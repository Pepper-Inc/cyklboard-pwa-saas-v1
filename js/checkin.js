/**
 * XTREME BIKE MANAGEMENT — CHECKIN.JS
 * Module B: Instructor Attendance Check-in
 */

window.XBM = window.XBM || {};

XBM.CheckIn = (function () {
    'use strict';

    let activeClassKey = '1800';  // default to 6 PM class

    /* ── LOAD CLASS ──────────────────────────────────────────────── */
    function loadClass(classKey) {
        activeClassKey = classKey;

        const list = document.getElementById('checkinList');
        if (!list) return;

        list.innerHTML = '';

        const attendees = XBM.attendees[classKey] || [];

        if (attendees.length === 0) {
            list.innerHTML = `
        <div style="text-align:center; padding:3rem; color:var(--text-muted);">
          <p style="font-size:1.5rem;">📋</p>
          <p style="margin-top:0.5rem;">Sin reservaciones para esta clase.</p>
        </div>`;
            updateSummary(classKey);
            return;
        }

        attendees.forEach((user, idx) => {
            const card = createUserCard(user, idx);
            list.appendChild(card);
        });

        updateSummary(classKey);
    }

    /* ── CREATE USER CARD ────────────────────────────────────────── */
    function createUserCard(user, delay = 0) {
        const card = document.createElement('div');
        card.className = `user-card ${user.status !== 'pending' ? 'is-' + user.status : ''}`;
        card.id = `user-card-${user.id}`;
        card.setAttribute('role', 'listitem');
        card.style.animationDelay = `${delay * 50}ms`;

        const creditsClass = user.credits <= 1 ? 'user-card__credits--low' : '';

        card.innerHTML = `
      <div class="user-card__avatar" aria-hidden="true">${XBM.getInitials(user.name)}</div>
      <div class="user-card__bike" aria-label="Bike ${user.bike}">${user.bike}</div>
      <div class="user-card__info">
        <p class="user-card__name">${user.name}</p>
        <div class="user-card__meta">
          <span class="user-card__credits ${creditsClass}" aria-label="${user.credits} créditos">
            <svg style="width:10px;height:10px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            ${user.credits} créd.
          </span>
          <span>· Bike #${user.bike}</span>
        </div>
      </div>
      <span class="user-card__status user-card__status--${user.status}" id="status-${user.id}" aria-live="polite">
        ${statusLabel(user.status)}
      </span>
      <div class="user-card__actions" role="group" aria-label="Acciones para ${user.name}">
        <button class="action-btn action-btn--attend ${user.status === 'attended' ? 'active' : ''}"
          id="attend-${user.id}"
          data-uid="${user.id}"
          aria-label="Marcar asistió"
          aria-pressed="${user.status === 'attended'}">
          ✓
        </button>
        <button class="action-btn action-btn--noshow ${user.status === 'noshow' ? 'active' : ''}"
          id="noshow-${user.id}"
          data-uid="${user.id}"
          aria-label="Marcar no-show"
          aria-pressed="${user.status === 'noshow'}">
          ✗
        </button>
      </div>
    `;

        // Bind buttons
        card.querySelector(`#attend-${user.id}`)?.addEventListener('click', () => setStatus(user, 'attended'));
        card.querySelector(`#noshow-${user.id}`)?.addEventListener('click', () => setStatus(user, 'noshow'));

        return card;
    }

    /* ── SET STATUS ──────────────────────────────────────────────── */
    function setStatus(user, newStatus) {
        const prevStatus = user.status;
        if (prevStatus === newStatus) {
            // Toggle back to pending
            user.status = 'pending';
        } else {
            user.status = newStatus;

            // Deduct credit on attend
            if (newStatus === 'attended' && prevStatus !== 'attended') {
                if (user.credits > 0) {
                    user.credits--;
                    XBM.addActivity({
                        type: 'info',
                        text: `<strong>${user.name}</strong> — 1 crédito descontado. Quedan: ${user.credits}`,
                    });
                } else {
                    XBM.toast({
                        title: 'Sin créditos',
                        msg: `${user.name} no tiene créditos disponibles.`,
                        type: 'danger',
                    });
                }
            }
        }

        // Refresh card
        const list = document.getElementById('checkinList');
        const oldCard = document.getElementById(`user-card-${user.id}`);
        if (oldCard && list) {
            const newCard = createUserCard(user);
            list.replaceChild(newCard, oldCard);
        }

        // Notification
        if (user.status === 'attended') {
            XBM.toast({ title: '✓ Asistió', msg: user.name, type: 'success' });
            XBM.addActivity({ type: 'success', text: `<strong>${user.name}</strong> — Asistencia confirmada · Bike #${user.bike}` });
        } else if (user.status === 'noshow') {
            XBM.toast({ title: '✗ No-show', msg: user.name, type: 'danger' });
            XBM.addActivity({ type: 'danger', text: `<strong>${user.name}</strong> — No-show · Bike #${user.bike} liberada` });
        }

        updateSummary(activeClassKey);
    }

    /* ── STATUS LABEL ────────────────────────────────────────────── */
    function statusLabel(status) {
        return { pending: 'Pendiente', attended: 'Asistió', noshow: 'No-show' }[status] || 'Pendiente';
    }

    /* ── UPDATE SUMMARY ──────────────────────────────────────────── */
    function updateSummary(classKey) {
        const attendees = XBM.attendees[classKey] || [];
        const attended = attendees.filter(u => u.status === 'attended').length;
        const noshow = attendees.filter(u => u.status === 'noshow').length;
        const pending = attendees.filter(u => u.status === 'pending').length;

        const elA = document.getElementById('ciAttended');
        const elN = document.getElementById('ciNoshow');
        const elP = document.getElementById('ciPending');

        if (elA) elA.textContent = `${attended} Asistieron`;
        if (elN) elN.textContent = `${noshow} No-show`;
        if (elP) elP.textContent = `${pending} Pendientes`;
    }

    /* ── BULK MARK ALL ATTENDED ──────────────────────────────────── */
    function markAllAttended() {
        const attendees = XBM.attendees[activeClassKey] || [];
        attendees.forEach(u => {
            if (u.status === 'pending') {
                u.status = 'attended';
                if (u.credits > 0) u.credits--;
            }
        });
        loadClass(activeClassKey);
        XBM.toast({ title: 'Todos marcados', msg: 'Asistencia completa registrada.', type: 'success' });
        XBM.addActivity({ type: 'success', text: `<strong>Clase ${activeClassKey}</strong> — Asistencia completa marcada` });
    }

    /* ── BULK MARK ALL NO-SHOW ───────────────────────────────────── */
    function markAllNoshow() {
        const attendees = XBM.attendees[activeClassKey] || [];
        attendees.forEach(u => {
            if (u.status === 'pending') u.status = 'noshow';
        });
        loadClass(activeClassKey);
        XBM.toast({ title: 'Todos marcados', msg: 'No-show completo registrado.', type: 'danger' });
    }

    /* ── EXPORT ──────────────────────────────────────────────────── */
    function exportCheckin() {
        const attendees = XBM.attendees[activeClassKey] || [];
        if (!attendees.length) {
            XBM.toast({ title: 'Sin datos', msg: 'No hay asistentes para exportar.', type: 'info' });
            return;
        }

        const csv = [
            'Nombre,Bike,Créditos Restantes,Estado',
            ...attendees.map(u =>
                `"${u.name}",${u.bike},${u.credits},"${statusLabel(u.status)}"`
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `checkin-${activeClassKey}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        XBM.toast({ title: '↓ Reporte Exportado', msg: 'Archivo CSV generado.', type: 'neon' });
    }

    /* ── INIT ────────────────────────────────────────────────────── */
    function init() {
        loadClass('1800');

        document.getElementById('loadClassBtn')?.addEventListener('click', () => {
            const sel = document.getElementById('classSelect');
            const key = sel?.value || '1800';
            loadClass(key);
            XBM.toast({ title: 'Clase cargada', msg: sel?.options[sel.selectedIndex]?.text || '', type: 'neon' });
        });

        document.getElementById('markAllAttendedBtn')?.addEventListener('click', markAllAttended);
        document.getElementById('markAllNoshowBtn')?.addEventListener('click', markAllNoshow);
        document.getElementById('exportCheckinBtn')?.addEventListener('click', exportCheckin);
    }

    return { init, loadClass, updateSummary };
})();

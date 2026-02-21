/**
 * XTREME BIKE MANAGEMENT — DASHBOARD.JS
 * Module C: Admin Dashboard / Metrics
 */

window.XBM = window.XBM || {};

XBM.Dashboard = (function () {
    'use strict';

    /* ── UPDATE KPIs ─────────────────────────────────────────────── */
    function updateKPIs() {
        const stats = XBM.getStats();

        // Ocupación
        const kpiOcEl = document.getElementById('kpi-ocupacion');
        if (kpiOcEl) XBM.animateNumber(kpiOcEl, stats.pct, '%');

        const subEl = document.getElementById('kpi-ocupacion-sub');
        if (subEl) subEl.textContent = `${stats.occupied + stats.blocked} de ${XBM.TOTAL_BIKES} bikes`;

        // Ingresos
        const kpiInEl = document.getElementById('kpi-ingresos');
        if (kpiInEl) {
            const target = stats.income;
            const start = performance.now();
            const from = 0;
            const dur = 900;
            function step(now) {
                const prog = Math.min((now - start) / dur, 1);
                const ease = 1 - Math.pow(1 - prog, 3);
                const cur = Math.round(from + (target - from) * ease);
                kpiInEl.textContent = XBM.formatCurrency(cur);
                if (prog < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        // Usuarios activos
        const kpiUEl = document.getElementById('kpi-usuarios');
        const activeUsers = Object.values(XBM.attendees)
            .flat()
            .filter(u => u.status === 'attended' || u.status === 'pending').length;
        if (kpiUEl) XBM.animateNumber(kpiUEl, activeUsers);

        // Occupancy bar (if exists)
        const occ = document.querySelector('.occ-bar-fill');
        if (occ) {
            setTimeout(() => { occ.style.width = stats.pct + '%'; }, 100);
        }
    }

    /* ── BUILD SCHEDULE ──────────────────────────────────────────── */
    function buildSchedule() {
        const container = document.getElementById('scheduleList');
        if (!container) return;

        container.innerHTML = '';

        XBM.schedule.forEach((cls, i) => {
            const item = document.createElement('div');
            item.className = `schedule-item ${cls.status === 'active' ? 'is-active' : cls.status === 'done' ? 'is-done' : ''}`;
            item.style.animationDelay = `${i * 60}ms`;

            const badgeClass = {
                active: 'schedule-item__badge--active',
                done: 'schedule-item__badge--done',
                upcoming: 'schedule-item__badge--upcoming',
            }[cls.status] || '';

            const badgeLabel = {
                active: 'En Vivo',
                done: 'Terminada',
                upcoming: 'Próxima',
            }[cls.status] || cls.status;

            item.innerHTML = `
        <span class="schedule-item__time">${cls.label}</span>
        <div class="schedule-item__info">
          <p class="schedule-item__name">${cls.name}</p>
          <p class="schedule-item__instructor">Instructor: ${cls.instructor} · ${cls.reservations}/${cls.capacity} reserv.</p>
        </div>
        <span class="schedule-item__badge ${badgeClass}">${badgeLabel}</span>
      `;

            container.appendChild(item);
        });
    }

    /* ── POPULATE ACTIVITY FEED ──────────────────────────────────── */
    function buildActivityFeed() {
        const feed = document.getElementById('activityFeed');
        if (!feed) return;

        feed.innerHTML = '';
        XBM.activityLog.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
        <span class="activity-item__dot activity-item__dot--${entry.type}" aria-hidden="true"></span>
        <span class="activity-item__text">${entry.text}</span>
        <span class="activity-item__time">${entry.time}</span>
      `;
            feed.appendChild(item);
        });
    }

    /* ── LIVE CLOCK ──────────────────────────────────────────────── */
    function startClock() {
        const el = document.getElementById('currentDate');
        function tick() {
            if (el) el.textContent = XBM.formatDate();
        }
        tick();
        setInterval(tick, 60000);
    }

    /* ── INIT ────────────────────────────────────────────────────── */
    function init() {
        startClock();
        buildSchedule();
        buildActivityFeed();
        updateKPIs();

        // "Add class" button (stub)
        document.getElementById('addClassBtn')?.addEventListener('click', () => {
            XBM.toast({ title: 'Agregar Clase', msg: 'Función disponible en la versión Pro.', type: 'info' });
        });
    }

    return { init, updateKPIs };
})();

/**
 * CYKLBOARD MANAGEMENT — UTILS.JS
 * Shared utility functions
 */

window.CYKL = window.CYKL || {};

/* ── TOAST NOTIFICATIONS ────────────────────────────────────── */
CYKL.toast = function ({ title, msg = '', type = 'neon', duration = 3500 }) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
        danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        neon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };

    const colorMap = {
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        neon: 'var(--primary-neon)',
        info: 'var(--color-info)',
    };

    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.style.color = colorMap[type] || colorMap.neon;
    el.setAttribute('role', 'alert');
    el.innerHTML = `
    <span class="toast__icon">${icons[type] || icons.neon}</span>
    <div class="toast__content">
      <p class="toast__title">${title}</p>
      ${msg ? `<p class="toast__msg">${msg}</p>` : ''}
    </div>
  `;

    container.appendChild(el);

    // Auto dismiss
    const dismiss = () => {
        el.classList.add('hiding');
        el.addEventListener('animationend', () => el.remove(), { once: true });
    };
    setTimeout(dismiss, duration);
};

/* ── FORMAT CURRENCY ────────────────────────────────────────── */
CYKL.formatCurrency = function (amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/* ── GET INITIALS ───────────────────────────────────────────── */
CYKL.getInitials = function (name) {
    return name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase();
};

/* ── ADD RIPPLE EFFECT ──────────────────────────────────────── */
CYKL.addRipple = function (el, event) {
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (event.clientX - rect.left) - size / 2;
    const y = (event.clientY - rect.top) - size / 2;

    const rip = document.createElement('span');
    rip.className = 'ripple';
    rip.style.cssText = `
    width: ${size}px; height: ${size}px;
    left: ${x}px; top: ${y}px;
  `;
    el.appendChild(rip);
    rip.addEventListener('animationend', () => rip.remove(), { once: true });
};

/* ── FORMAT TIME ────────────────────────────────────────────── */
CYKL.formatTime = function (date = new Date()) {
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

/* ── FORMAT DATE ────────────────────────────────────────────── */
CYKL.formatDate = function (date = new Date()) {
    return date.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

/* ── ANIMATE NUMBER ─────────────────────────────────────────── */
CYKL.animateNumber = function (el, target, suffix = '', duration = 800) {
    const start = performance.now();
    const from = parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0;

    function step(now) {
        const elapsed = Math.min(now - start, duration);
        const progress = elapsed / duration;
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        const current = Math.round(from + (target - from) * ease);
        el.textContent = current + suffix;
        if (elapsed < duration) requestAnimationFrame(step);
        else el.textContent = target + suffix;
    }

    requestAnimationFrame(step);
};

/* ── ADD ACTIVITY ITEM ──────────────────────────────────────── */
CYKL.addActivity = function ({ type = 'neon', text, time }) {
    if (!time) time = CYKL.formatTime();
    CYKL.activityLog.unshift({ type, text, time });
    if (CYKL.activityLog.length > 20) CYKL.activityLog.pop();

    const feed = document.getElementById('activityFeed');
    if (!feed) return;

    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
    <span class="activity-item__dot activity-item__dot--${type}" aria-hidden="true"></span>
    <span class="activity-item__text">${text}</span>
    <span class="activity-item__time">${time}</span>
  `;
    feed.insertBefore(item, feed.firstChild);

    // Keep max 10 visible
    while (feed.children.length > 10) feed.removeChild(feed.lastChild);
};

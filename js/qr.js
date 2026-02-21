/**
 * XTREME BIKE MANAGEMENT — QR.JS
 * QR Code generation (per user) + Camera scanner (check-in by QR)
 *
 * - QRCode generation: qrcode.js CDN
 * - QR Scanning: jsQR + getUserMedia (requires HTTPS)
 * - Graceful fallback when camera is unavailable (file:// protocol)
 */

window.XBM = window.XBM || {};

XBM.QR = (function () {
    'use strict';

    let videoStream = null;
    let scanInterval = null;
    let isScanning = false;

    /* ── QR DATA SCHEMA ───────────────────────────────────────── */
    // QR encodes JSON: { n: "Name", b: 3, c: 5 }
    // n = user name, b = bike number, c = credits
    function encodeUserQR(user) {
        return JSON.stringify({ n: user.name, b: user.bike, c: user.credits });
    }

    function decodeUserQR(rawText) {
        try {
            const obj = JSON.parse(rawText);
            if (obj && obj.n) return { name: obj.n, bike: obj.b, credits: obj.c };
        } catch (_) { }
        // Fallback: treat raw text as name
        return { name: rawText, bike: null, credits: null };
    }

    /* ── GENERATE QR FOR USER CARD ───────────────────────────── */
    async function generateUserQR(user) {
        if (!window.QRCode) {
            XBM.toast({ title: 'QR no disponible', msg: 'Librería cargando, intenta de nuevo.', type: 'info' });
            return;
        }

        // Build a modal to show the QR
        const payload = encodeUserQR(user);
        const modal = document.createElement('div');
        modal.className = 'qr-display-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', `Código QR de ${user.name}`);
        modal.innerHTML = `
      <div class="qr-display-card">
        <button class="modal__close qr-display-close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <p class="qr-display-overline">CHECK-IN QR</p>
        <h3 class="qr-display-name">${user.name}</h3>
        <p class="qr-display-meta">Bike #${user.bike} · ${user.credits} créditos</p>
        <div class="qr-display-canvas" id="qrDisplayCanvas"></div>
        <p class="qr-display-hint">Muestra este código al instructor para hacer check-in</p>
      </div>
    `;

        document.body.appendChild(modal);

        // Render QR
        await QRCode.toCanvas(modal.querySelector('#qrDisplayCanvas'), payload, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#E8FF00',
            },
        });

        // Close on button or backdrop click
        modal.querySelector('.qr-display-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); }
        }, { once: true });
    }

    /* ── INJECT QR BUTTONS INTO USER CARDS ──────────────────── */
    function injectQRButtons() {
        // Called by checkin.js after rendering cards
        // Each user card gets a QR button in the actions area
    }

    /* ── OPEN QR SCANNER MODAL ───────────────────────────────── */
    async function openScanner() {
        const overlay = document.getElementById('qrScannerOverlay');
        const nocam = document.getElementById('qrNoCam');
        const wrap = document.getElementById('qrScannerWrap');
        const result = document.getElementById('qrResult');

        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        result.style.display = 'none';
        nocam.style.display = 'none';
        wrap.style.display = 'block';

        // Check camera availability
        if (!navigator.mediaDevices?.getUserMedia) {
            showNoCameraState();
            return;
        }

        try {
            videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
            });

            const video = document.getElementById('qrVideo');
            video.srcObject = videoStream;
            await video.play();

            startScanning();
        } catch (err) {
            console.warn('[QR] Camera error:', err.message);
            if (err.name === 'NotAllowedError') {
                XBM.toast({ title: 'Permiso denegado', msg: 'Permite el acceso a la cámara.', type: 'danger' });
            }
            showNoCameraState();
        }
    }

    function showNoCameraState() {
        const wrap = document.getElementById('qrScannerWrap');
        const nocam = document.getElementById('qrNoCam');
        if (wrap) wrap.style.display = 'none';
        if (nocam) nocam.style.display = 'flex';
    }

    /* ── SCAN LOOP ───────────────────────────────────────────── */
    function startScanning() {
        if (isScanning) return;
        isScanning = true;

        const video = document.getElementById('qrVideo');
        const canvas = document.getElementById('qrCanvas');
        const ctx = canvas.getContext('2d');

        scanInterval = setInterval(() => {
            if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code) {
                onQRDetected(code.data);
            }
        }, 200); // 5 fps — enough for QR
    }

    /* ── QR DETECTED ─────────────────────────────────────────── */
    function onQRDetected(rawText) {
        stopScanning();

        const userData = decodeUserQR(rawText);
        showScanResult(userData);

        // Auto-check-in the user in the active class list
        autoCheckIn(userData);
    }

    function showScanResult(userData) {
        const hint = document.getElementById('qrScanHint');
        const result = document.getElementById('qrResult');

        if (hint) hint.textContent = '✓ ¡Código detectado!';
        if (result) {
            result.style.display = 'block';
            result.innerHTML = `
        <div class="qr-result-inner">
          <span class="qr-result-icon" aria-hidden="true">✓</span>
          <div class="qr-result-info">
            <strong>${userData.name}</strong>
            ${userData.bike ? `<span>· Bike #${userData.bike}</span>` : ''}
            ${userData.credits !== null ? `<span>· ${userData.credits} créditos</span>` : ''}
          </div>
        </div>
      `;

            // Auto-close scanner after 2 seconds
            setTimeout(() => closeScanner(), 2000);
        }
    }

    /* ── AUTO CHECK-IN ───────────────────────────────────────── */
    function autoCheckIn(userData) {
        // Find user in active class list and mark as attended
        const activeClassKey = XBM.CheckIn?._activeClassKey;
        const attendees = activeClassKey
            ? (XBM.attendees[activeClassKey] || [])
            : Object.values(XBM.attendees || {}).flat();

        const user = attendees.find(u =>
            u.name.toLowerCase().trim() === userData.name.toLowerCase().trim() ||
            u.bike === userData.bike
        );

        if (user) {
            if (user.status === 'attended') {
                XBM.toast({ title: 'Ya registrado', msg: `${user.name} ya tiene asistencia confirmada.`, type: 'info' });
                return;
            }
            user.status = 'attended';
            if (user.credits > 0) user.credits--;

            // Trigger re-render via CheckIn module if available
            if (typeof XBM.CheckIn?.loadClass === 'function') {
                XBM.CheckIn.loadClass(activeClassKey);
            }

            XBM.toast({ title: '✓ Check-in QR', msg: `${user.name} · Bike #${user.bike}`, type: 'success' });
            XBM.addActivity?.({ type: 'success', text: `<strong>${user.name}</strong> — Check-in por QR · Bike #${user.bike}` });
        } else {
            XBM.toast({ title: 'Usuario no encontrado', msg: `${userData.name} no está en la lista activa.`, type: 'danger' });
        }
    }

    /* ── STOP SCAN / CLOSE ───────────────────────────────────── */
    function stopScanning() {
        if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
        isScanning = false;
    }

    function closeScanner() {
        stopScanning();
        if (videoStream) {
            videoStream.getTracks().forEach(t => t.stop());
            videoStream = null;
        }
        const video = document.getElementById('qrVideo');
        const overlay = document.getElementById('qrScannerOverlay');
        if (video) video.srcObject = null;
        if (overlay) {
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
        }
        // Reset hint
        const hint = document.getElementById('qrScanHint');
        if (hint) hint.textContent = 'Apunta la cámara al código QR del usuario';
        const result = document.getElementById('qrResult');
        if (result) result.style.display = 'none';
    }

    /* ── INIT ────────────────────────────────────────────────── */
    function init() {
        document.getElementById('openScannerBtn')?.addEventListener('click', openScanner);
        document.getElementById('qrScannerClose')?.addEventListener('click', closeScanner);
        document.getElementById('qrScannerOverlay')?.addEventListener('click', e => {
            if (e.target === e.currentTarget) closeScanner();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && document.getElementById('qrScannerOverlay')?.classList.contains('is-open')) {
                closeScanner();
            }
        });
    }

    return { init, openScanner, closeScanner, generateUserQR, encodeUserQR };
})();

document.addEventListener('DOMContentLoaded', () => XBM.QR.init());

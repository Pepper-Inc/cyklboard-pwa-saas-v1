# ⚡ XTREME BIKE MANAGEMENT — PWA SaaS MVP

**High-Intensity Cycling Studio Management Platform**

> A fully offline-capable Progressive Web App for managing cycling studio rooms, reservations, and real-time attendance.

---

## 🎯 MODULES

### Módulo A — Sala de Bikes (Room Map)
Interactive grid of 20 bikes with 4 states:
- **Disponible** → click to open booking modal
- **Ocupada** → shows rider name  
- **Bloqueada** → maintenance flag
- **Seleccionada** → intense neon glow pulse

Features: filter bar, ripple click effects, booking modal, credit deduction, room reset.

### Módulo B — Check-in
Instructor interface for marking attendance:
- One-tap `✓` attended / `✗` no-show per user
- Credit auto-deduction on check-in
- Bulk mark all attended/no-show
- CSV export of the attendance list

### Módulo C — Dashboard
Admin metrics panel:
- **3 KPI cards**: Ocupación %, Ingresos del día, Usuarios activos
- Animated counter transitions
- Today's class schedule timeline
- Real-time activity feed
- Mini room map preview

---

## 🗂 FILE STRUCTURE

```
xtremebike-pwa-saas-v1/
├── index.html              ← App shell + HTML modules
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service Worker (offline-first)
│
├── css/
│   ├── theme.css           ← Design tokens, layout, base styles
│   ├── components.css      ← Buttons, cards, modal, toasts, forms
│   ├── room-map.css        ← Module A styles
│   ├── checkin.css         ← Module B styles
│   └── dashboard.css       ← Module C styles
│
├── js/
│   ├── data.js             ← App state & seed data
│   ├── utils.js            ← Shared utilities (toast, ripple, format)
│   ├── room-map.js         ← Module A logic
│   ├── checkin.js          ← Module B logic
│   ├── dashboard.js        ← Module C logic
│   └── app.js              ← Router & navigation controller
│
└── icons/                  ← PWA icon set (72–512px)
```

---

## 🎨 DESIGN SYSTEM

| Token | Value | Use |
|---|---|---|
| `--primary-neon` | `#E8FF00` | Actions, active states |
| `--bg-main` | `#000000` | Deep background |
| `--bg-surface` | `#121212` | Cards, nav |
| `--text-high` | `#FFFFFF` | Titles |
| `--text-low` | `#A0A0A0` | Labels |

**Typography:** Barlow + Barlow Condensed (Google Fonts)  
**Border radius:** 8px system  
**Effects:** Neon glow, ripple clicks, animated counters

---

## 🚀 RUNNING LOCALLY

No build step required — pure HTML/CSS/JS.

**Option 1 — VS Code Live Server:**
1. Open folder in VS Code
2. Right-click `index.html` → Open with Live Server

**Option 2 — Python:**
```bash
python3 -m http.server 8080
# → http://localhost:8080
```

**Option 3 — Node (if installed):**
```bash
npx serve .
```

> ⚠️ Service Worker requires HTTPS or localhost to activate.

---

## 📱 PWA INSTALLATION

1. Open in Chrome/Edge on mobile or desktop
2. Look for **"Add to Home Screen"** / install banner
3. App runs in standalone mode (no browser UI)

---

## 🔮 NEXT STEPS (Roadmap)

- [ ] Firebase/Supabase real-time backend integration
- [ ] User authentication (Instructor / Admin roles)
- [ ] Push notifications for class reminders
- [ ] QR code check-in scanner
- [ ] Monthly revenue analytics with Chart.js
- [ ] Multi-sala (multi-room) support
- [ ] Stripe payment integration for credits

---

*Built with ⚡ by Pepper Inc / Antigravity*

/**
 * XTREME BIKE MANAGEMENT — DATA.JS
 * Shared application state & seed data
 */

window.XBM = window.XBM || {};

/* ── BIKE ROOM STATE ────────────────────────────────────────── */
XBM.TOTAL_BIKES = 20;

XBM.bikeStates = Array.from({ length: XBM.TOTAL_BIKES }, (_, i) => ({
  id: i + 1,
  status: 'available',   // 'available' | 'occupied' | 'blocked'
  user: null,
  class: null,
  credits: null,
}));

// Seed a few pre-occupied bikes
const SEED_OCCUPIED = [
  { id: 3,  user: 'Laura M.',    class: '06:00 PM — Power Hour', credits: 5  },
  { id: 7,  user: 'Carlos S.',   class: '06:00 PM — Power Hour', credits: 2  },
  { id: 12, user: 'Ana R.',      class: '06:00 PM — Power Hour', credits: 8  },
  { id: 15, user: 'Pedro L.',    class: '06:00 PM — Power Hour', credits: 1  },
  { id: 18, user: 'Fernanda C.', class: '06:00 PM — Power Hour', credits: 12 },
];

const SEED_BLOCKED = [{ id: 9 }, { id: 10 }];

SEED_OCCUPIED.forEach(s => {
  const b = XBM.bikeStates.find(b => b.id === s.id);
  if (b) {
    b.status  = 'occupied';
    b.user    = s.user;
    b.class   = s.class;
    b.credits = s.credits;
  }
});

SEED_BLOCKED.forEach(s => {
  const b = XBM.bikeStates.find(b => b.id === s.id);
  if (b) b.status = 'blocked';
});

/* ── CLASS SCHEDULE ─────────────────────────────────────────── */
XBM.schedule = [
  { id: 's01', time: '07:00', label: '07:00 AM', name: 'Spinning Intenso',  instructor: 'Karla',  status: 'done',     capacity: 20, reservations: 17 },
  { id: 's02', time: '09:00', label: '09:00 AM', name: 'Endurance Ride',    instructor: 'Marco',  status: 'done',     capacity: 20, reservations: 14 },
  { id: 's03', time: '11:00', label: '11:00 AM', name: 'Beats & Burn',      instructor: 'Sofía',  status: 'done',     capacity: 20, reservations: 20 },
  { id: 's04', time: '18:00', label: '06:00 PM', name: 'Power Hour',        instructor: 'Diego',  status: 'active',   capacity: 20, reservations: 5  },
  { id: 's05', time: '20:00', label: '08:00 PM', name: 'Night Ride',        instructor: 'Ana',    status: 'upcoming', capacity: 20, reservations: 8  },
];

/* ── ATTENDEE LIST ──────────────────────────────────────────── */
XBM.attendees = {
  '0700': [
    { id: 'u01', name: 'Miguel Torres',  bike: 2,  credits: 4,  status: 'attended' },
    { id: 'u02', name: 'Daniela Cruz',   bike: 5,  credits: 7,  status: 'noshow'   },
    { id: 'u03', name: 'Roberto Lima',   bike: 8,  credits: 1,  status: 'attended' },
    { id: 'u04', name: 'Sara Pérez',     bike: 11, credits: 10, status: 'attended' },
  ],
  '0900': [
    { id: 'u05', name: 'Juan Morales',   bike: 1,  credits: 3,  status: 'attended' },
    { id: 'u06', name: 'Valeria Ortiz',  bike: 4,  credits: 9,  status: 'attended' },
    { id: 'u07', name: 'Luis Herrera',   bike: 6,  credits: 0,  status: 'noshow'   },
    { id: 'u08', name: 'Patricia Vega',  bike: 13, credits: 5,  status: 'noshow'   },
  ],
  '1100': [
    { id: 'u09', name: 'Carmen Ruiz',    bike: 2,  credits: 6,  status: 'attended' },
    { id: 'u10', name: 'Andrés Mejía',   bike: 7,  credits: 2,  status: 'attended' },
    { id: 'u11', name: 'Lucía Santos',   bike: 14, credits: 8,  status: 'attended' },
    { id: 'u12', name: 'Diego Pérez',    bike: 17, credits: 3,  status: 'noshow'   },
    { id: 'u13', name: 'Elena Fuentes',  bike: 20, credits: 5,  status: 'attended' },
  ],
  '1800': [
    { id: 'u14', name: 'Laura M.',       bike: 3,  credits: 5,  status: 'pending' },
    { id: 'u15', name: 'Carlos S.',      bike: 7,  credits: 2,  status: 'pending' },
    { id: 'u16', name: 'Ana R.',         bike: 12, credits: 8,  status: 'pending' },
    { id: 'u17', name: 'Pedro L.',       bike: 15, credits: 1,  status: 'pending' },
    { id: 'u18', name: 'Fernanda C.',    bike: 18, credits: 12, status: 'pending' },
  ],
  '2000': [
    { id: 'u19', name: 'Oscar Reyna',    bike: 1,  credits: 7,  status: 'pending' },
    { id: 'u20', name: 'Mariana López',  bike: 4,  credits: 4,  status: 'pending' },
    { id: 'u21', name: 'Felipe Ramos',   bike: 6,  credits: 9,  status: 'pending' },
    { id: 'u22', name: 'Isabel Mora',    bike: 9,  credits: 2,  status: 'pending' },
    { id: 'u23', name: 'Gabriel Ríos',   bike: 11, credits: 5,  status: 'pending' },
    { id: 'u24', name: 'Natalia Vega',   bike: 16, credits: 1,  status: 'pending' },
    { id: 'u25', name: 'Esteban Cruz',   bike: 19, credits: 8,  status: 'pending' },
    { id: 'u26', name: 'Camila Torres',  bike: 20, credits: 3,  status: 'pending' },
  ],
};

/* ── ACTIVITY LOG ───────────────────────────────────────────── */
XBM.activityLog = [
  { type: 'success', text: '<strong>Beats & Burn</strong> — Clase completada (20/20)', time: '11:52 AM' },
  { type: 'neon',    text: '<strong>Bike #5</strong> reservada por Daniela Cruz',      time: '05:33 PM' },
  { type: 'danger',  text: '<strong>Bike #9</strong> bloqueada por mantenimiento',     time: '05:15 PM' },
  { type: 'success', text: '<strong>Ana R.</strong> — Check-in confirmado · Bike #12', time: '05:47 PM' },
  { type: 'info',    text: '<strong>Night Ride</strong> — 8 reservaciones activas',    time: '05:00 PM' },
];

/* ── COMPUTED STATS ─────────────────────────────────────────── */
XBM.getStats = function () {
  const occupied  = XBM.bikeStates.filter(b => b.status === 'occupied').length;
  const blocked   = XBM.bikeStates.filter(b => b.status === 'blocked').length;
  const available = XBM.bikeStates.filter(b => b.status === 'available').length;
  const totalOcc  = occupied + blocked;
  const pct       = Math.round((totalOcc / XBM.TOTAL_BIKES) * 100);

  // Compute daily income from completed classes
  const completedRsvp = [17, 14, 20].reduce((a, b) => a + b, 0); // morning classes
  const income = completedRsvp * 120; // MXN per class

  return { occupied, blocked, available, pct, income };
};

/* ========== 1. CONFIGURACIÓN (lo único que tendrás que editar) ========== */
const CONFIG = {
  fecha: '2026-12-23T16:10:00-04:00',          // hora de Venezuela (UTC-4), así el contador es igual en cualquier país
  titulo: 'Boda Miguel & Katty',
  lugarEvento: 'Iglesia San Antonio / Restaurante La Barra de Domingo',
  lugarMapa: 'Restaurante La Barra de Domingo, Barquisimeto, Venezuela', // ajusta con la dirección exacta
  whatsapp: '584127929464'                      // ← REEMPLAZAR por el número real (código de país + número, sin + ni espacios)
};

const $ = (id) => document.getElementById(id);

/* ========== 2. MARCOS ORNAMENTALES: inserta las 4 esquinas en cada .frame ========== */
document.querySelectorAll('.frame').forEach((f) =>
  ['tl', 'tr', 'bl', 'br'].forEach((p) =>
    f.insertAdjacentHTML('beforeend', `<svg class="corner ${p}"><use href="#corner"/></svg>`)));

/* ========== 3. PÉTALOS DECORATIVOS ========== */
for (let i = 0; i < 10; i++) {
  const s = Math.random() * 10 + 8;
  const p = document.createElement('div');
  p.className = 'petal';
  p.style.cssText = `left:${Math.random() * 100}vw;width:${s}px;height:${s}px;animation-duration:${8 + Math.random() * 6}s;animation-delay:${Math.random() * 8}s`;
  $('petals').appendChild(p);
}

/* ========== 4. MÚSICA Y PORTADA ========== */
const music = $('music'), musicBtn = $('musicBtn');
function toggleMusic() {
  if (music.paused) music.play().then(() => musicBtn.classList.add('playing')).catch(() => {});
  else { music.pause(); musicBtn.classList.remove('playing'); }
}
musicBtn.addEventListener('click', toggleMusic);

$('openBtn').addEventListener('click', () => {
  $('cover').classList.add('hide');
  document.body.classList.remove('locked');
  if (music.paused) toggleMusic();              // el clic del usuario permite iniciar el audio
  setTimeout(() => $('cover').remove(), 1200);
});

/* ========== 5. GALERÍA (carrusel con dots, swipe y autoplay) ========== */
const track = document.querySelector('.track');
const total = track.children.length;
let current = 0, timer, startX = 0;
total && Array.from({ length: total }, (_, i) => {
  const b = document.createElement('button');
  b.setAttribute('aria-label', `Foto ${i + 1}`);
  b.onclick = () => { go(i); restart(); };
  $('dots').appendChild(b);
});
function go(i) {
  current = (i + total) % total;
  track.style.transform = `translateX(-${current * 100}%)`;
  [...$('dots').children].forEach((d, k) => d.classList.toggle('on', k === current));
}
const restart = () => { clearInterval(timer); timer = setInterval(() => go(current + 1), 4000); };
$('slider').addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
$('slider').addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1)); restart(); }
});
go(0); restart();

/* ========== 6. CUENTA REGRESIVA ========== */
const target = new Date(CONFIG.fecha).getTime();
function tick() {
  const diff = target - Date.now();
  if (diff <= 0) { $('countdown').textContent = '¡Hoy es el gran día!'; return; }
  const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24,
        m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
  $('countdown').textContent = `${d} días ${h} h ${m} min ${s} seg`;
}
tick(); setInterval(tick, 1000);

/* ========== 7. CALENDARIO (se genera solo a partir de la fecha) ========== */
const [Y, M, D] = CONFIG.fecha.slice(0, 10).split('-').map(Number);
const cal = $('calendar');
['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].forEach((d) => cal.insertAdjacentHTML('beforeend', `<span class="dow">${d}</span>`));
const blanks = (new Date(Y, M - 1, 1).getDay() + 6) % 7;   // la semana empieza en lunes
for (let i = 0; i < blanks; i++) cal.insertAdjacentHTML('beforeend', '<span></span>');
for (let d = 1; d <= new Date(Y, M, 0).getDate(); d++)
  cal.insertAdjacentHTML('beforeend', `<span class="${d === D ? 'today' : ''}">${d}</span>`);

/* Añadir a Google Calendar */
const fmt = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, '');
const start = new Date(CONFIG.fecha), end = new Date(start.getTime() + 8 * 36e5);
$('addCal').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  + `&text=${encodeURIComponent(CONFIG.titulo)}&dates=${fmt(start)}/${fmt(end)}`
  + `&details=${encodeURIComponent('¡Esperamos contar con tu presencia!')}&location=${encodeURIComponent(CONFIG.lugarEvento)}`;
$('addCal').target = '_blank';

/* ========== 8. MAPA ========== */
const q = encodeURIComponent(CONFIG.lugarMapa);
$('mapFrame').src = `https://www.google.com/maps?q=${q}&output=embed`;
$('mapOpen').href = `https://www.google.com/maps/search/?api=1&query=${q}`;
$('mapRoute').href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;

/* ========== 9. VENTANAS (<dialog>) Y RSVP POR WHATSAPP ========== */
$('giftBtn').onclick = () => $('giftDialog').showModal();
$('rsvpBtn').onclick = () => $('rsvpDialog').showModal();
document.querySelectorAll('dialog').forEach((dlg) => {
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.hasAttribute('data-close')) dlg.close(); });
});
$('rsvpForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = `¡Hola! Confirmo mi asistencia a la boda de Miguel & Katty.\n\n*Nombre:* ${$('rName').value}\n*Asistencia:* ${$('rAttend').value}\n*Acompañantes:* ${$('rGuests').value}`;
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  $('rsvpDialog').close();
});

/* ========== 10. APARICIÓN SUAVE AL HACER SCROLL ========== */
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add('show'); io.unobserve(en.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

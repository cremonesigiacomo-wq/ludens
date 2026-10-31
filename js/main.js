// URL della Web App Google Apps Script che scrive nel foglio (vedi
// google-sheet/ISTRUZIONI.md). Finché è vuoto il form mostra il messaggio di
// conferma senza inviare nulla: utile per l'anteprima.
const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyvAeYHPA8jQsJoMftDdhbVfFqx_wZjOsGqy_OHB04zqspb7XXwf6zpV7us93lFvi9Y/exec';

const nav  = document.getElementById('nav');
const hero = document.querySelector('.hero');

// Nav: trasparente sull'hero, verde pieno dopo lo scroll
new IntersectionObserver(
  ([entry]) => nav.classList.toggle('scrolled', !entry.isIntersecting),
  { rootMargin: '-80px 0px 0px 0px' }
).observe(hero);

// Comparsa morbida delle sezioni
const revealTargets = document.querySelectorAll(
  '.idea > *, .section-head, .tool, .deck li, .manifesto-list li, .manifesto-close, .who-grid > *, .join-inner > *'
);
const revealer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); }
  });
}, { threshold: 0.15 });
revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (el.matches('.deck li') ? (i % 4) * 90 : 0) + 'ms';
  revealer.observe(el);
});

// Form iscrizione
const form = document.getElementById('join-form');
const msg  = document.getElementById('form-msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  msg.className = 'form-msg';

  const nome = form.nome, email = form.email, consenso = form.consenso;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  nome.classList.toggle('invalid', !nome.value.trim());
  email.classList.toggle('invalid', !emailOk);
  consenso.closest('.consent').classList.toggle('invalid', !consenso.checked);

  if (!nome.value.trim() || !emailOk || !consenso.checked) {
    msg.textContent = !consenso.checked && nome.value.trim() && emailOk
      ? 'Serve il consenso per poterti scrivere.'
      : 'Controlla nome ed email.';
    msg.classList.add('error');
    return;
  }
  if (form._gotcha.value) return; // bot

  const btn = form.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Invio…';

  try {
    if (FORM_ENDPOINT) {
      // Google Apps Script non risponde alle richieste CORS: si invia in
      // modalità no-cors (risposta non leggibile) con i dati come form urlencoded.
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(form)),
      });
    }
    const name = nome.value.trim().split(' ')[0];
    form.classList.add('done');
    form.innerHTML = `
      <p class="eyebrow">Benvenuto nel branco</p>
      <p class="done-title">Grazie, ${name.replace(/[<>&"]/g, '')}.</p>
      <p class="done-text">Ti scriveremo appena la prima esperienza avrà una forma. Nel frattempo, esci e gioca.</p>`;
  } catch {
    btn.disabled = false;
    btn.textContent = 'Tienimi aggiornato';
    msg.textContent = 'Qualcosa non ha funzionato. Riprova tra poco.';
    msg.classList.add('error');
  }
});

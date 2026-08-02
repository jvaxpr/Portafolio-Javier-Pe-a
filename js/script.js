/* =========================================================================
   JAVIER PEÑA — PORTAFOLIO
   JavaScript: navegación móvil, scroll, efecto de terminal, contador de
   "uptime" y animaciones de aparición al hacer scroll.

   Estructura del archivo:
   1. Arranque (DOMContentLoaded) — llama a cada función de inicialización.
   2. Constantes de configuración — todos los "números mágicos" viven aquí.
   3. Una función init_XXX() por funcionalidad, cada una independiente y
      con su propia guarda (si el elemento no existe, no hace nada).

   Las funciones se declaran con `function nombre() {}` (no arrow/const),
   así que el orden en el archivo no importa: JavaScript las "hoistea"
   antes de ejecutar el script. Por eso el flujo principal va primero y
   el detalle de cada función después, como un índice.
   ========================================================================= */

/* ------------------------------------------------------------------------
   1. ARRANQUE
   ------------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  try {
    initMobileNav();
    initHeaderScroll();
    initActiveNavLink();
    initScrollReveal();
    initTerminalEffect();
    initUptimeCounter();
    initFooterYear();
    initCopyButtons();
  } catch (error) {
    // Si algo falla, lo dejamos en consola en vez de romper toda la página.
    console.error('Portafolio: error al inicializar la interfaz.', error);
  }
});

/* ------------------------------------------------------------------------
   2. CONSTANTES DE CONFIGURACIÓN
   ------------------------------------------------------------------------ */
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Header
const HEADER_SCROLL_OFFSET_PX = 12; // a partir de cuántos px de scroll se le pone sombra al header

// Animaciones de aparición al hacer scroll
const REVEAL_THRESHOLD = 0.15; // % del elemento que debe verse para disparar la animación

// Efecto de "escritura" en la terminal del hero
const TERMINAL_CHAR_DELAY_MS = 10;        // velocidad de tecleo para texto normal
const TERMINAL_PROMPT_CHAR_DELAY_MS = 28; // velocidad de tecleo para líneas "$ ..." (más lenta, se nota más)
const TERMINAL_LINE_PAUSE_MS = 90;        // pausa después de una línea con contenido
const TERMINAL_EMPTY_LINE_PAUSE_MS = 40;  // pausa después de una línea en blanco

// Contador de "uptime" (días desde el inicio de la carrera universitaria)
const UPTIME_START_DATE = new Date('2022-01-15T00:00:00');
const UPTIME_ANIMATION_DURATION_MS = 1200;

/* ------------------------------------------------------------------------
   3. NAVEGACIÓN MÓVIL
   ------------------------------------------------------------------------ */
function initMobileNav() {
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  if (!navToggle || !nav) return;

  function openNav() {
    nav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Cerrar menú de navegación');
  }

  function closeNav() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú de navegación');
  }

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  });

  // Cierra el menú al elegir un enlace (en vista móvil)
  nav.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  // Cierra el menú al presionar Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });
}

/* ------------------------------------------------------------------------
   4. SOMBRA DE HEADER AL HACER SCROLL
   ------------------------------------------------------------------------ */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  function handleHeaderScroll() {
    if (window.scrollY > HEADER_SCROLL_OFFSET_PX) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  handleHeaderScroll(); // estado correcto si la página ya carga con scroll
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
}

/* ------------------------------------------------------------------------
   5. ENLACE ACTIVO SEGÚN LA SECCIÓN VISIBLE
   ------------------------------------------------------------------------ */
function initActiveNavLink() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

/* ------------------------------------------------------------------------
   6. REVELADO DE ELEMENTOS AL HACER SCROLL
   ------------------------------------------------------------------------ */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (!revealEls.length) return;

  if (PREFERS_REDUCED_MOTION) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // ya cumplió su función, no hace falta seguir observando
      });
    },
    { threshold: REVEAL_THRESHOLD }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
}

/* ------------------------------------------------------------------------
   7. EFECTO DE TERMINAL (whoami / status.log)
   ------------------------------------------------------------------------ */
const TERMINAL_LINES = [
  { text: '$ whoami', type: 'prompt' },
  { text: 'javier_pena', type: 'plain' },
  { text: '', type: 'plain' },
  { text: '$ cat status.log', type: 'prompt' },
  { text: '[OK] Ingeniería en Computación — 8vo semestre', type: 'ok' },
  { text: '[OK] IU Politécnico Santiago Mariño, sede Valencia', type: 'ok' },
  { text: '[ACTIVO] Agente de Soporte de Hosting', type: 'active' },
  { text: '[APRENDIENDO] Python · NestJS · PostgreSQL', type: 'active' },
  { text: '[META] Desarrollador de Software', type: 'active' },
  { text: '', type: 'plain' },
  { text: '$ echo $MOTIVACION', type: 'prompt' },
  { text: '"Sigo aprendiendo cada día más y fortaleciendo mi conocimiento."', type: 'quote' },
];

const TERMINAL_LINE_CLASS_MAP = {
  prompt: 'line--prompt',
  ok: 'line--ok',
  active: 'line--active',
  quote: 'line--quote',
  plain: '',
};

function initTerminalEffect() {
  const terminalBody = document.getElementById('terminalBody');
  if (!terminalBody) return;

  if (PREFERS_REDUCED_MOTION) {
    renderStaticTerminal(terminalBody);
    return;
  }

  typeTerminal(terminalBody).catch((error) => {
    // Si la animación falla a mitad de camino, no dejamos la terminal a medias:
    // mostramos el contenido completo de una vez.
    console.error('Portafolio: error animando la terminal, se muestra la versión estática.', error);
    renderStaticTerminal(terminalBody);
  });
}

function renderStaticTerminal(terminalBody) {
  terminalBody.innerHTML = TERMINAL_LINES
    .map((line) => {
      const cssClass = TERMINAL_LINE_CLASS_MAP[line.type];
      return `<span class="${cssClass}">${line.text || '\u00A0'}</span>`;
    })
    .join('\n');
}

async function typeTerminal(terminalBody) {
  terminalBody.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'terminal__cursor';
  terminalBody.appendChild(cursor);

  for (const line of TERMINAL_LINES) {
    const lineEl = document.createElement('span');
    lineEl.className = TERMINAL_LINE_CLASS_MAP[line.type];
    terminalBody.insertBefore(lineEl, cursor);

    const charDelay = line.type === 'prompt' ? TERMINAL_PROMPT_CHAR_DELAY_MS : TERMINAL_CHAR_DELAY_MS;
    for (let i = 0; i < line.text.length; i++) {
      lineEl.textContent += line.text[i];
      await sleep(charDelay);
    }

    terminalBody.insertBefore(document.createTextNode('\n'), cursor);
    await sleep(line.text ? TERMINAL_LINE_PAUSE_MS : TERMINAL_EMPTY_LINE_PAUSE_MS);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------------
   8. CONTADOR DE "UPTIME"
   ------------------------------------------------------------------------ */
function initUptimeCounter() {
  const uptimeCounterEl = document.getElementById('uptimeCounter');
  if (!uptimeCounterEl) return;

  const totalDays = calculateDaysSince(UPTIME_START_DATE);

  if (PREFERS_REDUCED_MOTION || totalDays <= 0) {
    uptimeCounterEl.textContent = totalDays.toLocaleString('es-VE');
    return;
  }

  animateCounter(uptimeCounterEl, totalDays, UPTIME_ANIMATION_DURATION_MS);
}

function calculateDaysSince(startDate) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const elapsedMs = Date.now() - startDate.getTime();
  return Math.max(0, Math.floor(elapsedMs / MS_PER_DAY));
}

/**
 * Anima un contador desde 0 hasta targetValue en, aproximadamente,
 * durationMs milisegundos.
 *
 * Usa requestAnimationFrame en vez de setInterval con incrementos fijos:
 * en la versión anterior el "salto" por tick se calculaba a partir del
 * total de días, así que para números grandes la animación terminaba
 * durando mucho más de lo que el nombre de la constante prometía. Aquí
 * el valor mostrado se calcula siempre a partir del tiempo real
 * transcurrido (elapsed / durationMs), así que la duración es exacta sin
 * importar qué tan grande sea targetValue.
 */
function animateCounter(element, targetValue, durationMs) {
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    const currentValue = Math.floor(progress * targetValue);
    element.textContent = currentValue.toLocaleString('es-VE');

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = targetValue.toLocaleString('es-VE'); // evita errores de redondeo al final
    }
  }

  requestAnimationFrame(step);
}

/* ------------------------------------------------------------------------
   9. AÑO ACTUAL EN EL FOOTER
   ------------------------------------------------------------------------ */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
}

/* ------------------------------------------------------------------------
   10. BOTONES "COPIAR"
   ------------------------------------------------------------------------ */
const COPY_FEEDBACK_DURATION_MS = 1500;
const COPY_BUTTON_DEFAULT_TEXT = 'Copiar';
const COPY_BUTTON_SUCCESS_TEXT = '¡Copiado!';

function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  if (!copyButtons.length) return;

  copyButtons.forEach((button) => {
    button.addEventListener('click', () => handleCopyClick(button));
  });
}

async function handleCopyClick(button) {
  const textToCopy = button.dataset.copyText;
  if (!textToCopy) return;

  try {
    await navigator.clipboard.writeText(textToCopy);
    showCopyFeedback(button);
  } catch (error) {
    console.error('Portafolio: no se pudo copiar al portapapeles.', error);
  }
}

function showCopyFeedback(button) {
  button.textContent = COPY_BUTTON_SUCCESS_TEXT;
  button.classList.add('is-copied');

  setTimeout(() => {
    button.textContent = COPY_BUTTON_DEFAULT_TEXT;
    button.classList.remove('is-copied');
  }, COPY_FEEDBACK_DURATION_MS);
}
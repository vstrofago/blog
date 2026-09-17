/* VSTROFAGO — conmutador de tema.
   El estado inicial lo fija un script inline en <head> (evita el parpadeo); aquí solo
   se atiende el clic, se persiste la elección y se sincroniza aria-pressed.
   Sin elección guardada el sitio es claro: el DS es claro por defecto. */
(() => {
  const KEY = 'vf-theme';
  const root = document.documentElement;

  const sync = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('[data-vf-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('data-theme-state', dark ? 'dark' : 'light');
    });
  };

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-vf-theme-toggle]');
    if (!btn) return;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (next === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(KEY, next);
    } catch (e) {
      /* modo privado: la elección dura la sesión */
    }
    sync();
  });

  sync();
})();

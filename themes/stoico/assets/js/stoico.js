/* Stoico, Editorial voice: the blog's small behaviours. No dependencies.
     [data-theme-toggle]  dark ⇄ light, stored as `stoico-theme` (shared with the landing)
     [data-progress]      the reading-progress hairline on a note
     [data-copy-code]     copy a code block
     [data-copy-link]     copy the note's URL
   Every storage and clipboard access fails quietly. */
(() => {
  const root = document.documentElement;

  /* Theme. The inline script in baseof.html applied any stored choice before paint. */
  const meta = document.querySelector('meta[name="theme-color"]');
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  const syncTheme = () => {
    const light = root.dataset.theme === 'light';
    toggles.forEach((b) => b.setAttribute('aria-label', light ? b.dataset.labelDark : b.dataset.labelLight));
    if (meta) meta.content = light ? '#F4F3EF' : '#121110';
  };
  toggles.forEach((b) => b.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('stoico-theme', next); } catch (e) { /* this page only */ }
    syncTheme();
  }));
  syncTheme();

  /* Reading progress: a 2px --fg hairline across the top. */
  const bar = document.querySelector('[data-progress]');
  if (bar) {
    let queued = false;
    const update = () => {
      queued = false;
      const h = document.documentElement;
      const max = Math.max(1, h.scrollHeight - h.clientHeight);
      bar.style.transform = 'scaleX(' + Math.min(1, h.scrollTop / max) + ')';
    };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* Clipboard helpers. The button says it worked, then goes back. */
  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  };
  const confirm = (btn) => {
    const label = btn.querySelector('span') || btn;
    const idle = label.textContent;
    label.textContent = btn.dataset.done || idle;
    window.setTimeout(() => { label.textContent = idle; }, 1600);
  };
  document.querySelectorAll('[data-copy-code]').forEach((btn) => btn.addEventListener('click', async () => {
    const code = btn.closest('.ed-code')?.querySelector('pre code, pre');
    if (!code) return;
    try { await copyText(code.innerText); confirm(btn); } catch (e) { /* nothing copied */ }
  }));
  document.querySelectorAll('[data-copy-link]').forEach((btn) => btn.addEventListener('click', async () => {
    const link = document.querySelector('link[rel="canonical"]');
    try { await copyText(link ? link.href : location.href); confirm(btn); } catch (e) { /* nothing copied */ }
  }));
})();

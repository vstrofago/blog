/* Stoico, Editorial voice: the blog's small behaviours. No dependencies.
     [data-theme-toggle]  dark ⇄ light, stored as `stoico-theme` (shared with the landing)
     [data-progress]      the reading-progress hairline on a note
     [data-copy-code]     copy a code block
     [data-copy-link]     copy the note's URL
     canvas[data-bayer]   BayerField (Stoico components/motion/BayerField.jsx), a still plate
   Every storage and clipboard access fails quietly. Nothing animates under reduced motion. */
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
    document.dispatchEvent(new CustomEvent('stoico:theme'));
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

  /* BayerField: 8×8 ordered dither, diagonal falloff modulated by a slow wave. Algorithm
     and matrix are the system's; here it only ever draws still frames (`data-seed` picks
     the frame). Colour comes from the canvas' CSS color and follows the theme. */
  const BAYER = (() => {
    let matrix = [[0, 2], [3, 1]];
    let size = 2;
    const quadrant = [[0, 2], [3, 1]];
    while (size < 8) {
      const expanded = Array.from({ length: size * 2 }, () => new Array(size * 2));
      for (let y = 0; y < size * 2; y += 1) {
        for (let x = 0; x < size * 2; x += 1) {
          expanded[y][x] = 4 * matrix[y % size][x % size] + quadrant[Math.floor(y / size)][Math.floor(x / size)];
        }
      }
      matrix = expanded;
      size *= 2;
    }
    return matrix;
  })();
  document.querySelectorAll('canvas[data-bayer]').forEach((canvas) => {
    const context = canvas.getContext('2d');
    if (!context) return;
    const cell = Number(canvas.dataset.cell || 3);
    const time = Number(canvas.dataset.seed || 1.3);
    let image = null;
    const draw = () => {
      const width = Math.max(1, Math.ceil(canvas.clientWidth / cell));
      const height = Math.max(1, Math.ceil(canvas.clientHeight / cell));
      if (canvas.width !== width || canvas.height !== height || !image) {
        canvas.width = width;
        canvas.height = height;
        image = context.createImageData(width, height);
      }
      const [red, green, blue] = (getComputedStyle(canvas).color.match(/[\d.]+/g) || [128, 128, 128]).map(Number);
      const pixels = image.data;
      for (let y = 0; y < height; y += 1) {
        const ny = y / height;
        for (let x = 0; x < width; x += 1) {
          const nx = x / width;
          const base = 1 - (nx * 0.55 + ny * 0.45);
          const wave = 0.5 + 0.5 * Math.sin(nx * 6 + time * 0.9) * Math.cos(ny * 5 - time * 0.7);
          const value = base * (0.35 + 0.9 * wave);
          const offset = (y * width + x) * 4;
          if (value > (BAYER[y & 7][x & 7] + 0.5) / 64) {
            pixels[offset] = red; pixels[offset + 1] = green; pixels[offset + 2] = blue; pixels[offset + 3] = 255;
          } else {
            pixels[offset + 3] = 0;
          }
        }
      }
      context.putImageData(image, 0, 0);
    };
    draw();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(draw).observe(canvas);
    document.addEventListener('stoico:theme', draw);
  });
})();

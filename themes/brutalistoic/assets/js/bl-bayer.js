/* brutalistoic — dither Bayer 8x8 de las superficies (equivalente estático de
   BayerField para Card y ArticleHeader sin React). Pinta una sola vez: el dither
   del blog es estático por diseño (D5/D6), así que no hay drift que parar.
   El fundido va hacia la esquina superior izquierda, donde vive el texto, y el
   tramado se resuelve contra la matriz de Bayer 8x8. Decorativo: el canvas va
   aria-hidden y sin JS la superficie queda como una superficie limpia. */
(() => {
  const BAYER = [
    0, 32, 8, 40, 2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37,
    63, 31, 55, 23, 61, 29, 53, 21
  ];

  const paint = (canvas) => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const styles = window.getComputedStyle(canvas);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = styles.color;
    const cell = 3;
    for (let y = 0; y < h; y += cell) {
      for (let x = 0; x < w; x += cell) {
        const mx = (x / cell) & 7;
        const my = (y / cell) & 7;
        const threshold = (BAYER[my * 8 + mx] + 0.5) / 64;
        // campo suave de baja frecuencia, muestreado contra la matriz
        const field = 0.5 + 0.5 * Math.sin(x / 47 + y / 71) * Math.cos(y / 37 - x / 83);
        // fundido desde la esquina superior izquierda para no entorpecer el texto
        const fade = Math.min(1, (x / w) * 0.8 + (y / h) * 0.8);
        if (field * fade * 0.55 > threshold) ctx.fillRect(x, y, cell, cell);
      }
    }
  };

  const canvases = () => document.querySelectorAll('canvas.bl-bayer');

  const paintAll = () => canvases().forEach(paint);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paintAll);
  } else {
    paintAll();
  }

  let timer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(paintAll, 150);
  });
  // las fuentes cambian la métrica de la caja: repintar cuando carguen
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintAll);
})();

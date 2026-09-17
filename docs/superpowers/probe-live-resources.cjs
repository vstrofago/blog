/* Comprobación puntual: qué recursos responden >=400 en el sitio publicado.
   Sirve para distinguir un fallo real (fuente, imagen, JSON) del 404 esperado del
   fixture probe-code, que no se publica. */
const { chromium } = require('playwright');

const BASE = process.env.VF_BASE || 'https://vstrofago.github.io/blog/';
const ROUTES = ['', 'es/', 'posts/', 'posts/why-cant-we-just-start/', 'about/', 'tags/', 'tags/ai/', 'search/', 'es/', 'es/search/', '404.html'];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const bad = [];
  const page = await ctx.newPage();
  page.on('response', (r) => {
    if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
  });

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    // recorre para disparar carga diferida de imágenes, si hubiera
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
  }

  // La búsqueda trae el índice JSON por fetch: si fallara no saldría como <img>
  await page.goto(`${BASE}search/`, { waitUntil: 'networkidle' });
  await page.fill('[data-vf-search-input]', 'vulture');
  await page.waitForTimeout(800);
  const hits = await page.locator('.vf-search__hit').count();

  await browser.close();
  const real = [...new Set(bad)].filter((b) => !/probe-code/.test(b));
  console.log(JSON.stringify({ rutas: ROUTES.length, busqueda_hits: hits, fallos_reales: real, todo: [...new Set(bad)] }, null, 1));
})();

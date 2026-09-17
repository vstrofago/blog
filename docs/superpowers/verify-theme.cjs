/* Verificación real del tema VSTROFAGO contra el servidor local de Hugo.
   No es un test unitario: mide el CSS aplicado, el contraste, la persistencia del
   tema, el contrato de motion y el comportamiento responsive en un navegador real.

   Uso:
     hugo server --port 1313 --bind 127.0.0.1 --disableFastRender --buildDrafts
     NODE_PATH=/home/user/.hermes/hermes-agent/node_modules node docs/superpowers/verify-theme.cjs
   `--buildDrafts` es necesario: la placa de código se prueba contra
   content/en/probe-code.md, que va como `draft: true` para no publicarse nunca.
   Contra lo publicado:
     VF_BASE=https://vstrofago.github.io/blog/ node docs/superpowers/verify-theme.cjs
   (el fixture no está en producción, así que esa comprobación se omite sola).
   Capturas en /tmp/vf-shots (VF_SHOTS para cambiarlo). Sale con código 1 si algo falla.
   Ojo: el navegador remoto de Hermes no alcanza localhost; por eso se usa Playwright
   local en vez de la herramienta de navegador. */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.VF_BASE || 'http://localhost:1313/blog/';
const SHOTS = process.env.VF_SHOTS || '/tmp/vf-shots';

const results = [];
const record = (name, pass, detail) => results.push({ name, pass: !!pass, detail });

const lum = (rgb) => {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return ((x + 0.05) / (y + 0.05)).toFixed(2);
};

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();

  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  const httpFails = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    // "Failed to load resource" se juzga por URL abajo, no por el texto del log.
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text());
  });
  page.on('response', (r) => {
    // El fixture probe-code no se publica: su 404 es esperado y no cuenta.
    if (r.status() >= 400 && !/probe-code/.test(r.url())) httpFails.push(`${r.status()} ${r.url()}`);
  });

  const styles = () =>
    page.evaluate(() => {
      const cs = (sel) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el) : null;
      };
      const root = getComputedStyle(document.documentElement);
      return {
        theme: document.documentElement.getAttribute('data-theme'),
        accent: root.getPropertyValue('--accent').trim(),
        bg: cs('body').backgroundColor,
        text: cs('body').color,
        bodyFont: cs('body').fontFamily,
        h1Font: cs('h1') ? cs('h1').fontFamily : null,
        h1Size: cs('h1') ? cs('h1').fontSize : null,
        headerPos: cs('.vf-header') ? cs('.vf-header').position : null,
        plateRadius: cs('.vf-plate') ? cs('.vf-plate').borderRadius : null,
        tagRadius: cs('.vf-tag') ? cs('.vf-tag').borderRadius : null,
        tagBorder: cs('.vf-tag') ? cs('.vf-tag').borderTopWidth : null,
        featuredBg: cs('.vf-plate-featured') ? cs('.vf-plate-featured').backgroundColor : null,
        fieldBg: cs('.vf-field') ? cs('.vf-field').backgroundColor : null,
        staged: [...document.querySelectorAll('.vf-stage')].map((s) => ({
          cls: s.className.includes('is-armed') ? 'armed' : s.className.includes('is-playing') ? 'playing' : 'final',
        })),
        riseClip: cs('.vf-rise') ? cs('.vf-rise').clipPath : null,
        emptyAnchors: document.querySelectorAll('a[href="#"]').length,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        fonts: [...document.fonts].map((f) => `${f.family}@${f.weight}=${f.status}`),
        fontReqs: performance
          .getEntriesByType('resource')
          .map((r) => r.name)
          .filter((n) => /fonts\//.test(n)).length,
        entries: document.querySelectorAll('.vf-entry, .vf-entry--featured').length,
        grid: cs('body').backgroundImage.includes('linear-gradient'),
        aside: cs('.vf-toc') ? true : false,
      };
    });

  // ---------- 1. Portada, modo claro (canónico)
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  let s = await styles();
  record('claro: sin data-theme', s.theme === null, s.theme);
  record('claro: papel #F4F3EE', s.bg === 'rgb(244, 243, 238)', s.bg);
  record('claro: acento cobalto #1249d6', s.accent.toLowerCase() === '#1249d6', s.accent);
  record('display en Sanchez', /Sanchez/.test(s.h1Font || ''), s.h1Font);
  record('cuerpo en IBM Plex Mono', /IBM Plex Mono/.test(s.bodyFont || ''), s.bodyFont);
  record('header sticky', s.headerPos === 'sticky', s.headerPos);
  record('radios near-square (placa 6px)', s.plateRadius === '6px', s.plateRadius);
  record('tag radio 2px / borde 1px', s.tagRadius === '2px' && s.tagBorder === '1px', `${s.tagRadius}/${s.tagBorder}`);
  record('placa destacada en cobalto', s.featuredBg === 'rgb(13, 59, 192)', s.featuredBg);
  record('footer campo cobalto', s.fieldBg === 'rgb(13, 59, 192)', s.fieldBg);
  record('rejilla de fondo activa', s.grid === true, String(s.grid));
  record('entradas en portada = 3', s.entries === 3, s.entries);  record('fuentes locales solicitadas', s.fontReqs >= 2, s.fontReqs);
  record('sin href="#"', s.emptyAnchors === 0, s.emptyAnchors);
  record('sin overflow horizontal', s.overflow <= 0, s.overflow);
  record(
    'contraste cuerpo/paper claro >= 7',
    Number(contrast(s.text, s.bg)) >= 7,
    contrast(s.text, s.bg)
  );
  record('motion armado por JS', s.staged.length > 0 && s.staged.some((x) => x.cls !== 'final'), JSON.stringify(s.staged.slice(0, 3)));
  await page.screenshot({ path: `${SHOTS}/01-home-claro.png`, fullPage: true });

  // ---------- 2. Modo oscuro (opt-in) + persistencia
  await page.click('[data-vf-theme-toggle]');
  await page.waitForTimeout(150);
  let d = await styles();
  record('oscuro: data-theme=dark', d.theme === 'dark', d.theme);
  record('oscuro: tinta #101216', d.bg === 'rgb(16, 18, 22)', d.bg);
  record('oscuro: acento aclarado', d.accent.toLowerCase() === '#4d79f0', d.accent);
  record(
    'contraste cuerpo/paper oscuro >= 7',
    Number(contrast(d.text, d.bg)) >= 7,
    contrast(d.text, d.bg)
  );
  await page.screenshot({ path: `${SHOTS}/02-home-oscuro.png`, fullPage: true });

  await page.reload({ waitUntil: 'networkidle' });
  const afterReload = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  record('oscuro persiste tras recargar', afterReload === 'dark', afterReload);
  await page.evaluate(() => localStorage.removeItem('vf-theme'));
  await page.reload({ waitUntil: 'networkidle' });
  const backToLight = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  record('sin elección vuelve a claro', backToLight === null, backToLight);

  // ---------- 3. Entrada (TOC, prosa, navegación)
  await page.goto(`${BASE}posts/why-cant-we-just-start/`, { waitUntil: 'networkidle' });
  const post = await styles();
  record('entrada: TOC presente', post.aside === true, String(post.aside));
  record('entrada: breadcrumbs', (await page.locator('.vf-crumbs').count()) === 1, await page.locator('.vf-crumbs').count());
  const tocOpen = await page.locator('.vf-toc details').getAttribute('open');
  record('entrada: TOC plegado por defecto', tocOpen === null, String(tocOpen));
  await page.click('.vf-toc details > summary');
  await page.waitForTimeout(120);
  record('entrada: TOC abre al clic', (await page.locator('.vf-toc details[open]').count()) === 1, 'open');
  record('entrada: nav prev/next', (await page.locator('.vf-post-nav__item').count()) >= 1, await page.locator('.vf-post-nav__item').count());
  const proseWidth = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.vf-prose')).maxWidth));
  record('prosa con medida legible (≈68ch)', proseWidth >= 620 && proseWidth <= 720, proseWidth);
  await page.screenshot({ path: `${SHOTS}/03-entrada-claro.png`, fullPage: true });

  await page.evaluate(() => localStorage.setItem('vf-theme', 'dark'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SHOTS}/04-entrada-oscuro.png`, fullPage: true });
  await page.evaluate(() => localStorage.removeItem('vf-theme'));

  // ---------- 4. Lista, taxonomía, 404, ES
  await page.goto(`${BASE}posts/`, { waitUntil: 'networkidle' });
  const nums = await page.locator('.vf-entry__num').allTextContents();
  record('lista: numeración N.º', nums.every((n) => /N\.º \d\d/.test(n.trim())), nums.join(','));
  await page.screenshot({ path: `${SHOTS}/05-lista.png`, fullPage: true });

  await page.goto(`${BASE}tags/`, { waitUntil: 'networkidle' });
  record('taxonomía: nube de temas', (await page.locator('.vf-tag-cloud .vf-tag').count()) >= 5, await page.locator('.vf-tag-cloud .vf-tag').count());
  await page.screenshot({ path: `${SHOTS}/06-temas.png`, fullPage: true });

  await page.goto(`${BASE}es/`, { waitUntil: 'networkidle' });
  const esNav = await page.locator('.vf-nav__link').allTextContents();
  const esH1 = await page.locator('h1').first().textContent();
  record('ES: menú traducido', esNav.join('|').includes('Entradas'), esNav.join('|'));
  record('ES: portada traducida', /Hola/.test(esH1), esH1.trim());
  await page.screenshot({ path: `${SHOTS}/07-es-portada.png`, fullPage: true });

  await page.goto(`${BASE}404.html`, { waitUntil: 'networkidle' });
  record('404: placa con estado', (await page.locator('.vf-btn--primary').count()) === 1, 'boton');
  await page.screenshot({ path: `${SHOTS}/08-404.png`, fullPage: true });

  // ---------- 5. Búsqueda (interacción real, cada idioma con su índice)
  await page.goto(`${BASE}search/`, { waitUntil: 'networkidle' });
  await page.fill('[data-vf-search-input]', 'vulture');
  await page.waitForTimeout(700);
  const hits = await page.locator('.vf-search__hit').count();
  const status = await page.locator('[data-vf-search-status]').textContent();
  record('búsqueda EN: encuentra la entrada', hits === 1, `${hits} / "${status}"`);
  await page.screenshot({ path: `${SHOTS}/09-busqueda.png`, fullPage: true });
  await page.fill('[data-vf-search-input]', 'zzzz');
  await page.waitForTimeout(500);
  record('búsqueda: sin resultados avisa', (await page.locator('.vf-search__hit').count()) === 0, await page.locator('[data-vf-search-status]').textContent());

  await page.goto(`${BASE}es/search/`, { waitUntil: 'networkidle' });
  await page.fill('[data-vf-search-input]', 'zopilote');
  await page.waitForTimeout(700);
  record(
    'búsqueda ES: índice propio',
    (await page.locator('.vf-search__hit').count()) === 1,
    await page.locator('[data-vf-search-status]').textContent()
  );
  await page.screenshot({ path: `${SHOTS}/09b-busqueda-es.png`, fullPage: true });

  // ---------- 6. Móvil
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mp = await mobile.newPage();
  await mp.goto(BASE, { waitUntil: 'networkidle' });
  const mOverflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  record('móvil 390px: sin overflow', mOverflow <= 1, mOverflow);
  // El motion solo se dispara al entrar en pantalla: se recorre la página como lo
  // haría una persona y DESPUÉS se comprueba que ninguna fila quedó escondida.
  await mp.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, 0);
  });
  await mp.waitForTimeout(400);
  const rowState = await mp.evaluate(() =>
    [...document.querySelectorAll('.vf-entry__body, .vf-hero__lead')].map((el) => ({
      clip: getComputedStyle(el).clipPath,
      text: el.innerText.trim().length,
      h: Math.round(el.getBoundingClientRect().height),
    }))
  );
  record(
    'móvil: nada queda escondido tras recorrer la página',
    rowState.every((r) => r.clip !== 'inset(0px 0px 100% 0px)' && r.text > 20 && r.h > 20),
    JSON.stringify(rowState)
  );
  await mp.screenshot({ path: `${SHOTS}/10-movil.png`, fullPage: true });
  await mobile.close();

  // ---------- 7. reduced-motion: estado final, sin armar
  const rm = await browser.newContext({ viewport: { width: 1400, height: 1000 }, reducedMotion: 'reduce' });
  const rp = await rm.newPage();
  await rp.goto(BASE, { waitUntil: 'networkidle' });
  const rmState = await rp.evaluate(() => ({
    armed: document.querySelectorAll('.vf-stage.is-armed').length,
    playing: document.querySelectorAll('.vf-stage.is-playing').length,
    riseClip: getComputedStyle(document.querySelector('.vf-rise')).clipPath,
    visible: document.querySelector('.vf-hero__lead').getBoundingClientRect().height > 0,
  }));
  record('reduced-motion: nada armado', rmState.armed === 0 && rmState.playing === 0, JSON.stringify(rmState));
  record('reduced-motion: contenido en estado final', rmState.riseClip === 'none' && rmState.visible, rmState.riseClip);
  await rp.screenshot({ path: `${SHOTS}/11-reduced-motion.png`, fullPage: true });
  await rm.close();

  // ---------- 8. Placa de código (fixture: content/en/probe-code.md, draft: true)
  await page.goto(`${BASE}probe-code/`, { waitUntil: 'networkidle' });
  const plates = await page.locator('.vf-code').count();
  if (plates === 0) {
    record('código: placa de código (omitido)', true, 'sin fixture probe-code.md: no hay bloques que probar');
  } else {
    const code = await page.evaluate(() => {
      const el = document.querySelector('.vf-code');
      const pre = el.querySelector('pre');
      return {
        plates: document.querySelectorAll('.vf-code').length,
        lang: document.querySelector('.vf-code__lang').textContent,
        copy: document.querySelectorAll('[data-vf-copy]').length,
        preBg: getComputedStyle(pre).backgroundColor,
        chroma: document.querySelectorAll('.chroma').length,
        keywordColor: getComputedStyle(document.querySelector('.chroma .k')).color,
        accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      };
    });
    record('código: placa con lenguaje y copiar', code.plates === 2 && code.copy === 2, JSON.stringify(code));
    record('código: placa sobre paper-3', code.preBg === 'rgb(226, 224, 216)', code.preBg);
    record('código: palabra clave en acento', code.keywordColor === 'rgb(13, 59, 192)', code.keywordColor);
    await page.screenshot({ path: `${SHOTS}/12-codigo.png`, fullPage: true });

    // En modo oscuro también
    await page.evaluate(() => localStorage.setItem('vf-theme', 'dark'));
    await page.goto(`${BASE}probe-code/`, { waitUntil: 'networkidle' });
    const codeDark = await page.evaluate(() => ({
      preBg: getComputedStyle(document.querySelector('.vf-code pre')).backgroundColor,
      key: getComputedStyle(document.querySelector('.chroma .k')).color,
    }));
    record('código oscuro: placa y acento adaptados', codeDark.preBg === 'rgb(22, 24, 29)', JSON.stringify(codeDark));
    await page.screenshot({ path: `${SHOTS}/13-codigo-oscuro.png`, fullPage: true });
    await page.evaluate(() => localStorage.removeItem('vf-theme'));
  }

  record('sin errores de JS', errors.length === 0, errors.slice(0, 3).join(' | '));
  record(
    'sin recursos faltantes (>=400)',
    httpFails.length === 0,
    [...new Set(httpFails)].slice(0, 3).join(' | ')
  );

  // ---------- 9. ¿Qué fuente se renderiza de verdad?
  await page.evaluate(() => localStorage.removeItem('vf-theme'));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => {
    const probe = (family, weight) => {
      const span = document.createElement('span');
      span.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-size:72px;font-weight:${weight};font-family:${family}`;
      span.textContent = 'VSTROFAGO HAMBURGEVONS 0123456789';
      document.body.appendChild(span);
      const w = Math.round(span.getBoundingClientRect().width);
      span.remove();
      return w;
    };
    return {
      sanchezAvailable: document.fonts.check("400 72px 'Sanchez'"),
      plexAvailable: document.fonts.check("400 72px 'IBM Plex Mono'"),
      wSanchez: probe("'Sanchez'", 400),
      wGeorgia: probe('Georgia', 400),
      wPlex: probe("'IBM Plex Mono'", 400),
      wGenericMono: probe('monospace', 400),
      h1Family: getComputedStyle(document.querySelector('h1')).fontFamily,
      bodyFamily: getComputedStyle(document.body).fontFamily,
      loaded: [...document.fonts].map((f) => `${f.family}@${f.weight}:${f.status}`),
    };
  });
  record(
    'Sanchez disponible y distinta del respaldo serif',
    fonts.sanchezAvailable && fonts.wSanchez !== fonts.wGeorgia,
    `${fonts.wSanchez}px vs Georgia ${fonts.wGeorgia}px`
  );
  record(
    'IBM Plex Mono disponible y distinta del mono genérico',
    fonts.plexAvailable && fonts.wPlex !== fonts.wGenericMono,
    `${fonts.wPlex}px vs mono ${fonts.wGenericMono}px`
  );
  record('h1 declara Sanchez primero', /^"?Sanchez/.test(fonts.h1Family.trim()), fonts.h1Family);
  record('body declara IBM Plex Mono primero', /^"?IBM Plex Mono/.test(fonts.bodyFamily.trim()), fonts.bodyFamily);
  record('caras cargadas', fonts.loaded.filter((f) => f.endsWith('loaded')).length >= 2, fonts.loaded.join(', '));

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(JSON.stringify({ total: results.length, failed: failed.length, results }, null, 1));
  process.exit(failed.length ? 1 : 0);
})();

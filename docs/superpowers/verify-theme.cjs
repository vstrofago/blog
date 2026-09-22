/* Verificación real del tema brutalistoic contra el servidor local de Hugo.
   No es un test unitario: mide el CSS aplicado, el contraste WCAG de verdad, el
   contrato de markup de los componentes del DS, el contrato de movimiento y de
   sin-JS, las fuentes que se renderizan y el comportamiento responsive.

   Uso:
     hugo server --port 1319 --bind 127.0.0.1 --disableFastRender --buildDrafts
     NODE_PATH=/home/user/.hermes/hermes-agent/node_modules node docs/superpowers/verify-theme.cjs
   `--buildDrafts` es necesario: la placa de código se prueba contra
   content/en/probe-code.md, que va como `draft: true` para no publicarse nunca.
   Contra lo publicado:
     BL_BASE=https://vstrofago.github.io/blog/ node docs/superpowers/verify-theme.cjs
   (el fixture no está en producción, así que esa comprobación se omite sola).
   Capturas en docs/superpowers/shots (BL_SHOTS para cambiarlo). Sale con 1 si algo falla.

   Dos trampas conocidas, ya sufridas:
   - `color-mix()` se resuelve como `color(srgb r g b / a)` con las componentes en
     0-1: un parser que solo entiende `rgb()` lo salta y la auditoría sale limpia
     en falso. Aquí se parsean las DOS sintaxis y se compone el alfa.
   - La captura `fullPage` no dispara el `IntersectionObserver`: se recorre la
     página con `window.scrollTo` antes de capturar y de juzgar alturas. */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.BL_BASE || 'http://127.0.0.1:1319/blog/';
const SHOTS = process.env.BL_SHOTS || 'docs/superpowers/shots';
const DUMP = process.env.BL_DUMP || '/home/user/.hermes/cache/scratch/brutalo/dom.json';

const results = [];
const record = (name, pass, detail) => results.push({ name, pass: !!pass, detail: String(detail ?? '') });

/* ---------- color: la auditoría lleva sus propios parsers dentro ----------
   (ver auditContrast). Aquí solo queda el contrato de markup. */

/* Auditoría AA por página: umbral 4.5, o 3.0 en texto grande (>=24px, o >=18.66px
   en negrita). Se deduplica por RUTA del elemento, nunca por color+fondo. */
const auditContrast = () => {
  /* Estos helpers van DENTRO de la función: Playwright la serializa y la ejecuta
     en la página, sin acceso al ámbito de Node. */
  const parseColor = (raw) => {
    const str = String(raw || '').trim();
    let m = str.match(/^rgba?\(([^)]+)\)$/i);
    if (m) {
      const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    m = str.match(/^color\(srgb\s+([^)]+)\)$/i);
    if (m) {
      const p = m[1].split(/[/\s]+/).filter(Boolean).map(Number);
      return { r: Math.round(p[0] * 255), g: Math.round(p[1] * 255), b: Math.round(p[2] * 255), a: p.length > 3 ? p[3] : 1 };
    }
    return null;
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const lum = ({ r, g, b }) => {
    const f = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const contrast = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  const canvas = parseColor(getComputedStyle(document.documentElement).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  const bgOf = (el) => {
    let node = el;
    let acc = canvas;
    const stack = [];
    while (node && node.nodeType === 1) {
      const c = parseColor(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0) stack.push(c);
      node = node.parentElement;
    }
    for (let i = stack.length - 1; i >= 0; i--) acc = over(stack[i], acc);
    return acc;
  };
  const pathOf = (el) => {
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.documentElement) {
      let piece = node.tagName.toLowerCase();
      if (node.id) { parts.unshift(piece + '#' + node.id); break; }
      const cls = (node.className && node.className.baseVal !== undefined ? node.className.baseVal : node.className || '').toString().trim().split(/\s+/).filter(Boolean);
      if (cls.length) piece += '.' + cls.join('.');
      const parent = node.parentElement;
      if (parent) {
        const same = [...parent.children].filter((c) => c.tagName === node.tagName);
        if (same.length > 1) piece += ':nth(' + (same.indexOf(node) + 1) + ')';
      }
      parts.unshift(piece);
      node = parent;
    }
    return parts.join(' > ');
  };
  const out = [];
  const seen = new Set();
  document.querySelectorAll('body *').forEach((el) => {
    if (el.closest('[aria-hidden="true"]')) return; // decorativo: sin contrato de lectura
    if (el.closest('svg')) return;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    // solo nodos con texto propio
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!own) return;
    const fgRaw = parseColor(style.color);
    if (!fgRaw || fgRaw.a === 0) return;
    const bg = bgOf(el);
    const fg = over(fgRaw, bg);
    const size = parseFloat(style.fontSize);
    const weight = Number(style.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const ratio = contrast(fg, bg);
    const need = large ? 3.0 : 4.5;
    const path = pathOf(el);
    if (seen.has(path)) return;
    seen.add(path);
    if (ratio < need) {
      out.push({ path, ratio: ratio.toFixed(2), need, text: el.textContent.trim().slice(0, 40) });
    }
  });
  return out;
};

/* Contrato de markup: cada clase compuesta que el componente real emite tiene que
   aparecer en el HTML renderizado (el contenido de cada hueco es nuestro). */
const classCombos = (html) => {
  const set = new Set();
  const re = /class="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) set.add(m[1].trim().split(/\s+/).sort().join(' '));
  return set;
};

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const dump = fs.existsSync(DUMP) ? JSON.parse(fs.readFileSync(DUMP, 'utf8')) : null;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  const httpFails = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && !/probe-code/.test(r.url())) httpFails.push(`${r.status()} ${r.url()}`);
  });

  const walk = async () => {
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.7;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);
  };

  /* ---------- 1. Portada ---------- */
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  let s = await page.evaluate(() => {
    const cs = (sel, el) => getComputedStyle(el || document.querySelector(sel));
    const root = getComputedStyle(document.documentElement);
    const h1 = document.querySelector('h1');
    const still = document.querySelector('.bl-abanner--still');
    return {
      themeDoc: document.documentElement.getAttribute('data-theme'),
      themeBody: document.body.getAttribute('data-theme'),
      blRoot: document.body.classList.contains('bl-root'),
      bg: cs('body').backgroundColor,
      bodyFont: cs('body').fontFamily,
      h1Font: h1 ? cs(null, h1).fontFamily : null,
      h1Size: h1 ? parseFloat(cs(null, h1).fontSize) : 0,
      rowTitleSize: document.querySelector('.vf-entry__title') ? parseFloat(cs('.vf-entry__title').fontSize) : 0,
      muted: root.getPropertyValue('--bl-muted').trim().slice(0, 40),
      line: root.getPropertyValue('--bl-line').trim().slice(0, 40),
      accentEyebrow: document.querySelector('.vf-hero .bl-eyebrow') ? cs('.vf-hero .bl-eyebrow').getPropertyValue('--eyebrow').trim() : '',
      mgToken: root.getPropertyValue('--mg').trim(),
      emptyAnchors: document.querySelectorAll('a[href="#"]').length,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      bannerPres: still ? still.querySelectorAll('pre').length : 0,
      bannerInk: still ? (still.querySelectorAll('pre')[1] || { textContent: '' }).textContent.replace(/\s/g, '').length : 0,
      bannerBox: (() => {
        const b = document.querySelector('.vf-banner__box');
        const r = b.getBoundingClientRect();
        return Math.round(r.width) + 'x' + Math.round(r.height);
      })(),
      canvasBayer: document.querySelectorAll('canvas.bl-bayer').length,
      bayerPainted: (() => {
        const c = document.querySelector('canvas.bl-bayer');
        if (!c) return -1;
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
        return n;
      })(),
      featuredIsCard: !!document.querySelector('.bl-card.vf-featured'),
      footerOk: (document.querySelector('.vf-footer__ok') || { textContent: '' }).textContent,
    };
  });
  record('un solo tema: data-theme="terminal" en el documento', s.themeDoc === 'terminal', s.themeDoc);
  record('sin toggle: body sin data-theme y con .bl-root', s.themeBody === null && s.blRoot, `${s.themeBody}/${s.blRoot}`);
  record('suelo #141414', s.bg === 'rgb(20, 20, 20)', s.bg);
  record('cuerpo en Space Grotesk', /Space Grotesk/.test(s.bodyFont || ''), s.bodyFont);
  record('H1 en Jacquard24', /Jacquard24/.test(s.h1Font || ''), s.h1Font);
  record('H1 es el título mayor de la página', s.h1Size > s.rowTitleSize, `h1 ${s.h1Size}px vs fila ${s.rowTitleSize}px`);
  record('derivados del DS presentes (bl-muted / bl-line)', !!s.muted && !!s.line, `${s.muted} | ${s.line}`);
  record('eyebrow de portada en el acento mg', s.accentEyebrow === s.mgToken && s.mgToken.length > 0, `${s.accentEyebrow} == ${s.mgToken}`);
  record('fotograma horneado: 3 capas ASCII', s.bannerPres === 3, s.bannerPres);
  record('fotograma horneado: el logo está dibujado (no un boceto)', s.bannerInk > 200, s.bannerInk + ' glifos');
  record('caja del banner con la geometría del DS (1100x420)', s.bannerBox === '1100x420', s.bannerBox);
  record('dither Bayer pintado en superficies', s.canvasBayer >= 1 && s.bayerPainted > 500, `${s.canvasBayer} canvas / ${s.bayerPainted} píxeles`);
  record('destacada como Card del DS', s.featuredIsCard === true, String(s.featuredIsCard));
  record('estado del pie con palabra (OK), nunca color solo', /OK/.test(s.footerOk), s.footerOk);
  record('sin href="#"', s.emptyAnchors === 0, s.emptyAnchors);
  record('portada: sin overflow horizontal', s.overflow <= 0, s.overflow);

  await walk();
  await page.screenshot({ path: `${SHOTS}/01-portada.png`, fullPage: true });

  // La isla AsciiBanner tiene que montar de verdad y sustituir al fotograma
  // (React + bundle del DS, en diferido, solo aquí).
  let island = { mounted: false };
  try {
    await page.waitForFunction(
      () => {
        const m = document.querySelector('[data-bl-banner-mount]');
        return m && !m.hidden && m.querySelector('.bl-abanner');
      },
      { timeout: 20000 }
    );
    island = await page.evaluate(() => {
      const mount = document.querySelector('[data-bl-banner-mount]');
      const still = document.querySelector('.bl-abanner--still');
      const live = mount.querySelector('.bl-abanner');
      return {
        mounted: true,
        shown: !mount.hidden,
        stillHidden: still.hidden,
        pres: live.querySelectorAll('pre').length,
        roleImg: live.getAttribute('role') === 'img',
        rows: live.querySelectorAll('pre')[0] ? live.querySelectorAll('pre')[0].textContent.split('\n').length : 0,
      };
    });
  } catch (e) {
    island = { mounted: false, error: String(e.message).slice(0, 80) };
  }
  record(
    'isla AsciiBanner: monta y sustituye al fotograma',
    island.mounted && island.shown && island.stillHidden && island.pres === 3 && island.roleImg,
    JSON.stringify(island)
  );
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SHOTS}/01b-portada-isla.png`, fullPage: true });

  const fails = await page.evaluate(auditContrast);
  record('contraste AA en portada', fails.length === 0, JSON.stringify(fails.slice(0, 4)));

  /* ---------- 2. Entrada ---------- */
  await page.goto(`${BASE}posts/why-cant-we-just-start/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  let e = await page.evaluate(() => {
    const head = document.querySelector('.bl-article-head');
    const title = document.querySelector('.bl-article-head__title');
    const prose = document.querySelector('.bl-prose');
    return {
      head: !!head,
      headClasses: head ? head.className : '',
      inner: !!document.querySelector('.bl-article-head__inner'),
      kicker: !!document.querySelector('.p, .bl-article-head__kicker'),
      kickerClass: (document.querySelector('.bl-article-head__kicker') || {}).className || '',
      titleClass: (title || {}).className || '',
      titleFont: title ? getComputedStyle(title).fontFamily : '',
      deckFont: document.querySelector('.bl-article-head__deck') ? getComputedStyle(document.querySelector('.bl-article-head__deck')).fontFamily : '',
      metaClass: (document.querySelector('.bl-article-head__meta') || {}).className || '',
      proseFont: prose ? getComputedStyle(prose).fontFamily : '',
      proseSize: prose ? getComputedStyle(prose).fontSize : '',
      proseMeasure: prose ? Math.round(prose.getBoundingClientRect().width) : 0,
      proseH2Font: prose && prose.querySelector('h2') ? getComputedStyle(prose.querySelector('h2')).fontFamily : '',
      toc: document.querySelectorAll('.bl-card.vf-toc').length,
      crumbs: document.querySelectorAll('.vf-crumbs').length,
      postNav: document.querySelectorAll('.vf-post-nav__item').length,
      badges: document.querySelectorAll('.bl-badge').length,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  record('ArticleHeader: estructura del DS (head/inner/kicker/title/deck/meta)', e.head && e.inner && /bl-article-head__kicker/.test(e.kickerClass) && /bl-article-head__title/.test(e.titleClass) && /bl-article-head__meta/.test(e.metaClass), JSON.stringify({ k: e.kickerClass, t: e.titleClass, m: e.metaClass }));
  record('ArticleHeader: título en Jacquard24', /Jacquard24/.test(e.titleFont), e.titleFont);
  record('ArticleHeader: deck en Techno Vibe', /Techno Vibe/.test(e.deckFont), e.deckFont);
  record('prosa de entrada en IBM Plex Serif 18px', /IBMPlex Serif/.test(e.proseFont) && e.proseSize === '18px', `${e.proseFont} / ${e.proseSize}`);
  record('prosa con medida 66ch', e.proseMeasure > 560 && e.proseMeasure < 820, e.proseMeasure + 'px');
  record('h2 de la prosa en Techno Vibe', /Techno Vibe/.test(e.proseH2Font || ''), e.proseH2Font);
  record('TOC como placa Card del DS', e.toc === 1, e.toc);
  record('breadcrumbs', e.crumbs === 1, e.crumbs);
  record('prev/next', e.postNav >= 1, e.postNav);
  record('temas como Badge del DS', e.badges >= 1, e.badges);
  record('entrada: sin overflow horizontal', e.overflow <= 0, e.overflow);

  // TOC plegado y abrible sin JS (details nativo)
  const tocOpenBefore = await page.locator('.vf-toc details').getAttribute('open');
  await page.click('.vf-toc details > summary');
  await page.waitForTimeout(120);
  record('TOC plegado por defecto y abre al clic', tocOpenBefore === null && (await page.locator('.vf-toc details[open]').count()) === 1, 'details nativo');
  await walk();
  await page.screenshot({ path: `${SHOTS}/02-entrada.png`, fullPage: true });
  const entryFails = await page.evaluate(auditContrast);
  record('contraste AA en entrada', entryFails.length === 0, JSON.stringify(entryFails.slice(0, 4)));

  // markup de componentes vs. el dump del bundle real
  if (dump) {
    const combos = await page.evaluate(() => document.body.innerHTML);
    const rendered = classCombos(combos);
    for (const [caseName, sel] of [['ArticleHeader', '.bl-article-head']]) {
      const subtree = await page.evaluate((s) => {
        const el = document.querySelector(s);
        return el ? el.outerHTML : '';
      }, sel);
      const want = classCombos(dump[caseName]);
      const have = classCombos(subtree);
      const missing = [...want].filter((c) => !have.has(c));
      record(`markup del componente ${caseName} = dump del bundle`, missing.length === 0, 'faltan: ' + missing.join(', '));
    }
  } else {
    record('markup de componentes (omitido)', true, 'sin dump dom.json');
  }

  /* ---------- 3. Búsqueda ---------- */
  await page.goto(`${BASE}search/`, { waitUntil: 'networkidle' });
  const fieldDom = await page.evaluate(() => ({
    field: document.querySelectorAll('.bl-field').length,
    prompt: (document.querySelector('.bl-field__prompt') || {}).textContent,
    input: document.querySelectorAll('.bl-field__input').length,
    label: !!document.querySelector('.bl-field label.bl-label'),
  }));
  record('búsqueda: Field del DS (label + prompt > + input)', fieldDom.field === 1 && fieldDom.prompt === '>' && fieldDom.input === 1 && fieldDom.label, JSON.stringify(fieldDom));
  await page.fill('[data-bl-search-input]', 'vulture');
  await page.waitForTimeout(700);
  const hits = await page.locator('.vf-entry--hit').count();
  const status = await page.locator('[data-bl-search-status]').textContent();
  record('búsqueda: encuentra la entrada y cuenta exacta', hits >= 1 && /\d+ entr/.test(status), `${hits} / "${status}"`);
  await walk();
  await page.screenshot({ path: `${SHOTS}/03-busqueda.png`, fullPage: true });
  await page.fill('[data-bl-search-input]', 'zzzz');
  await page.waitForTimeout(500);
  record('búsqueda: sin resultados avisa con texto', (await page.locator('.vf-entry--hit').count()) === 0 && (await page.locator('[data-bl-search-status]').textContent()).length > 0, await page.locator('[data-bl-search-status]').textContent());

  /* ---------- 4. 404 con HUD + lista + ES ---------- */
  await page.goto(`${BASE}404.html`, { waitUntil: 'networkidle' });
  const hud = await page.evaluate(() => ({
    frame: document.querySelectorAll('.bl-frame').length,
    hudSet: document.querySelectorAll('.bl-hud-set').length,
    hud: document.querySelectorAll('.bl-hud').length,
    btn: document.querySelectorAll('.bl-btn--primary').length,
  }));
  record('404: placa con Frame y esquinas HUD (4)', hud.frame === 1 && hud.hudSet === 1 && hud.hud === 4 && hud.btn === 1, JSON.stringify(hud));
  await page.screenshot({ path: `${SHOTS}/04-404.png`, fullPage: true });

  await page.goto(`${BASE}posts/`, { waitUntil: 'networkidle' });
  const nums = await page.locator('.vf-entry__num').allTextContents();
  record('lista: numeración N.º NN en mono', nums.length > 0 && nums.every((n) => /N\.º \d\d/.test(n.trim())), nums.join(','));
  await walk();
  await page.screenshot({ path: `${SHOTS}/05-lista.png`, fullPage: true });

  await page.goto(`${BASE}es/`, { waitUntil: 'networkidle' });
  const esNav = await page.locator('.vf-nav__link').allTextContents();
  const esH1 = (await page.locator('h1').first().textContent()).trim();
  record('ES: menú y portada traducidos', esNav.join('|').includes('Entradas') && /Hola/.test(esH1), `${esNav.join('|')} / ${esH1}`);
  const langLinks = await page.locator('.vf-lang__link').count();
  record('selector de idioma enlaza a la página traducida', langLinks >= 1, langLinks);
  await walk();
  await page.screenshot({ path: `${SHOTS}/06-portada-es.png`, fullPage: true });

  /* ---------- 5. Móvil 390px ---------- */
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mp = await mobile.newPage();
  for (const route of ['', 'posts/why-cant-we-just-start/', 'search/']) {
    await mp.goto(BASE + route, { waitUntil: 'networkidle' });
    const over = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    record(`móvil 390px sin overflow: /${route}`, over <= 1, over);
  }
  await mp.goto(BASE, { waitUntil: 'networkidle' });
  await mp.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await mp.waitForTimeout(300);
  await mp.screenshot({ path: `${SHOTS}/07-movil-portada.png`, fullPage: true });
  await mp.goto(`${BASE}posts/why-cant-we-just-start/`, { waitUntil: 'networkidle' });
  await mp.screenshot({ path: `${SHOTS}/08-movil-entrada.png`, fullPage: true });
  await mobile.close();

  /* ---------- 6. prefers-reduced-motion ---------- */
  const rm = await browser.newContext({ viewport: { width: 1400, height: 1000 }, reducedMotion: 'reduce' });
  const rp = await rm.newPage();
  await rp.goto(BASE, { waitUntil: 'networkidle' });
  await rp.waitForTimeout(600);
  const rmState = await rp.evaluate(() => {
    const still = document.querySelector('.bl-abanner--still');
    const live = document.querySelector('[data-bl-banner-mount]');
    const anims = document.getAnimations().filter((a) => a.playState === 'running');
    const crt = document.querySelector('.bl-crt');
    return {
      stillVisible: !!still && !still.hidden,
      liveHidden: !!live && live.hidden,
      ink: still ? (still.querySelectorAll('pre')[1] || { textContent: '' }).textContent.replace(/\s/g, '').length : 0,
      running: anims.length,
      crtAnim: crt ? getComputedStyle(crt, '::after').animationName : 'sin CRT en esta página',
    };
  });
  record('reduced-motion: la isla NO monta, manda el fotograma', rmState.stillVisible && rmState.liveHidden, JSON.stringify(rmState));
  record('reduced-motion: el fotograma está entero (no un dibujo a medias)', rmState.ink > 200, rmState.ink + ' glifos');
  record('reduced-motion: nada anima', rmState.running === 0, rmState.running + ' animaciones');
  await rp.screenshot({ path: `${SHOTS}/09-reduced-motion.png`, fullPage: true });
  await rm.close();

  /* ---------- 7. Sin JS ---------- */
  const nj = await browser.newContext({ viewport: { width: 1400, height: 1000 }, javaScriptEnabled: false });
  const np = await nj.newPage();
  await np.goto(BASE, { waitUntil: 'domcontentloaded' });
  const noJs = await np.evaluate(() => {
    const still = document.querySelector('.bl-abanner--still');
    return {
      nav: document.querySelectorAll('.vf-nav__link').length,
      entries: document.querySelectorAll('.vf-entry').length,
      pres: still ? still.querySelectorAll('pre').length : 0,
      ink: still ? (still.querySelectorAll('pre')[1] || { textContent: '' }).textContent.replace(/\s/g, '').length : 0,
    };
  });
  record('sin JS: navegación e índice legibles', noJs.nav >= 2 && noJs.entries >= 1, JSON.stringify(noJs));
  record('sin JS: el banner muestra el fotograma', noJs.pres === 3 && noJs.ink > 200, JSON.stringify(noJs));
  await np.goto(`${BASE}search/`, { waitUntil: 'domcontentloaded' });
  const noscript = await np.evaluate(() => {
    const n = document.querySelector('noscript');
    return n ? n.textContent.trim().length > 0 : false;
  });
  record('sin JS: la búsqueda avisa con noscript', noscript, String(noscript));
  await np.goto(`${BASE}posts/why-cant-we-just-start/`, { waitUntil: 'domcontentloaded' });
  const noJsToc = await np.locator('.vf-toc details summary').count();
  record('sin JS: el TOC plegado sigue siendo abrible', noJsToc === 1, noJsToc);
  await np.screenshot({ path: `${SHOTS}/10-sin-js.png`, fullPage: true });
  await nj.close();

  /* ---------- 8. Impresión ---------- */
  await page.goto(`${BASE}posts/why-cant-we-just-start/`, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  const printState = await page.evaluate(() => {
    const hidden = (sel) => {
      const el = document.querySelector(sel);
      return !el || getComputedStyle(el).display === 'none';
    };
    const code = document.querySelector('.bl-terminal');
    return {
      chrome: hidden('.vf-header') && hidden('.vf-footer'),
      dither: hidden('.bl-bayer'),
      banner: hidden('.vf-banner'),
      nav: hidden('.vf-post-nav'),
      crt: code ? getComputedStyle(code, '::after').display === 'none' : true,
      codeVisible: code ? getComputedStyle(code).display !== 'none' : true,
      bg: getComputedStyle(document.body).backgroundColor,
    };
  });
  record('impresión: chrome, dither, banner y nav fuera', printState.chrome && printState.dither && printState.banner && printState.nav, JSON.stringify(printState));
  record('impresión: sin CRT y con el código legible en claro', printState.crt && printState.codeVisible, JSON.stringify(printState));
  await page.emulateMedia({ media: 'screen' });

  /* ---------- 9. Placa de código (fixture draft: content/en/probe-code.md) ---------- */
  await page.goto(`${BASE}probe-code/`, { waitUntil: 'networkidle' });
  const plates = await page.locator('.bl-terminal').count();
  if (plates === 0) {
    record('código: placa Terminal (omitido)', true, 'sin fixture probe-code.md: hay que arrancar con --buildDrafts');
  } else {
    const code = await page.evaluate(() => {
      const el = document.querySelector('.bl-terminal');
      const pre = el.querySelector('pre');
      const crt = getComputedStyle(el, '::after');
      return {
        plates: document.querySelectorAll('.bl-terminal').length,
        crt: el.classList.contains('bl-crt'),
        bar: !!el.querySelector('.bl-terminal__bar'),
        copy: document.querySelectorAll('[data-bl-copy]').length,
        lang: (el.querySelector('.bl-terminal__bar span') || {}).textContent,
        preBg: getComputedStyle(pre).backgroundColor,
        chroma: document.querySelectorAll('.chroma').length,
        keyword: document.querySelector('.chroma .k') ? getComputedStyle(document.querySelector('.chroma .k')).color : '',
        comment: document.querySelector('.chroma .c, .chroma .cm, .chroma .c1') ? getComputedStyle(document.querySelector('.chroma .c, .chroma .cm, .chroma .c1')).color : '',
        scanlines: crt.backgroundImage.includes('repeating-linear-gradient'),
      };
    });
    record('código: Terminal del DS (marco + CRT + barra + copiar)', code.plates >= 1 && code.crt && code.bar && code.copy >= 1 && code.scanlines, JSON.stringify(code));
    record('código: Chroma resaltado con clases (keywords en og)', code.chroma > 0 && code.keyword === 'rgb(232, 163, 133)', `${code.chroma} tokens / ${code.keyword}`);
    record('código: comentarios en bl-muted', code.comment.length > 0, code.comment);
    await page.screenshot({ path: `${SHOTS}/11-codigo.png`, fullPage: true });
    const codeFails = await page.evaluate(auditContrast);
    record('contraste AA en la página de código', codeFails.length === 0, JSON.stringify(codeFails.slice(0, 4)));
  }

  /* ---------- 10. Fuentes reales (no fallback silencioso) ---------- */
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(async () => {
    const mk = (f) => {
      const span = document.createElement('span');
      span.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-size:72px;font-family:${f}`;
      span.textContent = 'VSTROFAGO HAMBURGEVONS 0123456789';
      document.body.appendChild(span);
      const w = Math.round(span.getBoundingClientRect().width);
      span.remove();
      return w;
    };
    // El respaldo de comparación es el DECLARADO tras la cara en tokens.css.
    // Ojo con Space Grotesk: nace de Space Mono y comparte métrica con el mono
    // genérico, así que contra `monospace` la sonda no discrimina (medido: 1426
    // == 1426); se compara contra `sans-serif`, su respaldo real de cadena.
    const cases = {
      jacquard: ["'Jacquard24'", 'serif'],
      techno: ["'Techno Vibe Font'", 'monospace'],
      grotesk: ["'Space Grotesk'", 'sans-serif'],
      plex: ["'IBMPlex Serif'", 'Georgia'],
      geist: ["'Geist Mono'", 'monospace'],
    };
    const out = {};
    for (const [name, [family, fallback]] of Object.entries(cases)) {
      let faces = 0;
      try {
        faces = (await document.fonts.load(`400 72px ${family}`)).length;
      } catch (e) {
        faces = 0;
      }
      out[name] = {
        faces,
        check: document.fonts.check(`400 72px ${family}`),
        own: mk(family),
        base: mk(fallback),
        status: [...document.fonts].filter((f) => family.includes(f.family) && f.status === 'loaded').length,
      };
    }
    return out;
  });
  for (const [name, f] of Object.entries(fonts)) {
    record(
      `fuente ${name}: cargada y distinta del respaldo`,
      f.check && f.faces >= 1 && f.status >= 1 && f.own !== f.base,
      `check=${f.check} faces=${f.faces} status=${f.status} ${f.own}px vs ${f.base}px`
    );
  }

  record('sin errores de JS', errors.length === 0, errors.slice(0, 3).join(' | '));
  record('sin recursos faltantes (>=400)', httpFails.length === 0, [...new Set(httpFails)].slice(0, 3).join(' | '));

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(JSON.stringify({ base: BASE, total: results.length, failed: failed.length, results }, null, 1));
  process.exit(failed.length ? 1 : 0);
})();

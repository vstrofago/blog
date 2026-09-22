// tokens.json -> tokens.css. tokens.json is the source of truth; tokens.css is generated.
// usage: node tokens/build.mjs           regenerate tokens/tokens.css
//        node tokens/build.mjs --check   exit 1 if tokens.css is out of sync (writes nothing)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = JSON.parse(fs.readFileSync(path.join(dir, 'tokens.json'), 'utf8'));
const outPath = path.join(dir, 'tokens.css');
const check = process.argv.includes('--check');

const themes = src.color.themes.map(t => t.id);
const lit = v => {
  if (typeof v !== 'string') throw new Error('token value missing for a declared theme');
  return v.startsWith('{') ? `var(--${v.slice(1, -1)})` : v;
};
const fam = f => f.replace(/"/g, "'");

const L = [];
L.push('/* brutalistoic — generated from tokens.json */');
themes.forEach((theme, i) => {
  const sel = i === 0 ? `:root, [data-theme="${theme}"]` : `[data-theme="${theme}"]`;
  L.push(`${sel} {`);
  for (const t of src.color.tokens) {
    const v = lit(t.value[theme]);
    L.push(i === 0 ? `  --${t.name}: ${v}; /* ${t.usage} */` : `  --${t.name}: ${v};`);
  }
  L.push('}');
});
L.push(':root {');
for (const section of [src.spacing, src.radius, src.border]) {
  for (const t of section.tokens) L.push(`  --${t.name}: ${t.value}; /* ${t.usage} */`);
}
for (const [key, value] of Object.entries(src.type.families)) L.push(`  --font-${key}: ${fam(value)};`);
const styles = src.type.groups.flatMap(g => g.styles);
for (const s of styles) {
  const slant = s.fontStyle && s.fontStyle !== 'normal' ? `${s.fontStyle} ` : '';
  L.push(`  --text-${s.name}: ${slant}${s.fontWeight} ${s.fontSize}/${s.lineHeight} var(--font-${s.family}); /* ${s.usage} */`);
}
L.push('}');
for (const s of styles) {
  L.push(`.${s.name} {`);
  L.push(`  font-family: var(--font-${s.family});`);
  L.push(`  font-size: ${s.fontSize};`);
  L.push(`  line-height: ${s.lineHeight};`);
  L.push(`  font-weight: ${s.fontWeight};`);
  L.push(`  letter-spacing: ${s.letterSpacing};`);
  L.push('}');
}
const format = f => (f.endsWith('.otf') ? 'opentype' : 'truetype');
for (const f of src.type.fonts) {
  const url = '../' + f.file.split('/').map(encodeURIComponent).join('/');
  L.push('@font-face {');
  L.push(`  font-family: "${f.family}";`);
  L.push(`  src: url("${url}") format("${format(f.file)}");`);
  L.push(`  font-weight: ${f.weight};`);
  L.push(`  font-style: ${f.style};`);
  L.push('  font-display: swap;');
  L.push('}');
}
const next = L.join('\n') + '\n';
const prev = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : null;

if (check) {
  if (prev !== next) {
    console.error('tokens.css is out of sync with tokens.json — run: node tokens/build.mjs');
    process.exit(1);
  }
  console.log('tokens.css in sync with tokens.json');
  process.exit(0);
}
fs.writeFileSync(outPath, next);
console.log(`wrote ${outPath} (${next.length} bytes, ${styles.length} text styles, ${src.type.fonts.length} @font-face, ${src.color.tokens.length} colour tokens per theme)`);

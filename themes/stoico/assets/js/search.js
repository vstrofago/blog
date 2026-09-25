/* Client-side search over Hugo's JSON index (layouts/home.json). No dependencies and no
   network beyond the site's own index. Results render as the same hairline rows as the
   notes index. "/" focuses the field. */
(() => {
  const root = document.querySelector('[data-search]');
  if (!root) return;

  const input = root.querySelector('[data-search-input]');
  const results = root.querySelector('[data-search-results]');
  const status = root.querySelector('[data-search-status]');
  const url = root.getAttribute('data-index');
  const labelNone = root.getAttribute('data-label-none') || '';
  const labelCount = root.getAttribute('data-label-count') || '';
  const minChars = 2;

  const fold = (value) =>
    (value || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  let index = null;
  let loading = null;

  const load = () => {
    if (index) return Promise.resolve(index);
    if (!loading) {
      loading = fetch(url, { credentials: 'same-origin' })
        .then((response) => (response.ok ? response.json() : []))
        .then((data) => {
          index = Array.isArray(data) ? data : [];
          return index;
        })
        .catch(() => {
          index = [];
          return index;
        });
    }
    return loading;
  };

  const escapeHtml = (value) =>
    (value || '').replace(/[&<>"]/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    })[ch]);

  const snippet = (entry, needle) => {
    const text = entry.summary || entry.content || '';
    const flat = text.replace(/\s+/g, ' ').trim();
    if (!needle) return flat.slice(0, 180);
    const at = fold(flat).indexOf(needle);
    if (at < 0) return flat.slice(0, 180);
    const from = Math.max(0, at - 60);
    const window_ = flat.slice(from, from + 200);
    return (from > 0 ? '…' : '') + window_ + (from + 200 < flat.length ? '…' : '');
  };

  const render = (hits, needle) => {
    if (!hits.length) {
      results.innerHTML = '';
      status.textContent = labelNone + ' “' + input.value.trim() + '”.';
      return;
    }
    status.textContent = hits.length + ' ' + labelCount;
    results.innerHTML = hits
      .map((entry) => {
        const body = escapeHtml(snippet(entry, needle)).replace(
          needle ? new RegExp('(' + needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi') : /^$/,
          '<mark>$1</mark>'
        );
        return (
          '<li class="ed-row"><a class="ed-row__link" href="' + escapeHtml(entry.permalink) + '">' +
          '<span class="ed-row__num">' + escapeHtml(entry.date || '') + '</span>' +
          '<span class="ed-row__body"><span class="ed-row__title">' + escapeHtml(entry.title) + '</span>' +
          '<span class="ed-row__dek">' + body + '</span></span>' +
          '<span class="ed-row__meta"></span></a></li>'
        );
      })
      .join('');
  };

  let timer = null;

  const run = () => {
    const query = input.value.trim();
    const needle = fold(query);
    if (needle.length < minChars) {
      results.innerHTML = '';
      status.textContent = '';
      return;
    }
    load().then((data) => {
      const hits = data
        .filter((entry) => {
          const haystack = fold(
            [entry.title, entry.summary, (entry.tags || []).join(' '), entry.content].join(' ')
          );
          return needle.split(/\s+/).every((word) => haystack.indexOf(word) >= 0);
        })
        .slice(0, 32);
      render(hits, needle);
    });
  };

  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.target === input || /input|textarea|select/i.test(event.target.tagName)) return;
    event.preventDefault();
    input.focus();
  });

  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(run, 120);
  });
})();

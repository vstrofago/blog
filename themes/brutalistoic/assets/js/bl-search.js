/* brutalistoic — búsqueda en cliente sobre el índice JSON de Hugo.
   Sin dependencias ni dependencia de red más allá del propio índice del sitio. */
(() => {
  const root = document.querySelector('[data-bl-search]');
  if (!root) return;

  const input = root.querySelector('[data-bl-search-input]');
  const results = root.querySelector('[data-bl-search-results]');
  const status = root.querySelector('[data-bl-search-status]');
  const url = root.getAttribute('data-bl-index');
  const labelNone = root.getAttribute('data-bl-label-none') || '';
  const labelCount = root.getAttribute('data-bl-label-count') || '';
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
      status.textContent = labelNone;
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
          '<li class="vf-entry vf-entry--hit">' +
          '<div class="vf-entry__num mono">' +
          escapeHtml(entry.date || '') +
          '</div>' +
          '<div class="vf-entry__body">' +
          '<h3 class="bl-subtitle vf-entry__title">' +
          '<a href="' +
          escapeHtml(entry.permalink) +
          '">' +
          escapeHtml(entry.title) +
          '</a></h3>' +
          '<p class="vf-entry__summary">' +
          body +
          '</p>' +
          '</div></li>'
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

  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(run, 120);
  });
})();

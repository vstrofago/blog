/* brutalistoic — botón de copiar de las placas Terminal.
   Etiquetas traducidas vía data-attributes; el estado "copiado" se anuncia en el
   propio botón y se revierte solo. */
(() => {
  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
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

  document.querySelectorAll('[data-bl-copy]').forEach((btn) => {
    const idle = btn.textContent;
    const done = btn.getAttribute('data-bl-copied') || idle;

    btn.addEventListener('click', async () => {
      const plate = btn.closest('.bl-terminal');
      const code = plate ? plate.querySelector('pre code, pre') : null;
      if (!code) return;
      try {
        await copyText(code.innerText);
      } catch (e) {
        return;
      }
      btn.textContent = done;
      btn.setAttribute('data-copied', 'true');
      window.setTimeout(() => {
        btn.textContent = idle;
        btn.setAttribute('data-copied', 'false');
      }, 1600);
    });
  });
})();

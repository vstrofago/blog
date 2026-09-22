/* brutalistoic — isla de la portada: AsciiBanner.
   Único punto del sitio que carga React y el bundle del DS (~2.4 MB): se descarga
   solo cuando la caja entra en pantalla y nunca toca otro page load. Con
   prefers-reduced-motion no se monta nada: el fotograma horneado es el estado
   final (D6). Si la isla falla en cualquier paso, el fotograma se queda. */
(() => {
  const box = document.querySelector('[data-bl-banner]');
  if (!box) return;

  const mount = box.querySelector('[data-bl-banner-mount]');
  const still = box.querySelector('.bl-abanner--still');
  if (!mount || !still) return;

  // Sin movimiento: nada de isla, el fotograma quieto ya es el resultado.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const vendor = box.getAttribute('data-bl-vendor') || '';
  const rows = parseInt(box.getAttribute('data-bl-rows') || '30', 10);
  const size = parseInt(box.getAttribute('data-bl-size') || '11', 10);
  const alt = box.getAttribute('data-bl-alt') || '';

  let started = false;
  let failed = false;

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('ERR: no se pudo cargar ' + src));
      document.head.appendChild(script);
    });

  const mountBanner = async () => {
    if (started || failed) return;
    started = true;
    try {
      await loadScript(vendor + '/react/react.production.min.js');
      await loadScript(vendor + '/react/react-dom.production.min.js');
      await loadScript(vendor + '/dist/bundle.js');
      const React = window.React;
      const ReactDOM = window.ReactDOM;
      const B = window.Brutalistoic;
      if (!React || !ReactDOM || !B || !B.AsciiBanner) throw new Error('ERR: bundle sin AsciiBanner');
      const root = ReactDOM.createRoot(mount);
      root.render(React.createElement(B.AsciiBanner, { rows: rows, size: size, alt: alt }));
      mount.hidden = false;
      still.hidden = true;
    } catch (e) {
      // El fotograma horneado sigue ahí: nunca hay hueco.
      failed = true;
      started = false;
    }
  };

  if (!('IntersectionObserver' in window)) {
    mountBanner();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          mountBanner();
        }
      });
    },
    { rootMargin: '200px' }
  );
  observer.observe(box);
})();

/* VSTROFAGO — arranque del motion del DS.
   Respeta el contrato: los elementos ya están en su estado FINAL en el HTML; JS arma
   el contenedor (.is-armed) y lo pone a jugar (.is-playing) cuando entra en pantalla.
   Con prefers-reduced-motion no se arma nada: se ve el estado final.
   Sin JS, sin IntersectionObserver o si el usuario cambia a "reducir movimiento",
   el contenido queda terminado. */
(() => {
  const stages = Array.from(document.querySelectorAll('.vf-stage'));
  if (!stages.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supported = 'IntersectionObserver' in window;

  const disarm = () => {
    stages.forEach((stage) => stage.classList.remove('is-armed', 'is-playing'));
  };

  if (reduce.matches || !supported) {
    disarm();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-playing');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }
    );

    stages.forEach((stage) => {
      stage.classList.add('is-armed');
      observer.observe(stage);
    });

    const onChange = (event) => {
      if (!event.matches) return;
      observer.disconnect();
      disarm();
    };
    if (typeof reduce.addEventListener === 'function') {
      reduce.addEventListener('change', onChange);
    }
  }
})();

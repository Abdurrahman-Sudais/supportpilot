// Turns on the scroll choreography before first paint (skipped for reduced motion). Content stays visible without it.
if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) && 'IntersectionObserver' in window) document.documentElement.classList.add('fx-flow');

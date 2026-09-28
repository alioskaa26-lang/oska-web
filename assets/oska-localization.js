(() => {
  const prefix = (window.OSKA_ROOT || '/').replace(/\/$/, '');
  const localize = anchor => {
    const href = anchor.getAttribute('href');
    if (href && /^\/(pages|collections|products|policies|search)(\/|\?|$)/.test(href)) {
      anchor.setAttribute('href', prefix + href);
    }
  };
  document.querySelectorAll('a[href]').forEach(localize);
  // Model links and concierge handoffs can be created after page load.
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (anchor) localize(anchor);
  }, true);
  document.querySelectorAll('form.oska-language-direct').forEach(form => {
    form.addEventListener('submit', () => {
      form.querySelector('[name="return_to"]').value = location.pathname + location.search + location.hash;
    });
  });
})();

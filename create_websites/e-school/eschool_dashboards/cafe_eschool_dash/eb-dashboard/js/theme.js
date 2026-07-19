(function () {
  const saved = localStorage.getItem('eb-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  window.toggleTheme = function () {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem('eb-theme', cur);
    const ic = document.querySelector('#themeIcon');
    if (ic) {
      ic.setAttribute('data-lucide', cur === 'dark' ? 'sun' : 'moon');
      if (window.lucide) window.lucide.createIcons();
    }
  };
  window.addEventListener('DOMContentLoaded', () => {
    const ic = document.querySelector('#themeIcon');
    if (ic) ic.setAttribute('data-lucide', saved === 'dark' ? 'sun' : 'moon');
    if (window.lucide) window.lucide.createIcons();
  });
})();

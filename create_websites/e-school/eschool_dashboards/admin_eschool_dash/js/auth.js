(function () {
  window.requireAuth = function () {
    const u = localStorage.getItem('eb-user');
    if (!u) { window.location.href = '../admin_eschool_dash.html'; return null; }
    try { return JSON.parse(u); } catch { return null; }
  };
  window.logout = function () {
    localStorage.removeItem('eb-user');
    window.location.href = '../admin_eschool_dash.html';
  };
})();

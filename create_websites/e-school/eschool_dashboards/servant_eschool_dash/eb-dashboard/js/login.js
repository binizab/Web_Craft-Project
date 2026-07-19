document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim() || 'Student';
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    localStorage.setItem('eb-user', JSON.stringify({ name, email, role }));
    window.location.href = 'pages/dashboard.html';
  });
});

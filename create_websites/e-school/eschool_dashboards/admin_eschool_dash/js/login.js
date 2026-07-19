document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim() || 'Student';
    const passkey = document.getElementById('passkey').value.trim();
    localStorage.setItem('eb-user', JSON.stringify({ name, passkey }));
    window.location.href = 'pages/dashboard.html';
  });
  const togglePasswordVisibility = () => {
    const passkeyInput = document.getElementById('passkey');
    const passkeyToggle = document.getElementById('toggleIcon');
    if (passkeyInput.type === 'password') {
      passkeyInput.type = 'text';
      passkeyToggle.classList.remove('fa-eye');
      passkeyToggle.classList.add('fa-eye-slash');
    } else {
      passkeyInput.type = 'password';
      passkeyToggle.classList.add('fa-eye');
      passkeyToggle.classList.remove('fa-eye-slash');
    }
  };
  document.getElementById('toggleIcon').addEventListener('click', togglePasswordVisibility);
});


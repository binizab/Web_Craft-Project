// Shared shell (sidebar + topbar) injected into every page
(function () {
  const MODULES = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', file: 'dashboard.html' },
    { id: 'attendance', label: 'Attendance',   icon: 'book-open',      file: 'attendance.html' },
    { id: 'certificate',  label: 'Certificate',  icon: 'notebook-pen',     file: 'certificate.html' },
    { id: 'chair', label: 'Chair',icon: 'file-text',        file: 'chair.html' },
    { id: 'confirmation',      label: 'Confirmation',     icon: 'clipboard-check',  file: 'confirm.html' },
    { id: 'form',  label: 'Form',  icon: 'calendar-days',    file: 'form.html' },
    { id: 'make',    label: 'Make',    icon: 'play-circle',      file: 'make.html' },
    { id: 'webcam',    label: 'Live Call', icon: 'video',            file: 'webcam.html' },
    { id: 'schedule',    label: 'Schedule', icon: 'video',            file: 'schedule.html' },
    { id: 'payment',    label: 'Payment', icon: 'video',            file: 'payment.html' },
    { id: 'message',   label: 'Messages',  icon: 'message-circle',   file: 'message.html' }
  ];

  window.EB_MODULES = MODULES;

  window.renderShell = function ({ active, title }) {
    const user = window.requireAuth();
    if (!user) return;
    const initials = (user.name || 'S').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();

    document.body.innerHTML = `
      <div class="app">
        <aside class="sidebar" id="sidebar">
          <div class="brand-row">
            <i data-lucide="graduation-cap" style="color:var(--accent)"></i>
            <span class="brand">EB Academy</span>
            <button class="collapse-btn" id="toggleSideBar"> 
              <i data-lucide="sidebar"></i>
            </button>
          </div>
          <div class="nav-label">Workspace</div>
          ${MODULES.map(m => `
            <a class="nav-item ${m.id===active?'active':''}" href="${m.file}">
              <i data-lucide="${m.icon}"></i><span>${m.label}</span>
            </a>`).join('')}
          <div style="flex:1"></div>
          <a class="nav-item" href="#" onclick="logout();return false;">
            <i data-lucide="log-out" style="color: red;"></i><span style="color: red;">Sign out</span>
          </a>
        </aside>
        <div class="main">
          <header class="topbar">
            <h1>${title || 'Dashboard'}</h1>
            <div class="spacer"></div>
            <button class="icon-btn" onclick="toggleTheme()" title="Toggle theme">
              <i id="themeIcon" data-lucide="moon"></i>
            </button>
            <div class="user-chip">
              <div class="avatar">${initials}</div>
              <div style="font-size:.85rem">
                <div style="font-weight:600;line-height:1">${user.name}</div>
                <div style="color:var(--text-dim);font-size:.72rem;text-transform:capitalize">Admin</div>
              </div>
            </div>
          </header>
          <section class="content" id="content"></section>
        </div>
      </div>`;

    // Modern setup: Toggle a CSS class instead of setting inline styles
const collapseBtn = document.getElementById("toggleSideBar");
const sidebar = document.getElementById("sidebar");

// Restore saved state
const savedState = localStorage.getItem("sidebar-collapsed");

if (savedState === "true") {
  sidebar.classList.add("collapsed");
}

if (collapseBtn) {
  collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');

    // Save state
    localStorage.setItem(
      "sidebar-collapsed",
      sidebar.classList.contains("collapsed")
    );
  });
}

    if (window.lucide) window.lucide.createIcons();
    const themeIc = document.getElementById('themeIcon');
    const cur = document.documentElement.getAttribute('data-theme');
    if (themeIc) themeIc.setAttribute('data-lucide', cur==='dark'?'sun':'moon');
    if (window.lucide) window.lucide.createIcons();
  };

  window.embedPage = function (file) {
    const c = document.getElementById('content');
    c.innerHTML = `<iframe class="frame" src="${file}" title="module"></iframe>`;
  };
})();
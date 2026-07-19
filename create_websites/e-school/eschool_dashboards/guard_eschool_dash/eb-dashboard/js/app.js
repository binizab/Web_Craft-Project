// Shared shell (sidebar + topbar) injected into every page
(function () {
  const MODULES = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', file: 'dashboard.html' },
    { id: 'book',      label: 'Library',   icon: 'book-open',        file: 'book.html' },
    { id: 'notebook',  label: 'Notebook',  icon: 'notebook-pen',     file: 'notebook.html' },
    { id: 'worksheet', label: 'Worksheets',icon: 'file-text',        file: 'worksheet.html' },
    { id: 'exam',      label: 'Exams',     icon: 'clipboard-check',  file: 'exam.html' },
    { id: 'schedule',  label: 'Schedule',  icon: 'calendar-days',    file: 'schedule.html' },
    { id: 'videos',    label: 'Videos',    icon: 'play-circle',      file: 'videos.html' },
    { id: 'webcam',    label: 'Live Call', icon: 'video',            file: 'webcam.html' },
    { id: 'message',   label: 'Messages',  icon: 'message-circle',   file: 'message.html' },
    { id: 'clubs',     label: 'Clubs',     icon: 'users',            file: 'clubs.html' }
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
          </div>
          <div class="nav-label">Workspace</div>
          ${MODULES.map(m => `
            <a class="nav-item ${m.id===active?'active':''}" href="${m.file}">
              <i data-lucide="${m.icon}"></i><span>${m.label}</span>
            </a>`).join('')}
          <div style="flex:1"></div>
          <a class="nav-item" href="#" onclick="logout();return false;">
            <i data-lucide="log-out"></i><span>Sign out</span>
          </a>
        </aside>
        <div class="main">
          <header class="topbar">
            <button class="icon-btn menu-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">
              <i data-lucide="menu"></i>
            </button>
            <h1>${title || 'Dashboard'}</h1>
            <div class="spacer"></div>
            <button class="icon-btn" onclick="toggleTheme()" title="Toggle theme">
              <i id="themeIcon" data-lucide="moon"></i>
            </button>
            <div class="user-chip">
              <div class="avatar">${initials}</div>
              <div style="font-size:.85rem">
                <div style="font-weight:600;line-height:1">${user.name}</div>
                <div style="color:var(--text-dim);font-size:.72rem;text-transform:capitalize">${user.role}</div>
              </div>
            </div>
          </header>
          <section class="content" id="content"></section>
        </div>
      </div>`;
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

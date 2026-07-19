(function () {
  const $ = (s) => document.querySelector(s);
  const html = document.documentElement;

  /* THEME */
  const savedTheme = localStorage.getItem('eb-theme') || 'light';
  html.setAttribute('data-theme', savedTheme);
  function setTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('eb-theme', t);
    document.querySelectorAll('#themeFab i, #themeFabLogin i').forEach(i => {
      i.setAttribute('data-lucide', t === 'dark' ? 'sun' : 'moon');
    });
    if (window.lucide) lucide.createIcons();
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('#themeFab') || e.target.closest('#themeFabLogin')) {
      setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    }
  });

  /* AUTH / VIEW SWITCH */
  const loginView = $('#loginView');
  const appView = $('#appView');
  const session = JSON.parse(localStorage.getItem('eb-session') || 'null');

  function showApp(user) {
    loginView.classList.add('hidden');
    appView.classList.remove('hidden');
    $('#userName').textContent = user.email.split('@')[0];
    $('#userRole').textContent = user.role;
    $('#avatar').textContent = user.email[0].toUpperCase();
    $('#brandSub').textContent = user.role + ' panel';
    renderPage('dashboard');
    if (window.lucide) lucide.createIcons();
  }

  if (session) showApp(session);

  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = { email: $('#email').value, role: $('#role').value };
    localStorage.setItem('eb-session', JSON.stringify(user));
    showApp(user);
  });

  $('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('eb-session');
    location.reload();
  });

  /* SIDEBAR MOBILE */
  $('#menuBtn').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
    $('#overlay').classList.toggle('open');
  });
  $('#overlay').addEventListener('click', () => {
    $('#sidebar').classList.remove('open');
    $('#overlay').classList.remove('open');
  });

  /* NAV */
  document.querySelectorAll('.nav-item').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      a.classList.add('active');
      renderPage(a.dataset.page);
      if (window.innerWidth <= 900) {
        $('#sidebar').classList.remove('open');
        $('#overlay').classList.remove('open');
      }
    });
  });

  /* PAGES */
  const pages = {
    dashboard: () => `
      <div class="page-head">
        <div><h2>Welcome back</h2><p>Here's what's happening at EB Academy today.</p></div>
        <button class="btn-primary" style="padding:10px 16px;"><i data-lucide="plus"></i> New entry</button>
      </div>
      <div class="kpi-grid">
        ${kpi('users','Total Students','2,543','+12% this month')}
        ${kpi('user-check','Teachers','148','+3 new')}
        ${kpi('book-open','Active Courses','64','+5 this week')}
        ${kpi('dollar-sign','Revenue','$48.2K','+18% vs last month')}
      </div>
      <div class="two-col">
        <div class="card">
          <h3><i data-lucide="bar-chart-3"></i> Enrollment Overview</h3>
          <div class="bar-chart">
            ${[60,80,45,90,70,95,55,75].map((h,i)=>`<div class="bar" style="height:${h}%"><span>${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'][i]}</span></div>`).join('')}
          </div>
        </div>
        <div class="card">
          <h3><i data-lucide="activity"></i> Recent Activity</h3>
          <ul class="activity">
            ${[
              ['user-plus','New student enrolled in Math 101','2m ago'],
              ['file-check','Exam submitted by John Doe','15m ago'],
              ['book','New book added to library','1h ago'],
              ['credit-card','Payment received - $250','3h ago'],
            ].map(a=>`<li><div class="act-dot"><i data-lucide="${a[0]}"></i></div><div><div class="act-text">${a[1]}</div><div class="act-time">${a[2]}</div></div></li>`).join('')}
          </ul>
        </div>
      </div>`,

    books: () => listPage('Books Library', 'book-open', [
      ['Algebra Essentials','Mathematics','In Stock','success'],
      ['World History','Humanities','Low Stock','warning'],
      ['Physics Volume II','Science','In Stock','success'],
      ['Modern Literature','English','Out of Stock','danger'],
      ['Chemistry Basics','Science','In Stock','success'],
    ], ['Title','Category','Status']),

    exams: () => listPage('Exams & Tests', 'file-text', [
      ['Math Midterm','Grade 10','Mar 20','Scheduled','success'],
      ['Science Final','Grade 11','Apr 02','Draft','warning'],
      ['English Essay','Grade 9','Mar 18','Active','success'],
      ['History Quiz','Grade 12','Mar 10','Closed','danger'],
    ], ['Exam','Class','Date','Status']),

    courses: () => `
      <div class="page-head"><div><h2>Courses</h2><p>Browse and manage all courses.</p></div></div>
      <div class="cards-grid">
        ${[
          ['Mathematics','book-open','12 modules · 45 students'],
          ['Physics','atom','8 modules · 32 students'],
          ['English Literature','feather','10 modules · 51 students'],
          ['Computer Science','cpu','15 modules · 67 students'],
          ['History','landmark','9 modules · 28 students'],
          ['Biology','leaf','11 modules · 39 students'],
        ].map(c=>`<div class="card"><h3><i data-lucide="${c[1]}"></i> ${c[0]}</h3><p>${c[2]}</p><div class="card-actions"><span class="chip primary">View</span><span class="chip">Edit</span></div></div>`).join('')}
      </div>`,

    students: () => listPage('Students', 'users', [
      ['Aisha Khan','Grade 10','aisha@eb.com','Active','success'],
      ['Liam Smith','Grade 9','liam@eb.com','Active','success'],
      ['Maria Garcia','Grade 12','maria@eb.com','Inactive','danger'],
      ['Chen Wei','Grade 11','chen@eb.com','Active','success'],
    ], ['Name','Class','Email','Status']),

    teachers: () => listPage('Teachers', 'user-check', [
      ['Dr. Sarah Lee','Mathematics','12 yrs','Active','success'],
      ['Mr. Ahmed Ali','Physics','8 yrs','Active','success'],
      ['Ms. Rita Patel','English','5 yrs','On Leave','warning'],
    ], ['Name','Subject','Experience','Status']),

    schedule: () => `
      <div class="page-head"><div><h2>Schedule</h2><p>This week's class timetable.</p></div></div>
      <div class="card"><div class="table-wrap"><table>
        <thead><tr><th>Time</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th></tr></thead>
        <tbody>
          ${['09:00','10:00','11:00','13:00','14:00'].map(t=>`<tr><td><strong>${t}</strong></td>${['Math','Physics','English','History','Biology'].sort(()=>.5-Math.random()).map(s=>`<td>${s}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table></div></div>`,

    library: () => `
      <div class="page-head"><div><h2>Digital Library</h2><p>Resources and reading materials.</p></div></div>
      <div class="cards-grid">
        ${[
          ['eBooks','book','1,250 titles'],
          ['Research Papers','file-text','340 papers'],
          ['Video Lectures','play-circle','89 videos'],
          ['Past Exams','archive','512 archives'],
        ].map(c=>`<div class="card"><h3><i data-lucide="${c[1]}"></i> ${c[0]}</h3><p>${c[2]}</p><div class="card-actions"><span class="chip primary">Browse</span></div></div>`).join('')}
      </div>`,

    reports: () => `
      <div class="page-head"><div><h2>Reports & Analytics</h2><p>Performance insights at a glance.</p></div></div>
      <div class="kpi-grid">
        ${kpi('trending-up','Avg Score','82%','+4%')}
        ${kpi('award','Pass Rate','94%','+2%')}
        ${kpi('clock','Attendance','96%','+1%')}
        ${kpi('alert-circle','At Risk','24','-3')}
      </div>
      <div class="card">
        <h3><i data-lucide="bar-chart-3"></i> Subject Performance</h3>
        <div class="bar-chart">
          ${[85,72,90,68,78,82].map((h,i)=>`<div class="bar" style="height:${h}%"><span>${['Math','Phys','Eng','Hist','Bio','CS'][i]}</span></div>`).join('')}
        </div>
      </div>`,

    settings: () => `
      <div class="page-head"><div><h2>Settings</h2><p>Configure your account and preferences.</p></div></div>
      <div class="cards-grid">
        <div class="card"><h3><i data-lucide="user"></i> Profile</h3><p>Update name, email and avatar.</p><div class="card-actions"><span class="chip primary">Edit</span></div></div>
        <div class="card"><h3><i data-lucide="shield"></i> Security</h3><p>Change password & 2FA settings.</p><div class="card-actions"><span class="chip primary">Manage</span></div></div>
        <div class="card"><h3><i data-lucide="bell"></i> Notifications</h3><p>Email and push notification preferences.</p><div class="card-actions"><span class="chip primary">Configure</span></div></div>
        <div class="card"><h3><i data-lucide="palette"></i> Appearance</h3><p>Toggle theme using the moon/sun icon in the topbar.</p></div>
      </div>`,
  };

  function kpi(icon, label, value, trend) {
    return `<div class="kpi"><div class="kpi-icon"><i data-lucide="${icon}"></i></div><div><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-trend">${trend}</div></div></div>`;
  }

  function listPage(title, icon, rows, headers) {
    return `
      <div class="page-head"><div><h2>${title}</h2><p>Manage all ${title.toLowerCase()}.</p></div>
        <button class="btn-primary" style="padding:10px 16px;"><i data-lucide="plus"></i> Add</button>
      </div>
      <div class="card"><div class="table-wrap"><table>
        <thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}<th>Action</th></tr></thead>
        <tbody>
          ${rows.map(r=>{
            const status = r[r.length-2]; const tone = r[r.length-1];
            const cells = r.slice(0,-2).map(c=>`<td>${c}</td>`).join('');
            return `<tr>${cells}<td><span class="badge ${tone}">${status}</span></td><td><i data-lucide="more-horizontal"></i></td></tr>`;
          }).join('')}
        </tbody>
      </table></div></div>`;
  }

  function renderPage(name) {
    $('#content').innerHTML = (pages[name] || pages.dashboard)();
    if (window.lucide) lucide.createIcons();
  }

  /* INIT */
  setTheme(savedTheme);
  if (window.lucide) lucide.createIcons();
})();

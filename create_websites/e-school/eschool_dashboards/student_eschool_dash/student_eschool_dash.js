// student_dashboard.js - Unified EB Academy Dashboard

// ========== Dexie DB Setup ==========
const db = new Dexie("EBAcademyUnifiedDB");
db.version(1).stores({
    videos: '++id, title, youtubeId, type, fileData, timestamp',
    clubRequests: '++id, student, club, status, time',
    clubSubmissions: '++id, student, club, type, content, status, time',
    messages: '++id, from, to, subject, content, fileData, timestamp'
});

// ========== Navigation Configuration ==========
const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "fa-chalkboard-user" },
    { id: "schedule", label: "Schedule", icon: "fa-calendar-alt" },
    { id: "notebook", label: "Notebook", icon: "fa-book-open" },
    { id: "books", label: "Books", icon: "fa-book" },
    { id: "videos", label: "Video Hub", icon: "fa-video" },
    { id: "clubs", label: "Clubs", icon: "fa-users" },
    { id: "exams", label: "Exams", icon: "fa-pen-to-square" },
    { id: "messenger", label: "Messenger", icon: "fa-paper-plane" },
    { id: "webcam", label: "Webcam", icon: "fa-camera" },
    { id: "worksheet", label: "Worksheets", icon: "fa-clipboard-list" }
];

// App State
let currentView = "dashboard";
let sidebarCollapsed = false;
let currentTheme = localStorage.getItem('theme') || 'dark';
let schedules = JSON.parse(localStorage.getItem('studentSchedule')) || [];
let notebooks = JSON.parse(localStorage.getItem('eb_notebooks')) || [];
let currentNotebookId = localStorage.getItem('eb_current_id') || null;
let peerConnection = null;
let localWebcamStream = null;

// Helper Functions
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function setTheme(theme) {
    currentTheme = theme;
    if (theme === 'dark') {
        document.body.classList.remove('light-theme');
        document.documentElement.style.colorScheme = 'dark';
    } else if (theme === 'light') {
        document.body.classList.add('light-theme');
        document.documentElement.style.colorScheme = 'light';
    } else if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) document.body.classList.remove('light-theme');
        else document.body.classList.add('light-theme');
    }
    localStorage.setItem('theme', theme);
    document.getElementById('themeToggle').innerHTML = `<i class="fas fa-${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
}

// ========== RENDER ENGINE ==========
function renderDashboard() {
    const recentTasks = schedules.slice(0, 3);
    return `
        <div class="glass-card" style="margin-bottom: 2rem;">
            <h2>Welcome back, Alex 👋</h2>
            <p style="color: var(--text-dim);">Stay on top of your academics. You have ${schedules.filter(s => !s.completed && new Date(s.dateTime) > new Date()).length} upcoming tasks.</p>
        </div>
        <div class="video-grid">
            <div class="video-card" onclick="window.navigateToView('schedule')"><div class="video-thumb" style="background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); display: flex; align-items: center; justify-content: center;"><i class="fas fa-calendar fa-3x"></i></div><div class="video-card-body"><h4>Schedule Manager</h4><p>Plan your study sessions</p></div></div>
            <div class="video-card" onclick="window.navigateToView('notebook')"><div class="video-thumb" style="background: linear-gradient(135deg, var(--accent-purple), #ec4899); display: flex; align-items: center; justify-content: center;"><i class="fas fa-book fa-3x"></i></div><div class="video-card-body"><h4>Smart Notebook</h4><p>Take organized notes</p></div></div>
            <div class="video-card" onclick="window.navigateToView('videos')"><div class="video-thumb" style="background: linear-gradient(135deg, #f59e0b, #ef4444); display: flex; align-items: center; justify-content: center;"><i class="fas fa-play fa-3x"></i></div><div class="video-card-body"><h4>Video Lessons</h4><p>Watch recorded sessions</p></div></div>
        </div>
    `;
}

function renderScheduleView() {
    const sorted = [...schedules].sort((a,b) => new Date(a.dateTime) - new Date(b.dateTime));
    return `
        <div class="glass-card" style="margin-bottom: 2rem;">
            <div style="display: grid; gap: 1rem; grid-template-columns: 1fr auto;">
                <input type="text" id="taskInput" placeholder="Task name" class="input-field">
                <input type="datetime-local" id="datetimeInput" class="input-field">
                <button id="addTaskBtn" class="btn-primary">Add Task</button>
            </div>
        </div>
        <div class="task-list">
            ${sorted.length === 0 ? '<div class="glass-card">No tasks yet. Add your first task!</div>' : sorted.map(task => `
                <div class="task-item ${!task.completed && new Date(task.dateTime) <= new Date() ? 'due' : ''}">
                    <div><strong ${task.completed ? 'style="text-decoration: line-through; opacity:0.6"' : ''}>${escapeHtml(task.task)}</strong><br><small>📅 ${task.dateTime.replace('T', ' ')}</small></div>
                    <div style="display: flex; gap: 8px;"><button class="icon-btn" onclick="window.toggleTask(${task.id})"><i class="fas fa-check"></i></button><button class="icon-btn" onclick="window.deleteTask(${task.id})"><i class="fas fa-trash"></i></button></div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderNotebookView() {
    if (notebooks.length === 0) notebooks = [{ id: Date.now(), title: "New Note", content: "" }];
    const currentNotebook = notebooks.find(n => n.id == currentNotebookId) || notebooks[0];
    currentNotebookId = currentNotebook.id;
    return `
        <div class="notebook-editor">
            <div class="notebook-sidebar">
                <button class="btn-primary" style="width:100%; margin-bottom:1rem;" onclick="window.createNewNotebook()">+ New Notebook</button>
                <ul class="notebook-list">
                    ${notebooks.map(n => `<li class="notebook-item ${n.id == currentNotebookId ? 'active' : ''}" onclick="window.loadNotebook(${n.id})"><span>${escapeHtml(n.title)}</span><i class="fas fa-trash" onclick="event.stopPropagation(); window.deleteNotebook(${n.id})" style="cursor:pointer; opacity:0.6"></i></li>`).join('')}
                </ul>
            </div>
            <div class="notebook-main">
                <input type="text" id="notebookTitle" class="notebook-title-input" value="${escapeHtml(currentNotebook.title)}">
                <textarea id="notebookContent" class="notebook-content" placeholder="Start writing...">${escapeHtml(currentNotebook.content)}</textarea>
                <div style="margin-top: 1rem; font-size:0.8rem; color:var(--text-dim);">✨ Autosaving enabled</div>
            </div>
        </div>
    `;
}

function renderVideosView() {
    return `<div class="video-grid" id="videoGridContainer"><div class="glass-card">Loading video library...</div></div>`;
}

function renderClubsView() {
    return `
        <div class="glass-card" style="margin-bottom: 2rem;">
            <h3>Join a Club</h3>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;"><input id="studentName" placeholder="Your Name" class="input-field"><select id="clubSelect" class="input-field"><option>Coding Club</option><option>Media Club</option><option>Robotics</option><option>Debate Society</option></select><button class="btn-primary" onclick="window.requestJoinClub()">Request Join</button></div>
        </div>
        <div class="glass-card"><h3>Club Submissions</h3><div id="clubSubmissionsList">Submit a script or proposal</div></div>
    `;
}

function renderWebcamView() {
    return `
        <div class="webcam-grid">
            <div class="video-container"><video id="localWebcam" autoplay muted playsinline></video><div class="label">Your Camera</div></div>
            <div class="video-container"><video id="remoteWebcam" autoplay playsinline></video><div class="label">Remote Peer</div></div>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 2rem; justify-content: center;">
            <button class="btn-primary" id="startCamBtn">📷 Start Camera</button>
            <input type="text" id="peerIdInput" placeholder="Peer ID to call" class="input-field" style="width: 200px;">
            <button class="btn-primary" id="callPeerBtn">📞 Call</button>
        </div>
        <div class="glass-card" style="margin-top: 1rem;"><p>Your Peer ID: <strong id="myPeerId">Connecting...</strong></p></div>
    `;
}

function renderWorksheetView() {
    return `
        <div class="glass-card">
            <h2>Interactive Worksheets</h2>
            <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                <button class="btn-primary" onclick="window.openWorksheet('Math', 'Algebra')">Mathematics Worksheet</button>
                <button class="btn-primary" onclick="window.openWorksheet('History', 'World War II')">History Worksheet</button>
                <button class="btn-primary" onclick="window.openWorksheet('Biology', 'Cell Structure')">Biology Worksheet</button>
            </div>
        </div>
    `;
}

function renderBooksView() { return `<div class="glass-card"><h2>Digital Library</h2><p>📚 Textbook library is being synced. Access all PDF resources.</p><iframe src="book.html" style="width:100%; height:500px; border:none; border-radius:16px; margin-top:1rem;"></iframe></div>`; }
function renderExamsView() { return `<div class="glass-card"><h2>Exam Portal</h2><iframe src="exam.html" style="width:100%; height:600px; border:none; border-radius:16px;"></iframe></div>`; }
function renderMessengerView() { return `<div class="glass-card"><h2>P2P Messenger</h2><iframe src="message.html" style="width:100%; height:600px; border:none; border-radius:16px;"></iframe></div>`; }

async function renderCurrentView() {
    const container = document.getElementById('dynamicViewContainer');
    const titleMap = { dashboard: "Dashboard", schedule: "Schedule Planner", notebook: "Smart Notebook", books: "Library", videos: "Video Hub", clubs: "Clubs & Activities", exams: "Exams", messenger: "Messenger", webcam: "Webcam Studio", worksheet: "Worksheets" };
    document.getElementById('currentViewTitle').innerText = titleMap[currentView] || "Dashboard";
    if (currentView === 'dashboard') container.innerHTML = renderDashboard();
    else if (currentView === 'schedule') container.innerHTML = renderScheduleView();
    else if (currentView === 'notebook') container.innerHTML = renderNotebookView();
    else if (currentView === 'books') container.innerHTML = renderBooksView();
    else if (currentView === 'videos') container.innerHTML = renderVideosView();
    else if (currentView === 'clubs') container.innerHTML = renderClubsView();
    else if (currentView === 'exams') container.innerHTML = renderExamsView();
    else if (currentView === 'messenger') container.innerHTML = renderMessengerView();
    else if (currentView === 'webcam') container.innerHTML = renderWebcamView();
    else if (currentView === 'worksheet') container.innerHTML = renderWorksheetView();
    attachViewSpecificEvents();
}

// Schedule Logic
window.toggleTask = function(id) {
    schedules = schedules.map(s => s.id === id ? {...s, completed: !s.completed} : s);
    localStorage.setItem('studentSchedule', JSON.stringify(schedules));
    renderCurrentView();
};
window.deleteTask = function(id) {
    schedules = schedules.filter(s => s.id !== id);
    localStorage.setItem('studentSchedule', JSON.stringify(schedules));
    renderCurrentView();
};
function addScheduleTask() {
    const task = document.getElementById('taskInput')?.value;
    const dt = document.getElementById('datetimeInput')?.value;
    if(task && dt) { schedules.push({ id: Date.now(), task, dateTime: dt, completed: false, alerted: false }); localStorage.setItem('studentSchedule', JSON.stringify(schedules)); renderCurrentView(); }
}

// Notebook Logic
window.createNewNotebook = function() {
    const title = prompt("Notebook title:") || "Untitled";
    const newNote = { id: Date.now(), title, content: "" };
    notebooks.unshift(newNote);
    localStorage.setItem('eb_notebooks', JSON.stringify(notebooks));
    currentNotebookId = newNote.id;
    localStorage.setItem('eb_current_id', currentNotebookId);
    renderCurrentView();
};
window.loadNotebook = function(id) {
    currentNotebookId = id;
    localStorage.setItem('eb_current_id', id);
    renderCurrentView();
};
window.deleteNotebook = function(id) {
    if(confirm("Delete this notebook?")) {
        notebooks = notebooks.filter(n => n.id !== id);
        if(currentNotebookId == id && notebooks.length) currentNotebookId = notebooks[0].id;
        localStorage.setItem('eb_notebooks', JSON.stringify(notebooks));
        renderCurrentView();
    }
};
function autoSaveNotebook() {
    const titleInput = document.getElementById('notebookTitle');
    const contentInput = document.getElementById('notebookContent');
    if(titleInput && contentInput && currentNotebookId) {
        const idx = notebooks.findIndex(n => n.id == currentNotebookId);
        if(idx !== -1) { notebooks[idx].title = titleInput.value; notebooks[idx].content = contentInput.value; localStorage.setItem('eb_notebooks', JSON.stringify(notebooks)); }
    }
}

// Video Hub Logic (IndexedDB)
async function loadVideosFromDB() {
    const videos = await db.videos.toArray();
    const grid = document.getElementById('videoGridContainer');
    if(grid) {
        if(videos.length === 0) grid.innerHTML = `<div class="glass-card">No videos yet. Add from YouTube or upload later.</div>`;
        else grid.innerHTML = videos.map(v => `<div class="video-card" onclick="window.playVideo('${v.youtubeId || ''}')"><div class="video-thumb" style="background-image: url('https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg'); background-size: cover;"><div class="play-overlay"><i class="fas fa-play-circle fa-3x"></i></div></div><div class="video-card-body"><h4>${escapeHtml(v.title)}</h4></div></div>`).join('');
    }
}
window.playVideo = function(id) { if(id) window.open(`https://www.youtube.com/watch?v=${id}`, '_blank'); };

// WebRTC & Webcam
let peer = null;
async function initWebcam() {
    try {
        localWebcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const localVid = document.getElementById('localWebcam');
        if(localVid) localVid.srcObject = localWebcamStream;
        document.getElementById('startCamBtn').disabled = true;
        peer = new Peer();
        peer.on('open', id => document.getElementById('myPeerId').innerText = id);
        peer.on('call', call => { if(localWebcamStream) { call.answer(localWebcamStream); call.on('stream', stream => { document.getElementById('remoteWebcam').srcObject = stream; }); } });
    } catch(e) { alert("Camera access required"); }
}
function callPeer() {
    const remoteId = document.getElementById('peerIdInput')?.value;
    if(remoteId && peer && localWebcamStream) { const call = peer.call(remoteId, localWebcamStream); call.on('stream', stream => { document.getElementById('remoteWebcam').srcObject = stream; }); }
}

// Club Requests
window.requestJoinClub = async function() {
    const name = document.getElementById('studentName')?.value;
    const club = document.getElementById('clubSelect')?.value;
    if(name) await db.clubRequests.add({ student: name, club, status: 'pending', time: new Date().toISOString() });
    alert("Request sent to stakeholder!");
};

// Navigation & Sidebar
function navigateToView(viewId) {
    currentView = viewId;
    renderCurrentView();
    document.querySelectorAll('.nav-item').forEach(btn => { if(btn.getAttribute('data-view') === viewId) btn.classList.add('active'); else btn.classList.remove('active'); });
    closeMobileSidebar();
}
window.navigateToView = navigateToView;

function toggleSidebar() {
    const sidebar = document.getElementById('desktopSidebar');
    sidebarCollapsed = !sidebarCollapsed;
    if(sidebarCollapsed) sidebar.classList.add('collapsed');
    else sidebar.classList.remove('collapsed');
}
function openMobileSidebar() { document.getElementById('mobileSidebar').classList.add('open'); document.getElementById('mobileOverlay').classList.add('open'); }
function closeMobileSidebar() { document.getElementById('mobileSidebar').classList.remove('open'); document.getElementById('mobileOverlay').classList.remove('open'); }

function attachViewSpecificEvents() {
    document.getElementById('addTaskBtn')?.addEventListener('click', addScheduleTask);
    document.getElementById('notebookTitle')?.addEventListener('input', autoSaveNotebook);
    document.getElementById('notebookContent')?.addEventListener('input', autoSaveNotebook);
    document.getElementById('startCamBtn')?.addEventListener('click', initWebcam);
    document.getElementById('callPeerBtn')?.addEventListener('click', callPeer);
    if(currentView === 'videos') loadVideosFromDB();
}

// Build Navigation UI
function buildNav() {
    const desktopNav = document.getElementById('desktopNavContainer');
    const mobileNav = document.getElementById('mobileNavContainer');
    const navHtml = NAV_ITEMS.map(item => `<button class="nav-item ${currentView === item.id ? 'active' : ''}" data-view="${item.id}"><i class="fas ${item.icon}"></i><span>${item.label}</span></button>`).join('');
    desktopNav.innerHTML = `<div class="nav-label">Main</div>${navHtml}`;
    mobileNav.innerHTML = `<div class="nav-label">Main</div>${navHtml}`;
    document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => navigateToView(btn.getAttribute('data-view'))));
}

// Settings Modal
function initSettings() {
    const modal = document.getElementById('settingsModal');
    document.getElementById('settingsBtn').onclick = () => modal.style.display = 'flex';
    document.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if(e.target === modal) modal.style.display = 'none'; };
    document.querySelectorAll('[data-theme]').forEach(btn => btn.onclick = () => setTheme(btn.getAttribute('data-theme')));
}

// Floating Profile
let profileOpen = false;
document.getElementById('sidebarProfileBtn').onclick = () => { const card = document.getElementById('floatingProfileCard'); profileOpen = !profileOpen; if(profileOpen) card.classList.add('show'); else card.classList.remove('show'); };
document.getElementById('globalProfileBtn').onclick = () => document.getElementById('sidebarProfileBtn').click();

// Initialize
function init() {
    setTheme(currentTheme);
    buildNav();
    renderCurrentView();
    initSettings();
    document.getElementById('toggleSidebar')?.addEventListener('click', toggleSidebar);
    document.getElementById('menuBtn')?.addEventListener('click', openMobileSidebar);
    document.getElementById('mobileOverlay')?.addEventListener('click', closeMobileSidebar);
    document.getElementById('themeToggle')?.addEventListener('click', () => setTheme(currentTheme === 'dark' ? 'light' : 'dark'));
    setInterval(() => { if(currentView === 'schedule') { const now = new Date(); schedules.forEach(s => { if(!s.completed && !s.alerted && new Date(s.dateTime) <= now) { s.alerted = true; alert(`⏰ Reminder: ${s.task}`); localStorage.setItem('studentSchedule', JSON.stringify(schedules)); renderCurrentView(); } }); } }, 30000);
}
init();
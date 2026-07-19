// Navigation Configuration
        const NAV_ITEMS = [
            { id: "overview", label: "Overview", icon: "fa-chart-line" },
            { id: "marklist", label: "Mark List", icon: "fa-table-list" },
            { id: "attendance", label: "Attendance", icon: "fa-calendar-check" },
            { id: "exams", label: "Exam Publisher", icon: "fa-pen-to-square" },
            { id: "behavior", label: "Behavior Log", icon: "fa-clipboard-list" },
            { id: "schedule", label: "Schedule", icon: "fa-calendar-alt" },
            { id: "webcam", label: "Webcam", icon: "fa-video" }
        ];

        // Mock Data
        let students = [
            { id: 1, name: "Abebe Bekele", test: 8, cw: 12, hw: 18, pt: 4, exam: 42 },
            { id: 2, name: "Mulugeta Tesfaye", test: 9, cw: 14, hw: 19, pt: 5, exam: 48 },
            { id: 3, name: "Hanan Mohammed", test: 6, cw: 10, hw: 15, pt: 3, exam: 30 }
        ];

        let attendanceRecords = JSON.parse(localStorage.getItem('teacherAttendance')) || {
            week1: { "Abebe Bekele": ["p","p","a","p","l"], "Mulugeta Tesfaye": ["p","p","p","p","p"], "Hanan Mohammed": ["a","l","p","p","a"] }
        };

        let behaviorLogs = JSON.parse(localStorage.getItem('teacherBehaviorLogs')) || [
            { student: "Abebe Bekele", date: "2024-11-20", record: "Excellent participation in class" },
            { student: "Hanan Mohammed", date: "2024-11-19", record: "Late submission of homework" }
        ];

        let scheduleItems = JSON.parse(localStorage.getItem('teacherSchedule')) || [
            { id: 1, task: "Grade 11 Math Exam", dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16), completed: false },
            { id: 2, task: "Parent Meeting", dateTime: new Date(Date.now() - 86400000).toISOString().slice(0, 16), completed: false }
        ];

        let currentView = "overview";
        let sidebarCollapsed = false;

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

        function calculateTotal(student) {
            return (student.test || 0) + (student.cw || 0) + (student.hw || 0) + (student.pt || 0) + (student.exam || 0);
        }

        function saveAttendance() {
            localStorage.setItem('teacherAttendance', JSON.stringify(attendanceRecords));
        }

        function saveBehaviorLogs() {
            localStorage.setItem('teacherBehaviorLogs', JSON.stringify(behaviorLogs));
        }

        // Render Views
        function renderOverview() {
            const totalStudents = students.length;
            const avgScore = Math.round(students.reduce((sum, s) => sum + calculateTotal(s), 0) / totalStudents);
            const pendingTasks = scheduleItems.filter(s => !s.completed && new Date(s.dateTime) > new Date()).length;
            return `
                <div class="stats-grid">
                    <div class="stat-card"><h3>Total Students</h3><div class="stat-value">${totalStudents}</div></div>
                    <div class="stat-card"><h3>Class Average</h3><div class="stat-value">${avgScore}%</div></div>
                    <div class="stat-card"><h3>Pending Tasks</h3><div class="stat-value">${pendingTasks}</div></div>
                </div>
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Quick Actions</h3>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button class="btn-primary" onclick="window.navigateToView('marklist')"><i class="fas fa-edit"></i> Enter Marks</button>
                        <button class="btn-primary" onclick="window.navigateToView('attendance')"><i class="fas fa-fingerprint"></i> Take Attendance</button>
                        <button class="btn-primary" onclick="window.navigateToView('behavior')"><i class="fas fa-clipboard"></i> Log Behavior</button>
                    </div>
                </div>
            `;
        }

        function renderMarklistView() {
            return `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Student Mark List - Mathematics</h3>
                    <table class="data-table">
                        <thead>
                            <tr><th>Student</th><th>Test (10%)</th><th>CW (15%)</th><th>HW (20%)</th><th>Part. (5%)</th><th>Exam (50%)</th><th>Total</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            ${students.map(s => `
                                <tr>
                                    <td>${escapeHtml(s.name)}</td>
                                    <td><input type="number" class="score-input" id="test-${s.id}" value="${s.test}" min="0" max="10"></td>
                                    <td><input type="number" class="score-input" id="cw-${s.id}" value="${s.cw}" min="0" max="15"></td>
                                    <td><input type="number" class="score-input" id="hw-${s.id}" value="${s.hw}" min="0" max="20"></td>
                                    <td><input type="number" class="score-input" id="pt-${s.id}" value="${s.pt}" min="0" max="5"></td>
                                    <td><input type="number" class="score-input" id="exam-${s.id}" value="${s.exam}" min="0" max="50"></td>
                                    <td id="total-${s.id}">${calculateTotal(s)}%</td>
                                    <td><button class="btn-primary btn-success" style="padding:0.25rem 0.5rem;" onclick="updateMarks(${s.id})">Save</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button class="btn-primary" style="margin-top: 1rem;" onclick="syncAllMarks()">Sync to Student Portal</button>
                </div>
            `;
        }

        function renderAttendanceView() {
            const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
            const statusMap = { 'p': 'Present', 'a': 'Absent', 'l': 'Late' };
            const studentsList = Object.keys(attendanceRecords.week1);
            return `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Weekly Attendance - Current Week</h3>
                    <table class="data-table">
                        <thead><tr><th>Student</th>${days.map(d => `<th>${d}</th>`).join('')}</thead>
                        <tbody>
                            ${studentsList.map(s => `
                                <tr>
                                    <td>${escapeHtml(s)}</td>
                                    ${attendanceRecords.week1[s].map((status, idx) => `
                                        <td>
                                            <select class="score-input" style="width:100px;" onchange="updateAttendance('${s}', ${idx}, this.value)">
                                                <option value="p" ${status === 'p' ? 'selected' : ''}>Present</option>
                                                <option value="a" ${status === 'a' ? 'selected' : ''}>Absent</option>
                                                <option value="l" ${status === 'l' ? 'selected' : ''}>Late</option>
                                            </select>
                                        </td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button class="btn-primary" style="margin-top: 1rem;" onclick="saveAttendance()">Save Attendance</button>
                </div>
            `;
        }

        function renderExamsView() {
            return `<div class="glass-card"><h3>Exam Publisher</h3><iframe src="about:blank" id="examFrame" style="width:100%; height:600px; border:none; border-radius:12px; margin-top:1rem;"></iframe></div>`;
        }

        function renderBehaviorView() {
            return `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Student Behavior Log</h3>
                    <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                        <select id="behaviorStudent" class="score-input" style="width:200px;">
                            ${students.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('')}
                        </select>
                        <input type="date" id="behaviorDate" class="score-input" value="${new Date().toISOString().slice(0,10)}">
                        <input type="text" id="behaviorRecord" placeholder="Observation note..." class="score-input" style="flex:1;">
                        <button class="btn-primary" onclick="addBehaviorLog()">Add Log</button>
                    </div>
                    <table class="data-table">
                        <thead><tr><th>Date</th><th>Student</th><th>Record</th><th>Action</th></tr></thead>
                        <tbody>
                            ${behaviorLogs.map((log, idx) => `
                                <tr>
                                    <td>${log.date}</td>
                                    <td>${escapeHtml(log.student)}</td>
                                    <td>${escapeHtml(log.record)}</td>
                                    <td><button class="btn-danger" style="padding:0.25rem 0.5rem;" onclick="deleteBehaviorLog(${idx})">Delete</button></td>
                                </tr>
                            `).join('')}
                            ${behaviorLogs.length === 0 ? '<tr><td colspan="4" style="text-align:center;">No records yet</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function renderScheduleView() {
            const sorted = [...scheduleItems].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
            return `
                <div class="glass-card">
                    <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                        <input type="text" id="taskInput" class="score-input" style="flex:2;" placeholder="Task name">
                        <input type="datetime-local" id="datetimeInput" class="score-input">
                        <button class="btn-primary" onclick="addScheduleTask()">Add Task</button>
                    </div>
                    <div class="task-list">
                        ${sorted.map(item => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid var(--border-light);">
                                <div><strong>${escapeHtml(item.task)}</strong><br><small>📅 ${item.dateTime.replace('T', ' ')}</small></div>
                                <div>
                                    <button class="btn-success" style="padding:0.25rem 0.5rem;" onclick="toggleScheduleTask(${item.id})">${item.completed ? 'Undo' : 'Done'}</button>
                                    <button class="btn-danger" style="padding:0.25rem 0.5rem; margin-left:0.5rem;" onclick="deleteScheduleTask(${item.id})">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                        ${scheduleItems.length === 0 ? '<div style="text-align:center; padding:2rem;">No tasks scheduled</div>' : ''}
                    </div>
                </div>
            `;
        }

        function renderWebcamView() {
            return `<div class="glass-card"><h3>Webcam Studio</h3><iframe src="about:blank" id="webcamFrame" style="width:100%; height:500px; border:none; border-radius:12px; margin-top:1rem;"></iframe></div>`;
        }

        // Action Functions
        window.updateMarks = function(id) {
            const student = students.find(s => s.id === id);
            if (student) {
                student.test = parseInt(document.getElementById(`test-${id}`).value) || 0;
                student.cw = parseInt(document.getElementById(`cw-${id}`).value) || 0;
                student.hw = parseInt(document.getElementById(`hw-${id}`).value) || 0;
                student.pt = parseInt(document.getElementById(`pt-${id}`).value) || 0;
                student.exam = parseInt(document.getElementById(`exam-${id}`).value) || 0;
                document.getElementById(`total-${id}`).innerText = calculateTotal(student) + '%';
                alert(`Marks saved for ${student.name}`);
            }
        };

        window.syncAllMarks = function() {
            const globalScores = {};
            students.forEach(s => {
                globalScores[s.name] = { test: s.test, cw: s.cw, hw: s.hw, pt: s.pt, ex: s.exam };
            });
            localStorage.setItem('EB_GLOBAL_SCORES', JSON.stringify(globalScores));
            alert('All marks synced to student portal!');
        };

        window.updateAttendance = function(student, dayIndex, value) {
            if (!attendanceRecords.week1[student]) attendanceRecords.week1[student] = ["p","p","p","p","p"];
            attendanceRecords.week1[student][dayIndex] = value;
            saveAttendance();
            document.getElementById('save-status')?.remove();
            const notice = document.createElement('div');
            notice.id = 'save-status';
            notice.style.cssText = 'color: var(--success); margin-top: 0.5rem; font-size: 0.8rem;';
            notice.innerText = '✓ Auto-saved';
            document.querySelector('.glass-card')?.appendChild(notice);
            setTimeout(() => notice.remove(), 1500);
        };

        window.addBehaviorLog = function() {
            const student = document.getElementById('behaviorStudent').value;
            const date = document.getElementById('behaviorDate').value;
            const record = document.getElementById('behaviorRecord').value;
            if (!student || !record) { alert('Please fill all fields'); return; }
            behaviorLogs.unshift({ student, date, record });
            saveBehaviorLogs();
            renderCurrentView();
        };

        window.deleteBehaviorLog = function(idx) {
            behaviorLogs.splice(idx, 1);
            saveBehaviorLogs();
            renderCurrentView();
        };

        window.addScheduleTask = function() {
            const task = document.getElementById('taskInput')?.value;
            const dt = document.getElementById('datetimeInput')?.value;
            if (task && dt) {
                scheduleItems.push({ id: Date.now(), task, dateTime: dt, completed: false });
                localStorage.setItem('teacherSchedule', JSON.stringify(scheduleItems));
                renderCurrentView();
            }
        };

        window.toggleScheduleTask = function(id) {
            const item = scheduleItems.find(i => i.id === id);
            if (item) { item.completed = !item.completed; localStorage.setItem('teacherSchedule', JSON.stringify(scheduleItems)); renderCurrentView(); }
        };

        window.deleteScheduleTask = function(id) {
            scheduleItems = scheduleItems.filter(i => i.id !== id);
            localStorage.setItem('teacherSchedule', JSON.stringify(scheduleItems));
            renderCurrentView();
        };

        // Navigation
        function navigateToView(viewId) {
            currentView = viewId;
            renderCurrentView();
            document.querySelectorAll('.nav-item').forEach(btn => {
                if (btn.getAttribute('data-view') === viewId) btn.classList.add('active');
                else btn.classList.remove('active');
            });
            closeMobileSidebar();
        }
        window.navigateToView = navigateToView;

        function renderCurrentView() {
            const container = document.getElementById('dynamicViewContainer');
            const titleMap = {
                overview: "Teacher Overview",
                marklist: "Mark List",
                attendance: "Attendance Tracker",
                exams: "Exam Publisher",
                behavior: "Behavior Log",
                schedule: "Schedule",
                webcam: "Webcam Studio"
            };
            document.getElementById('currentViewTitle').innerText = titleMap[currentView] || "Dashboard";
            
            if (currentView === 'overview') container.innerHTML = renderOverview();
            else if (currentView === 'marklist') container.innerHTML = renderMarklistView();
            else if (currentView === 'attendance') container.innerHTML = renderAttendanceView();
            else if (currentView === 'exams') container.innerHTML = renderExamsView();
            else if (currentView === 'behavior') container.innerHTML = renderBehaviorView();
            else if (currentView === 'schedule') container.innerHTML = renderScheduleView();
            else if (currentView === 'webcam') container.innerHTML = renderWebcamView();
        }

        // Build Navigation
        function buildNavigation() {
            const desktopNav = document.getElementById('desktopNav');
            const mobileNav = document.getElementById('mobileNav');
            const navHtml = NAV_ITEMS.map(item => `
                <button class="nav-item ${currentView === item.id ? 'active' : ''}" data-view="${item.id}">
                    <i class="fas ${item.icon}"></i>
                    <span>${item.label}</span>
                </button>
            `).join('');
            desktopNav.innerHTML = `<div class="nav-header">Main</div>${navHtml}`;
            mobileNav.innerHTML = `<div class="nav-header">Main</div>${navHtml}`;
            document.querySelectorAll('.nav-item').forEach(btn => {
                btn.addEventListener('click', () => navigateToView(btn.getAttribute('data-view')));
            });
        }

        // Sidebar Functions
        function toggleSidebar() {
            const sidebar = document.getElementById('desktopSidebar');
            sidebarCollapsed = !sidebarCollapsed;
            if (sidebarCollapsed) sidebar.classList.add('collapsed');
            else sidebar.classList.remove('collapsed');
        }

        function openMobileSidebar() {
            document.getElementById('mobileSidebar').classList.add('open');
            document.getElementById('mobileOverlay').classList.add('open');
        }

        function closeMobileSidebar() {
            document.getElementById('mobileSidebar').classList.remove('open');
            document.getElementById('mobileOverlay').classList.remove('open');
        }

        // Theme Functions
        function applyTheme(theme) {
            if (theme === 'light') document.body.classList.add('light-theme');
            else document.body.classList.remove('light-theme');
            localStorage.setItem('teacherTheme', theme);
            document.getElementById('themeSelect').value = theme;
            const themeIcon = document.querySelector('#themeToggle i');
            if (themeIcon) themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }

        function initTheme() {
            const saved = localStorage.getItem('teacherTheme') || 'dark';
            applyTheme(saved);
        }

        // Settings Modal
        function openSettingsModal() {
            document.getElementById('settingsModal').classList.add('active');
        }

        function closeSettingsModal() {
            document.getElementById('settingsModal').classList.remove('active');
        }

        // Initialize
        function init() {
            initTheme();
            buildNavigation();
            renderCurrentView();
            document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);
            document.getElementById('menuBtn').addEventListener('click', openMobileSidebar);
            document.getElementById('mobileOverlay').addEventListener('click', closeMobileSidebar);
            document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
            document.getElementById('saveSettingsBtn').addEventListener('click', () => {
                const theme = document.getElementById('themeSelect').value;
                applyTheme(theme);
                closeSettingsModal();
                alert('Settings saved');
            });
            document.getElementById('themeToggle').addEventListener('click', () => {
                const current = localStorage.getItem('teacherTheme') || 'dark';
                applyTheme(current === 'dark' ? 'light' : 'dark');
            });
            document.getElementById('settingsModal').addEventListener('click', (e) => {
                if (e.target === document.getElementById('settingsModal')) closeSettingsModal();
            });
        }

        init();
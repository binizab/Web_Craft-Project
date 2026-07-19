// Navigation Items for Parent Dashboard
        const NAV_ITEMS = [
            { id: "overview", label: "Overview", icon: "fa-chart-line" },
            { id: "schedule", label: "Student Schedule", icon: "fa-calendar-alt" },
            { id: "payments", label: "Payments & Ledger", icon: "fa-credit-card" },
            { id: "results", label: "Results & Reports", icon: "fa-file-alt" },
            { id: "club-status", label: "Club Activity Status", icon: "fa-users" },
            { id: "messages", label: "Messages", icon: "fa-envelope" },
            { id: "attendance", label: "Attendance", icon: "fa-clock" }
        ];

        // Mock Data
        let scheduleItems = JSON.parse(localStorage.getItem('parentSchedule')) || [
            { id: 1, task: "Mathematics Exam", dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16), completed: false },
            { id: 2, task: "Physics Assignment", dateTime: new Date(Date.now() - 86400000).toISOString().slice(0, 16), completed: false },
            { id: 3, task: "History Project", dateTime: new Date(Date.now() + 172800000).toISOString().slice(0, 16), completed: true }
        ];

        let payments = JSON.parse(localStorage.getItem('parentPayments')) || [
            { id: 1, month: "September", amount: 6000, status: "paid", dueDate: "2024-09-30" },
            { id: 2, month: "October", amount: 6000, status: "pending", dueDate: "2024-10-30" },
            { id: 3, month: "November", amount: 6000, status: "pending", dueDate: "2024-11-30" }
        ];

        let clubRequests = [
            { club: "Coding Club", status: "approved", date: "2024-09-15" },
            { club: "Robotics Club", status: "pending", date: "2024-10-01" },
            { club: "Media Club", status: "approved", date: "2024-09-20" }
        ];

        let messages = [
            { from: "Teacher John", subject: "Parent-Teacher Meeting", content: "Meeting scheduled for Friday at 3 PM.", date: "2024-11-20" },
            { from: "Principal Office", subject: "School Announcement", content: "Winter break starts December 20.", date: "2024-11-18" }
        ];

        let attendance = [
            { date: "2024-11-18", status: "present" },
            { date: "2024-11-19", status: "present" },
            { date: "2024-11-20", status: "absent" },
            { date: "2024-11-21", status: "present" },
            { date: "2024-11-22", status: "present" }
        ];

        let currentView = "overview";
        let sidebarCollapsed = false;
        let currentTheme = localStorage.getItem('parentTheme') || 'dark';

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
            if (theme === 'light') {
                document.documentElement.style.setProperty('--background', '#ffffff');
                document.documentElement.style.setProperty('--foreground', '#0f172a');
                document.documentElement.style.setProperty('--card', '#ffffff');
                document.documentElement.style.setProperty('--border', '#e2e8f0');
                document.documentElement.style.setProperty('--muted', '#f1f5f9');
                document.documentElement.style.setProperty('--sidebar', '#f8fafc');
            } else {
                document.documentElement.style.setProperty('--background', '#0f172a');
                document.documentElement.style.setProperty('--foreground', '#f8fafc');
                document.documentElement.style.setProperty('--card', '#1e293b');
                document.documentElement.style.setProperty('--border', '#334155');
                document.documentElement.style.setProperty('--muted', '#1e293b');
                document.documentElement.style.setProperty('--sidebar', '#0f172a');
            }
            localStorage.setItem('parentTheme', theme);
        }

        // Render Views
        function renderOverview() {
            const totalTasks = scheduleItems.length;
            const completedTasks = scheduleItems.filter(t => t.completed).length;
            const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
            const presentDays = attendance.filter(a => a.status === 'present').length;
            
            return `
                <div class="stats-grid">
                    <div class="stat-card"><h3>Tasks Completed</h3><div class="stat-value">${completedTasks}/${totalTasks}</div></div>
                    <div class="stat-card"><h3>Pending Fees</h3><div class="stat-value">${pendingPayments.toLocaleString()} ETB</div></div>
                    <div class="stat-card"><h3>Attendance Rate</h3><div class="stat-value">${Math.round((presentDays/attendance.length)*100)}%</div></div>
                    <div class="stat-card"><h3>Clubs Approved</h3><div class="stat-value">${clubRequests.filter(c => c.status === 'approved').length}</div></div>
                </div>
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Recent Messages</h3>
                    ${messages.slice(0, 3).map(m => `<div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border);"><strong>${escapeHtml(m.subject)}</strong><br><small>${escapeHtml(m.from)} · ${m.date}</small></div>`).join('')}
                </div>
            `;
        }

        function renderScheduleView() {
            const sorted = [...scheduleItems].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
            return `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Student Schedule</h3>
                    <div class="schedule-list">
                        ${sorted.map(item => `
                            <div class="schedule-item ${new Date(item.dateTime) < new Date() && !item.completed ? 'overdue' : ''} ${item.completed ? 'completed' : ''}">
                                <div class="schedule-info">
                                    <h4>${escapeHtml(item.task)}</h4>
                                    <p>📅 ${item.dateTime.replace('T', ' ')}</p>
                                </div>
                                <span class="status-badge ${item.completed ? 'status-approved' : (new Date(item.dateTime) < new Date() ? 'status-rejected' : 'status-pending')}">
                                    ${item.completed ? 'Completed' : (new Date(item.dateTime) < new Date() ? 'Overdue' : 'Pending')}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderPaymentsView() {
            const totalDue = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
            return `
                <div class="stats-grid">
                    <div class="stat-card"><h3>Total Due</h3><div class="stat-value" style="color: var(--danger);">${totalDue.toLocaleString()} ETB</div></div>
                    <div class="stat-card"><h3>Total Paid</h3><div class="stat-value" style="color: var(--success);">${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()} ETB</div></div>
                </div>
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Payment History</h3>
                    <table class="data-table">
                        <thead><tr><th>Month</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
                        <tbody>
                            ${payments.map(p => `
                                <tr>
                                    <td>${p.month}</td>
                                    <td>${p.amount.toLocaleString()} ETB</td>
                                    <td>${p.dueDate}</td>
                                    <td><span class="status-badge ${p.status === 'paid' ? 'status-approved' : 'status-pending'}">${p.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button class="btn-primary" style="margin-top: 1rem;" onclick="alert('Payment gateway would open here')">Pay Now <i class="fas fa-arrow-right"></i></button>
                </div>
            `;
        }

        function renderResultsView() {
            return `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Academic Results</h3>
                    <table class="data-table">
                        <thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Status</th></tr></thead>
                        <tbody>
                            <tr><td>Mathematics</td><td>88</td><td>A</td><td><span class="status-badge status-approved">Excellent</span></td></tr>
                            <tr><td>Physics</td><td>76</td><td>B+</td><td><span class="status-badge status-approved">Good</span></td></tr>
                            <tr><td>English</td><td>92</td><td>A+</td><td><span class="status-badge status-approved">Outstanding</span></td></tr>
                            <tr><td>History</td><td>81</td><td>B+</td><td><span class="status-badge status-approved">Very Good</span></td></tr>
                        </tbody>
                    </table>
                    <button class="btn-primary" style="margin-top: 1rem;" onclick="window.print()"><i class="fas fa-print"></i> Print Report Card</button>
                </div>
            `;
        }

        function renderClubStatusView() {
            return `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Club Activity Status</h3>
                    <table class="data-table">
                        <thead><tr><th>Club Name</th><th>Request Date</th><th>Status</th></tr></thead>
                        <tbody>
                            ${clubRequests.map(c => `
                                <tr>
                                    <td>${c.club}</td>
                                    <td>${c.date}</td>
                                    <td><span class="status-badge ${c.status === 'approved' ? 'status-approved' : 'status-pending'}">${c.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="glass-card" style="margin-top: 1rem;">
                    <h3 style="margin-bottom: 1rem;">Club Submissions</h3>
                    <div class="schedule-list">
                        <div class="schedule-item"><div><h4>Media Script - "School News"</h4><small>Submitted: 2024-11-15</small></div><span class="status-badge status-approved">Approved</span></div>
                        <div class="schedule-item"><div><h4>Robotics Proposal</h4><small>Submitted: 2024-11-10</small></div><span class="status-badge status-pending">Under Review</span></div>
                    </div>
                </div>
            `;
        }

        function renderMessagesView() {
            return `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Messages from School</h3>
                    <div class="schedule-list">
                        ${messages.map(m => `
                            <div class="schedule-item" style="cursor: pointer;" onclick="alert('From: ${escapeHtml(m.from)}\\n\\n${escapeHtml(m.content)}')">
                                <div><h4>${escapeHtml(m.subject)}</h4><small>${escapeHtml(m.from)} · ${m.date}</small></div>
                                <i class="fas fa-envelope-open-text" style="color: var(--primary);"></i>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-primary" style="margin-top: 1rem;" onclick="alert('Compose message to school')">Send Message</button>
                </div>
            `;
        }

        function renderAttendanceView() {
            const present = attendance.filter(a => a.status === 'present').length;
            const total = attendance.length;
            return `
                <div class="stats-grid">
                    <div class="stat-card"><h3>Present Days</h3><div class="stat-value">${present}</div></div>
                    <div class="stat-card"><h3>Absent Days</h3><div class="stat-value">${total - present}</div></div>
                    <div class="stat-card"><h3>Attendance Rate</h3><div class="stat-value">${Math.round((present/total)*100)}%</div></div>
                </div>
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Recent Attendance Records</h3>
                    <table class="data-table">
                        <thead><tr><th>Date</th><th>Status</th></tr></thead>
                        <tbody>
                            ${attendance.map(a => `
                                <tr>
                                    <td>${a.date}</td>
                                    <td><span class="status-badge ${a.status === 'present' ? 'status-approved' : 'status-rejected'}">${a.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function renderCurrentView() {
            const container = document.getElementById('mainContent');
            const titleMap = {
                overview: "Parent Overview",
                schedule: "Student Schedule Tracker",
                payments: "Payments & Ledger",
                results: "Results & Report Cards",
                "club-status": "Club Activity Status",
                messages: "Messages",
                attendance: "Attendance Records"
            };
            document.getElementById('currentViewTitle').innerText = titleMap[currentView] || "Dashboard";
            
            if (currentView === 'overview') container.innerHTML = renderOverview();
            else if (currentView === 'schedule') container.innerHTML = renderScheduleView();
            else if (currentView === 'payments') container.innerHTML = renderPaymentsView();
            else if (currentView === 'results') container.innerHTML = renderResultsView();
            else if (currentView === 'club-status') container.innerHTML = renderClubStatusView();
            else if (currentView === 'messages') container.innerHTML = renderMessagesView();
            else if (currentView === 'attendance') container.innerHTML = renderAttendanceView();
        }

        // Navigation
        function buildNavigation() {
            const desktopNav = document.getElementById('desktopNav');
            const mobileNav = document.getElementById('mobileNav');
            const navHtml = NAV_ITEMS.map(item => `
                <button class="nav-item ${currentView === item.id ? 'active' : ''}" data-view="${item.id}">
                    <i class="fas ${item.icon}"></i>
                    <span class="nav-label">${item.label}</span>
                </button>
            `).join('');
            desktopNav.innerHTML = navHtml;
            mobileNav.innerHTML = navHtml;
            
            document.querySelectorAll('.nav-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentView = btn.getAttribute('data-view');
                    renderCurrentView();
                    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    closeMobileSidebar();
                });
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

        // Settings Modal
        function initSettings() {
            const modal = document.getElementById('settingsModal');
            document.getElementById('settingsBtn').onclick = () => modal.classList.add('active');
            document.getElementById('closeSettings').onclick = () => modal.classList.remove('active');
            modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
            document.getElementById('saveSettings').onclick = () => {
                const theme = document.getElementById('themeSelect').value;
                setTheme(theme);
                modal.classList.remove('active');
                alert('Settings saved');
            };
            document.getElementById('themeSelect').value = currentTheme;
        }

        // Initialize
        function init() {
            setTheme(currentTheme);
            buildNavigation();
            renderCurrentView();
            initSettings();
            document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);
            document.getElementById('menuBtn').addEventListener('click', openMobileSidebar);
            document.getElementById('mobileOverlay').addEventListener('click', closeMobileSidebar);
            document.getElementById('themeToggle').addEventListener('click', () => {
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
                document.getElementById('themeSelect').value = newTheme;
            });
        }

        init();
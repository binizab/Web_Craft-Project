// Navigation Configuration
        const NAV_ITEMS = [
            { id: "overview", label: "Dashboard Overview", icon: "fa-chart-line" },
            { id: "applications", label: "Registrations", icon: "fa-user-plus" },
            { id: "payment-ledger", label: "Payment Ledger", icon: "fa-credit-card" },
            { id: "attendance", label: "Attendance Tracker", icon: "fa-calendar-check" },
            { id: "calendar", label: "Academic Calendar", icon: "fa-calendar-alt" },
            { id: "risk-alerts", label: "Risk Alerts", icon: "fa-exclamation-triangle" },
            { id: "class-seating", label: "Class Seating", icon: "fa-chalkboard-user" },
            { id: "enrollment", label: "Enrollment", icon: "fa-school" }
        ];

        // Mock Data
        let applications = [
            { id: 1, name: "Abebe Bekele", type: "Student", grade: "Grade 11", status: "pending", date: "2024-11-15" },
            { id: 2, name: "Selam Tesfaye", type: "Teacher", subject: "Mathematics", status: "pending", date: "2024-11-14" },
            { id: 3, name: "Kebede Melaku", type: "Student", grade: "Grade 10", status: "approved", date: "2024-11-10" }
        ];

        let payments = [
            { id: 1, staff: "Abebe Molla", amount: 12000, month: "November", status: "pending" },
            { id: 2, staff: "Selam Tadesse", amount: 11500, month: "November", status: "paid" },
            { id: 3, staff: "Kebede Melaku", amount: 10000, month: "November", status: "pending" }
        ];

        let attendanceData = {
            week1: { "Abebe Bekele": ["p","p","a","p","l"], "Selam Tesfaye": ["p","p","p","p","p"], "Kebede Melaku": ["a","l","p","p","a"] }
        };

        let atRiskStudents = [
            { name: "Sarah Miller", attendance: 78, incidents: 4 },
            { name: "Michael Chen", attendance: 84, incidents: 0 },
            { name: "Emma Wilson", attendance: 98, incidents: 5 }
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

        function formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString();
        }

        // Theme Functions - FIXED
        function applyTheme(theme) {
            if (theme === 'light') {
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
            }
            localStorage.setItem('adminTheme', theme);
            document.getElementById('themeSelect').value = theme;
            // Update theme toggle icon
            const themeIcon = document.querySelector('#themeToggle i');
            if (themeIcon) {
                themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }

        function initTheme() {
            const saved = localStorage.getItem('adminTheme') || 'dark';
            applyTheme(saved);
        }

        // Render Views
        function renderOverview() {
            const pendingApps = applications.filter(a => a.status === 'pending').length;
            const pendingPayments = payments.filter(p => p.status === 'pending').length;
            const totalStudents = 245;
            const attendanceRate = 92;

            return `
                <div class="stats-grid">
                    <div class="stat-card"><h3>Pending Registrations</h3><div class="stat-value">${pendingApps}</div></div>
                    <div class="stat-card"><h3>Pending Salaries</h3><div class="stat-value">${pendingPayments}</div></div>
                    <div class="stat-card"><h3>Total Students</h3><div class="stat-value">${totalStudents}</div></div>
                    <div class="stat-card"><h3>Avg Attendance</h3><div class="stat-value">${attendanceRate}%</div></div>
                </div>
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Quick Actions</h3>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button class="btn-primary" onclick="window.navigateToView('applications')"><i class="fas fa-user-check"></i> Review Apps</button>
                        <button class="btn-primary" onclick="window.navigateToView('payment-ledger')"><i class="fas fa-money-bill"></i> Process Payments</button>
                        <button class="btn-primary" onclick="window.navigateToView('attendance')"><i class="fas fa-fingerprint"></i> Track Attendance</button>
                    </div>
                </div>
            `;
        }

        function renderApplicationsView() {
            return `
                <div class="glass-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3>Registration Applications</h3>
                        <button class="btn-primary" onclick="showAddApplicationModal()"><i class="fas fa-plus"></i> Add App</button>
                    </div>
                    <table class="data-table">
                        <thead><tr><th>Name</th><th>Type</th><th>Details</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            ${applications.map(app => `
                                <tr>
                                    <td>${escapeHtml(app.name)}</td>
                                    <td>${app.type}</td>
                                    <td>${app.type === 'Student' ? app.grade : app.subject}</td>
                                    <td>${formatDate(app.date)}</td>
                                    <td><span class="status-badge ${app.status === 'approved' ? 'status-approved' : (app.status === 'pending' ? 'status-pending' : 'status-rejected')}">${app.status}</span></td>
                                    <td>${app.status === 'pending' ? `<button class="btn-primary btn-success" style="padding:0.25rem 0.5rem; margin-right:0.25rem;" onclick="approveApplication(${app.id})">Approve</button><button class="btn-primary btn-danger" style="padding:0.25rem 0.5rem;" onclick="rejectApplication(${app.id})">Reject</button>` : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function renderPaymentLedgerView() {
            const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
            return `
                <div class="stats-grid">
                    <div class="stat-card"><h3>Total Pending</h3><div class="stat-value">${totalPending.toLocaleString()} ETB</div></div>
                    <div class="stat-card"><h3>Total Paid</h3><div class="stat-value">${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()} ETB</div></div>
                </div>
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Staff Payroll - November 2024</h3>
                    <table class="data-table">
                        <thead><tr><th>Staff Name</th><th>Amount</th><th>Month</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            ${payments.map(p => `
                                <tr>
                                    <td>${escapeHtml(p.staff)}</td>
                                    <td>${p.amount.toLocaleString()} ETB</td>
                                    <td>${p.month}</td>
                                    <td><span class="status-badge ${p.status === 'paid' ? 'status-approved' : 'status-pending'}">${p.status}</span></td>
                                    <td>${p.status === 'pending' ? `<button class="btn-primary" onclick="processPayment(${p.id})">Pay Now</button>` : '✓ Paid'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button class="btn-primary" style="margin-top: 1rem;" onclick="batchPay()"><i class="fas fa-layer-group"></i> Batch Pay All</button>
                </div>
            `;
        }

        function renderAttendanceView() {
            const students = Object.keys(attendanceData.week1);
            const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
            const statusMap = { 'p': 'Present', 'a': 'Absent', 'l': 'Late' };
            return `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Weekly Attendance (Week 1)</h3>
                    <table class="data-table">
                        <thead><tr><th>Student</th>${days.map(d => `<th>${d}</th>`).join('')}</thead>
                        <tbody>
                            ${students.map(s => `
                                <tr>
                                    <td>${escapeHtml(s)}</td>
                                    ${attendanceData.week1[s].map(status => `<td><span class="status-badge ${status === 'p' ? 'status-approved' : (status === 'l' ? 'status-pending' : 'status-rejected')}">${statusMap[status]}</span></td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function renderCalendarView() {
            return `<div class="glass-card"><h3>Ethiopian Academic Calendar 2018 E.C.</h3><div style="margin-top:1rem; background:var(--bg-dark); padding:2rem; border-radius:12px; text-align:center;"><p>📅 Meskerem - Nehase (12 Months)</p><p style="color:var(--text-dim); margin-top:1rem;">School Year: September 2024 - August 2025</p><button class="btn-primary" style="margin-top:1rem;" onclick="alert('Full calendar export feature')">Export Calendar</button></div></div>`;
        }

        function renderRiskAlertsView() {
            return `
                <div class="glass-card">
                    <h3 style="margin-bottom: 1rem;">Students Requiring Attention</h3>
                    <table class="data-table">
                        <thead><tr><th>Student Name</th><th>Attendance</th><th>Incidents</th><th>Alert Type</th></tr></thead>
                        <tbody>
                            ${atRiskStudents.map(s => `
                                <tr>
                                    <td>${escapeHtml(s.name)}</td>
                                    <td>${s.attendance}%</td>
                                    <td>${s.incidents}</td>
                                    <td><span class="status-badge status-rejected">${s.incidents >= 3 ? 'Discipline Alert' : 'Attendance Alert'}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function renderClassSeatingView() {
            return `
                <div class="glass-card">
                    <h3>AI Class Seating Arrangement</h3>
                    <div style="margin-top: 1rem;">
                        <div class="stats-grid" style="grid-template-columns: repeat(2,1fr);">
                            <div class="stat-card"><h3>Grade 9 Section A</h3><div class="stat-value">24 Students</div><div style="display:grid; grid-template-columns:repeat(4,1fr); gap:4px; margin-top:10px;">${Array(24).fill().map((_,i) => `<div style="background:#334155; padding:4px; border-radius:4px; font-size:10px; text-align:center;">${String.fromCharCode(65 + i%26)}</div>`).slice(0,24).join('')}</div></div>
                            <div class="stat-card"><h3>Grade 9 Section B</h3><div class="stat-value">22 Students</div><div style="display:grid; grid-template-columns:repeat(4,1fr); gap:4px; margin-top:10px;">${Array(22).fill().map((_,i) => `<div style="background:#334155; padding:4px; border-radius:4px; font-size:10px; text-align:center;">${String.fromCharCode(65 + (i+24)%26)}</div>`).join('')}</div></div>
                        </div>
                        <button class="btn-primary" style="margin-top:1rem;" onclick="alert('AI Regenerator would re-balance sections')"><i class="fas fa-robot"></i> Run AI Classification</button>
                    </div>
                </div>
            `;
        }

        function renderEnrollmentView() {
            return `
                <div class="glass-card">
                    <h3>School Enrollment System</h3>
                    <div class="stats-grid" style="grid-template-columns: repeat(3,1fr); margin-top: 1rem;">
                        <div class="stat-card"><h3>Nursery</h3><div class="stat-value">45</div></div>
                        <div class="stat-card"><h3>Primary (1-8)</h3><div class="stat-value">320</div></div>
                        <div class="stat-card"><h3>Secondary (9-12)</h3><div class="stat-value">280</div></div>
                    </div>
                    <button class="btn-primary" style="margin-top:1rem;" onclick="alert('Enrollment period open. Please configure sections.')"><i class="fas fa-pen"></i> Configure Enrollment</button>
                </div>
            `;
        }

        // Action Functions
        window.approveApplication = function(id) {
            const app = applications.find(a => a.id === id);
            if(app && app.status === 'pending') {
                app.status = 'approved';
                renderCurrentView();
                alert(`${app.name} approved successfully!`);
            }
        };

        window.rejectApplication = function(id) {
            const app = applications.find(a => a.id === id);
            if(app && app.status === 'pending') {
                app.status = 'rejected';
                renderCurrentView();
                alert(`${app.name} rejected.`);
            }
        };

        window.processPayment = function(id) {
            const payment = payments.find(p => p.id === id);
            if(payment && payment.status === 'pending') {
                payment.status = 'paid';
                renderCurrentView();
                alert(`Payment processed for ${payment.staff}: ${payment.amount.toLocaleString()} ETB`);
            }
        };

        window.batchPay = function() {
            payments.forEach(p => { if(p.status === 'pending') p.status = 'paid'; });
            renderCurrentView();
            alert("All pending salaries processed!");
        };

        function showAddApplicationModal() {
            const name = prompt("Enter applicant name:");
            if(!name) return;
            const type = prompt("Type (Student/Teacher):");
            const detail = prompt(type === "Student" ? "Grade:" : "Subject:");
            applications.unshift({
                id: Date.now(),
                name: name,
                type: type,
                grade: type === "Student" ? detail : undefined,
                subject: type === "Teacher" ? detail : undefined,
                status: "pending",
                date: new Date().toISOString().slice(0,10)
            });
            renderCurrentView();
        }

        // Navigation
        function navigateToView(viewId) {
            currentView = viewId;
            renderCurrentView();
            document.querySelectorAll('.nav-item').forEach(btn => {
                if(btn.getAttribute('data-view') === viewId) btn.classList.add('active');
                else btn.classList.remove('active');
            });
            closeMobileSidebar();
        }
        window.navigateToView = navigateToView;

        function renderCurrentView() {
            const container = document.getElementById('dynamicViewContainer');
            const titleMap = {
                overview: "Admin Overview",
                applications: "Registration Management",
                "payment-ledger": "Payment Ledger",
                attendance: "Attendance Tracker",
                calendar: "Academic Calendar",
                "risk-alerts": "Risk Alerts",
                "class-seating": "Class Seating",
                enrollment: "Enrollment"
            };
            document.getElementById('currentViewTitle').innerText = titleMap[currentView] || "Dashboard";
            
            if(currentView === 'overview') container.innerHTML = renderOverview();
            else if(currentView === 'applications') container.innerHTML = renderApplicationsView();
            else if(currentView === 'payment-ledger') container.innerHTML = renderPaymentLedgerView();
            else if(currentView === 'attendance') container.innerHTML = renderAttendanceView();
            else if(currentView === 'calendar') container.innerHTML = renderCalendarView();
            else if(currentView === 'risk-alerts') container.innerHTML = renderRiskAlertsView();
            else if(currentView === 'class-seating') container.innerHTML = renderClassSeatingView();
            else if(currentView === 'enrollment') container.innerHTML = renderEnrollmentView();
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
            desktopNav.innerHTML = navHtml;
            mobileNav.innerHTML = navHtml;
            document.querySelectorAll('.nav-item').forEach(btn => {
                btn.addEventListener('click', () => navigateToView(btn.getAttribute('data-view')));
            });
        }

        // Sidebar Functions
        function toggleSidebar() {
            const sidebar = document.getElementById('desktopSidebar');
            sidebarCollapsed = !sidebarCollapsed;
            if(sidebarCollapsed) sidebar.classList.add('collapsed');
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
                const currentTheme = localStorage.getItem('adminTheme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                applyTheme(newTheme);
            });
            // Close modal on overlay click
            document.getElementById('settingsModal').addEventListener('click', (e) => {
                if(e.target === document.getElementById('settingsModal')) closeSettingsModal();
            });
        }

        init();
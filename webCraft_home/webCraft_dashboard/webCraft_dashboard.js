/* ============================================================
 * Owner Hub — vanilla JS dashboard
 * ============================================================ */

/* ---------- Mock data ---------- */
const OWNER = {
  id: "OWN-0001",
  fullName: "Abebe Bekele",
  email: "abebe@ownerhub.et",
  phone: "+251 911 234 567",
  joined: "2024-01-15",
  role: "Owner / Admin",
};

const ETH_BANKS = [
  "Commercial Bank of Ethiopia (CBE)", "Awash Bank", "Dashen Bank", "Bank of Abyssinia",
  "Wegagen Bank", "United Bank (Hibret)", "Nib International Bank", "Cooperative Bank of Oromia",
  "Lion International Bank", "Zemen Bank", "Oromia International Bank", "Berhan Bank",
  "Bunna Bank", "Abay Bank", "Addis International Bank", "Debub Global Bank",
  "Enat Bank", "Hijra Bank", "ZamZam Bank", "Goh Betoch Bank", "Siinqee Bank", "Tsehay Bank",
  "Amhara Bank", "Gadaa Bank", "Telebirr (Mobile)", "M-Pesa (Mobile)", "CBE Birr (Mobile)",
];

const USERS = [
  { id: "USR-1001", name: "Hana Tadesse", email: "hana.t@example.et", joined: "2025-08-12", status: "active" },
  { id: "USR-1002", name: "Yonas Kebede", email: "yonas.k@example.et", joined: "2025-09-03", status: "active" },
  { id: "USR-1003", name: "Mahlet Alemu", email: "mahlet.a@example.et", joined: "2025-09-21", status: "pending" },
  { id: "USR-1004", name: "Dawit Girma", email: "dawit.g@example.et", joined: "2025-10-04", status: "active" },
  { id: "USR-1005", name: "Selam Worku", email: "selam.w@example.et", joined: "2025-10-19", status: "banned" },
  { id: "USR-1006", name: "Bereket Solomon", email: "bereket.s@example.et", joined: "2025-11-02", status: "active" },
  { id: "USR-1007", name: "Liya Mengistu", email: "liya.m@example.et", joined: "2025-11-15", status: "active" },
  { id: "USR-1008", name: "Nahom Teshome", email: "nahom.t@example.et", joined: "2025-12-01", status: "pending" },
];

const ACCOUNTS_INIT = [
  { id: 1, bank: "Commercial Bank of Ethiopia (CBE)", number: "1000123456789", holder: "Abebe Bekele", primary: true },
  { id: 2, bank: "Telebirr (Mobile)", number: "0911234567", holder: "Abebe Bekele", primary: false },
];

const CONTACTS = [
  { id: 1, name: "Hana Tadesse", last: "See you tomorrow!", time: "10:42", unread: 2, online: true },
  { id: 2, name: "Yonas Kebede", last: "Got the files, thanks.", time: "09:18", unread: 0, online: true },
  { id: 3, name: "Mahlet Alemu", last: "Can we meet at 3?", time: "Yesterday", unread: 1, online: false },
  { id: 4, name: "Team — E-school", last: "Dawit: Lecture uploaded.", time: "Mon", unread: 0, online: false },
  { id: 5, name: "Support", last: "Your ticket is resolved.", time: "Sun", unread: 0, online: false },
];

const MOCK_MESSAGES = {
  1: [
    { from: "in", text: "Selam Abebe! How are you?", time: "10:30" },
    { from: "out", text: "Dehna negn, ante?", time: "10:31" },
    { from: "in", text: "I am good. About the order — is it ready?", time: "10:35" },
    { from: "out", text: "Yes, shipping today.", time: "10:38" },
    { from: "in", text: "See you tomorrow!", time: "10:42" },
  ],
  2: [
    { from: "in", text: "Sent the design files.", time: "09:10" },
    { from: "out", text: "Got the files, thanks.", time: "09:18" },
  ],
  3: [{ from: "in", text: "Can we meet at 3?", time: "08:00" }],
  4: [{ from: "in", text: "Dawit: Lecture uploaded.", time: "Mon" }],
  5: [{ from: "in", text: "Your ticket is resolved.", time: "Sun" }],
};

const REQUESTS_INIT = [
  { id: 1, from: "Yonas K.", q: "Can I publish a new course on the school?", at: "2h ago", status: "pending" },
  { id: 2, from: "Hana T.", q: "May I issue a refund for order #1042?", at: "5h ago", status: "pending" },
  { id: 3, from: "Mahlet A.", q: "Can I export user data for analytics?", at: "Yesterday", status: "pending" },
  { id: 4, from: "Dawit G.", q: "Can I delete inactive accounts?", at: "2d ago", status: "approved" },
];

const NOTIFS_INIT = [
  { id: 1, title: "New order received", body: "Order #1042 from Hana T.", time: "2m ago", unread: true },
  { id: 2, title: "New student enrolled", body: "Yonas K. joined Web Dev 101.", time: "18m ago", unread: true },
  { id: 3, title: "Payment confirmed", body: "ETB 4,250 received via CBE.", time: "1h ago", unread: true },
  { id: 4, title: "New control request", body: "Permission request awaiting review.", time: "3h ago", unread: false },
  { id: 5, title: "Portfolio comment", body: "Visitor left feedback on your site.", time: "Yesterday", unread: false },
];

/* ---------- State ---------- */
const state = {
  authed: false,
  route: "dashboard",
  notifs: [...NOTIFS_INIT],
  accounts: [...ACCOUNTS_INIT],
  requests: [...REQUESTS_INIT],
  activeContact: 1,
  messages: JSON.parse(JSON.stringify(MOCK_MESSAGES)),
  punishTarget: null,
  charts: {},
};

/* ---------- Routes ---------- */
const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { id: "dashboard", title: "Dashboard", icon: "layout-dashboard", tip: "Overview & summary of all sections" },
      { id: "users", title: "Users", icon: "users", tip: "Signed-up users with ID, name, email, date and actions" },
      { id: "accounts", title: "Accounts", icon: "landmark", tip: "Add Ethiopian bank accounts and numbers" },
      { id: "profile", title: "Owner Profile", icon: "user-cog", tip: "Edit owner profile details" },
    ],
  },
  {
    label: "E-commerce",
    items: [
      { id: "ecommerce.website", title: "Website", icon: "shopping-cart", tip: "Manage e-commerce site & products" },
      { id: "ecommerce.finance", title: "Finance", icon: "trending-up", tip: "Profit & income graphs (e-commerce)" },
      { id: "ecommerce.messenger", title: "Messenger", icon: "message-circle", tip: "Chat with e-commerce contacts" },
      { id: "ecommerce.control", title: "Control", icon: "shield", tip: "Approve / reject e-commerce requests" },
    ],
  },
  {
    label: "E-school",
    items: [
      { id: "eschool.website", title: "Website", icon: "graduation-cap", tip: "Manage e-school site & courses" },
      { id: "eschool.finance", title: "Finance", icon: "trending-up", tip: "Profit & income graphs (e-school)" },
      { id: "eschool.messenger", title: "Messenger", icon: "message-circle", tip: "Chat with students & staff" },
      { id: "eschool.control", title: "Control", icon: "shield", tip: "Approve / reject e-school requests" },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { id: "portfolio.website", title: "Website", icon: "briefcase", tip: "Manage portfolio site" },
      { id: "portfolio.finance", title: "Finance", icon: "trending-up", tip: "Profit & income graphs (portfolio)" },
      { id: "portfolio.messenger", title: "Messenger", icon: "message-circle", tip: "Chat with portfolio leads" },
      { id: "portfolio.control", title: "Control", icon: "shield", tip: "Approve / reject portfolio requests" },
    ],
  },
];

/* ---------- Init ---------- */
window.addEventListener("DOMContentLoaded", () => {
  // Theme
  const savedTheme = localStorage.getItem("theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setTheme(savedTheme);

  // Auth
  state.authed = localStorage.getItem("authed") === "1";
  renderAuth();

  // Static handlers
  document.getElementById("login-form").addEventListener("submit", onLogin);
  document.getElementById("logout-btn").addEventListener("click", onLogout);
  document.getElementById("theme-btn").addEventListener("click", toggleTheme);
  document.getElementById("sidebar-toggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
    localStorage.setItem("collapsed", document.getElementById("sidebar").classList.contains("collapsed") ? "1" : "0");
  });
  
  if (localStorage.getItem("collapsed") === "1") document.getElementById("sidebar").classList.add("collapsed");

  // Notifications
  document.getElementById("notif-btn").addEventListener("click", (e) => togglePanel(e, "notif-panel"));
  document.getElementById("user-btn").addEventListener("click", (e) => togglePanel(e, "user-panel"));
  document.getElementById("mark-read").addEventListener("click", () => {
    state.notifs = state.notifs.map((n) => ({ ...n, unread: false }));
    renderNotifs();
  });
  document.querySelectorAll("[data-route]").forEach((b) =>
    b.addEventListener("click", () => navigate(b.dataset.route))
  );

  // Account modal
  document.getElementById("account-btn").addEventListener("click", () => openModal("account-modal"));
  document.getElementById("account-modal-btn").addEventListener("click", () => {
    document.getElementById("user-panel").classList.add("hidden");
    openModal("account-modal");
  });
  document.querySelectorAll("[data-close-modal]").forEach((b) =>
    b.addEventListener("click", () => closeModals())
  );
  document.querySelectorAll(".modal").forEach((m) =>
    m.addEventListener("click", (e) => { if (e.target === m) closeModals(); })
  );

  // Punish modal
  document.getElementById("punish-degree").addEventListener("input", (e) => {
    document.getElementById("degree-val").textContent = e.target.value;
  });
  document.getElementById("punish-confirm").addEventListener("click", confirmPunish);

  // Outside click to close panels
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".panel").forEach((p) => {
      if (!p.classList.contains("hidden") && !p.contains(e.target) &&
          !e.target.closest(".dropdown")) p.classList.add("hidden");
    });
  });

  fillOwnerInfo();
  refreshIcons();
});

function refreshIcons() { if (window.lucide) lucide.createIcons(); }

/* ---------- Auth ---------- */
function renderAuth() {
  document.getElementById("login-overlay").classList.toggle("hidden", state.authed);
  document.getElementById("app").classList.toggle("hidden", !state.authed);
  if (state.authed) {
    renderSidebar();
    renderNotifs();
    navigate(state.route);
  }
}
function onLogin(e) {
  e.preventDefault();
  const u = document.getElementById("login-user").value.trim();
  const p = document.getElementById("login-pass").value;
  const err = document.getElementById("login-error");
  if (u === "owner" && p === "owner123") {
    state.authed = true;
    localStorage.setItem("authed", "1");
    err.classList.add("hidden");
    renderAuth();
  } else {
    err.classList.remove("hidden");
  }
}
function onLogout() {
  state.authed = false;
  localStorage.removeItem("authed");
  renderAuth();
}

/* ---------- Theme ---------- */
function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("theme", t);
  const btn = document.getElementById("theme-btn");
  if (btn) btn.innerHTML = t === "dark" ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
  refreshIcons();
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme");
  setTheme(cur === "dark" ? "light" : "dark");
  // re-render charts to pick up colors
  if (state.authed) navigate(state.route);
}

/* ---------- Sidebar / Nav ---------- */
function renderSidebar() {
  const nav = document.getElementById("nav");
  nav.innerHTML = NAV_GROUPS.map((g) => `
    <div class="nav-group">
      <div class="nav-group-label">${g.label}</div>
      ${g.items.map((it) => `
        <button class="nav-item" data-route="${it.id}" data-tip="${it.tip}">
          <i data-lucide="${it.icon}"></i>
          <span class="nav-label">${it.title}</span>
        </button>
      `).join("")}
    </div>
  `).join("");
  nav.querySelectorAll(".nav-item").forEach((b) =>
    b.addEventListener("click", () => navigate(b.dataset.route))
  );
  refreshIcons();
}

function navigate(route) {
  state.route = route;
  document.querySelectorAll(".nav-item").forEach((n) =>
    n.classList.toggle("active", n.dataset.route === route)
  );
  const all = NAV_GROUPS.flatMap((g) => g.items);
  const item = all.find((i) => i.id === route);
  document.getElementById("page-title").textContent = item ? item.title : "Dashboard";
  // close mobile sidebar
  if (window.innerWidth < 768) document.getElementById("sidebar").classList.add("collapsed");
  // destroy old charts
  Object.values(state.charts).forEach((c) => c?.destroy?.());
  state.charts = {};
  renderPage(route);
  refreshIcons();
}

/* ---------- Notifications panel ---------- */
function renderNotifs() {
  const list = document.getElementById("notif-list");
  list.innerHTML = state.notifs.map((n) => `
    <div class="notif-item">
      <div class="notif-dot ${n.unread ? "unread" : ""}"></div>
      <div class="notif-body">
        <div class="notif-title">${n.title}</div>
        <div class="notif-text">${n.body}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>`).join("");
  const unread = state.notifs.filter((n) => n.unread).length;
  const badge = document.getElementById("notif-badge");
  badge.textContent = unread;
  badge.classList.toggle("hidden", unread === 0);
}

function togglePanel(e, id) {
  e.stopPropagation();
  document.querySelectorAll(".panel").forEach((p) => {
    if (p.id !== id) p.classList.add("hidden");
  });
  document.getElementById(id).classList.toggle("hidden");
}

/* ---------- Modals & toasts ---------- */
function openModal(id) { document.getElementById(id).classList.remove("hidden"); refreshIcons(); }
function closeModals() { document.querySelectorAll(".modal").forEach((m) => m.classList.add("hidden")); }
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.add("hidden"), 2200);
}

/* ---------- Owner info propagation ---------- */
function fillOwnerInfo() {
  const initials = OWNER.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("side-avatar", initials); set("side-name", OWNER.fullName); set("side-email", OWNER.email);
  set("hdr-avatar", initials); set("hdr-name", OWNER.fullName);
  set("up-name", OWNER.fullName); set("up-email", OWNER.email); set("up-id", "ID: " + OWNER.id);
  set("m-avatar", initials); set("m-name", OWNER.fullName); set("m-email", OWNER.email);
  set("m-id", OWNER.id); set("m-phone", OWNER.phone); set("m-joined", OWNER.joined);
}

/* ============================================================
 * PAGE RENDERERS
 * ============================================================ */
function renderPage(route) {
  const page = document.getElementById("page");
  const r = ROUTES[route] || ROUTES.dashboard;
  page.innerHTML = r.html();
  r.after?.();
  refreshIcons();
}

const ROUTES = {
  dashboard: {
    html: () => `
      <h2 class="page-h">Dashboard</h2>
      <p class="page-sub">Summary across e-commerce, e-school and portfolio.</p>
      <div class="grid grid-stats">
        ${statCard("Total users", USERS.length, "+12% this month", "users")}
        ${statCard("Revenue (ETB)", "284,500", "+8.2% vs last month", "wallet")}
        ${statCard("Active courses", "14", "+2 new", "graduation-cap")}
        ${statCard("Pending requests", state.requests.filter((r) => r.status === "pending").length, "Awaiting review", "shield")}
      </div>
      <div style="height:16px"></div>
      <div class="grid grid-2">
        <div class="card">
          <h3>Revenue by section</h3>
          <p class="card-sub">Last 6 months (ETB '000)</p>
          <div class="chart-wrap"><canvas id="ch-rev"></canvas></div>
        </div>
        <div class="card">
          <h3>Active users trend</h3>
          <p class="card-sub">Daily active users</p>
          <div class="chart-wrap"><canvas id="ch-users"></canvas></div>
        </div>
      </div>
      <div style="height:16px"></div>
      <div class="card">
        <h3>Latest signups</h3>
        <p class="card-sub">Most recent users</p>
        ${usersTable(USERS.slice(-5).reverse(), false)}
      </div>
    `,
    after: () => {
      barChart("ch-rev", ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
        [{ label: "E-commerce", data: [40, 55, 48, 70, 82, 95] },
         { label: "E-school", data: [22, 28, 30, 35, 42, 51] },
         { label: "Portfolio", data: [10, 12, 14, 13, 18, 22] }]);
      lineChart("ch-users", ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        [{ label: "DAU", data: [320, 412, 380, 495, 540, 612, 580] }]);
    },
  },

  users: {
    html: () => `
      <h2 class="page-h">Users</h2>
      <p class="page-sub">Signed-up users with their ID, name, email and signing date.</p>
      <div class="card">${usersTable(USERS, true)}</div>
    `,
    after: () => bindUserActions(),
  },

  accounts: {
    html: () => `
      <h2 class="page-h">Accounts</h2>
      <p class="page-sub">Add Ethiopian bank accounts. Select a bank and enter your account number.</p>
      <div class="grid grid-2">
        <div class="card">
          <h3>Add new account</h3>
          <p class="card-sub">Linked to: <strong>${OWNER.fullName}</strong></p>
          <label>Bank</label>
          <select id="acc-bank">${ETH_BANKS.map((b) => `<option>${b}</option>`).join("")}</select>
          <label>Account number</label>
          <input id="acc-num" type="text" inputmode="numeric" placeholder="e.g. 1000123456789" />
          <label>Holder name</label>
          <input id="acc-holder" type="text" value="${OWNER.fullName}" />
          <button class="btn btn-primary" id="acc-add" style="margin-top:14px">
            <i data-lucide="plus"></i> Add account
          </button>
        </div>
        <div class="card">
          <h3>Linked accounts</h3>
          <p class="card-sub">${state.accounts.length} account(s)</p>
          <div id="acc-list">${renderAccountList()}</div>
        </div>
      </div>
    `,
    after: () => {
      document.getElementById("acc-add").addEventListener("click", () => {
        const bank = document.getElementById("acc-bank").value;
        const num = document.getElementById("acc-num").value.trim();
        const holder = document.getElementById("acc-holder").value.trim();
        if (!num || !holder) { toast("Account number and holder required"); return; }
        state.accounts.push({ id: Date.now(), bank, number: num, holder, primary: false });
        document.getElementById("acc-num").value = "";
        document.getElementById("acc-list").innerHTML = renderAccountList();
        bindAccActions();
        toast("Account added");
        refreshIcons();
      });
      bindAccActions();
    },
  },

  profile: {
    html: () => `
      <h2 class="page-h">Owner Profile</h2>
      <p class="page-sub">Edit your profile information.</p>
      <div class="card" style="max-width:640px">
        <div style="text-align:center;margin-bottom:18px">
          <div class="avatar lg">${OWNER.fullName.split(" ").map((p)=>p[0]).slice(0,2).join("")}</div>
          <div class="muted xs mono">ID: ${OWNER.id}</div>
        </div>
        <label>Full name</label><input id="p-name" value="${OWNER.fullName}" />
        <label>Email</label><input id="p-email" type="email" value="${OWNER.email}" />
        <label>Phone</label><input id="p-phone" value="${OWNER.phone}" />
        <label>Role</label><input value="${OWNER.role}" disabled />
        <button class="btn btn-primary" id="p-save" style="margin-top:14px"><i data-lucide="save"></i> Save changes</button>
      </div>
    `,
    after: () => {
      document.getElementById("p-save").addEventListener("click", () => {
        OWNER.fullName = document.getElementById("p-name").value.trim() || OWNER.fullName;
        OWNER.email = document.getElementById("p-email").value.trim() || OWNER.email;
        OWNER.phone = document.getElementById("p-phone").value.trim() || OWNER.phone;
        fillOwnerInfo();
        toast("Profile saved");
      });
    },
  },

  // ---- Section pages auto-generated below
};

["ecommerce", "eschool", "portfolio"].forEach((sec) => {
  const label = sec === "ecommerce" ? "E-commerce" : sec === "eschool" ? "E-school" : "Portfolio";
  ROUTES[`${sec}.website`] = {
    html: () => `
      <h2 class="page-h">${label} — Website</h2>
      <p class="page-sub">Manage the ${label.toLowerCase()} website content.</p>
      <div class="grid grid-stats">
        ${statCard("Pages", "12", "+1 new", "file")}
        ${statCard("Visitors today", "1,284", "+5%", "eye")}
        ${statCard(label === "E-school" ? "Courses" : label === "E-commerce" ? "Products" : "Projects", "47", "+3 added", "package")}
        ${statCard("Conversion", "3.4%", "+0.2%", "trending-up")}
      </div>
      <div style="height:16px"></div>
      <div class="card">
        <h3>${label === "E-school" ? "Courses" : label === "E-commerce" ? "Products" : "Projects"}</h3>
        <p class="card-sub">Latest items</p>
        <div class="table-wrap"><table><thead><tr>
          <th>ID</th><th>Title</th><th>Status</th><th>Updated</th><th></th>
        </tr></thead><tbody>
          ${[
            ["#001","Item A","published","2d ago"],
            ["#002","Item B","draft","3d ago"],
            ["#003","Item C","published","1w ago"],
            ["#004","Item D","published","2w ago"],
          ].map((r)=>`<tr>
            <td class="mono">${r[0]}</td><td>${r[1]}</td>
            <td><span class="chip ${r[2]==="published"?"success":"warning"}">${r[2]}</span></td>
            <td class="muted">${r[3]}</td>
            <td class="row-actions">
              <button class="icon-btn btn-icon"><i data-lucide="eye"></i></button>
              <button class="icon-btn btn-icon"><i data-lucide="pencil"></i></button>
            </td>
          </tr>`).join("")}
        </tbody></table></div>
      </div>
    `,
  };
  ROUTES[`${sec}.finance`] = {
    html: () => `
      <h2 class="page-h">${label} — Finance</h2>
      <p class="page-sub">Profit, income and other financials.</p>
      <div class="grid grid-stats">
        ${statCard("Income (ETB)", "182,400", "+9%", "arrow-up")}
        ${statCard("Profit (ETB)", "64,200", "+6%", "trending-up")}
        ${statCard("Expenses (ETB)", "118,200", "+3%", "arrow-down")}
        ${statCard("Margin", "35.2%", "+1.1%", "percent")}
      </div>
      <div style="height:16px"></div>
      <div class="grid grid-2">
        <div class="card"><h3>Monthly income</h3><p class="card-sub">Last 8 months</p>
          <div class="chart-wrap"><canvas id="f-bar-${sec}"></canvas></div></div>
        <div class="card"><h3>Profit trend</h3><p class="card-sub">Last 8 months</p>
          <div class="chart-wrap"><canvas id="f-line-${sec}"></canvas></div></div>
      </div>
      <div style="height:16px"></div>
      <div class="card"><h3>Income by channel</h3><p class="card-sub">Distribution</p>
        <div class="chart-wrap"><canvas id="f-pie-${sec}"></canvas></div></div>
    `,
    after: () => {
      const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov"];
      barChart(`f-bar-${sec}`, months, [{ label: "Income", data: [120,135,150,142,168,175,182,195] }]);
      lineChart(`f-line-${sec}`, months, [
        { label: "Profit", data: [40,46,55,52,60,63,68,72] },
        { label: "Expenses", data: [80,89,95,90,108,112,114,123] },
      ]);
      pieChart(`f-pie-${sec}`, ["Direct","Referral","Mobile","Partner","Other"], [42,18,22,12,6]);
    },
  };
  ROUTES[`${sec}.messenger`] = {
    html: () => `
      <h2 class="page-h">${label} — Messenger</h2>
      <p class="page-sub">Telegram-style chat with your contacts (UI demo).</p>
      <div class="messenger">
        <div class="contacts">
          <div class="contact-search"><input type="text" placeholder="Search contacts..." id="contact-search" /></div>
          <div id="contact-list">${renderContacts()}</div>
        </div>
        <div class="chat" id="chat-pane">${renderChat()}</div>
      </div>
    `,
    after: () => {
      bindMessenger();
    },
  };
  ROUTES[`${sec}.control`] = {
    html: () => `
      <h2 class="page-h">${label} — Control</h2>
      <p class="page-sub">Approve or reject incoming permission requests. Issue punishments for violations.</p>
      <div class="grid grid-stats">
        ${statCard("Pending", state.requests.filter(r=>r.status==="pending").length, "", "clock")}
        ${statCard("Approved", state.requests.filter(r=>r.status==="approved").length, "", "check")}
        ${statCard("Rejected", state.requests.filter(r=>r.status==="rejected").length, "", "x")}
        ${statCard("Punished", state.requests.filter(r=>r.status==="punished").length, "", "gavel")}
      </div>
      <div style="height:16px"></div>
      <div class="card">
        <h3>Requests</h3>
        <p class="card-sub">Decide on each request below.</p>
        <div id="req-list">${renderRequests()}</div>
      </div>
    `,
    after: () => bindRequests(),
  };
});

/* ---------- Builders ---------- */
function statCard(label, value, trend, icon) {
  return `<div class="card stat-card">
    <div class="stat-label"><i data-lucide="${icon}"></i> ${label}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-trend">${trend}</div>
  </div>`;
}

function usersTable(rows, withActions) {
  return `<div class="table-wrap"><table>
    <thead><tr>
      <th>User ID</th><th>Name</th><th>Email</th><th>Date signed</th><th>Status</th>${withActions?"<th>Actions</th>":""}
    </tr></thead>
    <tbody>${rows.map((u) => `
      <tr>
        <td class="mono">${u.id}</td>
        <td>${u.name}</td>
        <td class="muted">${u.email}</td>
        <td class="muted">${u.joined}</td>
        <td><span class="chip ${u.status==="active"?"success":u.status==="pending"?"warning":"danger"}">${u.status}</span></td>
        ${withActions?`<td class="row-actions">
          <button class="icon-btn btn-icon" data-act="view" data-id="${u.id}"><i data-lucide="eye"></i></button>
          <button class="icon-btn btn-icon" data-act="edit" data-id="${u.id}"><i data-lucide="pencil"></i></button>
          <button class="icon-btn btn-icon" data-act="del" data-id="${u.id}"><i data-lucide="trash-2"></i></button>
        </td>`:""}
      </tr>`).join("")}</tbody></table></div>`;
}
function bindUserActions() {
  document.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => {
    const m = { view: "Viewing", edit: "Editing", del: "Deleted" };
    toast(`${m[b.dataset.act]} user ${b.dataset.id}`);
  }));
}

function renderAccountList() {
  if (!state.accounts.length) return `<p class="muted sm">No accounts yet.</p>`;
  return state.accounts.map((a) => `
    <div class="list-row">
      <div>
        <div style="font-weight:600;font-size:13px">${a.bank}</div>
        <div class="muted xs mono">${a.number} · ${a.holder}</div>
      </div>
      <div class="row-actions">
        ${a.primary?'<span class="chip success">primary</span>':''}
        <button class="icon-btn btn-icon" data-acc-del="${a.id}"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`).join("");
}
function bindAccActions() {
  document.querySelectorAll("[data-acc-del]").forEach((b) => b.addEventListener("click", () => {
    state.accounts = state.accounts.filter((a) => a.id !== Number(b.dataset.accDel));
    document.getElementById("acc-list").innerHTML = renderAccountList();
    bindAccActions(); refreshIcons(); toast("Account removed");
  }));
}

/* ---------- Messenger ---------- */
function renderContacts(filter="") {
  return CONTACTS.filter((c)=>c.name.toLowerCase().includes(filter.toLowerCase())).map((c) => `
    <div class="contact ${c.id===state.activeContact?"active":""}" data-cid="${c.id}">
      <div class="avatar">${c.name.split(" ").map((p)=>p[0]).slice(0,2).join("")}</div>
      <div class="contact-meta">
        <div class="contact-name">${c.name}</div>
        <div class="contact-last">${c.last}</div>
      </div>
      <div style="text-align:right">
        <div class="muted xs">${c.time}</div>
        ${c.unread?`<div class="unread-bubble">${c.unread}</div>`:""}
      </div>
    </div>`).join("");
}
function renderChat() {
  const c = CONTACTS.find((x)=>x.id===state.activeContact);
  if (!c) return `<div style="padding:24px" class="muted">Select a contact</div>`;
  const msgs = state.messages[c.id] || [];
  return `
    <div class="chat-head">
      <div class="avatar">${c.name.split(" ").map((p)=>p[0]).slice(0,2).join("")}</div>
      <div><div class="name">${c.name}</div>
      <div class="status">${c.online?"online":"last seen recently"}</div></div>
    </div>
    <div class="chat-body" id="chat-body">
      ${msgs.map((m) => `
        <div class="msg ${m.from}">
          ${m.file?`<div class="msg-file"><i data-lucide="paperclip"></i><span>${m.file}</span></div>`:""}
          ${m.text||""}
          <span class="msg-time">${m.time}</span>
        </div>
      `).join("")}
    </div>
    <div class="chat-input">
      <button class="icon-btn" id="attach-btn" title="Attach file"><i data-lucide="paperclip"></i></button>
      <input id="msg-input" type="text" placeholder="Write a message..." />
      <button class="btn btn-primary" id="send-btn"><i data-lucide="send"></i></button>
      <input type="file" id="file-input" hidden />
    </div>`;
}
function bindMessenger() {
  document.querySelectorAll("[data-cid]").forEach((el) => el.addEventListener("click", () => {
    state.activeContact = Number(el.dataset.cid);
    const c = CONTACTS.find((x)=>x.id===state.activeContact); if (c) c.unread = 0;
    document.getElementById("contact-list").innerHTML = renderContacts(document.getElementById("contact-search").value);
    document.getElementById("chat-pane").innerHTML = renderChat();
    bindMessenger(); refreshIcons();
    scrollChatBottom();
  }));
  document.getElementById("contact-search")?.addEventListener("input", (e) => {
    document.getElementById("contact-list").innerHTML = renderContacts(e.target.value);
    bindMessenger();
  });
  const send = () => {
    const inp = document.getElementById("msg-input");
    const txt = inp.value.trim(); if (!txt) return;
    state.messages[state.activeContact] = state.messages[state.activeContact] || [];
    state.messages[state.activeContact].push({ from: "out", text: txt, time: nowHHMM() });
    inp.value = "";
    // mock reply
    setTimeout(() => {
      state.messages[state.activeContact].push({ from: "in", text: mockReply(txt), time: nowHHMM() });
      if (state.route.endsWith(".messenger")) {
        document.getElementById("chat-pane").innerHTML = renderChat();
        bindMessenger(); refreshIcons(); scrollChatBottom();
      }
    }, 800);
    document.getElementById("chat-pane").innerHTML = renderChat();
    bindMessenger(); refreshIcons(); scrollChatBottom();
  };
  document.getElementById("send-btn")?.addEventListener("click", send);
  document.getElementById("msg-input")?.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
  document.getElementById("attach-btn")?.addEventListener("click", () => document.getElementById("file-input").click());
  document.getElementById("file-input")?.addEventListener("change", (e) => {
    const f = e.target.files[0]; if (!f) return;
    state.messages[state.activeContact] = state.messages[state.activeContact] || [];
    state.messages[state.activeContact].push({ from: "out", file: `${f.name} (${(f.size/1024).toFixed(1)} KB)`, time: nowHHMM() });
    document.getElementById("chat-pane").innerHTML = renderChat();
    bindMessenger(); refreshIcons(); scrollChatBottom();
  });
  scrollChatBottom();
}
function scrollChatBottom() { const b = document.getElementById("chat-body"); if (b) b.scrollTop = b.scrollHeight; }
function nowHHMM() { const d = new Date(); return d.toTimeString().slice(0,5); }
function mockReply(t) {
  const r = ["Got it 👍","Okay, thanks!","Sure, will do.","Noted.","Sounds good!","Let me check and get back."];
  return r[Math.floor(Math.random()*r.length)];
}

/* ---------- Control ---------- */
function renderRequests() {
  if (!state.requests.length) return `<p class="muted">No requests.</p>`;
  return state.requests.map((r) => `
    <div class="req-card">
      <div class="avatar">${r.from.split(" ").map((p)=>p[0]).slice(0,2).join("")}</div>
      <div class="body">
        <div class="req-q">${r.q}</div>
        <div class="req-meta">From <strong>${r.from}</strong> · ${r.at} · <span class="chip ${
          r.status==="approved"?"success":r.status==="rejected"||r.status==="punished"?"danger":"warning"
        }">${r.status}</span></div>
      </div>
      ${r.status==="pending"?`<div class="req-actions">
        <button class="btn btn-success btn-sm" data-req-act="approve" data-id="${r.id}"><i data-lucide="check"></i> Approve</button>
        <button class="btn btn-sm" data-req-act="reject" data-id="${r.id}"><i data-lucide="x"></i> Reject</button>
        <button class="btn btn-danger btn-sm" data-req-act="punish" data-id="${r.id}"><i data-lucide="gavel"></i> Punish</button>
      </div>`:""}
    </div>`).join("");
}
function bindRequests() {
  document.querySelectorAll("[data-req-act]").forEach((b) => b.addEventListener("click", () => {
    const id = Number(b.dataset.id);
    const act = b.dataset.reqAct;
    if (act === "punish") {
      state.punishTarget = id;
      const r = state.requests.find((x)=>x.id===id);
      document.getElementById("punish-target").textContent = `Request: ${r.q} (from ${r.from})`;
      openModal("punish-modal");
      return;
    }
    state.requests = state.requests.map((r) => r.id===id ? { ...r, status: act==="approve"?"approved":"rejected" } : r);
    document.getElementById("req-list").innerHTML = renderRequests();
    bindRequests(); refreshIcons();
    toast(act==="approve"?"Request approved":"Request rejected");
  }));
}
function confirmPunish() {
  const type = document.getElementById("punish-type").value;
  const deg = document.getElementById("punish-degree").value;
  const amt = document.getElementById("punish-amount").value;
  state.requests = state.requests.map((r) => r.id===state.punishTarget ? { ...r, status: "punished" } : r);
  closeModals();
  if (state.route.endsWith(".control")) {
    document.getElementById("req-list").innerHTML = renderRequests();
    bindRequests(); refreshIcons();
  }
  toast(`Punishment issued: ${type} (degree ${deg}, ETB ${amt})`);
}

/* ---------- Charts (Chart.js) ---------- */
function chartColors() {
  const cs = getComputedStyle(document.documentElement);
  const fg = cs.getPropertyValue("--fg").trim() || "#000";
  const grid = cs.getPropertyValue("--border").trim() || "#eee";
  return {
    fg, grid,
    palette: ["#4f46e5","#16a34a","#d97706","#dc2626","#db2777","#0891b2"],
  };
}
function commonOpts() {
  const { fg, grid } = chartColors();
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: fg, font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: fg }, grid: { color: grid } },
      y: { ticks: { color: fg }, grid: { color: grid } },
    },
  };
}
function barChart(id, labels, datasets) {
  const el = document.getElementById(id); if (!el) return;
  const { palette } = chartColors();
  state.charts[id] = new Chart(el, {
    type: "bar",
    data: { labels, datasets: datasets.map((d, i) => ({ ...d, backgroundColor: palette[i % palette.length], borderRadius: 4 })) },
    options: commonOpts(),
  });
}
function lineChart(id, labels, datasets) {
  const el = document.getElementById(id); if (!el) return;
  const { palette } = chartColors();
  state.charts[id] = new Chart(el, {
    type: "line",
    data: { labels, datasets: datasets.map((d, i) => ({
      ...d, borderColor: palette[i % palette.length],
      backgroundColor: palette[i % palette.length] + "33",
      tension: 0.35, fill: true, pointRadius: 3,
    })) },
    options: commonOpts(),
  });
}
function pieChart(id, labels, data) {
  const el = document.getElementById(id); if (!el) return;
  const { palette, fg } = chartColors();
  state.charts[id] = new Chart(el, {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: palette, borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "right", labels: { color: fg, font: { size: 11 } } } } },
  });
}


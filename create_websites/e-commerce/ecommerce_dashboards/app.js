// ===== ShopHub single-file dashboard =====
const PASSKEY = "shophub2026";
const SESSION_KEY = "shophub-session";
const THEME_KEY = "shophub-theme";

// ---------- Theme ----------
function applyTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem(THEME_KEY, t);
  document.querySelectorAll("#themeBtn i,#loginTheme i").forEach(i=>{
    i.setAttribute("data-lucide", t==="dark"?"sun":"moon");
  });
  if(window.lucide) lucide.createIcons();
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme")||"light";
  applyTheme(cur==="light"?"dark":"light");
}
applyTheme(localStorage.getItem(THEME_KEY)||"light");

// ---------- Role nav definitions ----------
const NAV = {
  manager:[
    ["overview","Overview","layout-dashboard"],
    ["sales","Sales Analytics","trending-up"],
    ["products","Products","package"],
    ["orders","Orders","shopping-cart"],
    ["staff","Team","users"],
    ["reports","Reports","file-bar-chart"],
    ["settings","Settings","settings"]
  ],
  finance:[
    ["overview","Finance Overview","layout-dashboard"],
    ["revenue","Revenue","dollar-sign"],
    ["expenses","Expenses","receipt"],
    ["invoices","Invoices","file-text"],
    ["payroll","Payroll","banknote"],
    ["tax","Tax & Audit","calculator"],
    ["settings","Settings","settings"]
  ],
  store:[
    ["overview","Store Overview","layout-dashboard"],
    ["inventory","Inventory","boxes"],
    ["products","Catalog","package"],
    ["suppliers","Suppliers","truck"],
    ["restock","Restock Alerts","alert-triangle"],
    ["warehouse","Warehouse","warehouse"],
    ["settings","Settings","settings"]
  ],
  hr:[
    ["overview","HR Overview","layout-dashboard"],
    ["employees","Employees","users"],
    ["recruit","Recruitment","user-plus"],
    ["attendance","Attendance","calendar-check"],
    ["leaves","Leave Requests","calendar-x"],
    ["payroll","Payroll","banknote"],
    ["settings","Settings","settings"]
  ],
  delivery:[
    ["overview","Delivery Overview","layout-dashboard"],
    ["shipments","Shipments","truck"],
    ["routes","Routes","map"],
    ["drivers","Drivers","user-check"],
    ["tracking","Live Tracking","map-pin"],
    ["returns","Returns","rotate-ccw"],
    ["settings","Settings","settings"]
  ]
};

// ---------- Helpers ----------
const kpi = (label,val,delta,icon,up=true)=>`
  <div class="kpi">
    <div class="kpi-icon"><i data-lucide="${icon}"></i></div>
    <div class="label">${label}</div>
    <div class="val">${val}</div>
    <div class="delta ${up?'up':'down'}"><i data-lucide="${up?'arrow-up-right':'arrow-down-right'}"></i>${delta}</div>
  </div>`;

const bars = (data)=>`<div class="bars">${data.map(([l,h])=>`<div class="bar" style="height:${h}%"><span>${l}</span></div>`).join("")}</div>`;

const table = (cols,rows)=>`<table><thead><tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

const head = (t,d,btn)=>`<div class="page-head"><div><h2>${t}</h2><p>${d}</p></div>${btn?`<button class="btn primary"><i data-lucide="plus"></i>${btn}</button>`:""}</div>`;

// ---------- Pages per role ----------
const PAGES = {
  manager:{
    overview:()=>head("Manager Overview","Bird's-eye view of business performance")+
      `<div class="kpi-grid">
        ${kpi("Revenue","$248,910","+12.4%","dollar-sign")}
        ${kpi("Orders","3,420","+8.1%","shopping-cart")}
        ${kpi("Customers","12,840","+5.6%","users")}
        ${kpi("Conversion","4.8%","-0.3%","percent",false)}
      </div>
      <div class="grid-2">
        <div class="card"><h3>Sales Trend <span class="pill">Last 7 days</span></h3>${bars([["Mon",55],["Tue",70],["Wed",45],["Thu",80],["Fri",95],["Sat",65],["Sun",78]])}</div>
        <div class="card"><h3>Top Categories</h3><div class="bar-row">
          ${[["Electronics",84],["Fashion",72],["Home",58],["Beauty",46],["Sports",33]].map(([n,p])=>`<div class="br"><div class="top"><span>${n}</span><span>${p}%</span></div><div class="progress"><div style="width:${p}%"></div></div></div>`).join("")}
        </div></div>
      </div>
      <div class="card"><h3>Recent Orders</h3>${table(["Order","Customer","Amount","Status","Date"],[
        ["#10921","Aisha Khan","$214","<span class='badge success'>Delivered</span>","May 9"],
        ["#10920","Ravi Patel","$87","<span class='badge warning'>Pending</span>","May 9"],
        ["#10919","Sara Johnson","$320","<span class='badge info'>Shipped</span>","May 8"],
        ["#10918","Marc Lee","$56","<span class='badge danger'>Cancelled</span>","May 8"],
        ["#10917","Lina Park","$179","<span class='badge success'>Delivered</span>","May 7"]
      ])}</div>`,
    sales:()=>head("Sales Analytics","Channel performance & growth")+
      `<div class="kpi-grid">${kpi("Online","$182k","+14%","globe")}${kpi("Retail","$48k","+6%","store")}${kpi("Wholesale","$18k","-2%","building",false)}</div>
       <div class="card"><h3>Monthly Revenue</h3>${bars([["Jan",40],["Feb",55],["Mar",62],["Apr",70],["May",88],["Jun",75],["Jul",92]])}</div>`,
    products:()=>head("Products","Manage catalog & pricing","Add Product")+
      `<div class="card">${table(["SKU","Name","Stock","Price","Status"],[
        ["P-001","Wireless Headphones","124","$89","<span class='badge success'>Active</span>"],
        ["P-002","Smart Watch X3","42","$199","<span class='badge success'>Active</span>"],
        ["P-003","Bluetooth Speaker","8","$49","<span class='badge warning'>Low</span>"],
        ["P-004","Laptop Stand","0","$29","<span class='badge danger'>Out</span>"]
      ])}</div>`,
    orders:()=>head("Orders","All customer orders")+
      `<div class="card">${table(["#","Customer","Items","Total","Status"],[
        ["10921","Aisha Khan","3","$214","<span class='badge success'>Delivered</span>"],
        ["10920","Ravi Patel","1","$87","<span class='badge warning'>Pending</span>"],
        ["10919","Sara Johnson","4","$320","<span class='badge info'>Shipped</span>"]
      ])}</div>`,
    staff:()=>head("Team","Department leads")+
      `<div class="card">${table(["Name","Role","Dept","Status"],[
        ["Daniel Cruz","Finance Lead","Finance","<span class='badge success'>Online</span>"],
        ["Maya Singh","HR Manager","HR","<span class='badge success'>Online</span>"],
        ["Tom Reed","Store Head","Store","<span class='badge warning'>Away</span>"],
        ["Linda Wu","Logistics","Delivery","<span class='badge success'>Online</span>"]
      ])}</div>`,
    reports:()=>head("Reports","Download business reports")+
      `<div class="list">${["Q1 Sales Report","Inventory Audit","Customer Retention","Marketing ROI"].map(r=>`<div class="list-item"><div class="ico"><i data-lucide="file-text"></i></div><div class="meta"><strong>${r}</strong><small>PDF • Updated today</small></div><button class="btn"><i data-lucide="download"></i>Download</button></div>`).join("")}</div>`,
    settings:()=>settingsPage("Manager")
  },
  finance:{
    overview:()=>head("Finance Overview","Cash flow & profitability")+
      `<div class="kpi-grid">${kpi("Revenue","$248,910","+12%","trending-up")}${kpi("Expenses","$162,400","+4%","trending-down",false)}${kpi("Profit","$86,510","+22%","dollar-sign")}${kpi("Pending","$14,220","","clock")}</div>
       <div class="grid-2"><div class="card"><h3>Cash Flow</h3>${bars([["Jan",60],["Feb",70],["Mar",55],["Apr",80],["May",92]])}</div>
       <div class="card"><h3>Expense Split</h3><div class="bar-row">${[["Salaries",55],["Inventory",70],["Marketing",30],["Logistics",40],["Misc",18]].map(([n,p])=>`<div class="br"><div class="top"><span>${n}</span><span>$${p}k</span></div><div class="progress"><div style="width:${p}%"></div></div></div>`).join("")}</div></div></div>`,
    revenue:()=>head("Revenue","Income streams")+`<div class="card"><h3>Revenue by Channel</h3>${bars([["Web",90],["App",65],["Retail",48],["B2B",30]])}</div>`,
    expenses:()=>head("Expenses","Recent expense entries","Add Entry")+
      `<div class="card">${table(["Date","Category","Vendor","Amount","Status"],[
        ["May 9","Logistics","FastShip","$1,240","<span class='badge success'>Paid</span>"],
        ["May 8","Marketing","Meta Ads","$3,500","<span class='badge success'>Paid</span>"],
        ["May 7","Inventory","SupplyCo","$8,900","<span class='badge warning'>Pending</span>"]
      ])}</div>`,
    invoices:()=>head("Invoices","Customer & vendor invoices")+
      `<div class="card">${table(["Inv #","Client","Amount","Due","Status"],[
        ["INV-2401","BlueMart","$4,200","May 14","<span class='badge warning'>Pending</span>"],
        ["INV-2400","RetailX","$1,800","May 12","<span class='badge success'>Paid</span>"]
      ])}</div>`,
    payroll:()=>head("Payroll","Monthly salary distribution")+
      `<div class="kpi-grid">${kpi("Total Payroll","$48,200","","banknote")}${kpi("Employees","124","","users")}${kpi("Next Run","May 30","","calendar")}</div>`,
    tax:()=>head("Tax & Audit","Quarterly tax overview")+
      `<div class="card">${table(["Period","Type","Amount","Status"],[
        ["Q1 2026","VAT","$12,400","<span class='badge success'>Filed</span>"],
        ["Q1 2026","Income","$22,800","<span class='badge warning'>Due</span>"]
      ])}</div>`,
    settings:()=>settingsPage("Finance")
  },
  store:{
    overview:()=>head("Store Overview","Inventory & stock health")+
      `<div class="kpi-grid">${kpi("Total SKUs","1,284","+22","package")}${kpi("In Stock","1,102","","check-circle")}${kpi("Low Stock","48","","alert-triangle",false)}${kpi("Out of Stock","12","","x-circle",false)}</div>
       <div class="card"><h3>Stock by Category</h3>${bars([["Elec",80],["Fashion",65],["Home",58],["Beauty",42],["Sports",30],["Toys",55]])}</div>`,
    inventory:()=>head("Inventory","Live stock levels","Add Item")+
      `<div class="card">${table(["SKU","Item","Warehouse","Qty","Status"],[
        ["P-001","Headphones","WH-1","124","<span class='badge success'>OK</span>"],
        ["P-003","Speaker","WH-2","8","<span class='badge warning'>Low</span>"],
        ["P-004","Laptop Stand","WH-1","0","<span class='badge danger'>Out</span>"]
      ])}</div>`,
    products:()=>head("Catalog","All products in store")+
      `<div class="card">${table(["SKU","Name","Category","Price"],[["P-001","Headphones","Electronics","$89"],["P-002","Smart Watch","Electronics","$199"],["P-005","Yoga Mat","Sports","$25"]])}</div>`,
    suppliers:()=>head("Suppliers","Vendor partners")+
      `<div class="card">${table(["Code","Supplier","Items","Lead Time","Status"],[
        ["S-01","SupplyCo","220","5d","<span class='badge success'>Active</span>"],
        ["S-02","GlobalGoods","140","12d","<span class='badge warning'>Delayed</span>"]
      ])}</div>`,
    restock:()=>head("Restock Alerts","Items needing reorder")+
      `<div class="list">${[["Bluetooth Speaker","8 left"],["Laptop Stand","0 left"],["USB-C Cable","12 left"]].map(([n,q])=>`<div class="list-item"><div class="ico"><i data-lucide="alert-triangle"></i></div><div class="meta"><strong>${n}</strong><small>${q}</small></div><button class="btn primary"><i data-lucide="refresh-cw"></i>Reorder</button></div>`).join("")}</div>`,
    warehouse:()=>head("Warehouses","Distribution centres")+
      `<div class="kpi-grid">${kpi("WH-1 (NYC)","82% full","","warehouse")}${kpi("WH-2 (LA)","64% full","","warehouse")}${kpi("WH-3 (CHI)","45% full","","warehouse")}</div>`,
    settings:()=>settingsPage("Store")
  },
  hr:{
    overview:()=>head("HR Overview","People & culture")+
      `<div class="kpi-grid">${kpi("Employees","124","+4","users")}${kpi("Open Roles","8","","briefcase")}${kpi("On Leave","6","","calendar-x")}${kpi("Attendance","94%","+1.2%","calendar-check")}</div>
       <div class="grid-2"><div class="card"><h3>Headcount by Dept</h3>${bars([["Tech",85],["Ops",55],["Sales",70],["HR",30],["Finance",40]])}</div>
       <div class="card"><h3>Recent Joiners</h3><div class="list">${[["Anya Roy","Designer"],["Ben Iyer","Engineer"],["Cara Patel","Analyst"]].map(([n,r])=>`<div class="list-item"><div class="ico"><i data-lucide="user"></i></div><div class="meta"><strong>${n}</strong><small>${r}</small></div></div>`).join("")}</div></div></div>`,
    employees:()=>head("Employees","Workforce directory","Add Employee")+
      `<div class="card">${table(["ID","Name","Role","Dept","Status"],[
        ["E-101","Aisha Khan","Designer","Product","<span class='badge success'>Active</span>"],
        ["E-102","Ravi Patel","Developer","Tech","<span class='badge success'>Active</span>"],
        ["E-103","Sara Johnson","Manager","Sales","<span class='badge warning'>Leave</span>"]
      ])}</div>`,
    recruit:()=>head("Recruitment","Open positions")+
      `<div class="card">${table(["Role","Dept","Applicants","Stage"],[["Senior Dev","Tech","42","<span class='badge info'>Interview</span>"],["UX Lead","Product","18","<span class='badge warning'>Screening</span>"]])}</div>`,
    attendance:()=>head("Attendance","Today's check-ins")+
      `<div class="kpi-grid">${kpi("Present","112","","check")}${kpi("Absent","6","","x",false)}${kpi("Remote","18","","home")}</div>`,
    leaves:()=>head("Leave Requests","Pending approvals")+
      `<div class="card">${table(["Employee","Type","From","To","Status"],[
        ["Sara Johnson","Annual","May 12","May 18","<span class='badge warning'>Pending</span>"],
        ["Marc Lee","Sick","May 10","May 11","<span class='badge success'>Approved</span>"]
      ])}</div>`,
    payroll:()=>head("Payroll","Salary processing")+`<div class="kpi-grid">${kpi("Next Cycle","May 30","","calendar")}${kpi("Total","$48,200","","banknote")}</div>`,
    settings:()=>settingsPage("HR")
  },
  delivery:{
    overview:()=>head("Delivery Overview","Logistics & dispatch")+
      `<div class="kpi-grid">${kpi("Active Shipments","248","+18","truck")}${kpi("Delivered Today","94","","check-circle")}${kpi("In Transit","132","","map-pin")}${kpi("Failed","6","","x-circle",false)}</div>
       <div class="grid-2"><div class="card"><h3>Daily Deliveries</h3>${bars([["Mon",60],["Tue",75],["Wed",55],["Thu",82],["Fri",94],["Sat",70],["Sun",48]])}</div>
       <div class="card"><h3>Top Routes</h3><div class="bar-row">${[["NYC → BOS",78],["LA → SFO",65],["CHI → DET",52],["MIA → ATL",40]].map(([n,p])=>`<div class="br"><div class="top"><span>${n}</span><span>${p}%</span></div><div class="progress"><div style="width:${p}%"></div></div></div>`).join("")}</div></div></div>`,
    shipments:()=>head("Shipments","All active orders","New Shipment")+
      `<div class="card">${table(["Tracking","Customer","Destination","Status","ETA"],[
        ["TRK-9821","Aisha K","Boston, MA","<span class='badge info'>In Transit</span>","May 11"],
        ["TRK-9820","Ravi P","Newark, NJ","<span class='badge success'>Delivered</span>","Done"],
        ["TRK-9819","Sara J","Albany, NY","<span class='badge warning'>Pending</span>","May 12"]
      ])}</div>`,
    routes:()=>head("Routes","Optimised delivery routes")+
      `<div class="list">${[["Route A","12 stops • 4h"],["Route B","8 stops • 3h"],["Route C","18 stops • 6h"]].map(([n,d])=>`<div class="list-item"><div class="ico"><i data-lucide="map"></i></div><div class="meta"><strong>${n}</strong><small>${d}</small></div><button class="btn"><i data-lucide="navigation"></i>View</button></div>`).join("")}</div>`,
    drivers:()=>head("Drivers","Active fleet")+
      `<div class="card">${table(["ID","Driver","Vehicle","Route","Status"],[
        ["D-12","Tom Reed","Van-04","Route A","<span class='badge success'>On Duty</span>"],
        ["D-13","Linda Wu","Van-07","Route B","<span class='badge success'>On Duty</span>"],
        ["D-14","Mike Cole","Truck-02","—","<span class='badge warning'>Off</span>"]
      ])}</div>`,
    tracking:()=>head("Live Tracking","Real-time fleet positions")+
      `<div class="card" style="height:340px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.08));"><div style="text-align:center"><i data-lucide="map" style="width:48px;height:48px;color:var(--primary)"></i><p style="margin-top:12px;color:var(--muted)">Live map • 24 vehicles tracked</p></div></div>`,
    returns:()=>head("Returns","Reverse logistics")+
      `<div class="card">${table(["RMA","Customer","Item","Reason","Status"],[
        ["RMA-220","Marc Lee","Headphones","Defective","<span class='badge warning'>Processing</span>"],
        ["RMA-219","Lina Park","Speaker","Wrong item","<span class='badge success'>Refunded</span>"]
      ])}</div>`,
    settings:()=>settingsPage("Delivery")
  }
};

function settingsPage(role){
  return head("Settings",`Preferences for ${role} workspace`)+
  `<div class="card"><h3>Profile</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px">
      <div><label style="font-size:12px;color:var(--muted)">Name</label><input class="login-form" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--surface-2);margin-top:4px" value="${role} User"/></div>
      <div><label style="font-size:12px;color:var(--muted)">Email</label><input style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--surface-2);margin-top:4px" value="user@shophub.com"/></div>
    </div>
    <button class="btn primary" style="margin-top:14px"><i data-lucide="save"></i>Save Changes</button>
  </div>
  <div class="card" style="margin-top:14px"><h3>Appearance</h3>
    <button class="btn" onclick="toggleTheme()"><i data-lucide="moon"></i>Toggle Theme</button>
  </div>`;
}

// ---------- App rendering ----------
let currentRole = null;
let currentPage = "overview";

function renderSidebar(role){
  const nav = document.getElementById("sideNav");
  nav.innerHTML = NAV[role].map(([id,label,icon])=>
    `<button class="nav-item ${id===currentPage?'active':''}" data-page="${id}"><i data-lucide="${icon}"></i><span>${label}</span></button>`
  ).join("");
  nav.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>{
    currentPage = b.dataset.page;
    renderSidebar(role);
    renderPage();
    if(window.innerWidth<=900) document.querySelector(".app").classList.remove("mobile-open");
  });
  lucide.createIcons();
}

function renderPage(){
  const fn = PAGES[currentRole]?.[currentPage] || PAGES[currentRole]?.overview;
  document.getElementById("content").innerHTML = fn ? fn() : "<p>Page not found</p>";
  lucide.createIcons();
}

function showApp(session){
  currentRole = session.role;
  currentPage = "overview";
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("appView").classList.remove("hidden");
  document.getElementById("userEmail").textContent = session.email;
  document.getElementById("userRole").textContent = session.role;
  document.getElementById("userAvatar").textContent = (session.email[0]||"U").toUpperCase();
  renderSidebar(currentRole);
  renderPage();
}

// ---------- Login ----------
document.getElementById("loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("passkey").value;
  const role = document.querySelector("input[name=role]:checked")?.value;
  const err = document.getElementById("loginError");
  if(!role){err.textContent="Select a role";return;}
  if(pass!==PASSKEY){err.textContent="Invalid passkey";return;}
  err.textContent="";
  const session = {email,role};
  localStorage.setItem(SESSION_KEY,JSON.stringify(session));
  showApp(session);
});

document.getElementById("logoutBtn").addEventListener("click",()=>{
  localStorage.removeItem(SESSION_KEY);
  location.reload();
});

document.getElementById("themeBtn").addEventListener("click",toggleTheme);
document.getElementById("loginTheme").addEventListener("click",toggleTheme);

document.getElementById("collapseBtn").addEventListener("click",()=>{
  document.querySelector(".app").classList.toggle("collapsed");
});
document.getElementById("mobileMenu").addEventListener("click",()=>{
  document.querySelector(".app").classList.toggle("mobile-open");
});

// Auto-login if session exists
const saved = localStorage.getItem(SESSION_KEY);
if(saved){ try{ showApp(JSON.parse(saved)); }catch(e){} }

// init icons
window.addEventListener("DOMContentLoaded",()=>lucide.createIcons());
lucide.createIcons();

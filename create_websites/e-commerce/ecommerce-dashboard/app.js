/* ===== ShopHub multi-role dashboard ===== */
const PASSKEY    = "shophub2026";
const SESSION_KEY = "shophub-session";
const THEME_KEY  = "shophub-theme";

const ROLES = {
  manager:  { title:"Manager",  panel:"Manager Panel",  icon:"briefcase",
    nav:[["overview","Overview","layout-dashboard"],["sales","Sales Analytics","trending-up"],["products","Products","package"],["orders","Orders","shopping-cart"],["staff","Team","users"],["reports","Reports","file-bar-chart"],["settings","Settings","settings"]] },
  finance:  { title:"Finance",  panel:"Finance Panel",  icon:"wallet",
    nav:[["overview","Overview","layout-dashboard"],["revenue","Revenue","dollar-sign"],["expenses","Expenses","receipt"],["invoices","Invoices","file-text"],["payroll","Payroll","banknote"],["tax","Tax & Audit","calculator"],["settings","Settings","settings"]] },
  store:    { title:"Store",    panel:"Store Panel",    icon:"store",
    nav:[["overview","Overview","layout-dashboard"],["inventory","Inventory","boxes"],["products","Catalog","package"],["suppliers","Suppliers","truck"],["restock","Restock Alerts","alert-triangle"],["warehouse","Warehouse","warehouse"],["settings","Settings","settings"]] },
  hr:       { title:"HR",       panel:"HR Panel",       icon:"users",
    nav:[["overview","Overview","layout-dashboard"],["employees","Employees","users"],["recruit","Recruitment","user-plus"],["attendance","Attendance","calendar-check"],["leaves","Leave Requests","calendar-x"],["payroll","Payroll","banknote"],["settings","Settings","settings"]] },
  delivery: { title:"Delivery", panel:"Delivery Panel", icon:"truck",
    nav:[["overview","Overview","layout-dashboard"],["shipments","Shipments","truck"],["routes","Routes","map"],["drivers","Drivers","user-check"],["tracking","Live Tracking","map-pin"],["returns","Returns","rotate-ccw"],["settings","Settings","settings"]] },
};

const $ = (s)=>document.querySelector(s);
function icons(){ if(window.lucide) window.lucide.createIcons(); }

/* ---------- Theme ---------- */
function getTheme(){ try{return localStorage.getItem(THEME_KEY);}catch(e){return null;} }
function applyTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
  document.querySelectorAll("#themeBtn i,#loginTheme i").forEach(i=>i.setAttribute("data-lucide", t==="dark"?"sun":"moon"));
  icons();
  const frame = $("#contentFrame");
  if(frame && frame.contentWindow){ frame.contentWindow.postMessage({type:"theme", theme:t}, "*"); }
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme")||"light";
  applyTheme(cur==="light"?"dark":"light");
}
applyTheme(getTheme()||"light");

/* keep iframe in sync once it (re)loads, and handle requests from modules */
window.addEventListener("message",(e)=>{
  if(!e.data) return;
  if(e.data.type==="frameReady") applyTheme(document.documentElement.getAttribute("data-theme")||"light");
  if(e.data.type==="toggleTheme") toggleTheme();
});

/* ---------- Custom role dropdown ---------- */
const roleTrigger = $("#roleTrigger"), roleMenu = $("#roleMenu"), roleInput = $("#roleInput");
roleTrigger.addEventListener("click",(e)=>{ e.stopPropagation(); roleMenu.classList.toggle("show"); roleTrigger.classList.toggle("active"); });
document.addEventListener("click",()=>{ roleMenu.classList.remove("show"); roleTrigger.classList.remove("active"); });
roleMenu.querySelectorAll(".option-item").forEach(opt=>{
  opt.addEventListener("click",()=>{
    const val = opt.dataset.value, icon = opt.dataset.icon, label = opt.textContent.trim();
    roleInput.value = val;
    roleTrigger.querySelector(".selected-label").textContent = label;
    roleTrigger.querySelector(".trigger-content i").setAttribute("data-lucide", icon);
    roleMenu.classList.remove("show"); roleTrigger.classList.remove("active");
    icons();
  });
});

/* ---------- Passkey eye toggle ---------- */
$("#eyeBtn").addEventListener("click",()=>{
  const inp = $("#passkey"), ic = $("#eyeBtn i");
  const show = inp.type === "password";
  inp.type = show ? "text" : "password";
  ic.setAttribute("data-lucide", show ? "eye-off" : "eye");
  icons();
});

/* ---------- App rendering ---------- */
let currentRole = "manager";
let currentPage = "overview";

function loadModule(){
  $("#contentFrame").src = `pages/modules/${currentRole}/${currentPage}.html`;
}

function renderSidebar(){
  const nav = $("#sideNav");
  nav.innerHTML = ROLES[currentRole].nav.map(([id,label,icon])=>
    `<button class="nav-item ${id===currentPage?"active":""}" data-page="${id}"><i data-lucide="${icon}"></i><span>${label}</span></button>`).join("");
  nav.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>{
    currentPage = b.dataset.page;
    renderSidebar();
    loadModule();
    closeMobileNav();
  }));
  icons();
}

function showApp(session){
  currentRole = session.role;
  currentPage = "overview";
  $("#loginView").classList.add("hidden");
  $("#appView").classList.remove("hidden");
  const r = ROLES[currentRole];
  $("#sideRole").textContent = r.panel;
  $("#userNameLabel").textContent = session.name;
  $("#userRoleLabel").textContent = r.title;
  $("#userAvatar").textContent = (session.name.trim()[0]||"U").toUpperCase();
  renderSidebar();
  loadModule();
}

/* ---------- Login ---------- */
$("#loginForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const name = $("#userName").value.trim();
  const pass = $("#passkey").value;
  const role = roleInput.value;
  const err  = $("#loginError");
  if(!name){ err.textContent="Please enter your username."; return; }
  if(pass !== PASSKEY){ err.textContent="Incorrect passkey. Try shophub2026"; return; }
  err.textContent="";
  const session = { name, role };
  try{ sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); }catch(e){}
  showApp(session);
});

/* ---------- Logout ---------- */
$("#logoutBtn").addEventListener("click",()=>{
  try{ sessionStorage.removeItem(SESSION_KEY); }catch(e){}
  $("#appView").classList.add("hidden");
  $("#loginView").classList.remove("hidden");
  $("#passkey").value=""; $("#userName").value="";
});

/* ---------- Theme buttons ---------- */
$("#themeBtn").addEventListener("click", toggleTheme);
$("#loginTheme").addEventListener("click", toggleTheme);

/* ---------- Sidebar collapse + mobile ---------- */
$("#collapseBtn").addEventListener("click",()=>$("#appView").classList.toggle("collapsed"));
function openMobileNav(){ $("#appView").classList.add("mobile-open"); }
function closeMobileNav(){ if(window.innerWidth<=900) $("#appView").classList.remove("mobile-open"); }
$("#mobileMenu").addEventListener("click", openMobileNav);
$("#backdrop").addEventListener("click", closeMobileNav);

/* ---------- Restore session ---------- */
(function(){
  let s=null; try{ s=JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null"); }catch(e){}
  if(s && s.role && ROLES[s.role]) showApp(s);
  icons();
})();

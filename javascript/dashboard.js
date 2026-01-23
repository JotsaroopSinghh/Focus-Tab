(function(){
  const grid = document.getElementById("widgetGrid");
  const tplWrap = document.getElementById("widgetTemplates");
  const emptyState = document.getElementById("emptyState");
  const emptyAddBtn = document.getElementById("emptyAddBtn");

  const openSettingsBtn = document.getElementById("openSettings");
  const settingsBackdrop = document.getElementById("settingsBackdrop");
  const closeSettingsBtn = document.getElementById("closeSettings");
  const doneBtn = document.getElementById("doneBtn");
  const resetLayoutBtn = document.getElementById("resetLayoutBtn");
  const picker = document.getElementById("widgetPicker");

  const linksBar = document.getElementById("quickLinks");
  const linksEditor = document.getElementById("linksEditor");
  const focusInput = document.getElementById("focusInput");
  const focusClear = document.getElementById("focusClear");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  const STORAGE_VIS = "ft_widgets_vis_v3";
  const STORAGE_ORDER = "ft_widgets_order_v3";
  const STORAGE_LINKS = "ft_quick_links_v2";
  const STORAGE_FOCUS = "ft_daily_focus_v2";
  const STORAGE_THEME = "ft_theme_v1";

  const ALL = [
    { id:"clock", title:"Time & Date", desc:"Clock + date." },
    { id:"todo", title:"To‑Do", desc:"Simple tasks with persistence." },
    { id:"weather", title:"Weather", desc:"City search or auto-detect." },
    { id:"music", title:"Focus Sounds", desc:"Built-in noise player." },
    { id:"pomodoro", title:"Pomodoro", desc:"Work/break timer." },
    { id:"quote", title:"Daily Quote", desc:"Fresh quote + author." },
  ];

  function safeParse(raw, fallback){
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function loadVis(){
    const v = safeParse(localStorage.getItem(STORAGE_VIS), null);
    if (v && typeof v === "object") return v;
    // default: show clock + todo + weather
    return { clock:true, todo:true, weather:true, music:false, pomodoro:true, quote:true };
  }
  function saveVis(v){ localStorage.setItem(STORAGE_VIS, JSON.stringify(v)); }

  function loadOrder(){
    const o = safeParse(localStorage.getItem(STORAGE_ORDER), null);
    if (Array.isArray(o) && o.length) return o.filter(id => ALL.some(w=>w.id===id));
    return ALL.map(w=>w.id);
  }
  function saveOrder(o){ localStorage.setItem(STORAGE_ORDER, JSON.stringify(o)); }

  function defaultLinks(){
    return [
      { name:"Google", url:"https://www.google.com/" },
      { name:"Gmail", url:"https://mail.google.com/" },
      { name:"GitHub", url:"https://github.com/" },
      { name:"YouTube", url:"https://www.youtube.com/" },
      { name:"eClass", url:"https://eclass.srv.ualberta.ca/" },
      { name:"BearTracks", url:"https://www.beartracks.ualberta.ca/" }
    ];
  }
  function loadLinks(){
    const l = safeParse(localStorage.getItem(STORAGE_LINKS), null);
    if (Array.isArray(l) && l.length) return l.slice(0,10);
    return defaultLinks();
  }
  function saveLinks(l){ localStorage.setItem(STORAGE_LINKS, JSON.stringify(l)); }

  function loadFocus(){ return (localStorage.getItem(STORAGE_FOCUS) || ""); }
  function saveFocus(v){ localStorage.setItem(STORAGE_FOCUS, v || ""); }

  function applyTheme(theme){
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(STORAGE_THEME, t);
    // update buttons state if present
    const bLight = document.querySelector('[data-role="themeLight"]');
    const bDark = document.querySelector('[data-role="themeDark"]');
    if (bLight) bLight.classList.toggle("is-active", t === "light");
    if (bDark) bDark.classList.toggle("is-active", t === "dark");
  }

  function initTheme(){
    const stored = localStorage.getItem(STORAGE_THEME);
    const initial = stored || "light";
    applyTheme(initial);
    const bLight = document.querySelector('[data-role="themeLight"]');
    const bDark = document.querySelector('[data-role="themeDark"]');
    if (bLight) bLight.addEventListener("click", ()=> applyTheme("light"));
    if (bDark) bDark.addEventListener("click", ()=> applyTheme("dark"));
  }

  function initials(name){
    const t = (name||"").trim();
    if (!t) return "•";
    const parts = t.split(/\s+/).slice(0,2);
    return parts.map(p => p[0]?.toUpperCase() || "").join("");
  }

  function renderLinks(){
    const links = loadLinks();
    linksBar.innerHTML = "";
    links.forEach(l=>{
      if (!l?.url) return;
      const a = document.createElement("a");
      a.className = "quick-link";
      a.href = l.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      const ico = document.createElement("div");
      ico.className = "quick-ico";
      ico.textContent = initials(l.name);

      const txt = document.createElement("div");
      txt.className = "quick-text";
      txt.textContent = l.name || l.url;

      a.appendChild(ico);
      a.appendChild(txt);
      linksBar.appendChild(a);
    });
  }

  function buildLinksEditor(){
    const links = loadLinks();
    linksEditor.innerHTML = "";
    const max = 8;

    for (let i=0;i<max;i++){
      const row = document.createElement("div");
      row.className = "link-row";

      const name = document.createElement("input");
      name.type="text"; name.placeholder="Name";
      name.value = links[i]?.name || "";

      const url = document.createElement("input");
      url.type="text"; url.placeholder="https://…";
      url.value = links[i]?.url || "";

      const saveNow = () => {
        const updated = [];
        for (let j=0;j<max;j++){
          const r = linksEditor.children[j];
          const n = r.children[0].value.trim();
          const u = r.children[1].value.trim();
          if (n || u) updated.push({ name: n || u, url: u || "" });
        }
        saveLinks(updated);
        renderLinks();
      };

      name.addEventListener("change", saveNow);
      url.addEventListener("change", saveNow);
      row.appendChild(name);
      row.appendChild(url);
      linksEditor.appendChild(row);
    }
  }

  function bindFocus(){
    focusInput.value = loadFocus();
    focusInput.addEventListener("input", () => saveFocus(focusInput.value));
    focusClear.addEventListener("click", () => {
      focusInput.value = "";
      saveFocus("");
      focusInput.focus();
    });
  }

  function openModal(){
    settingsBackdrop.style.display="flex";
    settingsBackdrop.classList.add("show");
    buildLinksEditor();
  }
  function closeModal(){
    settingsBackdrop.classList.remove("show");
    settingsBackdrop.style.display="none";
  }

  function buildPicker(vis){
    picker.innerHTML = "";
    ALL.forEach(w=>{
      const row = document.createElement("div");
      row.className = "picker-row";

      const left = document.createElement("div");
      left.className = "picker-left";
      const t = document.createElement("div");
      t.className="picker-title"; t.textContent=w.title;
      const d = document.createElement("div");
      d.className="picker-desc"; d.textContent=w.desc;
      left.appendChild(t); left.appendChild(d);

      const btn = document.createElement("button");
      btn.className="toggle-btn";
      btn.type="button";
      btn.setAttribute("aria-pressed", String(!!vis[w.id]));
      btn.textContent = vis[w.id] ? "Added" : "Add";
      btn.addEventListener("click", ()=>{
        vis[w.id] = !vis[w.id];
        saveVis(vis);
        render();
        buildPicker(vis);
      });

      row.appendChild(left);
      row.appendChild(btn);
      picker.appendChild(row);
    });
  }

  function cloneWidget(id){
    const template = tplWrap.content.querySelector(`[data-widget="${id}"]`);
    const node = template.cloneNode(true);
    // add remove button
    const headerActions = node.querySelector(".header-actions");
    const rm = document.createElement("button");
    rm.className = "w-icon";
    rm.type = "button";
    rm.title = "Remove";
    rm.textContent = "✕";
    rm.addEventListener("click", ()=>{
      const vis = loadVis();
      vis[id] = false;
      saveVis(vis);
      render();
      buildPicker(vis);
    });
    headerActions.appendChild(rm);

    // DnD
    const handle = node.querySelector(".drag-handle");
    node.draggable = true;
    node.dataset.widgetId = id;
    handle.addEventListener("mousedown", ()=>{ node.classList.add("drag-ready"); });
    handle.addEventListener("mouseup", ()=>{ node.classList.remove("drag-ready"); });
    node.addEventListener("dragstart", (e)=>{
      e.dataTransfer.setData("text/plain", id);
      node.classList.add("dragging");
    });
    node.addEventListener("dragend", ()=>{
      node.classList.remove("dragging");
      [...grid.children].forEach(c=>c.classList.remove("drop-target"));
    });
    node.addEventListener("dragover", (e)=>{
      e.preventDefault();
      node.classList.add("drop-target");
    });
    node.addEventListener("dragleave", ()=> node.classList.remove("drop-target"));
    node.addEventListener("drop", (e)=>{
      e.preventDefault();
      const from = e.dataTransfer.getData("text/plain");
      const to = id;
      if (!from || from === to) return;
      const order = loadOrder();
      const a = order.indexOf(from);
      const b = order.indexOf(to);
      if (a === -1 || b === -1) return;
      order.splice(a,1);
      order.splice(b,0,from);
      saveOrder(order);
      render();
    });

    return node;
  }

  function render(){
    const vis = loadVis();
    const order = loadOrder();

    grid.innerHTML = "";
    const active = order.filter(id => vis[id]);
    if (!active.length){
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      active.forEach(id => grid.appendChild(cloneWidget(id)));
    }

    // After DOM is ready, init widget logic
    window.dispatchEvent(new CustomEvent("ft:widgets-rendered"));
  }

  // Search
  searchForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const q = (searchInput.value || "").trim();
    if (!q) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  });

  // Modal wiring
  openSettingsBtn.addEventListener("click", openModal);
  emptyAddBtn.addEventListener("click", openModal);
  closeSettingsBtn.addEventListener("click", closeModal);
  doneBtn.addEventListener("click", closeModal);
  settingsBackdrop.addEventListener("click", (e)=>{ if (e.target === settingsBackdrop) closeModal(); });
  document.addEventListener("keydown", (e)=>{ if (e.key === "Escape") closeModal(); });

  resetLayoutBtn.addEventListener("click", ()=>{
    localStorage.removeItem(STORAGE_VIS);
    localStorage.removeItem(STORAGE_ORDER);
    localStorage.removeItem(STORAGE_LINKS);
    // keep theme preference (intentional)
    renderLinks();
    render();
    buildPicker(loadVis());
  });

  

  // Streak chip (pomodoro work sessions)
  function loadStreak(){
    const KEY = "ft_streak_v1";
    try{ return JSON.parse(localStorage.getItem(KEY) || "null"); }catch{ return null; }
  }
  function renderStreak(){
    const chip = document.getElementById("streakChip");
    if (!chip) return;

    const s = loadStreak();
    if (!s){
      chip.innerHTML = `<span>🔥 <span class="muted">Streak</span> 0</span><span class="muted">•</span><span>0 today</span>`;
      return;
    }
    chip.innerHTML = `<span>🔥 <span class="muted">Streak</span> ${s.streak || 0}</span><span class="muted">•</span><span>${s.sessionsToday || 0} today</span>`;
  }

  // Init
  initTheme();
  bindFocus();
  renderLinks();
  renderStreak();
  buildPicker(loadVis());
  render();
  window.addEventListener('ft:streak-updated', renderStreak);
})();

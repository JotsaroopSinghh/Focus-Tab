(function(){
  // Helpers
  const $all = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const KEY_TODO = "ft_todo_v1";
  const KEY_POMO = "ft_pomo_v1";
  const KEY_QUOTE = "ft_daily_quote_v3";
  const KEY_WEATHER = "ft_weather_v1";
  const KEY_SOUND = "ft_sound_v1";

  function todayKey(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  // CLOCK
  function initClock(card){
    const timeEl = card.querySelector("#clockTime");
    const dateEl = card.querySelector("#clockDate");
    if (!timeEl || !dateEl) return;

    const tick = ()=>{
      const d = new Date();
      const hh = String(d.getHours()).padStart(2,"0");
      const mm = String(d.getMinutes()).padStart(2,"0");
      timeEl.textContent = `${hh}:${mm}`;

      const fmt = d.toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"long", day:"numeric" });
      dateEl.textContent = fmt;
    };
    tick();
    const id = setInterval(tick, 1000);
    card._ftInterval = id;
  }

  // TODO
  function loadTodo(){ return JSON.parse(localStorage.getItem(KEY_TODO) || "[]"); }
  function saveTodo(list){ localStorage.setItem(KEY_TODO, JSON.stringify(list)); }

  function renderTodo(card, list){
    const ul = card.querySelector('[data-role="todoList"]');
    const count = card.querySelector('[data-role="todoCount"]');
    ul.innerHTML = "";
    list.forEach((t, idx)=>{
      const li = document.createElement("li");
      li.className = "w-todo-item" + (t.done ? " done" : "");
      const left = document.createElement("button");
      left.type="button";
      left.className = "w-todo-check";
      left.textContent = t.done ? "✓" : "";
      left.addEventListener("click", ()=>{
        const cur = loadTodo();
        cur[idx].done = !cur[idx].done;
        saveTodo(cur);
        renderTodo(card, cur);
      });

      const text = document.createElement("div");
      text.className = "w-todo-text";
      text.textContent = t.text;

      const del = document.createElement("button");
      del.type="button";
      del.className = "w-todo-del";
      del.textContent = "✕";
      del.addEventListener("click", ()=>{
        const cur = loadTodo();
        cur.splice(idx,1);
        saveTodo(cur);
        renderTodo(card, cur);
      });

      li.appendChild(left);
      li.appendChild(text);
      li.appendChild(del);
      ul.appendChild(li);
    });

    const remaining = list.filter(t=>!t.done).length;
    count.textContent = `${remaining} left`;
  }

  function initTodo(card){
    const form = card.querySelector('[data-role="todoForm"]');
    const input = card.querySelector('[data-role="todoInput"]');
    const clearBtn = card.querySelector('[data-role="todoClear"]');
    if (!form || !input || !clearBtn) return;

    const list = loadTodo();
    renderTodo(card, list);

    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const text = (input.value||"").trim();
      if (!text) return;
      const cur = loadTodo();
      cur.unshift({ text, done:false, ts: Date.now() });
      saveTodo(cur);
      input.value = "";
      renderTodo(card, cur);
    });

    clearBtn.addEventListener("click", ()=>{
      const cur = loadTodo().filter(t=>!t.done);
      saveTodo(cur);
      renderTodo(card, cur);
    });
  }

  // WEATHER (Open-Meteo + geocoding)
  function codeToDesc(code){
    // Simplified WMO interpretation
    const map = {
      0:"Clear", 1:"Mostly clear", 2:"Partly cloudy", 3:"Overcast",
      45:"Fog", 48:"Rime fog",
      51:"Light drizzle", 53:"Drizzle", 55:"Heavy drizzle",
      61:"Light rain", 63:"Rain", 65:"Heavy rain",
      71:"Light snow", 73:"Snow", 75:"Heavy snow",
      80:"Rain showers", 81:"Showers", 82:"Violent showers",
      95:"Thunderstorm"
    };
    return map[code] || "Weather";
  }

  function codeToIcon(code){
    // Simple emoji/icons by WMO buckets
    if (code === 0) return "☀️";
    if (code === 1) return "🌤️";
    if (code === 2) return "⛅";
    if (code === 3) return "☁️";
    if (code === 45 || code === 48) return "🌫️";
    if (code >= 51 && code <= 55) return "🌦️";
    if (code >= 61 && code <= 65) return "🌧️";
    if (code >= 71 && code <= 75) return "❄️";
    if (code >= 80 && code <= 82) return "🌧️";
    if (code === 95) return "⛈️";
    return "🌡️";
  }

  async function geoCity(name){
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("geo");
    const data = await res.json();
    const r = data?.results?.[0];
    if (!r) throw new Error("notfound");
    return { name: `${r.name}${r.admin1 ? ", "+r.admin1 : ""}`, lat: r.latitude, lon: r.longitude };
  }

  async function forecast(lat, lon){
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("wx");
    const data = await res.json();
    const cur = data.current;
    const daily = data.daily;
    return {
      temp: Math.round(cur.temperature_2m),
      code: cur.weather_code,
      high: Math.round(daily.temperature_2m_max?.[0]),
      low: Math.round(daily.temperature_2m_min?.[0]),
    };
  }

  function saveWeatherCache(obj){ localStorage.setItem(KEY_WEATHER, JSON.stringify(obj)); }
  function loadWeatherCache(){
    try { return JSON.parse(localStorage.getItem(KEY_WEATHER)||"null"); } catch { return null; }
  }

  async function setWeather(card, loc){
    const locEl = card.querySelector('[data-role="weatherLoc"]');
    const tempEl = card.querySelector('[data-role="weatherTemp"]');
    const descEl = card.querySelector('[data-role="weatherDesc"]');
    const iconEl = card.querySelector('[data-role="weatherIcon"]');
    const hiEl = card.querySelector('[data-role="weatherHigh"]');
    const loEl = card.querySelector('[data-role="weatherLow"]');

    locEl.textContent = "Loading…";
    const f = await forecast(loc.lat, loc.lon);
    locEl.textContent = loc.name;
    tempEl.textContent = `${f.temp}°C`;
    descEl.textContent = codeToDesc(f.code);
    if (iconEl) iconEl.textContent = codeToIcon(f.code);
    hiEl.textContent = f.high;
    loEl.textContent = f.low;

    saveWeatherCache({ when: Date.now(), loc, f });
  }

  function initWeather(card){
    const form = card.querySelector('[data-role="weatherForm"]');
    const city = card.querySelector('[data-role="weatherCity"]');
    const auto = card.querySelector('[data-role="weatherAuto"]');

    const cached = loadWeatherCache();
    if (cached?.loc?.name && cached?.f){
      const locEl = card.querySelector('[data-role="weatherLoc"]');
      const tempEl = card.querySelector('[data-role="weatherTemp"]');
      const descEl = card.querySelector('[data-role="weatherDesc"]');
      const iconEl = card.querySelector('[data-role="weatherIcon"]');
      const hiEl = card.querySelector('[data-role="weatherHigh"]');
      const loEl = card.querySelector('[data-role="weatherLow"]');
      locEl.textContent = cached.loc.name;
      tempEl.textContent = `${cached.f.temp}°C`;
      descEl.textContent = codeToDesc(cached.f.code);
      if (iconEl) iconEl.textContent = codeToIcon(cached.f.code);
      hiEl.textContent = cached.f.high;
      loEl.textContent = cached.f.low;
    }

    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const name = (city.value||"").trim();
      if (!name) return;
      try{
        const loc = await geoCity(name);
        await setWeather(card, loc);
      }catch{
        const locEl = card.querySelector('[data-role="weatherLoc"]');
        locEl.textContent = "City not found";
      }
    });

    auto.addEventListener("click", ()=>{
      if (!navigator.geolocation){
        card.querySelector('[data-role="weatherLoc"]').textContent = "No geolocation";
        return;
      }
      card.querySelector('[data-role="weatherLoc"]').textContent = "Detecting…";
      navigator.geolocation.getCurrentPosition(async (pos)=>{
        try{
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const loc = { name: "Your location", lat, lon };
          await setWeather(card, loc);
        }catch{
          card.querySelector('[data-role="weatherLoc"]').textContent = "Couldn’t load weather";
        }
      }, ()=>{
        card.querySelector('[data-role="weatherLoc"]').textContent = "Permission denied";
      }, { enableHighAccuracy:false, timeout:8000 });
    });
  }

  // SOUND (WebAudio noise)
  function makeNoise(ctx, type){
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i=0;i<bufferSize;i++){
      data[i] = Math.random()*2-1;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // shaping filters
    let node = src;
    if (type === "brown"){
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 350;
      node.connect(filter);
      node = filter;
    } else if (type === "pink"){
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 800;
      filter.Q.value = 0.6;
      node.connect(filter);
      node = filter;
    }
    return { src, out: node };
  }

  function initSound(card){
    const btn = card.querySelector('[data-role="soundToggle"]');
    const sel = card.querySelector('[data-role="soundType"]');
    const vol = card.querySelector('[data-role="soundVol"]');

    let ctx=null, gain=null, noise=null, playing=false;

    function loadState(){
      try { return JSON.parse(localStorage.getItem(KEY_SOUND)||"null"); } catch { return null; }
    }
    function saveState(){
      localStorage.setItem(KEY_SOUND, JSON.stringify({ type: sel.value, vol: Number(vol.value) }));
    }

    const st = loadState();
    if (st?.type) sel.value = st.type;
    if (typeof st?.vol === "number") vol.value = String(st.vol);

    const ensure = ()=>{
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain();
      gain.gain.value = Number(vol.value)/100;
      gain.connect(ctx.destination);
    };

    const start = ()=>{
      ensure();
      if (noise) { try{ noise.src.stop(); }catch{} noise=null; }
      noise = makeNoise(ctx, sel.value);
      noise.out.connect(gain);
      noise.src.start();
      playing=true;
      btn.textContent="Pause";
    };
    const stop = ()=>{
      if (noise){ try{ noise.src.stop(); }catch{} }
      noise=null;
      playing=false;
      btn.textContent="Play";
    };

    btn.addEventListener("click", ()=>{
      if (!playing) start();
      else stop();
      saveState();
    });

    sel.addEventListener("change", ()=>{
      if (playing){ start(); }
      saveState();
    });

    vol.addEventListener("input", ()=>{
      if (gain) gain.gain.value = Number(vol.value)/100;
      saveState();
    });

    // stop audio if widget removed (best effort)
    card._ftCleanup = ()=>{ try{ stop(); }catch{} };
  }

  
  // POMODORO
  function loadPomo(){
    try { return JSON.parse(localStorage.getItem(KEY_POMO)||"null"); } catch { return null; }
  }
  function savePomo(s){ localStorage.setItem(KEY_POMO, JSON.stringify(s)); }

  function playChime(){
    // WebAudio chime (works without external files)
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const g = ctx.createGain();

      o1.type = "sine"; o2.type = "triangle";
      o1.frequency.value = 880;
      o2.frequency.value = 1320;

      g.gain.value = 0.0001;
      o1.connect(g); o2.connect(g); g.connect(ctx.destination);

      const t = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

      o1.start(t); o2.start(t);
      o1.stop(t + 0.6); o2.stop(t + 0.6);
      setTimeout(()=>{ try{ ctx.close(); }catch{} }, 700);
    }catch{}
  }

  function bumpWorkStreak(){
    // store per-day completed work sessions + streak
    const KEY = "ft_streak_v1"; // {lastDay:"YYYY-MM-DD", streak:int, sessionsToday:int}
    const today = todayKey();
    let s;
    try{ s = JSON.parse(localStorage.getItem(KEY) || "null"); }catch{ s=null; }
    if (!s) s = { lastDay: today, streak: 0, sessionsToday: 0 };

    // if new day:
    if (s.lastDay !== today){
      // if lastDay was yesterday AND had at least 1 session, keep streak; else reset
      const last = new Date(s.lastDay+"T00:00:00");
      const now = new Date(today+"T00:00:00");
      const diff = Math.round((now-last)/86400000);
      if (diff === 1 && s.sessionsToday > 0){
        // this case shouldn't happen because sessionsToday belonged to last day; treat as continue
        s.streak = Math.max(1, s.streak + 1);
      } else if (diff === 1){
        // if yesterday had sessions, keep; we don't know (sessionsToday reset). So use heuristic: if streak>0 keep.
        s.streak = s.streak > 0 ? (s.streak + 1) : 1;
      } else {
        s.streak = 1;
      }
      s.sessionsToday = 0;
      s.lastDay = today;
    }

    s.sessionsToday += 1;
    if (s.streak === 0) s.streak = 1;

    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("ft:streak-updated"));
  }

  function initPomo(card){
    const modeEl = card.querySelector('[data-role="pomoMode"]');
    const timeEl = card.querySelector('[data-role="pomoTime"]');
    const startBtn = card.querySelector('[data-role="pomoStart"]');
    const resetBtn = card.querySelector('[data-role="pomoReset"]');
    const presets = $all('[data-role="pomoPreset"]', card);
    const promptWrap = card.querySelector('[data-role="pomoPrompt"]');
    const promptText = card.querySelector('[data-role="pomoPromptText"]');
    const promptStart = card.querySelector('[data-role="pomoPromptStart"]');

    let state = loadPomo() || { work:25, brk:5, mode:"work", remaining:25*60, running:false, sound:true };
    let timer=null;

    const fmt = (sec)=>{
      const m = Math.floor(sec/60);
      const s = sec%60;
      return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    };

    function render(){
      modeEl.textContent = state.mode === "work" ? "Work" : "Break";
      timeEl.textContent = fmt(state.remaining);

      if (promptWrap){
        promptWrap.hidden = !state.prompt;
        if (state.prompt && promptText && promptStart){
          const nextLabel = state.mode === "work" ? "Start work" : "Start break";
          promptText.textContent = state.mode === "work" ? "Break complete. Ready to focus?" : "Work complete. Start your break?";
          promptStart.textContent = nextLabel;
        }
      }

      if (state.running){
        startBtn.textContent = "Pause";
      } else {
        startBtn.textContent = state.mode === "work" ? "Start" : "Start Break";
      }
    }

    function completePhase(){
      // if finishing a WORK session, bump streak and sessions
      if (state.mode === "work") bumpWorkStreak();
      if (state.sound) playChime();

      state.mode = state.mode === "work" ? "break" : "work";
      state.remaining = (state.mode === "work" ? state.work : state.brk) * 60;
      state.running = false; // user must start next phase
      state.prompt = true;
      savePomo(state);
      render();
    }

    function tick(){
      if (!state.running) return;
      state.remaining -= 1;
      if (state.remaining <= 0){
        completePhase();
        return;
      }
      savePomo(state);
      render();
    }

    function ensureTimer(){
      if (timer) return;
      timer = setInterval(tick, 1000);
    }

    startBtn.addEventListener("click", ()=>{
      state.prompt = false;
      state.running = !state.running;
      savePomo(state);
      ensureTimer();
      render();
    });

    if (promptStart){
      promptStart.addEventListener("click", ()=>{
        state.prompt = false;
        state.running = true;
        savePomo(state);
        ensureTimer();
        render();
      });
    }

    resetBtn.addEventListener("click", ()=>{
      state.running = false;
      state.prompt = false;
      state.mode = "work";
      state.remaining = state.work*60;
      savePomo(state);
      render();
    });

    presets.forEach(btn=>{
      btn.addEventListener("click", ()=>{
        state.work = Number(btn.dataset.work);
        state.brk = Number(btn.dataset.break);
        state.running = false;
        state.prompt = false;
        state.mode = "work";
        state.remaining = state.work*60;
        savePomo(state);
        render();
      });
    });

    ensureTimer();
    render();
    card._ftCleanup = ()=>{ try{ if (timer) clearInterval(timer); }catch{} };
  }
// QUOTE (ZenQuotes today + refresh)
  async function fetchZenToday(){
    const res = await fetch("https://zenquotes.io/api/today", { cache:"no-store" });
    if (!res.ok) throw new Error("zen");
    const data = await res.json();
    const it = Array.isArray(data) ? data[0] : null;
    const text = it?.q;
    const author = it?.a;
    if (!text) throw new Error("noquote");
    return { text, author: author || "Unknown" };
  }
  async function fetchZenRandom(){
    const res = await fetch("https://zenquotes.io/api/random", { cache:"no-store" });
    if (!res.ok) throw new Error("zen");
    const data = await res.json();
    const it = Array.isArray(data) ? data[0] : null;
    const text = it?.q;
    const author = it?.a;
    if (!text) throw new Error("noquote");
    return { text, author: author || "Unknown" };
  }

  function loadQuote(){
    try { return JSON.parse(localStorage.getItem(KEY_QUOTE)||"null"); } catch { return null; }
  }
  function saveQuote(q){ localStorage.setItem(KEY_QUOTE, JSON.stringify(q)); }

  async function initQuote(card){
    const textEl = card.querySelector('[data-role="quoteText"]');
    const authEl = card.querySelector('[data-role="quoteAuthor"]');
    if (!textEl || !authEl) return;

    const apply = (q)=>{
      textEl.textContent = q.text;
      authEl.textContent = q.author ? `— ${q.author}` : "";
    };

    const cached = loadQuote();
    if (cached?.date === todayKey() && cached?.text){
      apply(cached);
    } else {
      try{
        const q = await fetchZenToday();
        const store = { date: todayKey(), text:q.text, author:q.author };
        saveQuote(store);
        apply(store);
      }catch{
        apply({ text:"Stay consistent. The results will come.", author:"Unknown" });
      }
    }

    // Intentionally no manual refresh: quote rotates once per day.
  }

  // Init when widgets rendered
  function initAll(){
    // cleanup old intervals/audio if any
    $all(".widget-card").forEach(card=>{
      if (card._ftInited) return;
      const id = card.dataset.widgetId || card.getAttribute("data-widget");
      card._ftInited = true;

      try{
        if (id === "clock") initClock(card);
        if (id === "todo") initTodo(card);
        if (id === "weather") initWeather(card);
        if (id === "music") initSound(card);
        if (id === "pomodoro") initPomo(card);
        if (id === "quote") initQuote(card);
      }catch(e){
        // fail silently to avoid killing the page
      }
    });
  }

  window.addEventListener("ft:widgets-rendered", initAll);
  document.addEventListener("DOMContentLoaded", initAll);
})();

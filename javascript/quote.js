// Daily quote with author (cached per day).
// Tries ZenQuotes first, then falls back to a local list.
(function () {
  const KEY = "ft_daily_quote_v2"; // {date:"YYYY-MM-DD", text:"...", author:"..."}
  const localFallback = [
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
    { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Small steps every day.", author: "Unknown" }
  ];

  function todayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function setQuote(text, author) {
    const qt = document.getElementById("quote-text");
    const qa = document.getElementById("quote-author");
    if (qt) qt.textContent = text || "";
    if (qa) qa.textContent = author ? `— ${author}` : "";
  }

  function loadCached() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (obj && obj.date === todayKey() && obj.text) return obj;
    } catch {}
    return null;
  }

  function saveCached(text, author) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ date: todayKey(), text, author }));
    } catch {}
  }

  async function fetchZenQuotes() {
    // ZenQuotes returns: [{ q: "...", a: "Author", h: "<blockquote>..." }]
    const res = await fetch("https://zenquotes.io/api/today", { cache: "no-store" });
    if (!res.ok) throw new Error("ZenQuotes failed");
    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : null;
    const text = item?.q;
    const author = item?.a;
    if (!text) throw new Error("No quote in response");
    return { text, author: author || "Unknown" };
  }

  function randomFallback() {
    const i = Math.floor(Math.random() * localFallback.length);
    return localFallback[i];
  }

  async function ensureQuote() {
    const cached = loadCached();
    if (cached) {
      setQuote(cached.text, cached.author);
      return;
    }

    try {
      const q = await fetchZenQuotes();
      setQuote(q.text, q.author);
      saveCached(q.text, q.author);
      return;
    } catch {
      const fb = randomFallback();
      setQuote(fb.text, fb.author);
      saveCached(fb.text, fb.author);
    }
  }

  function init() {
    // If the widget isn't present, do nothing.
    if (!document.getElementById("quote-text")) return;
    ensureQuote();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("ft:widgets-rendered", init);
})();

/* assets/js/i18n.js — FULL */

(function () {
  const STORAGE_KEY = "site_lang";
  const DEFAULT_LANG = "ar";
  const LANG_FILES = {
    ar: "assets/i18n/ar.json",
    en: "assets/i18n/en.json",
  };

  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  let dict = null;

  // Helpers
  const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const setDir = (dir) => {
    document.documentElement.setAttribute("dir", dir || "rtl");
    document.body.classList.toggle("rtl", dir === "rtl");
    document.body.classList.toggle("ltr", dir === "ltr");
  };

  async function loadLang(lang) {
    const url = LANG_FILES[lang] || LANG_FILES[DEFAULT_LANG];
    const res = await fetch(url, { cache: "no-cache" });
    dict = await res.json();
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Direction + dropdown state
    if (dict && dict._meta) {
      setDir(dict._meta.dir);
      const flag = document.getElementById("current-lang-flag");
      const label = document.getElementById("current-lang-label");
      if (flag && dict._meta.flag) flag.src = dict._meta.flag;
      if (label && dict._meta.label) label.textContent = dict._meta.label;
    }

    applyI18n();
  }

  function t(path, fallback = "") {
    if (!dict) return fallback;
    return (
      path
        .split(".")
        .reduce(
          (acc, key) => (acc && acc[key] != null ? acc[key] : undefined),
          dict
        ) ?? fallback
    );
  }

  function applyText() {
    $all("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = t(key, el.textContent.trim());
      if (val != null) el.textContent = val;
    });
  }

  function applyAttrs() {
    $all("[data-i18n-attr]").forEach((el) => {
      const raw = el.getAttribute("data-i18n-attr"); // "placeholder:x.y;aria-label:a.b"
      if (!raw) return;
      raw.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s && s.trim());
        if (!attr || !key) return;
        const val = t(key);
        if (val != null) el.setAttribute(attr, val);
      });
    });
  }

  // Format <time data-date-iso="YYYY-MM-DD">
  function applyDates() {
    const locale = currentLang === "ar" ? "ar-SY" : "en-US";
    const opts = { day: "numeric", month: "long", year: "numeric" };
    $all("time[data-date-iso]").forEach((el) => {
      const iso = el.getAttribute("data-date-iso");
      if (!iso) return;
      const d = new Date(iso);
      if (isNaN(d.getTime())) return;
      el.textContent = new Intl.DateTimeFormat(locale, opts).format(d);
    });
  }

  // NEW: Format range <span data-datetime-start="ISO" data-datetime-end="ISO">
  function applyDateTimes() {
    const isArabic = currentLang === "ar";
    const localeDate = isArabic ? "ar-SY" : "en-US";
    const localeTime = isArabic ? "ar-SY" : "en-US";

    const dateFmt = new Intl.DateTimeFormat(localeDate, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeFmt = new Intl.DateTimeFormat(localeTime, {
      hour: "numeric",
      minute: "2-digit",
    });

    $all("[data-datetime-start]").forEach((el) => {
      const startISO = el.getAttribute("data-datetime-start");
      const endISO = el.getAttribute("data-datetime-end");
      if (!startISO) return;

      const ds = new Date(startISO);
      const de = endISO ? new Date(endISO) : null;
      if (isNaN(ds.getTime())) return;
      if (de && isNaN(de.getTime())) return;

      const datePart = dateFmt.format(ds);
      const startPart = timeFmt.format(ds);
      const endPart = de ? timeFmt.format(de) : null;

      // Joiner with locale punctuation
      let text;
      if (endPart) {
        // ar: "10 أكتوبر 2025، 6:00–9:30 م"
        // en: "October 10, 2025, 6:00–9:30 PM"
        const comma = isArabic ? "، " : ", ";
        const dash = "–";
        text = `${datePart}${comma}${startPart}${dash}${endPart}`;
      } else {
        const comma = isArabic ? "، " : ", ";
        text = `${datePart}${comma}${startPart}`;
      }

      el.textContent = text;
    });
  }

  function applyDirAwareUtilities() {
    const isLTR = dict && dict._meta && dict._meta.dir === "ltr";
    // Example: paragraphs inside event cards
    $all(".event-card-content p").forEach((p) => {
      p.classList.toggle("text-end", !isLTR);
      p.classList.toggle("text-start", isLTR);
    });
    // Example: about-event lists alignment
    $all(".about-event li, .location-details li").forEach((li) => {
      li.style.textAlign = isLTR ? "left" : "right";
    });
  }

  function applyI18n() {
    applyText();
    applyAttrs();
    applyDates();
    applyDateTimes();
    applyDirAwareUtilities();
  }

  function bindSwitcher() {
    $all(".dropdown-item[data-lang], [data-set-lang]").forEach((btn) => {
      const lang =
        btn.getAttribute("data-lang") || btn.getAttribute("data-set-lang");
      btn.addEventListener("click", () => loadLang(lang));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindSwitcher();
    loadLang(currentLang).catch(() => {
      currentLang = DEFAULT_LANG;
      loadLang(DEFAULT_LANG);
    });
  });

  window.__i18n = { loadLang, t };
})();

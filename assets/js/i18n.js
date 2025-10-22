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
    const html = document.documentElement;
    html.setAttribute("dir", dir || "rtl");
    html.setAttribute("lang", currentLang);
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
    const formatter = new Intl.DateTimeFormat(locale, opts);
    $all("time[data-date-iso]").forEach((el) => {
      const iso = el.getAttribute("data-date-iso");
      if (!iso) return;
      try {
        const d = new Date(iso);
        if (!isNaN(d.getTime())) {
          el.textContent = formatter.format(d);
        }
      } catch (e) {
        console.error("Invalid date:", iso, e);
      }
    });
  }

  // NEW: Format range <span data-datetime-start="ISO" data-datetime-end="ISO">
  function applyDateTimes() {
    const locale = currentLang === "ar" ? "ar-SY" : "en-US";
    const timeOpts = { hour: "numeric", minute: "2-digit", hourCycle: "h23" };
    const dateOpts = { day: "numeric", month: "long", year: "numeric" };

    const timeFmt = new Intl.DateTimeFormat(locale, timeOpts);
    const dateFmt = new Intl.DateTimeFormat(locale, dateOpts);
    const dateTimeFmt = new Intl.DateTimeFormat(locale, {
      ...dateOpts,
      ...timeOpts,
    });

    $all(".event-datetime[data-datetime-start]").forEach((el) => {
      const startISO = el.getAttribute("data-datetime-start");
      const endISO = el.getAttribute("data-datetime-end");
      if (!startISO) return;

      try {
        const ds = new Date(startISO);
        const de = endISO ? new Date(endISO) : null;
        if (isNaN(ds.getTime()) || (de && isNaN(de.getTime()))) return;

        let formatted;
        if (de) {
          const sameDay = ds.toDateString() === de.toDateString();
          if (sameDay) {
            const timeRange = `${timeFmt.format(ds)}–${timeFmt.format(de)}`;
            formatted = `${timeRange} • ${dateFmt.format(ds)}`;
          } else {
            formatted = `${dateTimeFmt.format(ds)} – ${dateTimeFmt.format(
              de
            )}`;
          }
        } else {
          formatted = dateTimeFmt.format(ds);
        }
        el.textContent = formatted;
      } catch (e) {
        console.error("Error formatting date range:", startISO, endISO, e);
      }
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

  function applyMapLocale() {
    const iframe = document.getElementById("google-maps-iframe");
    if (!iframe) return;

    try {
      const url = new URL(iframe.src);
      const params = new URLSearchParams(url.search);
      params.set("hl", currentLang);
      url.search = params.toString();
      
      // Only update src if it has changed to avoid reloads
      if (iframe.src !== url.toString()) {
        iframe.src = url.toString();
      }
    } catch (e) {
      console.error("Failed to update map locale:", e);
    }
  }

  // NEW: Format numbers with data-i18n-number attribute
  function applyNumbers() {
    const locale = currentLang === "ar" ? "ar-SY" : "en-US";
    const formatter = new Intl.NumberFormat(locale, { useGrouping: false });
    $all("[data-i18n-number]").forEach((el) => {
      const num = parseFloat(el.textContent);
      if (!isNaN(num)) {
        el.textContent = formatter.format(num);
      }
    });
  }

  function applyI18n() {
    applyText();
    applyAttrs();
    applyDates();
    applyDateTimes();
    applyDirAwareUtilities();
    applyMapLocale();
    applyNumbers();
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

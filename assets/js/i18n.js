(function () {
  const DEFAULT_LANG = "ar";
  const SUPPORTED = ["ar", "en"];
  const LS_KEY = "app_lang";

  // عناصر HTML عامة
  const htmlEl = document.documentElement;
  const currentLabelEl = document.getElementById("current-lang-label");
  const currentFlagEl = document.getElementById("current-lang-flag");

  // ========== Helpers ==========
  const getInitialLang = () => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;

    const nav = (
      navigator.language ||
      navigator.userLanguage ||
      ""
    ).toLowerCase();
    if (nav.startsWith("ar")) return "ar";
    return DEFAULT_LANG;
  };

  const loadDict = async (lang) => {
    const res = await fetch(`assets/i18n/${lang}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`i18n load failed: ${lang}`);
    return res.json();
  };

  const getByPath = (obj, path) =>
    path
      .split(".")
      .reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj);

  // تطبيق الترجمة على العناصر
  const applyI18n = (dict) => {
    // النص الداخلي
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = getByPath(dict, key);
      if (val != null) el.textContent = val;
    });

    // placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = getByPath(dict, key);
      if (val != null) el.setAttribute("placeholder", val);
    });

    // خصائص متعددة: data-i18n-attr="title:nav.home;aria-label:carousel.prev"
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const pairs = el
        .getAttribute("data-i18n-attr")
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
      pairs.forEach((p) => {
        const [attr, key] = p.split(":").map((s) => s.trim());
        const val = getByPath(dict, key);
        if (attr && val != null) el.setAttribute(attr, val);
      });
    });
  };

  // تنسيق التواريخ المعروضة حسب اللغة
  const formatDatesForLang = (lang) => {
    const opts = { day: "2-digit", month: "long", year: "numeric" };
    document.querySelectorAll("[data-date-iso]").forEach((el) => {
      const iso = el.getAttribute("data-date-iso"); // مثال: 2025-11-15
      const d = new Date(iso + "T00:00:00");
      try {
        el.textContent = new Intl.DateTimeFormat(lang, opts).format(d);
      } catch {
        el.textContent = iso; //fallback بسيط
      }
    });
  };

  // ضبط لغة/اتجاه الصفحة + تحديث تسمية زر اللغة والعلم
  const setLangDirUi = (lang, meta) => {
    htmlEl.setAttribute("lang", lang);
    htmlEl.setAttribute("dir", meta?.dir || (lang === "ar" ? "rtl" : "ltr"));
    if (currentLabelEl && meta?.label) currentLabelEl.textContent = meta.label;
    if (currentFlagEl && meta?.flag)
      currentFlagEl.setAttribute("src", meta.flag);
  };

  // تبديل اللغة
  const setLanguage = async (lang) => {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    const dict = await loadDict(lang);
    applyI18n(dict);
    setLangDirUi(lang, dict._meta);
    formatDatesForLang(lang);
    localStorage.setItem(LS_KEY, lang);
  };

  // ربط أزرار القائمة المنسدلة
  const bindDropdown = () => {
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const lang = e.currentTarget.getAttribute("data-lang");
        setLanguage(lang).catch(console.error);
      });
    });
  };

  // ========== Init ==========
  (async function init() {
    bindDropdown();
    const initial = getInitialLang();
    await setLanguage(initial);
  })();
})();

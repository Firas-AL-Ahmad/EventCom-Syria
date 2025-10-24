/* ============================================================
   EventCom Syria - MAIN.JS (shared across all pages)
   - Theme init + toggle (persistent)
   - Auto-activate current nav link
   - Format all [data-date-iso] + fix event cards missing date
   - Scroll-to-top button
   - Navbar shadow on scroll
   ============================================================ */

/* ============== THEME: init + switch (shared) ============== */
(function () {
  try {
    var KEY = "ec:theme";
    var root = document.documentElement;
    var saved = localStorage.getItem(KEY);
    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved ? saved : prefersDark ? "dark" : "light";
    root.setAttribute("data-theme", theme);

    var switchEl = document.getElementById("themeSwitch");
    if (switchEl) {
      switchEl.checked = theme === "dark";
      switchEl.setAttribute("aria-checked", String(switchEl.checked));
      switchEl.addEventListener("change", function () {
        var t = switchEl.checked ? "dark" : "light";
        root.setAttribute("data-theme", t);
        localStorage.setItem(KEY, t);
        switchEl.setAttribute("aria-checked", String(switchEl.checked));
      });
    }
  } catch (e) {
    /* no-op */
  }
})();

/* ============== NAV: auto active link (shared) ============== */
(function () {
  try {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navbar .nav-link").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href && href === path) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      } else {
        a.classList.remove("active");
        a.removeAttribute("aria-current");
      }
    });
  } catch (e) {
    /* no-op */
  }
})();

/* === HELPERS === */
function ecFormatISO(iso, locale) {
  try {
    var d = new Date(iso);
    if (isNaN(d)) return null;
    return d.toLocaleDateString(
      locale || document.documentElement.lang || "ar",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  } catch (_e) {
    return null;
  }
}

/* === EVENTS: format data-date-iso + fix missing date section (shared) === */
(function () {
  var doc = document;
  var locale = doc.documentElement.lang || "ar";
  var dir = doc.documentElement.dir || "rtl";

  // 1) صياغة كل span[data-date-iso]
  doc.querySelectorAll("span[data-date-iso]").forEach(function (el) {
    var iso = el.getAttribute("data-date-iso");
    var txt = ecFormatISO(iso, locale) || "غير محدد";
    el.textContent = txt;
    if (iso) el.setAttribute("title", iso);
    el.style.unicodeBidi = "plaintext";
    el.style.direction = dir;
  });

  // 2) معالجة بطاقات الفعالية التي لا تحتوي على قسم تاريخ
  doc.querySelectorAll(".event-card").forEach(function (card) {
    var hasDateSection = !!card.querySelector(".date");
    if (!hasDateSection) {
      // ابحث عن أقرب data-date-iso داخل البطاقة أو على البطاقة نفسها
      var isoEl = card.querySelector("[data-date-iso]");
      var iso =
        (isoEl && isoEl.getAttribute("data-date-iso")) ||
        card.getAttribute("data-date-iso") ||
        "";

      var formatted = ecFormatISO(iso, locale) || "غير محدد";
      var content = card.querySelector(".event-card-content") || card;

      var dateDiv = document.createElement("div");
      dateDiv.className = "date py-3 m-0";
      dateDiv.innerHTML =
        '<i class="bi bi-calendar3"></i> <span>' + formatted + "</span>";

      // الأفضل وضع التاريخ قبل أزرار البطاقة إن وُجدت
      var buttons = content.querySelector(".card-buttons");
      if (buttons && buttons.parentNode === content) {
        content.insertBefore(dateDiv, buttons);
      } else {
        content.appendChild(dateDiv);
      }
    }
  });
})();

/* ============== SCROLL TO TOP ============== */
(function () {
  var btn = document.querySelector(".scroll-to-top");
  if (!btn) return;

  function toggleBtn() {
    if (window.scrollY > 300) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  }
  toggleBtn();
  window.addEventListener("scroll", toggleBtn, { passive: true });

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ============== NAVBAR shadow on scroll ============== */
(function () {
  var nav = document.querySelector(".navbar");
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > 4) {
      nav.classList.add("navbar-elevated");
    } else {
      nav.classList.remove("navbar-elevated");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

// === Hero Carousel Autoplay (index.html) ===
(function initHeroCarousel() {
  var el = document.getElementById("carouselExampleIndicators");
  if (!el || !window.bootstrap) return;

  // احترام تفضيل المستخدم لتقليل الحركة
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // في حال تقليل الحركة: لا تشغيل تلقائي
  var opts = {
    interval: reduceMotion ? false : 2000,
    ride: reduceMotion ? false : "carousel",
    pause: "hover",
    wrap: true,
    touch: true,
  };

  var inst = bootstrap.Carousel.getInstance(el);
  if (!inst) {
    inst = new bootstrap.Carousel(el, opts);
  } else {
    inst.pause();
    // تحديث الإعدادات إن وُجدت نسخة سابقة
    inst._config.interval = opts.interval;
    inst._config.pause = opts.pause;
    if (!reduceMotion) inst.cycle();
  }
})();

// === Swap navbar logo based on theme ===
(function setupThemeAwareLogo() {
  var html = document.documentElement;
  var img = document.getElementById("site-logo");
  if (!img) return;

  var lightSrc = img.getAttribute("data-logo-light");
  var darkSrc = img.getAttribute("data-logo-dark");

  function currentTheme() {
    return (html.getAttribute("data-theme") || "light").toLowerCase();
  }

  function applyLogo() {
    var t = currentTheme();
    img.src = (t === "dark" ? darkSrc : lightSrc) || img.src;
  }

  // 1) عند التحميل
  applyLogo();

  // 2) لو عندك سويتش ثيم في الصفحة
  var themeSwitch = document.getElementById("themeSwitch");
  if (themeSwitch) {
    themeSwitch.addEventListener("change", applyLogo);
  }

  // 3) راقب أي تغيير على data-theme (لو تغيّر من سكربت آخر)
  try {
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (
          muts[i].type === "attributes" &&
          muts[i].attributeName === "data-theme"
        ) {
          applyLogo();
          break;
        }
      }
    });
    mo.observe(html, { attributes: true });
  } catch (e) {
    /* no-op */
  }
})();

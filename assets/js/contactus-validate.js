(function () {
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const t = (key, fb = "") =>
    window.__i18n && window.__i18n.t ? window.__i18n.t(key, fb) : fb;

  function setError(input, key) {
    input.classList.add("is-invalid");
    const holder = document.querySelector(
      `.invalid-feedback[data-error-for="${input.name}"]`
    );
    if (holder) holder.textContent = t(key);
  }

  function clearError(input) {
    input.classList.remove("is-invalid");
    const holder = document.querySelector(
      `.invalid-feedback[data-error-for="${input.name}"]`
    );
    if (holder) holder.textContent = "";
  }

  function validateEmailFormat(value) {
    // بسيط وكافي للواجهة الأمامية
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  // Expose for testing
  window.__validateEmailFormat = validateEmailFormat;

  function validateForm(form) {
    let ok = true;

    const fullName = form.elements["fullName"];
    const email = form.elements["email"];
    const subject = form.elements["subject"];

    // Full name
    if (!fullName.value.trim()) {
      setError(fullName, "contact_page.validation.full_name_required");
      ok = false;
    } else {
      clearError(fullName);
    }

    // Email
    if (!email.value.trim()) {
      setError(email, "contact_page.validation.email_required");
      ok = false;
    } else if (!validateEmailFormat(email.value.trim())) {
      setError(email, "contact_page.validation.email_invalid");
      ok = false;
    } else {
      clearError(email);
    }

    // Subject / message
    if (!subject.value.trim()) {
      setError(subject, "contact_page.validation.subject_required");
      ok = false;
    } else {
      clearError(subject);
    }

    return ok;
  }

  function bindLiveValidation(form) {
    $$(".form-control", form).forEach((el) => {
      el.addEventListener("input", () => {
        if (el.classList.contains("is-invalid")) {
          // جرّب التحقق الجزئي عند الكتابة
          if (el.name === "email") {
            if (el.value.trim() && validateEmailFormat(el.value.trim()))
              clearError(el);
          } else if (el.value.trim()) {
            clearError(el);
          }
        }
      });
      el.addEventListener("blur", () => {
        // تحقّق عند فقدان التركيز
        if (el.name === "fullName" && !el.value.trim())
          setError(el, "contact_page.validation.full_name_required");
        if (el.name === "email") {
          if (!el.value.trim())
            setError(el, "contact_page.validation.email_required");
          else if (!validateEmailFormat(el.value.trim()))
            setError(el, "contact_page.validation.email_invalid");
        }
        if (el.name === "subject" && !el.value.trim())
          setError(el, "contact_page.validation.subject_required");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    if (!form) return;

    bindLiveValidation(form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const success = document.getElementById("contactSuccess");
      if (success) {
        success.classList.add("d-none");
        success.textContent = "";
      }

      const ok = validateForm(form);
      if (!ok) return;

      // هنا تضع إرسالاً حقيقياً لاحقاً (fetch)، الآن فقط رسالة نجاح محلية
      if (success) {
        success.textContent = t(
          "contact_page.validation.success_message",
          "تم إرسال رسالتك بنجاح."
        );
        success.classList.remove("d-none");
      }
      form.reset();
    });
  });
})();

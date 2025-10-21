document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  const formAlerts = document.getElementById("form-alerts");
  const emailField = document.getElementById("email");
  const emailFeedback = document.getElementById("emailFeedback");
  const messageField = document.getElementById("message");
  const messageCounter = document.getElementById("message-counter");
  const submitBtn = document.getElementById("submitBtn");
  const formLoadTimestampField = document.getElementById("formLoadTimestamp");

  // Set form load timestamp for spam protection
  formLoadTimestampField.value = Date.now();

  const t = (key, fallback = "") =>
    window.__i18n && window.__i18n.t
      ? window.__i18n.t(key, fallback)
      : fallback;

  const createAlert = (message, type = "success") => {
    const wrapper = document.createElement("div");
    const alertId = `alert-${Date.now()}`;
    wrapper.innerHTML = [
      `<div id="${alertId}" class="alert alert-${type} alert-dismissible" role="alert" tabindex="-1">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");
    const alertEl = wrapper.firstChild;
    // Focus the new alert for screen readers
    setTimeout(() => document.getElementById(alertId)?.focus(), 10);
    return alertEl;
  };

  // Update character counter for textarea
  const updateMessageCounter = () => {
    const maxLength = messageField.getAttribute("maxlength");
    const currentLength = messageField.value.length;
    const counterText = t("contact_page.form.char_counter", "{count}/{max}")
      .replace("{count}", currentLength)
      .replace("{max}", maxLength);
    messageCounter.textContent = counterText;
  };

  messageField.addEventListener("input", updateMessageCounter);
  updateMessageCounter(); // Initial call

  // Dynamic email validation messages
  emailField.addEventListener("input", () => {
    if (emailField.validity.valueMissing) {
      emailFeedback.textContent = t("contact_page.validation.email_required");
    } else if (emailField.validity.typeMismatch) {
      emailFeedback.textContent = t("contact_page.validation.email_invalid");
    }
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    formAlerts.innerHTML = "";
    const originalBtnContent = submitBtn.innerHTML;

    // Spam protection checks
    const honeypot = contactForm.querySelector('[name="website"]');
    if (honeypot && honeypot.value) {
      console.warn("Honeypot field filled. Submission blocked.");
      return; // Silently fail
    }
    const formLoadTime = parseInt(formLoadTimestampField.value, 10);
    if (Date.now() - formLoadTime < 2000) {
      console.warn("Form submitted too quickly. Submission blocked.");
      return; // Silently fail
    }

    try {
      contactForm.classList.add("was-validated");
      if (emailField.validity.valueMissing) {
        emailFeedback.textContent = t("contact_page.validation.email_required");
      }

      if (!contactForm.checkValidity()) {
        const firstInvalidField = contactForm.querySelector(":invalid");
        firstInvalidField?.focus();
        return;
      }

      // --- Form is valid, simulate submission ---
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span class="visually-hidden">Loading...</span>
            `;

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Form is valid and ready to be sent.");
      const successMessage = t("contact_page.validation.success_message");
      formAlerts.appendChild(createAlert(successMessage, "success"));

      contactForm.reset();
      contactForm.classList.remove("was-validated");
      updateMessageCounter(); // Reset counter text
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      const errorMessage = t("contact_page.validation.error_message");
      formAlerts.appendChild(createAlert(errorMessage, "danger"));
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  });
});

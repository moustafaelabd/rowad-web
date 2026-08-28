/* =========================================================
   رواد الظل | settings-loader.js
   يجيب بيانات الإعدادات من /api/settings ويملأ بيها
   كل عنصر عليه data-settings في أي صفحة من صفحات الموقع
========================================================= */

(function () {
  "use strict";

  function resolveImage(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return "/uploads/" + path.replace(/^\/?(uploads\/)?/, "");
  }

  async function loadSiteSettings() {
    let settings;

    try {
      const res = await fetch("/api/settings");
      settings = await res.json();
    } catch (e) {
      console.error("تعذر تحميل الإعدادات:", e);
      return;
    }

    if (!settings) return;

    /* ============================================
       كل عنصر نصّه لازم يتغيّر بقيمة من الإعدادات
       (زي: رقم الهاتف الظاهر، الإيميل، العنوان)
       ضيف عليه: data-settings="phone"
    ============================================ */
    document.querySelectorAll("[data-settings]").forEach((el) => {
      const key = el.getAttribute("data-settings");
      if (settings[key] !== undefined && settings[key] !== null && settings[key] !== "") {
        el.textContent = settings[key];
      }
    });

    /* ============================================
       روابط tel: — لازم يتغيّر الـ href
       ضيف عليه: data-settings-href="tel:phoneIntl"
    ============================================ */
    document.querySelectorAll("[data-settings-href]").forEach((el) => {
      const raw = el.getAttribute("data-settings-href"); // مثال: "tel:phoneIntl"
      const [prefix, key] = raw.split(":");
      const value = settings[key];

      if (value) {
        if (prefix === "tel") el.setAttribute("href", "tel:" + value);
        else if (prefix === "mailto") el.setAttribute("href", "mailto:" + value);
        else if (prefix === "whatsapp") el.setAttribute("href", "https://wa.me/" + value);
        else el.setAttribute("href", value); // لروابط السوشيال الجاهزة (facebook, instagram...)
      }
    });

    /* ============================================
       اللوجو — ضيف على وسم <img> :
       data-settings-logo
    ============================================ */
    if (settings.logo) {
      document.querySelectorAll("[data-settings-logo]").forEach((img) => {
        img.src = resolveImage(settings.logo);
      });
    }

    /* ============================================
       اسم الموقع في التايتل (اختياري)
    ============================================ */
    if (settings.siteName) {
      document.querySelectorAll("[data-settings-sitename]").forEach((el) => {
        el.textContent = settings.siteName;
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSiteSettings);
  } else {
    loadSiteSettings();
  }

  window.RowadSettings = { reload: loadSiteSettings };
})();
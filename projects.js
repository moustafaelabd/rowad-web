/* =========================================================
   رواد الظل | projects.js
   جلب المشاريع من لوحة التحكم وعرضها في سكشن "أحدث مشاريعنا"
========================================================= */

(function () {
  "use strict";

  const track = document.getElementById("projectsTrack");
  if (!track) return;

 function resolveImage(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return API_BASE + "/uploads/" + path.replace(/^\/?(uploads\/)?/, "");
}

  function buildCard(project) {
    const img = resolveImage(project.image);

    return `
      <article class="project-card" data-image="${img}">
        <img src="${img}" alt="${project.title || ""}">
        <div class="project-dark"></div>
        <div class="project-info">
          <span class="project-category">${project.tag || "مشاريعنا"}</span>
          <h3>${project.title || ""}</h3>
          <p>${project.description || ""}</p>
          <a href="#" class="project-button">
            تفاصيل المشروع
            <span>←</span>
          </a>
        </div>
      </article>
    `;
  }

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();

      const projects = Array.isArray(data) ? data : data.projects || data.data || [];

      if (!projects.length) return; // سيبها فاضية أو حط كروت افتراضية لو حابب

      track.innerHTML = projects.map(buildCard).join("");

      // إعادة تفعيل أي سلايدر/تأثيرات hover بتتعلق بالكروت الجديدة
      document.dispatchEvent(new CustomEvent("projectsRendered"));
    } catch (err) {
      console.error("تعذر تحميل المشاريع:", err);
    }
  }

  loadProjects();
})();
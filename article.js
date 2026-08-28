/* =========================================================
   رواد الظل | article.js
   عرض محتوى مقال واحد بناءً على الـ slug في الرابط
========================================================= */

(function () {
  "use strict";

  const API_BASE = "HTTPS://ROWAD-WEB.ONRENDER.COM";
  const page = document.getElementById("articlePage");

  if (!page) return;

 function resolveImage(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return API_BASE + "/uploads/" + path.replace(/^\/?(uploads\/)?/, "");
}

  function formatDate(value) {
    if (!value) return "";
    try {
      const d = new Date(value);
      return d.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
      return "";
    }
  }

  function getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("slug");
  }

  function renderNotFound() {
    page.innerHTML = `
      <div class="article-not-found">
        <p>عذراً، المقال غير موجود أو تم حذفه.</p>
        <a href="articles-list.html">
          <i class="fa-solid fa-arrow-right"></i>
          الرجوع لكل المقالات
        </a>
      </div>
    `;
  }

  function setSEO(article) {
    const title = article.metaTitle || article.title || "مقال";
    const description = article.metaDescription || article.excerpt || "";
    const keywords = article.metaKeywords || "";

    document.title = title + " | رواد الظل";
    document.getElementById("pageTitle").textContent = title + " | رواد الظل";
    document.getElementById("pageDescription").setAttribute("content", description);
    document.getElementById("pageKeywords").setAttribute("content", keywords);
  }

  function renderArticle(article) {
    setSEO(article);

    const coverHtml = article.image
      ? `<div class="article-cover"><img src="${resolveImage(article.image)}" alt="${article.title || ""}"></div>`
      : "";

    const excerptHtml = article.excerpt
      ? `<div class="article-excerpt">${article.excerpt}</div>`
      : "";

    page.innerHTML = `
      <div class="article-breadcrumb">
        <a href="index.html">الرئيسية</a>
        <span>/</span>
        <a href="articles-list.html">المقالات</a>
        <span>/</span>
        <span>${article.title || ""}</span>
      </div>

      <span class="article-category-badge">${article.category || "مقالات"}</span>

      <h1 class="article-title">${article.title || ""}</h1>

      <div class="article-meta">
        <span><i class="fa-regular fa-calendar"></i> ${formatDate(article.createdAt || article.updatedAt)}</span>
      </div>

      ${coverHtml}

      ${excerptHtml}

      <div class="article-body">
        ${article.content || ""}
      </div>

      <a href="articles-list.html" class="article-back">
        <i class="fa-solid fa-arrow-right"></i>
        كل المقالات
      </a>
    `;
  }

  async function loadArticle() {
    const slug = getSlugFromUrl();

    if (!slug) {
      renderNotFound();
      return;
    }

    try {
      const res = await fetch(API_BASE + "/api/articles/" + encodeURIComponent(slug));

      if (!res.ok) {
        renderNotFound();
        return;
      }

      const data = await res.json();
      const article = data.article || data.data || data;

      if (!article || !article.title) {
        renderNotFound();
        return;
      }

      // لو المقال مسودة (published = false)، منعرضهوش على الزوار
      if (article.published === false) {
        renderNotFound();
        return;
      }

      renderArticle(article);
    } catch (err) {
      console.error(err);
      renderNotFound();
    }
  }

  loadArticle();
})();
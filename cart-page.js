/* =========================================================
   رواد الظل | cart-page.js
   صفحة سلة المشتريات — عرض المنتجات + تعديل الكمية + حذف
   + إتمام الطلب عبر واتساب
   ✅ رقم الواتساب بقى بييجي من /api/settings (لوحة التحكم)
========================================================= */

(function () {
  "use strict";

  const API_BASE = "https://rowad-web.onrender.com";

  const itemsContainer = document.getElementById("cartItemsContainer");
  const summaryContainer = document.getElementById("cartSummaryContainer");

  if (!itemsContainer || !summaryContainer) return;
  if (!window.RowadCart) return;

  // رقم احتياطي بس لو السيرفر مش راد أو مفيش إعدادات لسه
  let WHATSAPP_NUMBER = "201000000000";

  function resolveImage(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return API_BASE + "/uploads/" + path.replace(/^\/?(uploads\/)?/, "");
  }

  // ✅ جلب رقم الواتساب من إعدادات الموقع (لوحة التحكم)
  async function loadSettings() {
    try {
      const res = await fetch(API_BASE + "/api/settings");
      if (!res.ok) return;

      const data = await res.json();

      if (data && data.whatsapp) {
        WHATSAPP_NUMBER = String(data.whatsapp).replace(/[^0-9]/g, "");
      }
    } catch (e) {
      console.warn("تعذر تحميل إعدادات الموقع، هيتم استخدام الرقم الاحتياطي:", e);
    }
  }

  function render() {
    const cart = window.RowadCart.getCart();

    if (!cart.length) {
      renderEmpty();
      return;
    }

    renderItems(cart);
    renderSummary(cart);
  }

  function renderEmpty() {
    itemsContainer.innerHTML = `
      <div class="cart-empty">
        السلة فارغة حالياً
        <br>
        <a href="store.html">تصفح المتجر</a>
      </div>
    `;
    summaryContainer.innerHTML = "";
  }

  function renderItems(cart) {
    itemsContainer.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${resolveImage(item.image)}" alt="${item.title || ""}">

        <div class="cart-item-info">
          <div class="cart-item-title">${item.title || "منتج"}</div>
          <div class="cart-item-price">${item.price} ج.م</div>
        </div>

        <div class="cart-item-qty">
          <button type="button" class="cart-qty-minus" data-id="${item.id}">-</button>
          <input
            type="text"
            class="cart-qty-input"
            data-id="${item.id}"
            value="${item.qty}"
            inputmode="numeric"
          >
          <button type="button" class="cart-qty-plus" data-id="${item.id}">+</button>
        </div>

        <button type="button" class="cart-item-remove" data-id="${item.id}" aria-label="حذف">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `
      )
      .join("");

    bindItemEvents();
  }

  function bindItemEvents() {
    itemsContainer.querySelectorAll(".cart-qty-minus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const cart = window.RowadCart.getCart();
        const item = cart.find((i) => String(i.id) === String(id));
        if (!item) return;
        window.RowadCart.updateQty(id, Number(item.qty) - 1);
      });
    });

    itemsContainer.querySelectorAll(".cart-qty-plus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const cart = window.RowadCart.getCart();
        const item = cart.find((i) => String(i.id) === String(id));
        if (!item) return;
        window.RowadCart.updateQty(id, Number(item.qty) + 1);
      });
    });

    itemsContainer.querySelectorAll(".cart-qty-input").forEach((input) => {
      input.addEventListener("change", () => {
        const id = input.getAttribute("data-id");
        const val = parseInt(input.value, 10);
        window.RowadCart.updateQty(id, !val || val < 1 ? 1 : val);
      });
    });

    itemsContainer.querySelectorAll(".cart-item-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        window.RowadCart.removeItem(id);
      });
    });
  }

  function renderSummary(cart) {
    const total = window.RowadCart.getTotal();

    const orderLines = cart
      .map((item) => `- ${item.title} × ${item.qty} = ${Number(item.price) * Number(item.qty)} ج.م`)
      .join("\n");

    const message = `مرحباً، عايز أطلب:\n${orderLines}\n\nالإجمالي: ${total} ج.م`;
    const waLink = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);

    summaryContainer.innerHTML = `
      <div class="cart-summary">
        <div class="cart-summary-row">
          <span>الإجمالي</span>
          <span>${total} ج.م</span>
        </div>

        <a href="${waLink}" target="_blank" rel="noopener" class="cart-checkout-btn">
          <i class="fa-brands fa-whatsapp"></i>
          إتمام الطلب عبر واتساب
        </a>
      </div>
    `;
  }

  // إعادة الرسم تلقائياً لما السلة تتغير من أي صفحة تانية (نفس التبويب)
  document.addEventListener("rowadcart:updated", render);

  // ✅ لازم نجيب رقم الواتساب الأول قبل أول رسم للصفحة
  loadSettings().then(render);
})();
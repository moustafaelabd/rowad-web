document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const mobileNav = document.getElementById("mobileNav");
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const mobileClose = document.getElementById("mobileClose");

    if (mobileNav && mobileMenuBtn) {

        function openMobileMenu(){
            mobileNav.classList.add("active");
            mobileMenuBtn.setAttribute("aria-expanded", "true");
            document.body.style.overflow = "hidden";
        }

        function closeMobileMenu(){
            mobileNav.classList.remove("active");
            mobileMenuBtn.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
        }

        mobileMenuBtn.addEventListener("click", () => {
            const isOpen = mobileNav.classList.contains("active");
            isOpen ? closeMobileMenu() : openMobileMenu();
        });

        if (mobileClose) {
            mobileClose.addEventListener("click", closeMobileMenu);
        }

        document.querySelectorAll(".mobile-nav nav a").forEach(link => {
            link.addEventListener("click", closeMobileMenu);
        });
    }


    /* =====================================================
       COUNTER + SCROLL ANIMATION (الأرقام في قسم الإحصائيات)
    ===================================================== */

    const counters = document.querySelectorAll(".rw-counter");
    let counterStarted = false;

    function startCounters() {

        if (counterStarted) return;
        counterStarted = true;

        counters.forEach(function (counter) {

            const target = parseInt(counter.getAttribute("data-target"), 10);
            const duration = 1800;
            const startTime = performance.now();

            function updateCounter(currentTime) {

                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(ease * target);

                counter.textContent = current.toLocaleString("en-US");

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString("en-US");
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    const statAnimatedElements = document.querySelectorAll(
        ".rw-stat-item, .rw-about-content, .rw-about-image-wrap"
    );

    if (statAnimatedElements.length) {

        if ("IntersectionObserver" in window) {

            const observer = new IntersectionObserver(function (entries) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("rw-visible");

                        if (entry.target.classList.contains("rw-stat-item")) {
                            startCounters();
                        }
                    }
                });

            }, { threshold: 0.15 });

            statAnimatedElements.forEach(function (element) {
                observer.observe(element);
            });

        } else {

            statAnimatedElements.forEach(function (element) {
                element.classList.add("rw-visible");
            });

            startCounters();
        }
    }


/* =========================================================
   RW PRODUCTS
   بيسحب المنتجات لايف من لوحة التحكم عن طريق GET /api/products
========================================================= */

let products = [];

function resolveProductImage(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return "/uploads/" + path.replace(/^\/?(uploads\/)?/, "");
}

function mapApiProduct(p) {

    const categoryName =
        (p.Category && p.Category.name) ||
        (p.category && typeof p.category === "object" && p.category.name) ||
        (typeof p.category === "string" ? p.category : "");

    return {
        id: p.id,
        title: p.title,
        category: categoryName,
        image: resolveProductImage(p.image),
        price: Number(p.price || 0).toLocaleString("en-US"),
        oldPrice: p.oldPrice ? Number(p.oldPrice).toLocaleString("en-US") : "",
        discount: p.discount || ""
    };
}

async function loadProductsFromAPI() {

    try {

        const res = await fetch("/api/products");
        const data = await res.json();

        const raw = Array.isArray(data) ? data : (data.products || data.data || []);

        products = raw.map(mapApiProduct);

    } catch (err) {

        console.error("تعذر تحميل المنتجات من السيرفر:", err);
        products = [];
    }

    renderProducts();
    renderPagination();
}


/* =========================================================
   SETTINGS
========================================================= */

const productsPerPage = 10;

let currentPage = 1;


/* =========================================================
   ELEMENTS
========================================================= */

const productsGrid =
    document.getElementById("rwProductsGrid");

const pagination =
    document.getElementById("rwPagination");


/* =========================================================
   CART ICON
========================================================= */

const cartIcon = `
<svg viewBox="0 0 24 24">
    <path d="M6 7h12l1 13H5L6 7z"></path>
    <path d="M9 7a3 3 0 0 1 6 0"></path>
</svg>
`;


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    const start =
        (currentPage - 1) * productsPerPage;

    const end =
        start + productsPerPage;

    const pageProducts =
        products.slice(start, end);


    if (!pageProducts.length) {

        productsGrid.innerHTML = `
            <div class="rw-products-empty">
                لا توجد منتجات حالياً
            </div>
        `;

        return;
    }


    pageProducts.forEach(product => {

        const card =
            document.createElement("article");

        card.className =
            "rw-product-card";


        card.innerHTML = `

            <div class="rw-product-image">

                ${product.discount ? `
                    <span class="rw-product-badge">
                        ${product.discount}
                    </span>
                ` : ""}

                <img
                    src="${product.image}"
                    alt="${product.title}"
                    loading="lazy"
                >

            </div>


            <div class="rw-product-content">

                <h3 class="rw-product-title">
                    ${product.title}
                </h3>

                <div class="rw-product-category">
                    ${product.category}
                </div>


                <div class="rw-product-price">

                    <span class="rw-sale-price">
                        ${product.price} ج.م
                    </span>

                    ${product.oldPrice ? `
                        <span class="rw-old-price">
                            ${product.oldPrice} ج.م
                        </span>
                    ` : ""}

                </div>

<button
    class="rw-add-cart"
    data-id="${product.id}"
>

    <!-- الحالة العادية -->
    <span class="rw-cart-normal">

        ${cartIcon}

        <span>أضف إلى السلة</span>

    </span>


    <!-- الحالة عند Hover -->
    <svg
        class="rw-cart-hover"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path d="M6 7h12l1 13H5L6 7z"></path>
        <path d="M9 7a3 3 0 0 1 6 0"></path>
    </svg>

</button>

            </div>
        `;


        productsGrid.appendChild(card);

    });


    setupCartButtons();

}


/* =========================================================
   CART BUTTON
========================================================= */
function setupCartButtons() {

    document
        .querySelectorAll(".rw-add-cart")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    this.classList.add("added");

                    const text =
                        this.querySelector(
                            ".rw-cart-normal span"
                        );

                    if (text) {
                        text.textContent =
                            "تمت الإضافة ✓";
                    }


                    setTimeout(() => {

                        this.classList.remove("added");

                        if (text) {
                            text.textContent =
                                "أضف إلى السلة";
                        }

                    }, 1600);

                }
            );

        });

}

/* =========================================================
   PAGINATION
========================================================= */

function renderPagination() {

    if (!pagination) return;

    pagination.innerHTML = "";

    const totalPages =
        Math.ceil(
            products.length /
            productsPerPage
        );


    if (totalPages <= 1) {

        return;

    }


    /* PREVIOUS */

    const previous =
        document.createElement("button");

    previous.className =
        "rw-page-btn rw-page-arrow";

    previous.innerHTML = "‹";

    previous.disabled =
        currentPage === 1;

    previous.onclick = () => {

        if (currentPage > 1) {

            currentPage--;

            renderProducts();
            renderPagination();

            scrollToProducts();

        }

    };

    pagination.appendChild(previous);


    /* PAGES */

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        const page =
            document.createElement("button");

        page.className =
            "rw-page-btn";

        if (i === currentPage) {

            page.classList.add("active");

        }

        page.textContent = i;

        page.onclick = () => {

            currentPage = i;

            renderProducts();
            renderPagination();

            scrollToProducts();

        };

        pagination.appendChild(page);

    }


    /* NEXT */

    const next =
        document.createElement("button");

    next.className =
        "rw-page-btn rw-page-arrow";

    next.innerHTML = "›";

    next.disabled =
        currentPage === totalPages;

    next.onclick = () => {

        if (currentPage < totalPages) {

            currentPage++;

            renderProducts();
            renderPagination();

            scrollToProducts();

        }

    };

    pagination.appendChild(next);

}


/* =========================================================
   SCROLL
========================================================= */

function scrollToProducts() {

    const section =
        document.querySelector(".rw-products");

    if (!section) return;

    const top =
        section.getBoundingClientRect().top +
        window.scrollY -
        30;

    window.scrollTo({

        top: top,

        behavior: "smooth"

    });

}


/* =========================================================
   INIT
========================================================= */

if (productsGrid) {
    loadProductsFromAPI();
}

    const prodTrack = document.getElementById("rwProductsTrack");

    if (prodTrack) {

        const prodDotsContainer = document.getElementById("rwSliderDots");
        const prodNextBtn = document.querySelector(".rw-next");
        const prodPrevBtn = document.querySelector(".rw-prev");

        const modal = document.getElementById("rwProductModal");
        const modalImage = document.getElementById("rwModalImage");
        const modalTitle = document.getElementById("rwModalTitle");
        const modalCategory = document.getElementById("rwModalCategory");
        const modalDescription = document.getElementById("rwModalDescription");
        const modalPrice = document.getElementById("rwModalPrice");
        const modalClose = document.getElementById("rwModalClose");
        const modalOverlay = document.querySelector(".rw-modal-overlay");

        let currentPage = 0;
        let visibleProducts = 4;
        let autoPlay;

        function getVisibleProducts() {

            if (window.innerWidth <= 650) return 1;
            if (window.innerWidth <= 1050) return 2;
            return 4;
        }

        function renderProducts() {

            prodTrack.innerHTML = "";

            products.forEach(product => {

                const card = document.createElement("article");
                card.className = "rw-product-card";

                card.innerHTML = `
                    <div class="rw-product-image">
                        ${product.discount ? `<span class="rw-product-discount">${product.discount}</span>` : ""}
                        <span class="rw-product-badge">${product.category}</span>
                        <img src="${product.image}" alt="${product.title}" loading="lazy">
                        <button class="rw-quick-view" data-id="${product.id}">مشاهدة التفاصيل</button>
                    </div>
                    <div class="rw-product-content">
                        <span class="rw-product-category">${product.category}</span>
                        <h3 class="rw-product-title">${product.title}</h3>
                        <div class="rw-product-divider"></div>
                        <div class="rw-product-price">
                            <span class="rw-sale-price">${product.price} ر.س</span>
                            ${product.oldPrice ? `<span class="rw-old-price">${product.oldPrice} ر.س</span>` : ""}
                        </div>
                        <div class="rw-product-actions">
                            <button class="rw-product-info" data-id="${product.id}" aria-label="التفاصيل">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="9"></circle>
                                    <path d="M12 10v6"></path>
                                    <path d="M12 7h.01"></path>
                                </svg>
                            </button>
                            <button class="rw-add-cart" data-id="${product.id}">
                                <svg viewBox="0 0 24 24">
                                    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H7"></path>
                                    <circle cx="10" cy="20" r="1"></circle>
                                    <circle cx="18" cy="20" r="1"></circle>
                                </svg>
                                أضف إلى السلة
                            </button>
                        </div>
                    </div>
                `;

                prodTrack.appendChild(card);
            });

            createDots();
            setTimeout(updateSlider, 50);
        }

        function getPageCount() {
            visibleProducts = getVisibleProducts();
            return Math.ceil(products.length / visibleProducts);
        }

        function createDots() {

            if (!prodDotsContainer) return;

            prodDotsContainer.innerHTML = "";

            const pages = getPageCount();

            if (pages <= 1) return;

            for (let i = 0; i < pages; i++) {

                const dot = document.createElement("button");
                dot.className = "rw-dot";

                if (i === currentPage) {
                    dot.classList.add("active");
                }

                dot.addEventListener("click", function () {
                    currentPage = i;
                    updateSlider();
                    restartAutoPlay();
                });

                prodDotsContainer.appendChild(dot);
            }
        }

        function updateSlider() {

            visibleProducts = getVisibleProducts();

            const pages = getPageCount();

            if (currentPage >= pages) {
                currentPage = 0;
            }

            const cardWidth = prodTrack.parentElement.offsetWidth / visibleProducts;
            const gap = 18;

            const move = currentPage * (cardWidth * visibleProducts + gap * (visibleProducts - 1));

            prodTrack.style.transform = `translateX(${move}px)`;

            document.querySelectorAll(".rw-dot").forEach((dot, index) => {
                dot.classList.toggle("active", index === currentPage);
            });
        }

        function nextProdSlide() {

            const pages = getPageCount();
            if (pages <= 1) return;

            currentPage++;
            if (currentPage >= pages) currentPage = 0;

            updateSlider();
            restartAutoPlay();
        }

        function previousProdSlide() {

            const pages = getPageCount();
            if (pages <= 1) return;

            currentPage--;
            if (currentPage < 0) currentPage = pages - 1;

            updateSlider();
            restartAutoPlay();
        }

        if (prodNextBtn) prodNextBtn.addEventListener("click", nextProdSlide);
        if (prodPrevBtn) prodPrevBtn.addEventListener("click", previousProdSlide);

        function openProduct(id) {

            const product = products.find(item => item.id == id);
            if (!product || !modal) return;

            if (modalImage) {
                modalImage.src = product.image;
                modalImage.alt = product.title;
            }
            if (modalTitle) modalTitle.textContent = product.title;
            if (modalCategory) modalCategory.textContent = product.category;
            if (modalDescription) modalDescription.textContent = product.description;
            if (modalPrice) modalPrice.textContent = product.price + " ر.س";

            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function closeProduct() {

            if (!modal) return;

            modal.classList.remove("active");
            document.body.style.overflow = "";
        }

        document.addEventListener("click", function (event) {

            const button = event.target.closest("[data-id]");
            if (!button) return;

            const id = button.getAttribute("data-id");

            if (button.classList.contains("rw-quick-view") || button.classList.contains("rw-product-info")) {
                openProduct(id);
            }
        });

        if (modalClose) modalClose.addEventListener("click", closeProduct);
        if (modalOverlay) modalOverlay.addEventListener("click", closeProduct);

        document.addEventListener("keydown", function (event) {

            if (event.key === "Escape" && modal && modal.classList.contains("active")) {
                closeProduct();
            }
        });

        document.addEventListener("click", function (event) {

            const button = event.target.closest(".rw-add-cart");
            if (!button) return;

            const original = button.innerHTML;

            button.classList.add("added");
            button.innerHTML = `✓ تمت الإضافة للسلة`;

            setTimeout(function () {
                button.classList.remove("added");
                button.innerHTML = original;
            }, 1800);
        });

        function startAutoPlay() {

            clearInterval(autoPlay);
            if (getPageCount() <= 1) return;

            autoPlay = setInterval(nextProdSlide, 4500);
        }

        function restartAutoPlay() {
            startAutoPlay();
        }

        const productsSection = document.querySelector(".rw-products");

        if (productsSection) {
            productsSection.addEventListener("mouseenter", function () {
                clearInterval(autoPlay);
            });

            productsSection.addEventListener("mouseleave", function () {
                startAutoPlay();
            });
        }

        let prodTouchStartX = 0;
        let prodTouchEndX = 0;

        const prodSlider = document.querySelector(".rw-products-slider");

        if (prodSlider) {

            prodSlider.addEventListener("touchstart", function (event) {
                prodTouchStartX = event.changedTouches[0].screenX;
            }, { passive: true });

            prodSlider.addEventListener("touchend", function (event) {

                prodTouchEndX = event.changedTouches[0].screenX;
                const difference = prodTouchStartX - prodTouchEndX;

                if (Math.abs(difference) < 50) return;

                if (difference > 0) {
                    nextProdSlide();
                } else {
                    previousProdSlide();
                }
            }, { passive: true });
        }

        let prodResizeTimer;

        window.addEventListener("resize", function () {

            clearTimeout(prodResizeTimer);

            prodResizeTimer = setTimeout(function () {
                currentPage = 0;
                renderProducts();
                startAutoPlay();
            }, 200);
        });

        renderProducts();
        startAutoPlay();
    }


    /* =====================================================
       SERVICES SLIDER
    ===================================================== */

    const servicesSlider = document.querySelector(".rw-services-slider");

    if (servicesSlider) {

        let isDown = false;
        let startX;
        let scrollLeft;

        servicesSlider.addEventListener("mousedown", function (e) {
            isDown = true;
            servicesSlider.classList.add("is-dragging");
            startX = e.pageX - servicesSlider.offsetLeft;
            scrollLeft = servicesSlider.scrollLeft;
        });

        servicesSlider.addEventListener("mouseleave", function () {
            isDown = false;
            servicesSlider.classList.remove("is-dragging");
        });

        servicesSlider.addEventListener("mouseup", function () {
            isDown = false;
            servicesSlider.classList.remove("is-dragging");
        });

        servicesSlider.addEventListener("mousemove", function (e) {

            if (!isDown) return;

            e.preventDefault();

            const x = e.pageX - servicesSlider.offsetLeft;
            const walk = (x - startX) * 1.5;

            servicesSlider.scrollLeft = scrollLeft - walk;
        });

        let servicesAutoSlide;

        function startServicesAutoSlide() {

            if (window.innerWidth > 650) return;

            servicesAutoSlide = setInterval(function () {

                const cards = servicesSlider.querySelectorAll(".rw-service-card");
                if (!cards.length) return;

                const cardWidth = cards[0].offsetWidth + 15;
                const maxScroll = servicesSlider.scrollWidth - servicesSlider.clientWidth;

                if (Math.abs(servicesSlider.scrollLeft) >= Math.abs(maxScroll) - 10) {
                    servicesSlider.scrollTo({ left: 0, behavior: "smooth" });
                } else {
                    servicesSlider.scrollBy({ left: -cardWidth, behavior: "smooth" });
                }

            }, 4000);
        }

        function stopServicesAutoSlide() {
            clearInterval(servicesAutoSlide);
        }

        startServicesAutoSlide();

        servicesSlider.addEventListener("touchstart", function () {
            stopServicesAutoSlide();
        }, { passive: true });

        servicesSlider.addEventListener("touchend", function () {
            setTimeout(function () {
                startServicesAutoSlide();
            }, 2000);
        }, { passive: true });

        window.addEventListener("resize", function () {
            stopServicesAutoSlide();
            startServicesAutoSlide();
        });
    }


    /* =====================================================
       PROCESS TIMELINE ANIMATION
    ===================================================== */

    const processSection = document.getElementById("processSection");

    if (processSection) {

        const path = processSection.querySelector(".timeline-path");

        if (path) {
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
        }

        const processObserver = new IntersectionObserver(function (entries) {

            entries.forEach(function (entry) {

                if (!entry.isIntersecting) return;

                processSection.classList.add("is-visible");

                if (path) {

                    const length = path.getTotalLength();

                    path.animate(
                        [
                            { strokeDashoffset: length },
                            { strokeDashoffset: 0 }
                        ],
                        {
                            duration: 2200,
                            easing: "cubic-bezier(.22,1,.36,1)",
                            fill: "forwards"
                        }
                    );
                }

                processObserver.unobserve(processSection);
            });

        }, { threshold: 0.20 });

        processObserver.observe(processSection);
    }


    /* =====================================================
       PROJECTS SLIDER
    ===================================================== */

    const projectsSlider = document.querySelector(".projects-slider");
    const projectsTrack = document.querySelector(".projects-track");
    const projectCards = Array.from(document.querySelectorAll(".project-card"));

    if (projectsSlider && projectsTrack && projectCards.length) {

        const projNextBtn = document.querySelector(".slider-next");
        const projPrevBtn = document.querySelector(".slider-prev");

        let projCurrentIndex = 0;
        let cardWidth = 0;
        let visibleCards = 1;
        let maxIndex = 0;
        let projAutoPlay;
        let isDragging = false;
        let startX = 0;
        let startTranslate = 0;
        let currentTranslate = 0;

        function calculate() {

            const style = window.getComputedStyle(projectsTrack);
            const gap = parseFloat(style.columnGap || style.gap || 14);

            cardWidth = projectCards[0].offsetWidth + gap;
            visibleCards = Math.max(1, Math.floor(projectsSlider.clientWidth / cardWidth));
            maxIndex = Math.max(0, projectCards.length - visibleCards);

            if (projCurrentIndex > maxIndex) {
                projCurrentIndex = maxIndex;
            }

            moveSlider(false);
        }

        function moveSlider(animate = true) {

            const direction = document.documentElement.getAttribute("dir") === "rtl" ? 1 : -1;

            currentTranslate = projCurrentIndex * cardWidth * direction;

            projectsTrack.style.transition = animate
                ? "transform .7s cubic-bezier(.22,1,.36,1)"
                : "none";

            projectsTrack.style.transform = `translate3d(${currentTranslate}px,0,0)`;
        }

        function next() {

            projCurrentIndex = projCurrentIndex >= maxIndex ? 0 : projCurrentIndex + 1;
            moveSlider();
            restartProjAutoPlay();
        }

        function previous() {

            projCurrentIndex = projCurrentIndex <= 0 ? maxIndex : projCurrentIndex - 1;
            moveSlider();
            restartProjAutoPlay();
        }

        if (projNextBtn) projNextBtn.addEventListener("click", next);
        if (projPrevBtn) projPrevBtn.addEventListener("click", previous);

        function startProjAutoPlay() {
            clearInterval(projAutoPlay);
            projAutoPlay = setInterval(function () { next(); }, 4500);
        }

        function stopProjAutoPlay() {
            clearInterval(projAutoPlay);
        }

        function restartProjAutoPlay() {
            stopProjAutoPlay();
            startProjAutoPlay();
        }

        projectsSlider.addEventListener("mouseenter", stopProjAutoPlay);
        projectsSlider.addEventListener("mouseleave", startProjAutoPlay);

        projectsSlider.addEventListener("pointerdown", function (e) {

            isDragging = true;
            startX = e.clientX;
            startTranslate = currentTranslate;

            projectsSlider.classList.add("is-dragging");
            projectsTrack.style.transition = "none";

            projectsSlider.setPointerCapture(e.pointerId);
            stopProjAutoPlay();
        });

        projectsSlider.addEventListener("pointermove", function (e) {

            if (!isDragging) return;

            const diff = e.clientX - startX;
            currentTranslate = startTranslate + diff;

            projectsTrack.style.transform = `translate3d(${currentTranslate}px,0,0)`;
        });

        function finishDrag() {

            if (!isDragging) return;

            isDragging = false;
            projectsSlider.classList.remove("is-dragging");

            const diff = currentTranslate - startTranslate;
            const threshold = 55;

            if (Math.abs(diff) > threshold) {
                if (diff < 0) {
                    next();
                } else {
                    previous();
                }
            } else {
                moveSlider();
            }

            startProjAutoPlay();
        }

        projectsSlider.addEventListener("pointerup", finishDrag);
        projectsSlider.addEventListener("pointercancel", finishDrag);
        projectsSlider.addEventListener("pointerleave", function () {
            if (isDragging) finishDrag();
        });

        projectCards.forEach(function (card) {

            card.addEventListener("click", function () {

                if (window.innerWidth <= 768) {

                    projectCards.forEach(function (item) {
                        if (item !== card) {
                            item.classList.remove("is-active");
                        }
                    });

                    card.classList.toggle("is-active");
                }
            });
        });

        window.addEventListener("resize", function () {
            calculate();
        });

        calculate();
        startProjAutoPlay();
    }


    /* =====================================================
       ARTICLES SLIDER
    ===================================================== */

    const articles = [

        {
            image: "images/article-1.jpg",
            title: "الحفل السنوي 2026",
            year: "2026",
            category: "فعاليات"
        },
        {
            image: "images/article-2.jpg",
            title: "احتفالية 2025",
            year: "2025",
            category: "فعاليات"
        },
        {
            image: "images/article-3.jpg",
            title: "احتفالنا بعيد الفطر 2025",
            year: "2025",
            category: "فعاليات"
        }

    ];

    const articlesSlider = document.querySelector(".shadow-articles-slider");

    if (articlesSlider) {

        const articleCards = articlesSlider.querySelectorAll(".shadow-article-card");
        const rightButton = articlesSlider.querySelector(".shadow-arrow-right");
        const leftButton = articlesSlider.querySelector(".shadow-arrow-left");

        let articleIndex = 1;

        function updateArticles(direction) {

            articleIndex += direction;

            if (articleIndex >= articles.length) articleIndex = 0;
            if (articleIndex < 0) articleIndex = articles.length - 1;

            const previousIndex = (articleIndex - 1 + articles.length) % articles.length;
            const nextIndex = (articleIndex + 1) % articles.length;

            const positions = [previousIndex, articleIndex, nextIndex];

            articleCards.forEach(function (card, index) {

                const article = articles[positions[index]];

                const image = card.querySelector("img");
                const title = card.querySelector("h3");
                const year = card.querySelector(".shadow-article-year");
                const category = card.querySelector(".shadow-article-category");

                if (image) {
                    image.src = article.image;
                    image.alt = article.title;
                }
                if (title) title.textContent = article.title;
                if (year) year.textContent = article.year;
                if (category) category.textContent = article.category;

                card.classList.remove("shadow-article-center", "shadow-article-side");
                card.classList.add(index === 1 ? "shadow-article-center" : "shadow-article-side");
            });
        }

        if (rightButton) {
            rightButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                updateArticles(-1);
            });
        }

        if (leftButton) {
            leftButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                updateArticles(1);
            });
        }
    }


    /* =====================================================
       الهيدر المتحرك (Sticky / Animated Header)
       — يختفي لما تنزل، ويظهر تاني لما تطلع (كل المقاسات بما فيها الموبايل)
    ===================================================== */

    const header = document.querySelector(
        "#site-header, .site-header, .rw-header, header.header, #header, header"
    );

    if (header) {

        header.classList.add("rw-animated-header");

        const scrollThreshold = 60;
        let lastScrollY = window.scrollY;
        let ticking = false;

        function handleHeaderScroll() {

            const currentScrollY = window.scrollY;

            header.classList.toggle("rw-scrolled", currentScrollY > scrollThreshold);

            if (currentScrollY > scrollThreshold && currentScrollY > lastScrollY) {
                // بينزل (Scroll Down) بعد تجاوز العتبة → الهيدر يختفي
                header.classList.add("rw-hidden");
            } else if (currentScrollY < lastScrollY) {
                // بيطلع (Scroll Up) → الهيدر يظهر تاني
                header.classList.remove("rw-hidden");
            }

            lastScrollY = currentScrollY;
            ticking = false;
        }

        window.addEventListener("scroll", function () {

            if (!ticking) {
                requestAnimationFrame(handleHeaderScroll);
                ticking = true;
            }

        }, { passive: true });

        handleHeaderScroll();
    }

});

/* =========================================================
   VIDEO MODAL
========================================================= */

(function () {
  "use strict";

  const videoOpenBtn = document.getElementById("videoOpen");
  const videoModal = document.getElementById("videoModal");
  const videoCloseBtn = document.getElementById("videoClose");
  const heroVideo = document.getElementById("heroVideo");

  function openVideoModal() {
    if (!videoModal) return;
    videoModal.classList.add("active");

    if (heroVideo) {
      heroVideo.play().catch(() => {});
    }
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove("active");

    if (heroVideo) {
      heroVideo.pause();
    }
  }

  if (videoOpenBtn) {
    videoOpenBtn.addEventListener("click", openVideoModal);
  }

  if (videoCloseBtn) {
    videoCloseBtn.addEventListener("click", closeVideoModal);
  }

  if (videoModal) {
    const overlay = videoModal.querySelector(".video-modal-overlay");
    if (overlay) overlay.addEventListener("click", closeVideoModal);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeVideoModal();
    }
  });

  /* =====================================================
     PROCESS SECTION — تفعيل الأنيميشن عند الظهور
     (fallback لو الصفحة مش فيها DOMContentLoaded listener فوق)
  ===================================================== */

  const processSection = document.getElementById("processSection");
  if (processSection && "IntersectionObserver" in window && !processSection.classList.contains("is-visible")) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            processSection.classList.add("is-visible");
            observer.unobserve(processSection);
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(processSection);
  }
})();
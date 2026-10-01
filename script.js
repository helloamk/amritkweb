document.addEventListener("DOMContentLoaded", () => {
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    // Particle animation setup
    // Ensure the canvas element exists before proceeding
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    const ctx = canvas.getContext('2d');

    // Get CSS variables for colors
    const rootStyles = getComputedStyle(document.documentElement);
    const particleColor = rootStyles.getPropertyValue('--particle-color').trim() || 'rgba(200, 220, 255, 0.8)';
    const lineColor = rootStyles.getPropertyValue('--line-color').trim() || 'rgba(200, 220, 255, 0.2)';

    let particlesArray = [];
    const numberOfParticles = 80; // Adjust for density
    const maxDistance = 120;      // Max distance for lines

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight; // Or canvas.parentElement.offsetHeight if you want it strictly within hero
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);


    // Particle class
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    // Create particle array
    function init() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            let size = Math.random() * 2.5 + 1; // Particle size between 1 and 3.5
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let directionX = (Math.random() * 0.6) - 0.3; // Slow movement
            let directionY = (Math.random() * 0.6) - 0.3;
            particlesArray.push(new Particle(x, y, directionX, directionY, size, particleColor));
        }
    }

    // Draw lines between particles
    function connect() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a + 1; b < particlesArray.length; b++) { // Start b from a + 1
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    // Calculate opacity based on distance for a fade effect
                    let opacity = 1 - (distance / maxDistance);
                    ctx.strokeStyle = lineColor.replace(/[\d\.]+\)$/g, `${opacity})`); // Dynamically set opacity
                    ctx.lineWidth = 0.5; // Thin lines
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    init();
    animate();

    // Optional: Mouse interaction - particles move away from cursor
    let mouse = {
        x: null,
        y: null,
        radius: 100 // Radius of mouse influence
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Modify Particle.update for mouse interaction
    Particle.prototype.update = function () { // Using prototype to modify existing class
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // Mouse interaction
        if (mouse.x != null && mouse.y != null) {
            let dxMouse = this.x - mouse.x;
            let dyMouse = this.y - mouse.y;
            let distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            if (distanceMouse < mouse.radius) {
                // Push particle away
                let forceDirectionX = dxMouse / distanceMouse;
                let forceDirectionY = dyMouse / distanceMouse;
                let maxForce = 2; // Adjust strength of push
                let force = (mouse.radius - distanceMouse) / mouse.radius * maxForce;

                this.x += forceDirectionX * force;
                this.y += forceDirectionY * force;

            }
        }


        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    };

    const initPreloader = () => {
        const preloader = document.getElementById("preloader");
        if (!preloader) return;

        const hidePreloader = () => preloader.classList.add("hidden");
        window.addEventListener("load", hidePreloader);
        setTimeout(hidePreloader, 3000); // Fallback
    };

    const initMobileMenu = () => {
        const menuToggle = document.querySelector(".menu-toggle");
        const navbar = document.getElementById("navbar");
        if (!menuToggle || !navbar) return;

        if (!menuToggle.querySelector(".fa-times")) {
            menuToggle.appendChild(Object.assign(document.createElement("i"), {
                className: "fas fa-times"
            }));
        }

        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            navbar.classList.toggle("active");
            menuToggle.classList.toggle("open");
        });

        document.addEventListener("click", (e) => {
            if (navbar.classList.contains("active") &&
                !navbar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                navbar.classList.remove("active");
                menuToggle.classList.remove("open");
            }
        });

        navbar.addEventListener("click", (e) => {
            if (e.target.tagName === "A" && navbar.classList.contains("active")) {
                navbar.classList.remove("active");
                menuToggle.classList.remove("open");
            }
        });
    };

    const initHeaderScroll = () => {
        const header = document.querySelector("header");
        if (!header) return;

        const updateHeader = debounce(() => {
            header.classList.toggle("scrolled", window.scrollY > 50);
        }, 50);
        window.addEventListener("scroll", updateHeader);
    };

    // Navigation highlight functionality
    // This function highlights the active navigation link based on the current scroll position
    const initNavHighlight = () => {
        const sections = document.querySelectorAll("section[id]");
        const navLinks = document.querySelectorAll("#navbar a");
        const header = document.querySelector("header");

        if (sections.length === 0 || navLinks.length === 0 || !header) {
            // If essential elements are missing, don't proceed to avoid errors.
            if (navLinks.length > 0 && sections.length === 0) { // e.g. only home link
                if (window.scrollY < 50 && navLinks[0].getAttribute("href") === "#home") {
                    navLinks[0].classList.add("active");
                }
            }
            return;
        }

        const headerHeight = header.offsetHeight;

        const updateActiveLink = debounce(() => {
            const scrollY = window.scrollY;
            let currentSectionId = "";

            const activationLineInViewport = headerHeight + 10;

            // Iterate through sections to find which one the activationLineInViewport falls into
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                // Check if the activation line is within the section's top and bottom bounds
                if (scrollY + activationLineInViewport >= sectionTop &&
                    scrollY + activationLineInViewport < sectionBottom) {
                    currentSectionId = section.id;
                    break; // Found the active section
                }
            }

            if (currentSectionId === "" && scrollY < headerHeight) { // If scrollY is less than header height
                // Check if the first nav link is #home or if the first section is #home
                if (navLinks[0]?.getAttribute("href") === "#home") {
                    currentSectionId = "home";
                } else if (sections[0]?.id === "home") {
                    currentSectionId = "home";
                } else if (sections.length > 0 && scrollY < sections[0].offsetTop - headerHeight / 2) {
                    if (navLinks.length > 0 && navLinks[0].getAttribute("href") === `#${sections[0].id}`) {
                        currentSectionId = sections[0].id;
                    }
                }
            }

            // Fallback 2: If we are at the bottom of the page, set to last section
            if (currentSectionId === "" && sections.length > 0) {
                const lastSection = sections[sections.length - 1];
                if (scrollY + activationLineInViewport >= lastSection.offsetTop) {
                    currentSectionId = lastSection.id;
                }
            }

            if ((window.innerHeight + scrollY) >= (document.body.scrollHeight - 20) && sections.length > 0) {
                currentSectionId = sections[sections.length - 1].id;
            }


            // Apply the 'active' class
            navLinks.forEach((link) => {
                link.classList.toggle("active", link.getAttribute("href") === `#${currentSectionId}`);
            });
        }, 50); // Debounce time

        window.addEventListener("scroll", updateActiveLink);
        window.addEventListener("load", updateActiveLink); // Also run on load
    };

    const initThemeToggle = () => {
        const themeToggle = document.querySelector(".theme-toggle");
        const htmlElement = document.documentElement;
        if (!themeToggle) return;

        const savedTheme = localStorage.getItem("theme") ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        htmlElement.setAttribute("data-theme", savedTheme);

        themeToggle.addEventListener("click", () => {
            const newTheme = htmlElement.getAttribute("data-theme") === "light" ? "dark" : "light";
            htmlElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    };

    const initCategoryDisplay = () => {
        const categoryItems = document.querySelectorAll(".category-item");
        const contentSections = document.querySelectorAll("#content-display > .content-section");
        const contentPlaceholder = document.querySelector("#content-display-area .content-placeholder");
        const contentDisplayArea = document.getElementById("content-display-area");
        const header = document.querySelector("header");
        if (categoryItems.length === 0 || !contentDisplayArea) {
            return;
        }

        const headerHeight = header?.offsetHeight || 70;

        const showCategory = (categoryId) => {
            categoryItems.forEach((item) => item.classList.remove("active"));
            const activeItem = document.querySelector(`.category-item[data-category="${categoryId}"]`);
            if (activeItem) activeItem.classList.add("active");

            contentSections.forEach((section) => section.style.display = "none");
            if (contentPlaceholder) contentPlaceholder.style.display = "none";

            const selectedSection = document.getElementById(categoryId);
            if (selectedSection) {
                selectedSection.style.display = "block";
                try {
                    const rect = selectedSection.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const targetPosition = rect.top + scrollTop - headerHeight - 20;
                    window.scrollTo({ top: targetPosition, behavior: "smooth" });
                    setTimeout(() => {
                        const currentPosition = window.scrollY;
                        if (Math.abs(currentPosition - targetPosition) > 5) {
                            selectedSection.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                    }, 500);
                } catch (error) {
                    selectedSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            } else {
                if (contentPlaceholder) contentPlaceholder.style.display = "flex";
            }
        };

        categoryItems.forEach((item) => {
            item.addEventListener("click", () => {
                const categoryId = item.getAttribute("data-category");
                if (item.classList.contains("active")) {
                    item.classList.remove("active");
                    document.getElementById(categoryId).style.display = "none";
                    if (contentPlaceholder) contentPlaceholder.style.display = "flex";
                } else {
                    showCategory(categoryId);
                }
            });
        });

        if (contentPlaceholder) contentPlaceholder.style.display = "flex";
        contentSections.forEach((section) => section.style.display = "none");
    };

    const initScrollButtons = () => {
        const scrollDownArrow = document.querySelector(".scroll-down a");
        const scrollTopContainer = document.querySelector(".scroll-top");
        const header = document.querySelector("header");

        if (scrollDownArrow && header) {
            scrollDownArrow.addEventListener("click", (e) => {
                e.preventDefault();
                const targetSection = document.querySelector(scrollDownArrow.getAttribute("href"));
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - header.offsetHeight,
                        behavior: "smooth"
                    });
                }
            });
        }

        if (scrollTopContainer) {
            scrollTopContainer.querySelector("a").addEventListener("click", (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
            window.addEventListener("scroll", debounce(() => {
                scrollTopContainer.classList.toggle("visible", window.scrollY > 300);
            }, 50));
        }
    };

    const initHeroParallax = () => {
        const heroSection = document.querySelector(".hero");
        if (!heroSection) return;

        window.addEventListener("scroll", debounce(() => {
            heroSection.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
        }, 10));
    };

    // Global IntersectionObserver for scroll animations
    let globalScrollObserver;
    const initScrollReveal = () => {
        if (globalScrollObserver) { // Return existing observer if already initialized
            return { observer: globalScrollObserver };
        }
        globalScrollObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });

        document.querySelectorAll(
            ".animate-on-scroll, .book-item, .semester-item, .resource-item, .category-item, .blog-post-preview, .profile-bio-container, .typewriter-code, .education, .skills-overview, .social-links, .contact-form"
        ).forEach((el) => {
            if (!el.classList.contains("animate-on-scroll")) { // Add class if not present
                el.classList.add("animate-on-scroll");
            }
            globalScrollObserver.observe(el);
        });
        return { observer: globalScrollObserver }; // Return the observer for specific use cases if needed
    };


    const initTypewriter = () => {
        const heroTitle = document.querySelector(".hero-content h1");
        if (!heroTitle || !heroTitle.textContent.trim()) return;

        const text = heroTitle.textContent.trim();
        heroTitle.textContent = "";
        heroTitle.style.opacity = "1";
        let i = 0;

        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text[i++];
                setTimeout(typeWriter, 70);
            }
        };
        setTimeout(typeWriter, 1200);
    };

    // Blog section - WordPress version.
    // TO ADD A NEW POST: copy one {...} block below, paste it at the TOP of the list, and edit the values.
    const initBlogSection = (moreText = "Show More Posts", lessText = "Show Less Posts") => {
        const blogPostsData = [

            {
                id: "blog1",
                title: "Essential Software For Chemical Engineer",
                url: "https://amritkhnl.wordpress.com/2026/10/01/essential-software-for-chemical-engineers/", // <- put your WordPress post URL here
                previewImage: "https://bit.ly/amritkblog1",
                category: "Software",
                date: "2025-05-02",
                snippet: "The history of chemical engineering in Nepal may be short, but its development has been promising. Originating after the Industrial Revolution, this field can significantly contribute to Nepal's pharmaceutical, food processing, cement, environmental protection, and renewable energy sectors."
            },
            {
                id: "blog2",
                title: "Chemical Engineering in Nepal: Opportunities and Challenges",
                url: "https://amritkhnl.wordpress.com/2026/10/01/chemical-engineering-in-nepal/", // <- put your WordPress post URL here
                previewImage: "https://bit.ly/amritkblog2",
                category: "Career",
                date: "2025-05-02",
                snippet: "The history of chemical engineering in Nepal may be short, but its development has been promising. Originating after the Industrial Revolution, this field can significantly contribute to Nepal's pharmaceutical, food processing, cement, environmental protection, and renewable energy sectors."
            },
        ];

        const container = document.querySelector(".blog-posts-container");
        if (!container) { console.error(".blog-posts-container not found."); return; }
        const toggleBtn = document.querySelector("#toggleBtn");
        const searchInput = document.getElementById("blogSearch");
        const catBox = document.getElementById("blogCats");
        const modal = document.getElementById("blogModal");
        const mTitle = document.getElementById("modalBlogTitle");
        const article = document.getElementById("blogArticle");
        const mLink = document.getElementById("viewOnWordPressLink");
        const progress = document.getElementById("readProgress");
        const mBody = modal?.querySelector(".modal-body");
        const initialVisibleCount = 3;
        let isAllVisible = false, query = "", category = "All", current = null, currentPost = null;
        const cache = new Map();

        const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
        const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
        const matches = (p) => (category === "All" || p.category === category) &&
            `${p.title} ${p.snippet} ${p.category || ""}`.toLowerCase().includes(query);

        // ---- SEO: structured data for the blog list ----
        const ld = document.createElement("script");
        ld.type = "application/ld+json";
        ld.textContent = JSON.stringify({
            "@context": "https://schema.org", "@type": "Blog", name: "Amrit Khanal's Blog", url: location.origin + "/#blogs",
            blogPost: blogPostsData.map((p) => ({
                "@type": "BlogPosting", headline: p.title, url: p.url, image: p.previewImage, description: p.snippet,
                datePublished: p.date, author: { "@type": "Person", name: "Amrit Khanal" }
            }))
        });
        document.head.appendChild(ld);

        // ---- Cards ----
        const renderCategories = () => {
            if (!catBox) return;
            const cats = [...new Set(blogPostsData.map((p) => p.category).filter(Boolean))];
            catBox.innerHTML = cats.length < 2 ? "" : ["All", ...cats].map((c) =>
                `<button type="button" class="blog-chip${c === category ? " active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
        };

        const displayBlogPreviews = () => {
            const list = blogPostsData.filter(matches);
            const shown = isAllVisible ? list : list.slice(0, initialVisibleCount);
            container.innerHTML = !list.length
                ? '<p style="text-align:center;color:var(--text-light);grid-column:1/-1;">No posts found.</p>'
                : shown.map((p) => `
        <article class="blog-post-preview animate-on-scroll">
          <div class="preview-media">
            ${p.previewImage ? `<img src="${esc(p.previewImage)}" alt="${esc(p.title)}" class="preview-image" loading="lazy" width="600" height="200">` : ""}
            ${p.category ? `<span class="post-badge">${esc(p.category)}</span>` : ""}
          </div>
          <div class="post-meta"><i class="far fa-calendar-alt"></i><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time></div>
          <h3>${esc(p.title)}</h3>
          <p class="snippet">${esc(p.snippet)}</p>
          <div class="actions">
            <button class="btn primary-btn read-more-btn" data-id="${esc(p.id)}" aria-label="Read ${esc(p.title)} on this site">Read More</button>
            <!-- <a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="btn secondary-btn" aria-label="View ${esc(p.title)} on WordPress">View on WordPress</a> -->
          </div>
        </article>`).join("");

            const { observer } = initScrollReveal();
            container.querySelectorAll(".blog-post-preview").forEach((el) => observer.observe(el));

            if (toggleBtn) {
                toggleBtn.textContent = isAllVisible ? lessText : moreText;
                toggleBtn.classList.toggle("view-less", isAllVisible);
                toggleBtn.style.display = list.length <= initialVisibleCount ? "none" : "inline-flex";
            }
        };

        // ---- Read on this site (article loads inside the popup) ----
        const wpApi = (url) => {
            try {
                const u = new URL(url);
                return `https://public-api.wordpress.com/rest/v1.1/sites/${u.hostname}/posts/slug:${u.pathname.split("/").filter(Boolean).pop()}`;
            } catch { return null; }
        };
        const clean = (html) => {
            const doc = new DOMParser().parseFromString(html, "text/html");
            doc.querySelectorAll("script,style,object,embed,form").forEach((n) => n.remove());
            doc.querySelectorAll("*").forEach((n) => [...n.attributes].forEach((a) => { if (/^on/i.test(a.name)) n.removeAttribute(a.name); }));
            doc.querySelectorAll("img").forEach((i) => { i.loading = "lazy"; });
            doc.querySelectorAll("a[href]").forEach((a) => { a.target = "_blank"; a.rel = "noopener noreferrer"; });
            return doc.body.innerHTML;
        };
        const loadArticle = async (post) => {
            if (cache.has(post.id)) return cache.get(post.id);
            const api = wpApi(post.url);
            if (!api) return null;
            try {
                const r = await fetch(api);
                if (!r.ok) throw new Error(r.status);
                const html = clean((await r.json()).content || "");
                if (html) cache.set(post.id, html);
                return html || null;
            } catch { return null; }
        };

        const openModalWithPost = async (post) => {
            if (!modal || !article) { window.open(post.url, "_blank"); return; }
            current = post.id;
            currentPost = post;
            closeShareMenu();
            mTitle.textContent = post.title;
            mLink.href = post.url;
            article.innerHTML = '<div class="article-skeleton"><span></span><span></span><span></span><span></span></div>';
            if (mBody) mBody.scrollTop = 0;
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
            history.replaceState(null, "", `#post-${post.id}`);
            modal.querySelector(".close-button")?.focus();

            const html = await loadArticle(post);
            if (current !== post.id) return; // closed or switched while loading
            const mins = html ? Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200)) : 0;
            article.innerHTML = html
                ? `<h1 class="article-title">${esc(post.title)}</h1>
                   <div class="article-meta">${post.category ? `<span class="post-badge static">${esc(post.category)}</span>` : ""}<span><i class="far fa-calendar-alt"></i> ${fmtDate(post.date)}</span><span><i class="far fa-clock"></i> ${mins} min read</span></div>
                   ${post.previewImage ? `<img class="article-hero" src="${esc(post.previewImage)}" alt="${esc(post.title)}">` : ""}
                   <div class="article-body">${html}</div>
                   <div class="article-end"><p>Enjoyed this article? Share it:</p><button type="button" class="btn primary-btn" data-share="copy"><i class="far fa-copy"></i>&nbsp;Copy Link</button></div>`
                : `<p class="article-note">Showing the original page. If it stays blank, use <strong>View on WordPress</strong> below.</p>
                   <iframe class="blog-frame" src="${esc(post.url)}" title="${esc(post.title)}"></iframe>`;
        };

        const closeBlogModal = () => {
            if (!modal) return;
            current = null;
            currentPost = null;
            closeShareMenu();
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("modal-open");
            history.replaceState(null, "", location.pathname + location.search);
            setTimeout(() => { if (current === null && article) article.innerHTML = ""; }, 300);
        };

        container.addEventListener("click", (e) => {
            const btn = e.target.closest(".read-more-btn");
            if (!btn) return;
            const post = blogPostsData.find((p) => p.id === btn.dataset.id);
            if (post) openModalWithPost(post);
        });
        if (modal) {
            modal.querySelectorAll(".close-button, .close-modal-footer-btn").forEach((b) => b.addEventListener("click", closeBlogModal));
            modal.addEventListener("click", (e) => { if (e.target === modal) closeBlogModal(); });
            document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeBlogModal(); });
            mBody?.addEventListener("scroll", () => {
                if (progress) progress.style.width = (mBody.scrollTop / ((mBody.scrollHeight - mBody.clientHeight) || 1)) * 100 + "%";
            });
        }

        // ---- Share (copy link) + text size ----
        const shareBtn = document.getElementById("shareBtn");
        const shareMenu = document.getElementById("shareMenu");
        const toast = document.getElementById("blogToast");
        let toastTimer;
        const showToast = (t) => {
            if (!toast) return;
            toast.textContent = t;
            toast.classList.add("show");
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
        };
        const postLink = () => `${location.href.split("#")[0]}#post-${currentPost.id}`;
        function closeShareMenu() {
            if (shareMenu) shareMenu.hidden = true;
            shareBtn?.setAttribute("aria-expanded", "false");
        }
        const copyText = async (text) => {
            try { await navigator.clipboard.writeText(text); }
            catch {
                const ta = document.createElement("textarea");
                ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
                document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
            }
            showToast("Link copied to clipboard");
        };
        const refreshShareLinks = () => {
            if (!currentPost || !shareMenu) return;
            const u = encodeURIComponent(postLink()), t = encodeURIComponent(currentPost.title);
            const map = {
                whatsapp: `https://wa.me/?text=${t}%20${u}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
                x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`
            };
            shareMenu.querySelectorAll("a[data-share]").forEach((a) => { a.href = map[a.dataset.share] || "#"; });
            const nativeBtn = shareMenu.querySelector('[data-share="native"]');
            if (nativeBtn) nativeBtn.hidden = !navigator.share;
        };
        shareBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            refreshShareLinks();
            shareMenu.hidden = !shareMenu.hidden;
            shareBtn.setAttribute("aria-expanded", String(!shareMenu.hidden));
        });
        modal?.addEventListener("click", (e) => {
            const item = e.target.closest("[data-share]");
            if (item && currentPost) {
                if (item.dataset.share === "copy") copyText(postLink());
                else if (item.dataset.share === "native") navigator.share({ title: currentPost.title, url: postLink() }).catch(() => { });
                if (item.tagName !== "A") closeShareMenu();
            } else if (!e.target.closest(".share-wrap")) closeShareMenu();
        });
        document.getElementById("copyLinkFooter")?.addEventListener("click", () => { if (currentPost) copyText(postLink()); });
        modal?.querySelector(".close-button")?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") closeBlogModal(); });

        let readSize = 1.1;
        try { readSize = parseFloat(localStorage.getItem("blogReadSize")) || 1.1; } catch { }
        const applySize = () => article?.style.setProperty("--read-size", readSize + "rem");
        const changeSize = (d) => {
            readSize = Math.min(1.5, Math.max(0.9, +(readSize + d).toFixed(2)));
            applySize();
            try { localStorage.setItem("blogReadSize", readSize); } catch { }
        };
        document.getElementById("fontUp")?.addEventListener("click", () => changeSize(0.1));
        document.getElementById("fontDown")?.addEventListener("click", () => changeSize(-0.1));
        applySize();

        // ---- Search, filter, show more ----
        toggleBtn?.addEventListener("click", () => {
            const wasAll = isAllVisible;
            isAllVisible = !isAllVisible;
            displayBlogPreviews();
            if (wasAll) document.getElementById("blogs")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        searchInput?.addEventListener("input", debounce(() => {
            query = searchInput.value.trim().toLowerCase();
            isAllVisible = query !== "";
            displayBlogPreviews();
        }, 150));
        catBox?.addEventListener("click", (e) => {
            const chip = e.target.closest(".blog-chip");
            if (!chip) return;
            category = chip.dataset.cat;
            isAllVisible = category !== "All";
            renderCategories();
            displayBlogPreviews();
        });

        renderCategories();
        displayBlogPreviews();

        // Shareable link: yoursite.com/#post-blog1 opens that article directly
        const m = location.hash.match(/^#post-(.+)$/);
        if (m) { const p = blogPostsData.find((x) => x.id === m[1]); if (p) openModalWithPost(p); }
    };

    const scriptURL = 'https://script.google.com/macros/s/AKfycbzrrvgJcSa_MrmnSaCW4aiwXzuwVpdEjXZSbXQGY8-uKyif71reDBk_G590OMXOFPZ6Rg/exec';
    const contactForm = document.getElementById('contactForm');

    const initContactForm = () => {
        if (contactForm) {
            contactForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const name = contactForm.name.value.trim();
                const email = contactForm.email.value.trim();
                const subject = contactForm.subject.value.trim();
                const message = contactForm.message.value.trim();
                let isValid = true;

                if (!name) {
                    isValid = false; alert('Name is required.'); contactForm.name.focus();
                } else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    isValid = false; alert('Valid email is required.'); contactForm.email.focus();
                } else if (!subject) {
                    isValid = false; alert('Subject is required.'); contactForm.subject.focus();
                } else if (!message) {
                    isValid = false; alert('Message is required.'); contactForm.message.focus();
                }

                if (!isValid) return;

                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('subject', subject);
                formData.append('message', message);

                fetch(scriptURL, { method: 'POST', body: formData })
                    .then(response => response.json())
                    .then(data => {
                        if (data.result === 'success') {
                            alert(`Thank you, ${name} ! Your message has been sent successfully. It will be reviewed shortly.`);
                            contactForm.reset();
                        } else {
                            alert('Error submitting form. Please try again.');
                        }
                    })
                    .catch(error => {
                        alert('Error submitting form. Please try again.');
                    });
            });
        }
    };

    const initFooterYear = () => { // Wrapped your footer year logic in a function
        const yearSpan = document.getElementById('currentYear');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    };

    initPreloader();
    initMobileMenu();
    initHeaderScroll();
    initNavHighlight();
    initThemeToggle();
    initCategoryDisplay();
    initScrollButtons();
    initHeroParallax();
    initScrollReveal(); // Initialize the global observer
    initTypewriter();
    initBlogSection("View More Blogs", "Back to previous"); // Text parameters for the button
    initContactForm();
    initFooterYear();
});

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

    // Blog section - UPDATED
    const initBlogSection = (moreText = "Show More Posts", lessText = "Show Less Posts") => {
        const blogPostsData = [
            {
                id: "blog1",
                title: "Essential Software for Chemical Engineers",
                bloggerUrl: "https://eramrit.blogspot.com/2025/05/essential-software-for-chemical.html",
                previewImage: "https://bit.ly/amritkblog1",
                snippet: "Check out the best tools for chemical engineers! Use Aspen Plus and HYSYS to test ideas, AutoCAD and SolidWorks to draw designs, MATLAB, Python, and Minitab to study data, and Simulink, LabVIEW, and DeltaV to control processes. These make work easier and smarter! Great for students and experts."
            },
            {
                id: "blog2",
                title: "Chemical Engineering in Nepal: Opportunities and Challenges",
                bloggerUrl: "https://eramrit.blogspot.com/2025/05/chemical-engineering-in-nepal.html",
                previewImage: "https://bit.ly/amritkblog2",
                snippet: "The history of chemical engineering in Nepal may be short, but its development has been promising. Originating after the Industrial Revolution, this field can significantly contribute to Nepal's pharmaceutical, food processing, cement, environmental protection, and renewable energy sectors."
            }/* 
            {
                id: "blog3",
                title: "Mastering Remote Work: Tips for Productivity",
                bloggerUrl: "https://eramritkhanal.blogspot.com/your-remote-work-link-here",
                previewImage: "Images/blog-placeholder-3.jpg",
                snippet: "Practical advice and strategies to stay focused, organized, and maintain a healthy work-life balance while working from home effectively."
            },
            {
                id: "blog4",
                title: "Essential Software for Chemical Engineers (Copy)",
                bloggerUrl: "https://eramrit.blogspot.com/2025/05/essential-software-for-chemical.html",
                previewImage: "https://bit.ly/amritkblog1",
                snippet: "Check out the best tools for chemical engineers! Use Aspen Plus and HYSYS to test ideas, AutoCAD and SolidWorks to draw designs, MATLAB, Python, and Minitab to study data, and Simulink, LabVIEW, and DeltaV to control processes. These make work easier and smarter! Great for students and experts."
            },
            {
                id: "blog5",
                title: "Chemical Engineering in Nepal (Copy)",
                bloggerUrl: "https://eramrit.blogspot.com/2025/05/chemical-engineering-in-nepal.html",
                previewImage: "https://bit.ly/amritkblog2",
                snippet: "The history of chemical engineering in Nepal may be short, but its development has been promising. Originating after the Industrial Revolution, this field can significantly contribute to Nepal's pharmaceutical, food processing, cement, environmental protection, and renewable energy sectors."
            },
            {
                id: "blog6",
                title: "Mastering Remote Work (Copy)",
                bloggerUrl: "https://eramritkhanal.blogspot.com/your-remote-work-link-here",
                previewImage: "Images/blog-placeholder-3.jpg",
                snippet: "Practical advice and strategies to stay focused, organized, and maintain a healthy work-life balance while working from home effectively."
            }*/
        ];

        const blogPostsContainer = document.querySelector(".blog-posts-container");
        const blogModal = document.getElementById("blogModal");

        if (!blogPostsContainer) {
            console.error(".blog-posts-container not found. Blog section will not initialize.");
            return;
        }

        const modalBlogTitle = document.getElementById("modalBlogTitle");
        const blogIframe = document.getElementById("blogIframe");
        const viewOnBloggerLinkModal = document.getElementById("viewOnBloggerLink");
        const closeModalButtons = document.querySelectorAll("#blogModal .close-button, #blogModal .close-modal-footer-btn");

        const initialVisibleCount = 3;
        let visibleCount = initialVisibleCount;
        let isAllVisible = false;
        const toggleBtn = document.querySelector("#toggleBtn");

        if (!toggleBtn) {
            console.warn("Toggle button #toggleBtn not found! Show More/Less functionality will be disabled.");
        }

        const displayBlogPreviews = () => {
            blogPostsContainer.innerHTML = blogPostsData.length === 0
                ? '<p style="text-align: center; color: var(--text-light);">No blog posts available yet. Check back soon!</p>'
                : blogPostsData.slice(0, visibleCount).map(post => `
        <article class="blog-post-preview animate-on-scroll">
          ${post.previewImage ? `<img src="${post.previewImage}" alt="${post.title} preview" class="preview-image">` : ""}
          <h3>${post.title}</h3>
          <p class="snippet">${post.snippet}</p>
          <div class="actions">
            <button class="btn primary-btn read-more-btn" data-id="${post.id}" aria-label="Read more about ${post.title}">Read More</button>
            <a href="${post.bloggerUrl}" target="_blank" rel="noopener noreferrer" class="btn secondary-btn view-on-blogger-preview" aria-label="View ${post.title} on Blogger">View on Blogger</a>
          </div>
        </article>
      `).join("");

            // Re-apply scroll reveal to newly added blog post previews
            const scrollRevealInstance = initScrollReveal(); // Get the global observer instance
            if (scrollRevealInstance && scrollRevealInstance.observer) {
                document.querySelectorAll(".blog-posts-container .blog-post-preview.animate-on-scroll").forEach((el) => {
                    scrollRevealInstance.observer.observe(el);
                });
            }


            if (toggleBtn) {
                toggleBtn.textContent = isAllVisible ? lessText : moreText;
                toggleBtn.classList.toggle("view-less", isAllVisible);

                if (blogPostsData.length <= initialVisibleCount) {
                    toggleBtn.style.display = 'none';
                } else {
                    toggleBtn.style.display = 'inline-flex';
                }
            }
        };

        const openModalWithPost = ({ id, title, bloggerUrl }) => {
            if (!blogModal || !modalBlogTitle || !blogIframe || !viewOnBloggerLinkModal) {
                if (bloggerUrl) window.open(bloggerUrl, '_blank'); // Fallback to open in new tab
                return;
            }
            modalBlogTitle.textContent = title;
            blogIframe.src = bloggerUrl;
            viewOnBloggerLinkModal.href = bloggerUrl;
            blogModal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
            const firstFocusable = blogModal.querySelector(".close-button, a.btn, button.btn, [tabindex]:not([tabindex='-1'])");
            if (firstFocusable) firstFocusable.focus();
        };

        const closeBlogModal = () => {
            if (!blogModal || !blogIframe) return;
            blogModal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("modal-open");
            setTimeout(() => { if (blogIframe) blogIframe.src = "about:blank"; }, 300);
        };

        blogPostsContainer.addEventListener("click", (e) => {
            const readMoreBtn = e.target.closest(".read-more-btn");
            if (readMoreBtn) {
                const postId = readMoreBtn.dataset.id;
                const postData = blogPostsData.find((p) => p.id === postId);
                if (postData) openModalWithPost(postData);
            }
        });

        if (blogModal) {
            closeModalButtons.forEach((btn) => btn.addEventListener("click", closeBlogModal));
            blogModal.addEventListener("click", (e) => {
                if (e.target === blogModal) closeBlogModal();
            });
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && blogModal.getAttribute("aria-hidden") === "false") {
                    closeBlogModal();
                }
            });
        }

        if (toggleBtn) {
            toggleBtn.addEventListener("click", () => {
                const wasAllVisible = isAllVisible;
                isAllVisible = !isAllVisible;
                visibleCount = isAllVisible ? blogPostsData.length : initialVisibleCount;
                displayBlogPreviews();

                if (wasAllVisible && !isAllVisible) {
                    const blogSectionElement = document.getElementById("blogs");
                    if (blogSectionElement) {
                        blogSectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
                    } else if (blogPostsContainer) {
                        blogPostsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            });
        }
        displayBlogPreviews();
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
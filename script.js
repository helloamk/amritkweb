document.addEventListener("DOMContentLoaded", () => {
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
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

  const initNavHighlight = () => {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("#navbar a");
    const header = document.querySelector("header");
    if (sections.length === 0 || navLinks.length === 0) return;

    const headerHeight = header?.offsetHeight || 70;
    const updateActiveLink = debounce(() => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      let current = "";

      sections.forEach((section) => {
        if (scrollY >= section.offsetTop - headerHeight - 20) {
          current = section.id;
        }
      });

      if (window.innerHeight + scrollY + 50 >= document.body.scrollHeight) {
        current = sections[sections.length - 1].id;
      }

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
      });
    }, 50);

    window.addEventListener("scroll", updateActiveLink);
    window.addEventListener("load", updateActiveLink);
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
      },/*
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
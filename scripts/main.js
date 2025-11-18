/*
Copyright (c) 2025, Steven Tse
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
*/

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initThemeToggle();
  initBackToTop();
  initSmoothScroll();
  initFormValidation();
  initProjectFilters();
  initBlogFilters();
  initSkillAnimations();
  initPageTransitions();
});

// Mobile Menu Toggle
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileNav = document.getElementById("mobile-nav");

  if (mobileMenuBtn && mobileNav) {
    // Ensure ARIA attributes are present
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    mobileMenuBtn.setAttribute("aria-controls", "mobile-nav");
    mobileNav.setAttribute("aria-hidden", "true");
    mobileNav.setAttribute(
      "role",
      mobileNav.getAttribute("role") || "navigation"
    );

    mobileMenuBtn.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("active");
      mobileMenuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      mobileNav.setAttribute("aria-hidden", isOpen ? "false" : "true");

      if (isOpen) {
        // Focus first focusable item in mobile nav
        const firstItem = mobileNav.querySelector(".menu-item");
        if (firstItem) firstItem.focus();
      } else {
        // Return focus to the menu button
        mobileMenuBtn.focus();
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", function (event) {
      if (
        !mobileMenuBtn.contains(event.target) &&
        !mobileNav.contains(event.target)
      ) {
        if (mobileNav.classList.contains("active")) {
          mobileNav.classList.remove("active");
          mobileMenuBtn.setAttribute("aria-expanded", "false");
          mobileNav.setAttribute("aria-hidden", "true");
        }
      }
    });

    // Close mobile menu on Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("active")) {
        mobileNav.classList.remove("active");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");
        mobileMenuBtn.focus();
      }
    });
  }
}

// Dark Theme Toggle
function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem("theme") || "light";
  if (currentTheme === "dark") {
    body.classList.add("dark-theme");
  }

  if (themeToggle) {
    // expose state to assistive tech
    const isDark = body.classList.contains("dark-theme");
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");

    themeToggle.addEventListener("click", function () {
      body.classList.toggle("dark-theme");

      // Save theme preference
      const theme = body.classList.contains("dark-theme") ? "dark" : "light";
      localStorage.setItem("theme", theme);

      // Update aria state
      const pressed = body.classList.contains("dark-theme");
      themeToggle.setAttribute("aria-pressed", pressed ? "true" : "false");

      // Optional: Add visual feedback
      this.style.transform = "rotate(360deg)";
      setTimeout(() => {
        this.style.transform = "rotate(0deg)";
      }, 300);
    });
  }
}

// Back to Top Button
function initBackToTop() {
  const backToTopBtn = document.getElementById("back-to-top");

  if (backToTopBtn) {
    window.addEventListener("scroll", function () {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add("visible");
        backToTopBtn.setAttribute("aria-hidden", "false");
      } else {
        backToTopBtn.classList.remove("visible");
        backToTopBtn.setAttribute("aria-hidden", "true");
      }
    });

    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
  // Ignore anchors that are plain hashes ("#") to avoid intercepting
  // toolbar or router anchors. Scope selection to same-page anchors.
  document
    .querySelectorAll('a[href^="#"]:not([href="#"])')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      });
    });
}

// Form Validation (Contact Page)
function initFormValidation() {
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Scope queries to the form to minimize global DOM lookups
      const name = contactForm.querySelector("#name");
      const email = contactForm.querySelector("#email");
      const subject = contactForm.querySelector("#subject");
      const message = contactForm.querySelector("#message");

      // Reset previous error states
      clearErrors();

      let isValid = true;

      // Validate name
      if (!name || !name.value.trim()) {
        if (name) showError(name, "Name is required");
        isValid = false;
      }

      // Validate email
      if (!email || !email.value.trim()) {
        if (email) showError(email, "Email is required");
        isValid = false;
      } else if (!isValidEmail(email.value)) {
        showError(email, "Please enter a valid email address");
        isValid = false;
      }

      // Validate subject
      if (!subject || !subject.value.trim()) {
        if (subject) showError(subject, "Subject is required");
        isValid = false;
      }

      // Validate message
      if (!message || !message.value.trim()) {
        if (message) showError(message, "Message is required");
        isValid = false;
      } else if (message.value.trim().length < 10) {
        showError(message, "Message must be at least 10 characters");
        isValid = false;
      }

      if (isValid) {
        // Form is valid - show success message
        showSuccessMessage(contactForm);
        contactForm.reset();
      }
    });
  }
}

function showError(input, message) {
  const formGroup = input.parentElement;
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message text-red mt-1";
  errorDiv.textContent = message;
  formGroup.appendChild(errorDiv);
  input.classList.add("error");
}

function clearErrors() {
  document
    .querySelectorAll(".error-message")
    .forEach((error) => error.remove());
  document
    .querySelectorAll(".error")
    .forEach((input) => input.classList.remove("error"));
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showSuccessMessage(formElement) {
  const successDiv = document.createElement("div");
  successDiv.className = "flash flash-success mt-3";
  successDiv.innerHTML = `
        <svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
            <path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
        </svg>
        Thank you for your message! I'll get back to you soon.
    `;

  const form = formElement || document.getElementById("contact-form");
  if (form && form.parentElement) {
    form.parentElement.insertBefore(successDiv, form);
  } else if (form) {
    // Fallback: append to body
    document.body.appendChild(successDiv);
  }

  // Remove success message after 5 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}

// Project Filter (Portfolio Page)
function initProjectFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const filter = this.getAttribute("data-filter");

        // Update active button
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        // Filter projects
        projectCards.forEach((card) => {
          if (
            filter === "all" ||
            card.getAttribute("data-category") === filter
          ) {
            card.style.display = "block";
            card.classList.add("fade-in");
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }
}

// Blog Filter (Blog Page)
function initBlogFilters() {
  const filterButtons = document.querySelectorAll(".blog-filter-btn");
  const blogCards = document.querySelectorAll(".blog-card");

  if (filterButtons.length > 0 && blogCards.length > 0) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const filter = this.getAttribute("data-filter");

        // Update active button
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        // Filter blog posts
        blogCards.forEach((card) => {
          if (
            filter === "all" ||
            card.getAttribute("data-category") === filter
          ) {
            card.style.display = "block";
            card.classList.add("fade-in");
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }
}

// Skill Progress Animation (Skills Page)
function initSkillAnimations() {
  const skillBars = document.querySelectorAll(".skill-progress");

  if (skillBars.length > 0) {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const skillBar = entry.target;
          const targetWidth = skillBar.getAttribute("data-level") + "%";
          skillBar.style.width = targetWidth;
          observer.unobserve(skillBar);
        }
      });
    }, observerOptions);

    skillBars.forEach((bar) => {
      bar.style.width = "0%";
      observer.observe(bar);
    });
  }
}

// Page Transition Effects
function initPageTransitions() {
  // Add fade-in effect to main sections
  const sections = document.querySelectorAll("section, .Box, .timeline-item");

  if (sections.length > 0) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      observer.observe(section);
    });
  }
}

// Blog Search Functionality
function initBlogSearch() {
  const searchInput = document.getElementById("blog-search");
  const blogCards = document.querySelectorAll(".blog-card");

  if (searchInput && blogCards.length > 0) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();

      blogCards.forEach((card) => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        const excerpt = card
          .querySelector(".blog-excerpt")
          .textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll(".Label"))
          .map((label) => label.textContent.toLowerCase())
          .join(" ");

        if (
          title.includes(searchTerm) ||
          excerpt.includes(searchTerm) ||
          tags.includes(searchTerm)
        ) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  }
}

// Initialize search if on blog page
if (window.location.pathname.includes("blog.html")) {
  initBlogSearch();
}

// Add active state to current page in navigation
function setActiveNavLink() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".Header-link, .menu-item");

  navLinks.forEach((link) => {
    // Normalize link href to a filename (handles absolute URLs and hash links)
    const href = link.getAttribute("href") || "";
    const urlParts = href.split("/");
    const linkPath = urlParts.pop() || urlParts.pop() || "";

    if (
      linkPath === currentPath ||
      (linkPath === "" && currentPath === "index.html")
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }

    // Ensure clicks update active state (useful for SPA-like nav behavior)
    link.addEventListener("click", function () {
      document
        .querySelectorAll(".Header-link, .menu-item")
        .forEach((n) => n.classList.remove("active"));
      this.classList.add("active");

      // Close mobile nav after selecting an item (small screens)
      const mobileNav = document.getElementById("mobile-nav");
      if (mobileNav && mobileNav.classList.contains("active")) {
        mobileNav.classList.remove("active");
      }
    });
  });
}

setActiveNavLink();

// Utility function to debounce events
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

// Performance optimization for scroll events
const optimizedScroll = debounce(function () {
  // Additional scroll-based functionality can be added here
}, 100);

window.addEventListener("scroll", optimizedScroll);

// Log page load performance (for development)
window.addEventListener("load", function () {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log("Page load time: " + pageLoadTime + "ms");
});

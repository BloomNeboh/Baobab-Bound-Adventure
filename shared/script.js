// Baobab Bound Adventures - Shared JavaScript
// Theme toggle, language switching, animations, and common functionality

class BaobabAdventures {
  constructor() {
    this.currentLanguage = 'en';
    this.currentTheme = 'light';
    this.reviewsData = [];
    this.init();
  }

  init() {
    this.loadTheme();
    this.loadLanguage();
    this.setupEventListeners();
    this.initializeComponents();
    this.setupAnimations();
  }

  // Theme Management
  loadTheme() {
    const savedTheme = localStorage.getItem('baobab-theme') || 'light';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('baobab-theme', theme);
    this.updateThemeToggleIcon();
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  updateThemeToggleIcon() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
    }
  }

  // Language Management
  loadLanguage() {
    const savedLanguage = localStorage.getItem('baobab-language') || 'en';
    this.setLanguage(savedLanguage);
  }

  async setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('baobab-language', lang);
    
    try {
      const response = await fetch(`shared/lang/${lang}.json`);
      const translations = await response.json();
      this.updatePageContent(translations);
    } catch (error) {
      console.warn(`Language file for ${lang} not found, using English fallback`);
    }
  }

  updatePageContent(translations) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[key]) {
        if (element.tagName === 'INPUT' && element.type === 'submit') {
          element.value = translations[key];
        } else {
          element.textContent = translations[key];
        }
      }
    });
  }

  // Event Listeners
  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Language selector
    const languageSelector = document.querySelector('.language-selector');
    if (languageSelector) {
      languageSelector.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // FAQ Accordion
    this.setupFAQAccordion();

    // Reviews Carousel
    this.setupReviewsCarousel();

    // Gallery Lightbox
    this.setupGalleryLightbox();

    // Form Validation
    this.setupFormValidation();

    // Lazy Loading
    this.setupLazyLoading();
  }

  // FAQ Accordion
  setupFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => {
          // Close other items
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });
          // Toggle current item
          item.classList.toggle('active');
        });
      }
    });
  }

  // Reviews Carousel
  setupReviewsCarousel() {
    const carousel = document.querySelector('.reviews-carousel');
    if (!carousel) return;

    const container = carousel.querySelector('.reviews-container');
    const reviews = container.querySelectorAll('.review-card');
    let currentIndex = 0;

    if (reviews.length <= 1) return;

    // Auto-rotate reviews
    setInterval(() => {
      currentIndex = (currentIndex + 1) % reviews.length;
      container.style.transform = `translateX(-${currentIndex * 100}%)`;
    }, 5000);

    // Touch/swipe support
    let startX = 0;
    let isDragging = false;

    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });

    container.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left - next review
          currentIndex = (currentIndex + 1) % reviews.length;
        } else {
          // Swipe right - previous review
          currentIndex = (currentIndex - 1 + reviews.length) % reviews.length;
        }
        container.style.transform = `translateX(-${currentIndex * 100}%)`;
      }
    });
  }

  // Gallery Lightbox
  setupGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = this.createLightbox();

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('.gallery-img');
        if (img) {
          this.openLightbox(lightbox, img.src, img.alt);
        }
      });
    });
  }

  createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <span class="lightbox-close">&times;</span>
        <img class="lightbox-img" src="" alt="">
        <div class="lightbox-nav">
          <button class="lightbox-prev">&larr;</button>
          <button class="lightbox-next">&rarr;</button>
        </div>
      </div>
    `;

    // Add lightbox styles
    const style = document.createElement('style');
    style.textContent = `
      .lightbox {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        cursor: pointer;
      }
      .lightbox.active {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
      }
      .lightbox-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      .lightbox-close {
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 30px;
        cursor: pointer;
      }
      .lightbox-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
        display: flex;
        justify-content: space-between;
        pointer-events: none;
      }
      .lightbox-prev,
      .lightbox-next {
        background: rgba(255, 255, 255, 0.8);
        border: none;
        padding: 10px 15px;
        cursor: pointer;
        font-size: 18px;
        pointer-events: all;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(lightbox);
    return lightbox;
  }

  openLightbox(lightbox, src, alt) {
    const img = lightbox.querySelector('.lightbox-img');
    img.src = src;
    img.alt = alt;
    lightbox.classList.add('active');

    // Close on click outside image
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        this.closeLightbox(lightbox);
      }
    });

    // Close button
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
      this.closeLightbox(lightbox);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (lightbox.classList.contains('active')) {
        if (e.key === 'Escape') {
          this.closeLightbox(lightbox);
        }
      }
    });
  }

  closeLightbox(lightbox) {
    lightbox.classList.remove('active');
  }

  // Form Validation
  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
      } else if (field.type === 'email' && !this.isValidEmail(field.value)) {
        this.showFieldError(field, 'Please enter a valid email address');
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    return isValid;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Lazy Loading
  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Animations
  setupAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.card, .section-title, .process-step');
    animatedElements.forEach(el => observer.observe(el));
  }

  // Initialize Components
  initializeComponents() {
    this.loadReviewsData();
    this.initializeLanguageSelector();
  }

  async loadReviewsData() {
    try {
      const response = await fetch('shared/data/reviews.json');
      this.reviewsData = await response.json();
      this.renderReviews();
    } catch (error) {
      console.warn('Reviews data not found, using fallback');
      this.renderFallbackReviews();
    }
  }

  renderReviews() {
    const container = document.querySelector('.reviews-container');
    if (!container || !this.reviewsData.length) return;

    container.innerHTML = this.reviewsData.map(review => `
      <div class="review-card">
        <div class="review-rating">${'★'.repeat(review.rating)}</div>
        <p class="review-text">"${review.text}"</p>
        <p class="review-author">- ${review.author}</p>
      </div>
    `).join('');
  }

  renderFallbackReviews() {
    const container = document.querySelector('.reviews-container');
    if (!container) return;

    const fallbackReviews = [
      {
        rating: 5,
        text: "An absolutely incredible experience! The guides were knowledgeable and the wildlife viewing was beyond our expectations.",
        author: "Sarah Johnson"
      },
      {
        rating: 5,
        text: "Baobab Bound Adventures made our dream safari come true. Every detail was perfectly planned.",
        author: "Michael Chen"
      },
      {
        rating: 5,
        text: "The most authentic and memorable trip of our lives. Highly recommend to anyone seeking adventure.",
        author: "Emma Williams"
      }
    ];

    container.innerHTML = fallbackReviews.map(review => `
      <div class="review-card">
        <div class="review-rating">${'★'.repeat(review.rating)}</div>
        <p class="review-text">"${review.text}"</p>
        <p class="review-author">- ${review.author}</p>
      </div>
    `).join('');
  }

  initializeLanguageSelector() {
    const languageSelector = document.querySelector('.language-selector');
    if (!languageSelector) return;

    const languages = [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' },
      { code: 'es', name: 'Español' },
      { code: 'zh', name: '中文' },
      { code: 'ar', name: 'العربية' },
      { code: 'de', name: 'Deutsch' },
      { code: 'it', name: 'Italiano' },
      { code: 'ru', name: 'Русский' },
      { code: 'pt', name: 'Português' }
    ];

    languageSelector.innerHTML = languages.map(lang => 
      `<option value="${lang.code}">${lang.name}</option>`
    ).join('');

    languageSelector.value = this.currentLanguage;
  }

  // Utility Methods
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
      }
      .notification-info { background-color: #17a2b8; }
      .notification-success { background-color: #28a745; }
      .notification-warning { background-color: #ffc107; color: #212529; }
      .notification-error { background-color: #dc3545; }
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  // Booking Integration
  async createCheckoutSession(tourId, tourName, price) {
    try {
      const response = await fetch('/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId,
          tourName,
          price,
          currency: 'USD'
        })
      });

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      this.showNotification('Booking temporarily unavailable. Please contact us directly.', 'error');
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.baobabAdventures = new BaobabAdventures();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaobabAdventures;
}

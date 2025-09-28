/**
 * Navigation Component
 * Handles main navigation, smooth scrolling, and active section tracking
 */
import { BaseComponent } from './BaseComponent.js';
import { eventBus, EVENTS } from '../eventBus.js';
import { stateManager } from '../stateManager.js';
import { $, $$, debounce, throttle, scrollToElement } from '../utils/dom.js';

export class NavigationComponent extends BaseComponent {
  constructor(element, config = {}) {
    super(element, config);
    
    this.sections = [];
    this.currentSection = 'hero';
    this.isScrolling = false;
    this.lastScrollY = 0;
    this.mobileMenuOpen = false;
    
    // Bind methods
    this.handleScroll = throttle(this.handleScroll.bind(this), 16);
    this.handleResize = debounce(this.handleResize.bind(this), 250);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      sections: ['hero', 'about', 'skills', 'experience', 'projects', 'blog', 'contact'],
      smoothScrollDuration: 800,
      navHideThreshold: 100,
      sectionOffset: 100,
      className: 'navigation'
    };
  }

  async setup() {
    // Get navigation elements
    this.navLinks = $$('.nav-link', this.element);
    this.mobileToggle = $('.mobile-menu-toggle', this.element);
    this.navLinksContainer = $('.nav-links', this.element);
    
    // Initialize sections
    this.initializeSections();
    
    // Set initial active section
    this.updateActiveSection(this.currentSection);
  }

  async bindEvents() {
    // Navigation link clicks
    this.navLinks.forEach(link => {
      this.addEventListener(link, 'click', this.handleNavClick);
    });
    
    // Mobile menu toggle
    if (this.mobileToggle) {
      this.addEventListener(this.mobileToggle, 'click', this.handleMobileToggle);
    }
    
    // Window events
    this.addEventListener(window, 'scroll', this.handleScroll);
    this.addEventListener(window, 'resize', this.handleResize);
    this.addEventListener(document, 'keydown', this.handleKeydown);
    
    // State changes
    this.subscribeToState('currentSection', this.handleSectionChange.bind(this));
    this.subscribeToState('mobileMenuOpen', this.handleMobileMenuState.bind(this));
  }

  /**
   * Initialize section elements and observers
   */
  initializeSections() {
    this.sections = this.config.sections
      .map(sectionId => {
        const element = $(`#${sectionId}`);
        return element ? { id: sectionId, element } : null;
      })
      .filter(Boolean);

    // Set up intersection observer for section detection
    this.setupIntersectionObserver();
  }

  /**
   * Set up intersection observer for automatic section detection
   */
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: `-${this.config.sectionOffset}px 0px -60% 0px`,
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId !== this.currentSection) {
            this.currentSection = sectionId;
            stateManager.setState('currentSection', sectionId);
            this.updateActiveSection(sectionId);
          }
        }
      });
    }, options);

    // Observe all sections
    this.sections.forEach(section => {
      this.observer.observe(section.element);
    });
  }

  /**
   * Handle navigation link clicks
   */
  handleNavClick = (event) => {
    event.preventDefault();
    
    const link = event.currentTarget;
    const sectionId = link.getAttribute('data-section') || 
                     link.getAttribute('href')?.replace('#', '');
    
    if (sectionId) {
      this.navigateToSection(sectionId);
      
      // Close mobile menu if open
      if (this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    }
  }

  /**
   * Navigate to a specific section
   */
  navigateToSection(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return;

    this.isScrolling = true;
    
    // Update state
    stateManager.setState('currentSection', sectionId);
    
    // Smooth scroll to section
    scrollToElement(section.element, {
      behavior: 'smooth',
      offset: this.config.sectionOffset
    });
    
    // Update URL without triggering navigation
    if (history.pushState) {
      history.pushState(null, null, `#${sectionId}`);
    }
    
    // Emit navigation event
    eventBus.emit(EVENTS.SECTION_CHANGE, {
      from: this.currentSection,
      to: sectionId,
      element: section.element
    });
    
    // Reset scrolling flag after animation
    setTimeout(() => {
      this.isScrolling = false;
    }, this.config.smoothScrollDuration);
  }

  /**
   * Update active navigation link
   */
  updateActiveSection(sectionId) {
    // Remove active class from all links
    this.navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current section link
    const activeLink = Array.from(this.navLinks).find(link => {
      const linkSection = link.getAttribute('data-section') || 
                         link.getAttribute('href')?.replace('#', '');
      return linkSection === sectionId;
    });
    
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    if (this.config.debug) {
      console.log(`Navigation: Active section changed to ${sectionId}`);
    }
  }

  /**
   * Handle window scroll
   */
  handleScroll = () => {
    if (this.isScrolling) return;
    
    const currentScrollY = window.scrollY;
    
    // Handle navigation visibility
    this.handleNavigationVisibility(currentScrollY);
    
    // Emit scroll event
    eventBus.emit(EVENTS.SCROLL_UPDATE, {
      scrollY: currentScrollY,
      direction: currentScrollY > this.lastScrollY ? 'down' : 'up',
      delta: currentScrollY - this.lastScrollY
    });
    
    this.lastScrollY = currentScrollY;
  }

  /**
   * Handle navigation visibility based on scroll
   */
  handleNavigationVisibility(scrollY) {
    const shouldHide = scrollY > this.config.navHideThreshold && 
                      scrollY > this.lastScrollY;
    
    if (shouldHide && !this.element.classList.contains('hidden')) {
      this.element.classList.add('hidden');
    } else if (!shouldHide && this.element.classList.contains('hidden')) {
      this.element.classList.remove('hidden');
    }
  }

  /**
   * Handle mobile menu toggle
   */
  handleMobileToggle = () => {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    stateManager.setState('mobileMenuOpen', this.mobileMenuOpen);
  }

  /**
   * Handle mobile menu state changes
   */
  handleMobileMenuState(isOpen) {
    this.mobileMenuOpen = isOpen;
    
    // Update button attributes
    if (this.mobileToggle) {
      this.mobileToggle.setAttribute('aria-expanded', isOpen);
      this.mobileToggle.classList.toggle('active', isOpen);
    }
    
    // Update navigation container
    if (this.navLinksContainer) {
      this.navLinksContainer.classList.toggle('mobile-open', isOpen);
    }
    
    // Update body scroll
    document.body.classList.toggle('menu-open', isOpen);
    
    // Focus management
    if (isOpen) {
      this.trapFocusInMobileMenu();
    } else {
      this.releaseFocusTrap();
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    stateManager.setState('mobileMenuOpen', false);
  }

  /**
   * Handle keyboard navigation
   */
  handleKeydown(event) {
    // Close mobile menu on Escape
    if (event.key === 'Escape' && this.mobileMenuOpen) {
      this.closeMobileMenu();
      this.mobileToggle?.focus();
      return;
    }
    
    // Handle arrow key navigation in menu
    if (this.mobileMenuOpen && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      this.handleArrowKeyNavigation(event.key);
    }
  }

  /**
   * Handle arrow key navigation in mobile menu
   */
  handleArrowKeyNavigation(key) {
    const focusableLinks = Array.from(this.navLinks).filter(link => {
      return link.offsetParent !== null; // Is visible
    });
    
    const currentIndex = focusableLinks.indexOf(document.activeElement);
    let nextIndex;
    
    if (key === 'ArrowDown') {
      nextIndex = currentIndex + 1;
      if (nextIndex >= focusableLinks.length) nextIndex = 0;
    } else {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = focusableLinks.length - 1;
    }
    
    focusableLinks[nextIndex]?.focus();
  }

  /**
   * Trap focus in mobile menu
   */
  trapFocusInMobileMenu() {
    // Implementation would depend on your focus trap utility
    // For now, just focus the first link
    const firstLink = this.navLinks[0];
    if (firstLink) {
      firstLink.focus();
    }
  }

  /**
   * Release focus trap
   */
  releaseFocusTrap() {
    // Release any focus trapping
  }

  /**
   * Handle window resize
   */
  handleResize = () => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768 && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
    
    // Recalculate section positions
    this.updateSectionOffsets();
  }

  /**
   * Update section offsets after resize
   */
  updateSectionOffsets() {
    // Disconnect and reconnect observer to recalculate positions
    if (this.observer) {
      this.observer.disconnect();
      setTimeout(() => {
        this.sections.forEach(section => {
          this.observer.observe(section.element);
        });
      }, 100);
    }
  }

  /**
   * Handle section change from state
   */
  handleSectionChange(newSection) {
    if (newSection !== this.currentSection) {
      this.currentSection = newSection;
      this.updateActiveSection(newSection);
    }
  }

  /**
   * Get current section
   */
  getCurrentSection() {
    return this.currentSection;
  }

  /**
   * Navigate to next section
   */
  navigateToNextSection() {
    const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
    const nextIndex = (currentIndex + 1) % this.sections.length;
    const nextSection = this.sections[nextIndex];
    
    if (nextSection) {
      this.navigateToSection(nextSection.id);
    }
  }

  /**
   * Navigate to previous section
   */
  navigateToPreviousSection() {
    const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
    const prevIndex = currentIndex === 0 ? this.sections.length - 1 : currentIndex - 1;
    const prevSection = this.sections[prevIndex];
    
    if (prevSection) {
      this.navigateToSection(prevSection.id);
    }
  }

  /**
   * Cleanup before destroying
   */
  async beforeDestroy() {
    // Disconnect intersection observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Close mobile menu
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
    
    // Remove body classes
    document.body.classList.remove('menu-open');
  }
}

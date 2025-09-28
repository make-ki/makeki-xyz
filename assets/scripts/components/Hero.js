/**
 * Hero Component
 * Handles hero section with animated background, typing effect, and scroll indicators
 */
import { BaseComponent } from './BaseComponent.js';
import { eventBus, EVENTS } from '../eventBus.js';
import { stateManager } from '../stateManager.js';
import { $ } from '../utils/dom.js';

export class HeroComponent extends BaseComponent {
  constructor(element, config = {}) {
    super(element, config);
    
    this.typingText = null;
    this.cursor = null;
    this.currentPhraseIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.typingTimeout = null;
    this.backgroundImage = null;
    
    // Bind methods
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      phrases: [
        'Movie enjoyer', 
        'Music enjoyer', 
        'CTFs over weekend enjoyer (no)', 
        'Programming Problems Enjoyer (i suck)', 
        'Anime enjoyer', 
        'cute things enjoyer', 
        'Math enjoyer (other than coursework)', 
        'reddit >> 4chan (boo)', 
        'ADRIAAANNNNNN!!!',
        'Thats it dude ._.',
        'Movie enjoyer',
        'Music enjoyer',
        'sike...!!..',
        'really?',
      ],
      typingSpeed: 100,
      deleteSpeed: 50,
      pauseDuration: 2000,
      backgroundImage: 'index.gif',
      parallaxStrength: 0.5,
      className: 'hero-section'
    };
  }

  async setup() {
    // Get hero elements
    this.typingText = $('.typed-text', this.element);
    this.cursor = $('.cursor', this.element);
    this.backgroundImage = $('.hero-background-image', this.element);
    this.scrollIndicator = $('.scroll-indicator', this.element);
    
    // Initialize background
    this.initializeBackground();
    
    // Initialize typing animation
    this.initializeTypingAnimation();
    
    // Set up last updated time
    this.updateLastUpdatedTime();
  }

  async bindEvents() {
    // Window events for parallax and scroll effects
    this.addEventListener(window, 'scroll', this.handleScroll);
    this.addEventListener(window, 'resize', this.handleResize);
    
    // Handle background image load
    if (this.backgroundImage) {
      this.addEventListener(this.backgroundImage, 'load', this.handleImageLoad);
      this.addEventListener(this.backgroundImage, 'error', this.handleImageError);
    }
    
    // Listen for section changes to pause/resume animations
    this.subscribeToState('currentSection', this.handleSectionChange.bind(this));
    
    // Listen for reduced motion preference
    this.subscribeToState('preferences.reducedMotion', this.handleReducedMotion.bind(this));
  }

  /**
   * Initialize background image and effects
   */
  initializeBackground() {
    if (!this.backgroundImage) return;
    
    // Set the background image source
    const imageSrc = this.config.backgroundImage;
    if (imageSrc && this.backgroundImage.src !== imageSrc) {
      this.backgroundImage.src = imageSrc;
      this.backgroundImage.alt = 'Animated background showcasing dynamic visuals';
    }
    
    // Add loading state
    this.addClass('loading-background');
  }

  /**
   * Handle background image load
   */
  handleImageLoad = () => {
    this.removeClass('loading-background');
    this.addClass('background-loaded');
    
    if (this.config.debug) {
      console.log('Hero: Background image loaded successfully');
    }
    
    // Emit event for performance tracking
    eventBus.emit(EVENTS.PERFORMANCE_METRIC, {
      name: 'hero-background-loaded',
      timestamp: performance.now()
    });
  }

  /**
   * Handle background image error
   */
  handleImageError = () => {
    this.removeClass('loading-background');
    this.addClass('background-error');
    
    console.warn('Hero: Failed to load background image');
    
    // Set fallback background
    if (this.element) {
      this.element.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
    }
  }

  /**
   * Initialize typing animation
   */
  initializeTypingAnimation() {
    if (!this.typingText || !this.config.phrases.length) return;
    
    // Check for reduced motion preference
    const reducedMotion = stateManager.getState('preferences.reducedMotion');
    if (reducedMotion) {
      this.showStaticText();
      return;
    }
    
    // Start typing animation
    this.startTypingAnimation();
  }

  /**
   * Show static text instead of animation for reduced motion
   */
  showStaticText() {
    if (this.typingText) {
      this.typingText.textContent = this.config.phrases[0];
    }
    if (this.cursor) {
      this.cursor.style.display = 'none';
    }
  }

  /**
   * Start the typing animation cycle
   */
  startTypingAnimation() {
    this.typeText();
  }

  /**
   * Type text animation
   */
  typeText = () => {
    const currentPhrase = this.config.phrases[this.currentPhraseIndex];
    
    if (this.isDeleting) {
      // Deleting characters
      this.currentCharIndex--;
      this.typingText.textContent = currentPhrase.substring(0, this.currentCharIndex);
      
      if (this.currentCharIndex === 0) {
        this.isDeleting = false;
        this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.config.phrases.length;
        this.typingTimeout = setTimeout(this.typeText, 500); // Pause before typing new phrase
      } else {
        this.typingTimeout = setTimeout(this.typeText, this.config.deleteSpeed);
      }
    } else {
      // Typing characters
      this.currentCharIndex++;
      this.typingText.textContent = currentPhrase.substring(0, this.currentCharIndex);
      
      if (this.currentCharIndex === currentPhrase.length) {
        // Pause before deleting
        this.typingTimeout = setTimeout(() => {
          this.isDeleting = true;
          this.typeText();
        }, this.config.pauseDuration);
      } else {
        this.typingTimeout = setTimeout(this.typeText, this.config.typingSpeed);
      }
    }
  }

  /**
   * Handle scroll for parallax and scroll indicator
   */
  handleScroll = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Parallax effect for background
    if (this.backgroundImage && !stateManager.getState('preferences.reducedMotion')) {
      const parallaxOffset = scrollY * this.config.parallaxStrength;
      this.backgroundImage.style.transform = `translateY(${parallaxOffset}px) scale(1.1)`;
    }
    
    // Hide scroll indicator when scrolling
    if (this.scrollIndicator) {
      const opacity = Math.max(0, 1 - (scrollY / windowHeight));
      this.scrollIndicator.style.opacity = opacity;
    }
    
    // Fade out hero content on scroll
    const heroContent = $('.hero-content', this.element);
    if (heroContent) {
      const fadeStart = windowHeight * 0.3;
      const fadeDistance = windowHeight * 0.5;
      
      if (scrollY > fadeStart) {
        const fadeProgress = Math.min(1, (scrollY - fadeStart) / fadeDistance);
        const opacity = 1 - fadeProgress;
        heroContent.style.opacity = opacity;
      } else {
        heroContent.style.opacity = 1;
      }
    }
  }

  /**
   * Handle window resize
   */
  handleResize = () => {
    // Recalculate any size-dependent calculations
    if (this.config.debug) {
      console.log('Hero: Window resized, recalculating dimensions');
    }
  }

  /**
   * Handle section changes
   */
  handleSectionChange(currentSection) {
    const isHeroActive = currentSection === 'hero';
    
    // Pause/resume typing animation based on visibility
    if (isHeroActive && !this.typingTimeout) {
      this.startTypingAnimation();
    } else if (!isHeroActive && this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  /**
   * Handle reduced motion preference changes
   */
  handleReducedMotion(reducedMotion) {
    if (reducedMotion) {
      // Stop typing animation
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
        this.typingTimeout = null;
      }
      this.showStaticText();
      
      // Remove parallax effect
      if (this.backgroundImage) {
        this.backgroundImage.style.transform = '';
      }
    } else {
      // Restart typing animation if on hero section
      const currentSection = stateManager.getState('currentSection');
      if (currentSection === 'hero') {
        this.initializeTypingAnimation();
      }
    }
  }

  /**
   * Update last updated time in footer
   */
  updateLastUpdatedTime() {
    const lastUpdatedElement = $('#last-updated');
    if (lastUpdatedElement) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      lastUpdatedElement.textContent = formattedDate;
      lastUpdatedElement.setAttribute('datetime', now.toISOString());
    }
  }

  /**
   * Scroll to next section
   */
  scrollToNextSection() {
    eventBus.emit('navigation:scroll-to-next');
  }

  /**
   * Get current typing phrase
   */
  getCurrentPhrase() {
    return this.config.phrases[this.currentPhraseIndex];
  }

  /**
   * Add new phrase to typing animation
   */
  addPhrase(phrase) {
    if (phrase && !this.config.phrases.includes(phrase)) {
      this.config.phrases.push(phrase);
      
      if (this.config.debug) {
        console.log(`Hero: Added new phrase: ${phrase}`);
      }
    }
  }

  /**
   * Remove phrase from typing animation
   */
  removePhrase(phrase) {
    const index = this.config.phrases.indexOf(phrase);
    if (index > -1 && this.config.phrases.length > 1) {
      this.config.phrases.splice(index, 1);
      
      // Adjust current index if necessary
      if (this.currentPhraseIndex >= this.config.phrases.length) {
        this.currentPhraseIndex = 0;
      }
      
      if (this.config.debug) {
        console.log(`Hero: Removed phrase: ${phrase}`);
      }
    }
  }

  /**
   * Set typing speed
   */
  setTypingSpeed(speed) {
    this.config.typingSpeed = Math.max(50, Math.min(500, speed));
  }

  /**
   * Set delete speed
   */
  setDeleteSpeed(speed) {
    this.config.deleteSpeed = Math.max(25, Math.min(250, speed));
  }

  /**
   * Pause typing animation
   */
  pauseTyping() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  /**
   * Resume typing animation
   */
  resumeTyping() {
    if (!this.typingTimeout && !stateManager.getState('preferences.reducedMotion')) {
      this.startTypingAnimation();
    }
  }

  /**
   * Cleanup before destroying
   */
  async beforeDestroy() {
    // Clear typing animation timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
    
    // Reset any inline styles
    if (this.backgroundImage) {
      this.backgroundImage.style.transform = '';
    }
    
    const heroContent = $('.hero-content', this.element);
    if (heroContent) {
      heroContent.style.opacity = '';
    }
    
    if (this.scrollIndicator) {
      this.scrollIndicator.style.opacity = '';
    }
  }
}

/**
 * Main Application Controller
 * Orchestrates the entire application initialization and component management
 */
import { AppConfig } from './config.js';
import { eventBus, EVENTS } from './eventBus.js';
import { stateManager } from './stateManager.js';
import { NavigationComponent } from './components/Navigation.js';
import { HeroComponent } from './components/Hero.js';
import { AboutComponent } from './components/About.js';
import { SkillsComponent } from './components/Skills.js';
import { ExperienceComponent } from './components/Experience.js';
import { ProjectsComponent } from './components/Projects.js';
import { BlogComponent } from './components/Blog.js';
import { ContactComponent } from './components/Contact.js';
import { ScrollAnimations } from './components/ScrollAnimations.js';
import { $ } from './utils/dom.js';

export class App {
  constructor() {
    this.components = new Map();
    this.isInitialized = false;
    this.performanceMetrics = {
      startTime: performance.now(),
      loadTime: null,
      initTime: null
    };
    
    // Bind methods
    this.handleError = this.handleError.bind(this);
    this.handleUnload = this.handleUnload.bind(this);
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing MakeKi.xyz...');
      
      // Set up error handling
      console.log('🛡️ Setting up error handling...');
      this.setupErrorHandling();
      
      // Check browser compatibility
      console.log('🔍 Checking browser compatibility...');
      this.checkBrowserSupport();
      
      // Initialize core systems
      console.log('⚙️ Initializing core systems...');
      await this.initializeCoreSystem();
      
      // Load and initialize components
      console.log('🔧 Loading components...');
      await this.initializeComponents();
      
      // Set up global event listeners
      console.log('📡 Setting up global event listeners...');
      this.setupGlobalEventListeners();
      
      // Initialize performance monitoring
      console.log('📊 Initializing performance monitoring...');
      this.initializePerformanceMonitoring();
      
      // Set application as ready
      this.isInitialized = true;
      this.performanceMetrics.initTime = performance.now() - this.performanceMetrics.startTime;
      
      // Emit app ready event
      eventBus.emit(EVENTS.APP_READY, {
        performanceMetrics: this.performanceMetrics,
        components: Array.from(this.components.keys())
      });
      
      console.log('✅ Application initialized successfully', {
        initTime: `${this.performanceMetrics.initTime.toFixed(2)}ms`,
        components: this.components.size
      });
      
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      console.error('🔍 Error details:', error.stack);
      this.handleError(error);
      
      // Always hide loading screen
      const loading = document.getElementById('loading');
      if (loading) {
        loading.classList.add('hidden');
        console.log('🔄 Loading screen hidden after init error');
      }
    }
  }

  /**
   * Initialize core application systems
   */
  async initializeCoreSystem() {
    // Initialize state manager with default state
    stateManager.setState({
      isLoading: true,
      currentSection: 'hero',
      theme: this.detectPreferredTheme(),
      preferences: this.loadUserPreferences()
    });

    // Set up event bus debug mode if needed
    if (AppConfig.development.enableDebugMode) {
      eventBus.setDebugMode(true);
      stateManager.setDebugMode(true);
    }

    // Apply theme
    this.applyTheme(stateManager.getState('theme'));
    
    // Check for reduced motion preference
    this.checkAccessibilityPreferences();
  }

  /**
   * Initialize all components
   */
  async initializeComponents() {
    const componentConfigs = [
      {
        name: 'navigation',
        class: NavigationComponent,
        selector: '#navigation',
        config: AppConfig.components.navigation
      },
      {
        name: 'hero',
        class: HeroComponent,
        selector: '#hero',
        config: AppConfig.components.hero
      },
      {
        name: 'about',
        class: AboutComponent,
        selector: '#about',
        config: {}
      },
      {
        name: 'skills',
        class: SkillsComponent,
        selector: '#skills',
        config: AppConfig.components.skills
      },
      {
        name: 'experience',
        class: ExperienceComponent,
        selector: '#experience',
        config: {}
      },
      {
        name: 'projects',
        class: ProjectsComponent,
        selector: '#projects',
        config: AppConfig.components.projects
      },
      {
        name: 'blog',
        class: BlogComponent,
        selector: '#blog',
        config: {}
      },
      {
        name: 'contact',
        class: ContactComponent,
        selector: '#contact',
        config: {}
      },
      {
        name: 'scrollAnimations',
        class: ScrollAnimations,
        selector: 'body', // ScrollAnimations observes the entire document
        config: {}
      }
    ];

    // Initialize components sequentially to avoid conflicts
    for (const componentConfig of componentConfigs) {
      await this.initializeComponent(componentConfig);
    }

    // Update loading state
    stateManager.setState('isLoading', false);
    
    // Hide loading screen
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
    }
  }

  /**
   * Initialize a single component
   */
  async initializeComponent({ name, class: ComponentClass, selector, config }) {
    try {
      const element = $(selector);
      
      if (!element) {
        console.warn(`Component element not found: ${selector}`);
        return;
      }

      const component = new ComponentClass(element, {
        ...config,
        debug: AppConfig.development.enableDebugMode
      });

      await component.init();
      this.components.set(name, component);
      
      console.log(`✅ Component initialized: ${name}`);
      
    } catch (error) {
      console.error(`❌ Failed to initialize component: ${name}`, error);
      eventBus.emit(EVENTS.APP_ERROR, { error, component: name });
    }
  }

  /**
   * Set up global event listeners
   */
  setupGlobalEventListeners() {
    // Handle window unload
    window.addEventListener('beforeunload', this.handleUnload);
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      const isVisible = !document.hidden;
      eventBus.emit('app:visibilitychange', { isVisible });
    });
    
    // Handle online/offline status
    window.addEventListener('online', () => {
      eventBus.emit('app:connectionchange', { isOnline: true });
    });
    
    window.addEventListener('offline', () => {
      eventBus.emit('app:connectionchange', { isOnline: false });
    });
    
    // Handle theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      const theme = e.matches ? 'dark' : 'light';
      stateManager.setState('theme', theme);
      this.applyTheme(theme);
    });
    
    // Handle reduced motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      stateManager.setState('preferences.reducedMotion', e.matches);
      document.body.classList.toggle('reduced-motion', e.matches);
    });
  }

  /**
   * Set up error handling
   */
  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', this.handleError);
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason);
    });
    
    // Listen for component errors
    eventBus.on(EVENTS.APP_ERROR, (event) => {
      this.handleError(event.data.error, event.data);
    });
  }

  /**
   * Handle application errors
   */
  handleError(error, context = {}) {
    console.error('Application Error:', error, context);
    
    // Don't crash the entire app for component errors
    if (context.component) {
      console.log(`Attempting to recover from ${context.component} error...`);
      return;
    }
    
    // For critical errors, show user-friendly message
    this.showErrorMessage('Something went wrong. Please refresh the page.');
  }

  /**
   * Show user-friendly error message
   */
  showErrorMessage(message) {
    // You could implement a toast notification or modal here
    console.log('User Error Message:', message);
  }

  /**
   * Check browser support
   */
  checkBrowserSupport() {
    const requiredFeatures = [
      'IntersectionObserver',
      'requestAnimationFrame',
      'addEventListener',
      'querySelector',
      'classList',
      'fetch'
    ];
    
    const unsupported = requiredFeatures.filter(feature => {
      return !(feature in window) && !(feature in document) && !(feature in Element.prototype);
    });
    
    if (unsupported.length > 0) {
      console.warn('Unsupported browser features:', unsupported);
      this.showErrorMessage('Your browser may not support all features. Please consider updating.');
    }
  }

  /**
   * Detect user's preferred theme
   */
  detectPreferredTheme() {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved && ['light', 'dark'].includes(saved)) {
      return saved;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'dark'; // Default
  }

  /**
   * Apply theme to the application
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
    
    // Save preference
    localStorage.setItem('theme', theme);
    
    eventBus.emit(EVENTS.THEME_CHANGE, { theme });
  }

  /**
   * Load user preferences from localStorage
   */
  loadUserPreferences() {
    try {
      const saved = localStorage.getItem('userPreferences');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
      return {};
    }
  }

  /**
   * Check accessibility preferences
   */
  checkAccessibilityPreferences() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    stateManager.setState('preferences', {
      ...stateManager.getState('preferences'),
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast
    });
    
    // Apply classes
    document.body.classList.toggle('reduced-motion', prefersReducedMotion);
    document.body.classList.toggle('high-contrast', prefersHighContrast);
  }

  /**
   * Initialize performance monitoring
   */
  initializePerformanceMonitoring() {
    if (!AppConfig.development.enablePerformanceMetrics) return;
    
    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            eventBus.emit(EVENTS.PERFORMANCE_METRIC, {
              name: entry.name,
              type: entry.entryType,
              startTime: entry.startTime,
              duration: entry.duration
            });
          });
        });
        
        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
      } catch (error) {
        console.warn('Performance monitoring failed:', error);
      }
    }
  }

  /**
   * Handle window unload
   */
  handleUnload() {
    // Save any pending data
    this.saveUserData();
    
    // Clean up components
    this.destroy();
  }

  /**
   * Save user data before unload
   */
  saveUserData() {
    try {
      const preferences = stateManager.getState('preferences');
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save user data:', error);
    }
  }

  /**
   * Get component by name
   */
  getComponent(name) {
    return this.components.get(name);
  }

  /**
   * Get all components
   */
  getAllComponents() {
    return new Map(this.components);
  }

  /**
   * Destroy application and clean up
   */
  async destroy() {
    if (!this.isInitialized) return;
    
    console.log('🧹 Cleaning up application...');
    
    // Destroy all components
    for (const [name, component] of this.components) {
      try {
        await component.destroy();
        console.log(`✅ Component destroyed: ${name}`);
      } catch (error) {
        console.error(`❌ Failed to destroy component: ${name}`, error);
      }
    }
    
    this.components.clear();
    
    // Remove global event listeners
    window.removeEventListener('beforeunload', this.handleUnload);
    window.removeEventListener('error', this.handleError);
    
    this.isInitialized = false;
    console.log('✅ Application cleanup complete');
  }

  /**
   * Get application debug information
   */
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      components: Array.from(this.components.keys()),
      performanceMetrics: this.performanceMetrics,
      state: stateManager.getState(),
      config: AppConfig,
      eventBus: eventBus.getEvents()
    };
  }
}

// Create and export global app instance
export const app = new App();

// Add some debug logging
console.log('🚀 Main script loaded');
console.log('📱 Document ready state:', document.readyState);

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  console.log('⏳ Waiting for DOM...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded, initializing app...');
    app.init().catch(error => {
      console.error('❌ App initialization failed:', error);
      // Hide loading screen even if app fails
      const loading = document.getElementById('loading');
      if (loading) {
        loading.classList.add('hidden');
        console.log('🔄 Loading screen hidden after error');
      }
    });
  });
} else {
  console.log('✅ DOM already loaded, initializing app...');
  app.init().catch(error => {
    console.error('❌ App initialization failed:', error);
    // Hide loading screen even if app fails
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
      console.log('🔄 Loading screen hidden after error');
    }
  });
}

/**
 * Base Component Class
 * Provides common functionality for all UI components
 */
import { eventBus, EVENTS } from '../eventBus.js';
import { stateManager } from '../stateManager.js';

export class BaseComponent {
  constructor(element, config = {}) {
    this.element = element;
    this.config = { ...this.getDefaultConfig(), ...config };
    this.state = {};
    this.eventListeners = new Map();
    this.stateSubscriptions = new Set();
    this.isInitialized = false;
    this.isDestroyed = false;
    
    // Generate unique component ID
    this.id = this.generateId();
    this.element?.setAttribute('data-component-id', this.id);
    
    if (this.config.autoInit) {
      this.init();
    }
  }

  /**
   * Initialize the component
   */
  async init() {
    if (this.isInitialized || this.isDestroyed) return;

    try {
      await this.beforeInit();
      await this.setup();
      await this.render();
      await this.bindEvents();
      await this.afterInit();
      
      this.isInitialized = true;
      this.emit('init', { component: this });
      
      if (this.config.debug) {
        console.log(`Component ${this.constructor.name} initialized:`, this.id);
      }
    } catch (error) {
      console.error(`Error initializing component ${this.constructor.name}:`, error);
      this.emit('error', { error, component: this });
    }
  }

  /**
   * Setup component (override in subclasses)
   */
  async setup() {
    // Override in subclasses
  }

  /**
   * Render component (override in subclasses)
   */
  async render() {
    // Override in subclasses
  }

  /**
   * Bind event listeners (override in subclasses)
   */
  async bindEvents() {
    // Override in subclasses
  }

  /**
   * Before initialization hook
   */
  async beforeInit() {
    // Override in subclasses
  }

  /**
   * After initialization hook
   */
  async afterInit() {
    // Override in subclasses
  }

  /**
   * Destroy the component
   */
  async destroy() {
    if (this.isDestroyed) return;

    try {
      await this.beforeDestroy();
      
      // Remove all event listeners
      this.removeAllEventListeners();
      
      // Unsubscribe from all state changes
      this.unsubscribeFromAllState();
      
      // Remove element attributes
      this.element?.removeAttribute('data-component-id');
      
      await this.afterDestroy();
      
      this.isDestroyed = true;
      this.emit('destroy', { component: this });
      
      if (this.config.debug) {
        console.log(`Component ${this.constructor.name} destroyed:`, this.id);
      }
    } catch (error) {
      console.error(`Error destroying component ${this.constructor.name}:`, error);
    }
  }

  /**
   * Before destruction hook
   */
  async beforeDestroy() {
    // Override in subclasses
  }

  /**
   * After destruction hook
   */
  async afterDestroy() {
    // Override in subclasses
  }

  /**
   * Update component configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdate', { config: this.config, component: this });
  }

  /**
   * Get default configuration (override in subclasses)
   * @returns {Object} Default configuration
   */
  getDefaultConfig() {
    return {
      autoInit: true,
      debug: false,
      className: 'component',
      attributes: {}
    };
  }

  /**
   * Generate unique component ID
   * @returns {string} Unique ID
   */
  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${this.constructor.name.toLowerCase()}-${timestamp}-${random}`;
  }

  /**
   * Add event listener with automatic cleanup
   * @param {Element|Window|Document} target - Event target
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  addEventListener(target, event, handler, options = {}) {
    const wrappedHandler = (e) => {
      try {
        handler.call(this, e);
      } catch (error) {
        console.error(`Event handler error in ${this.constructor.name}:`, error);
        this.emit('error', { error, event, component: this });
      }
    };

    target.addEventListener(event, wrappedHandler, options);

    // Store for cleanup
    if (!this.eventListeners.has(target)) {
      this.eventListeners.set(target, new Map());
    }
    this.eventListeners.get(target).set(event, wrappedHandler);

    return () => this.removeEventListener(target, event);
  }

  /**
   * Remove specific event listener
   * @param {Element|Window|Document} target - Event target
   * @param {string} event - Event type
   */
  removeEventListener(target, event) {
    if (!this.eventListeners.has(target)) return;

    const targetListeners = this.eventListeners.get(target);
    const handler = targetListeners.get(event);
    
    if (handler) {
      target.removeEventListener(event, handler);
      targetListeners.delete(event);
      
      if (targetListeners.size === 0) {
        this.eventListeners.delete(target);
      }
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllEventListeners() {
    this.eventListeners.forEach((events, target) => {
      events.forEach((handler, event) => {
        target.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();
  }

  /**
   * Subscribe to global state changes
   * @param {string} key - State key
   * @param {Function} callback - Change handler
   * @param {Object} options - Subscription options
   */
  subscribeToState(key, callback, options = {}) {
    const unsubscribe = stateManager.subscribe(key, callback, {
      ...options,
      context: this
    });
    
    this.stateSubscriptions.add(unsubscribe);
    return unsubscribe;
  }

  /**
   * Unsubscribe from all state changes
   */
  unsubscribeFromAllState() {
    this.stateSubscriptions.forEach(unsubscribe => unsubscribe());
    this.stateSubscriptions.clear();
  }

  /**
   * Emit component event
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data = {}) {
    const eventName = `component:${this.constructor.name.toLowerCase()}:${event}`;
    eventBus.emit(eventName, { ...data, componentId: this.id });
  }

  /**
   * Listen to component events
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  on(event, callback) {
    const eventName = `component:${this.constructor.name.toLowerCase()}:${event}`;
    return eventBus.on(eventName, callback);
  }

  /**
   * Get element by selector within component
   * @param {string} selector - CSS selector
   * @returns {Element|null} Found element
   */
  $(selector) {
    return this.element?.querySelector(selector);
  }

  /**
   * Get elements by selector within component
   * @param {string} selector - CSS selector
   * @returns {NodeList} Found elements
   */
  $$(selector) {
    return this.element?.querySelectorAll(selector) || [];
  }

  /**
   * Add CSS class to component element
   * @param {string} className - Class name to add
   */
  addClass(className) {
    this.element?.classList.add(className);
  }

  /**
   * Remove CSS class from component element
   * @param {string} className - Class name to remove
   */
  removeClass(className) {
    this.element?.classList.remove(className);
  }

  /**
   * Toggle CSS class on component element
   * @param {string} className - Class name to toggle
   * @param {boolean} force - Force add/remove
   */
  toggleClass(className, force) {
    return this.element?.classList.toggle(className, force);
  }

  /**
   * Check if component element has CSS class
   * @param {string} className - Class name to check
   * @returns {boolean} Whether class exists
   */
  hasClass(className) {
    return this.element?.classList.contains(className) || false;
  }

  /**
   * Set component element attribute
   * @param {string} name - Attribute name
   * @param {string} value - Attribute value
   */
  setAttribute(name, value) {
    this.element?.setAttribute(name, value);
  }

  /**
   * Get component element attribute
   * @param {string} name - Attribute name
   * @returns {string|null} Attribute value
   */
  getAttribute(name) {
    return this.element?.getAttribute(name);
  }

  /**
   * Set element data attribute
   * @param {string} key - Data key
   * @param {string} value - Data value
   */
  setData(key, value) {
    this.element?.setAttribute(`data-${key}`, value);
  }

  /**
   * Get element data attribute
   * @param {string} key - Data key
   * @returns {string|null} Data value
   */
  getData(key) {
    return this.element?.getAttribute(`data-${key}`);
  }

  /**
   * Show component element
   */
  show() {
    if (this.element) {
      this.element.style.display = '';
      this.element.removeAttribute('hidden');
      this.addClass('visible');
      this.removeClass('hidden');
    }
  }

  /**
   * Hide component element
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
      this.element.setAttribute('hidden', '');
      this.addClass('hidden');
      this.removeClass('visible');
    }
  }

  /**
   * Check if component is visible
   * @returns {boolean} Visibility state
   */
  isVisible() {
    if (!this.element) return false;
    
    const style = window.getComputedStyle(this.element);
    return style.display !== 'none' && 
           !this.element.hasAttribute('hidden') &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
  }

  /**
   * Get component debug information
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    return {
      id: this.id,
      name: this.constructor.name,
      isInitialized: this.isInitialized,
      isDestroyed: this.isDestroyed,
      config: this.config,
      state: this.state,
      eventListeners: this.eventListeners.size,
      stateSubscriptions: this.stateSubscriptions.size,
      element: this.element
    };
  }
}

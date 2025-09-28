/**
 * Event Bus - Global event system for component communication
 * Implements publish-subscribe pattern for loose coupling between components
 */
export class EventBus {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
    this.debugMode = false;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {Object} options - Additional options
   */
  on(event, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Event callback must be a function');
    }

    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const handler = {
      callback,
      context: options.context || null,
      priority: options.priority || 0,
      once: false
    };

    this.events.get(event).add(handler);

    if (this.debugMode) {
      console.log(`EventBus: Subscribed to '${event}'`, { handler, totalListeners: this.events.get(event).size });
    }

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event (one-time only)
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {Object} options - Additional options
   */
  once(event, callback, options = {}) {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, new Set());
    }

    const handler = {
      callback,
      context: options.context || null,
      priority: options.priority || 0,
      once: true
    };

    this.onceEvents.get(event).add(handler);

    if (this.debugMode) {
      console.log(`EventBus: Subscribed once to '${event}'`);
    }

    return () => this.offOnce(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler to remove
   */
  off(event, callback) {
    if (!this.events.has(event)) return;

    const handlers = this.events.get(event);
    for (const handler of handlers) {
      if (handler.callback === callback) {
        handlers.delete(handler);
        break;
      }
    }

    if (handlers.size === 0) {
      this.events.delete(event);
    }

    if (this.debugMode) {
      console.log(`EventBus: Unsubscribed from '${event}'`);
    }
  }

  /**
   * Unsubscribe from a once event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler to remove
   */
  offOnce(event, callback) {
    if (!this.onceEvents.has(event)) return;

    const handlers = this.onceEvents.get(event);
    for (const handler of handlers) {
      if (handler.callback === callback) {
        handlers.delete(handler);
        break;
      }
    }

    if (handlers.size === 0) {
      this.onceEvents.delete(event);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {any} data - Event data
   * @param {Object} options - Emission options
   */
  emit(event, data = null, options = {}) {
    const timestamp = Date.now();
    const eventData = {
      type: event,
      data,
      timestamp,
      source: options.source || 'unknown'
    };

    if (this.debugMode) {
      console.log(`EventBus: Emitting '${event}'`, eventData);
    }

    // Handle regular events
    this._handleEventEmission(event, eventData, this.events);
    
    // Handle once events
    this._handleEventEmission(event, eventData, this.onceEvents, true);

    // Clean up once events after emission
    if (this.onceEvents.has(event)) {
      this.onceEvents.delete(event);
    }
  }

  /**
   * Handle event emission for both regular and once events
   * @private
   */
  _handleEventEmission(event, eventData, eventMap, isOnce = false) {
    if (!eventMap.has(event)) return;

    const handlers = Array.from(eventMap.get(event));
    
    // Sort handlers by priority (higher priority first)
    handlers.sort((a, b) => b.priority - a.priority);

    handlers.forEach(handler => {
      try {
        if (handler.context) {
          handler.callback.call(handler.context, eventData);
        } else {
          handler.callback(eventData);
        }
      } catch (error) {
        console.error(`EventBus: Error in event handler for '${event}':`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
      this.onceEvents.delete(event);
    } else {
      this.events.clear();
      this.onceEvents.clear();
    }

    if (this.debugMode) {
      console.log(`EventBus: Removed all listeners for '${event || 'all events'}'`);
    }
  }

  /**
   * Get list of all registered events
   * @returns {Array} List of event names
   */
  getEvents() {
    return [...new Set([...this.events.keys(), ...this.onceEvents.keys()])];
  }

  /**
   * Get number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  getListenerCount(event) {
    const regularCount = this.events.has(event) ? this.events.get(event).size : 0;
    const onceCount = this.onceEvents.has(event) ? this.onceEvents.get(event).size : 0;
    return regularCount + onceCount;
  }

  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Debug mode state
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`EventBus: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Create a namespaced event bus
   * @param {string} namespace - Namespace prefix
   * @returns {Object} Namespaced event bus methods
   */
  namespace(namespace) {
    return {
      on: (event, callback, options) => this.on(`${namespace}:${event}`, callback, options),
      once: (event, callback, options) => this.once(`${namespace}:${event}`, callback, options),
      off: (event, callback) => this.off(`${namespace}:${event}`, callback),
      emit: (event, data, options) => this.emit(`${namespace}:${event}`, data, { ...options, source: namespace })
    };
  }
}

// Create and export global event bus instance
export const eventBus = new EventBus();

// Common event constants
export const EVENTS = {
  // Application events
  APP_INIT: 'app:init',
  APP_READY: 'app:ready',
  APP_ERROR: 'app:error',
  
  // Navigation events
  SECTION_CHANGE: 'navigation:section-change',
  SCROLL_UPDATE: 'navigation:scroll-update',
  
  // UI events
  THEME_CHANGE: 'ui:theme-change',
  MODAL_OPEN: 'ui:modal-open',
  MODAL_CLOSE: 'ui:modal-close',
  
  // Data events
  DATA_LOADED: 'data:loaded',
  DATA_ERROR: 'data:error',
  
  // Animation events
  ANIMATION_START: 'animation:start',
  ANIMATION_END: 'animation:end',
  
  // Performance events
  PERFORMANCE_METRIC: 'performance:metric'
};

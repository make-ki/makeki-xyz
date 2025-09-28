/**
 * State Manager - Centralized state management for the application
 * Implements reactive state updates with subscriptions
 */
export class StateManager {
  constructor() {
    this.state = {
      // Application state
      isLoading: false,
      currentSection: 'hero',
      theme: 'dark',
      
      // Navigation state
      navigationVisible: true,
      mobileMenuOpen: false,
      
      // Content state
      skills: [],
      projects: [],
      blogPosts: [],
      experience: [],
      
      // UI state
      modalOpen: false,
      modalContent: null,
      
      // Performance state
      performanceMetrics: {},
      
      // User preferences
      preferences: {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'normal'
      }
    };

    this.subscribers = new Map();
    this.history = [];
    this.maxHistoryLength = 50;
    this.debugMode = false;
  }

  /**
   * Get current state value
   * @param {string} key - State key (supports dot notation)
   * @returns {any} State value
   */
  getState(key) {
    if (!key) return { ...this.state };
    
    return key.split('.').reduce((obj, prop) => {
      return obj && obj[prop] !== undefined ? obj[prop] : undefined;
    }, this.state);
  }

  /**
   * Set state value
   * @param {string|Object} key - State key or state object
   * @param {any} value - New value (if key is string)
   * @param {boolean} silent - Skip notifications if true
   */
  setState(key, value, silent = false) {
    const oldState = { ...this.state };
    
    if (typeof key === 'object') {
      // Bulk state update
      Object.entries(key).forEach(([k, v]) => {
        this._setNestedValue(k, v);
      });
    } else {
      // Single state update
      this._setNestedValue(key, value);
    }

    // Add to history
    this._addToHistory(oldState, { ...this.state });

    if (this.debugMode) {
      console.log('State updated:', { key, value, newState: this.state });
    }

    // Notify subscribers unless silent
    if (!silent) {
      if (typeof key === 'object') {
        Object.keys(key).forEach(k => this._notifySubscribers(k));
      } else {
        this._notifySubscribers(key);
      }
    }
  }

  /**
   * Set nested state value using dot notation
   * @private
   */
  _setNestedValue(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key] || typeof obj[key] !== 'object') {
        obj[key] = {};
      }
      return obj[key];
    }, this.state);
    
    target[lastKey] = value;
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key to watch
   * @param {Function} callback - Callback function
   * @param {Object} options - Subscription options
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    const subscription = {
      callback,
      context: options.context || null,
      immediate: options.immediate !== false,
      once: options.once || false
    };

    this.subscribers.get(key).add(subscription);

    // Call immediately with current value if requested
    if (subscription.immediate) {
      try {
        const currentValue = this.getState(key);
        if (subscription.context) {
          subscription.callback.call(subscription.context, currentValue, key);
        } else {
          subscription.callback(currentValue, key);
        }
      } catch (error) {
        console.error(`State subscription error for '${key}':`, error);
      }
    }

    if (this.debugMode) {
      console.log(`Subscribed to state '${key}'`);
    }

    // Return unsubscribe function
    return () => this.unsubscribe(key, callback);
  }

  /**
   * Unsubscribe from state changes
   * @param {string} key - State key
   * @param {Function} callback - Callback to remove
   */
  unsubscribe(key, callback) {
    if (!this.subscribers.has(key)) return;

    const subscriptions = this.subscribers.get(key);
    for (const subscription of subscriptions) {
      if (subscription.callback === callback) {
        subscriptions.delete(subscription);
        break;
      }
    }

    if (subscriptions.size === 0) {
      this.subscribers.delete(key);
    }

    if (this.debugMode) {
      console.log(`Unsubscribed from state '${key}'`);
    }
  }

  /**
   * Notify subscribers of state changes
   * @private
   */
  _notifySubscribers(key) {
    if (!this.subscribers.has(key)) return;

    const subscriptions = Array.from(this.subscribers.get(key));
    const currentValue = this.getState(key);

    subscriptions.forEach(subscription => {
      try {
        if (subscription.context) {
          subscription.callback.call(subscription.context, currentValue, key);
        } else {
          subscription.callback(currentValue, key);
        }

        // Remove once subscriptions after calling
        if (subscription.once) {
          this.subscribers.get(key).delete(subscription);
        }
      } catch (error) {
        console.error(`State notification error for '${key}':`, error);
      }
    });

    // Clean up empty subscription sets
    if (this.subscribers.get(key).size === 0) {
      this.subscribers.delete(key);
    }
  }

  /**
   * Add state change to history
   * @private
   */
  _addToHistory(oldState, newState) {
    this.history.push({
      timestamp: Date.now(),
      oldState,
      newState
    });

    // Limit history size
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }

  /**
   * Get state change history
   * @returns {Array} History entries
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Clear state change history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Reset state to initial values
   * @param {Array} keys - Specific keys to reset (optional)
   */
  resetState(keys = null) {
    const initialState = this._getInitialState();
    
    if (keys) {
      keys.forEach(key => {
        const initialValue = key.split('.').reduce((obj, prop) => {
          return obj && obj[prop] !== undefined ? obj[prop] : undefined;
        }, initialState);
        this.setState(key, initialValue);
      });
    } else {
      this.state = { ...initialState };
      this.subscribers.forEach((_, key) => {
        this._notifySubscribers(key);
      });
    }

    if (this.debugMode) {
      console.log('State reset:', keys || 'all');
    }
  }

  /**
   * Get initial state values
   * @private
   */
  _getInitialState() {
    return {
      isLoading: false,
      currentSection: 'hero',
      theme: 'dark',
      navigationVisible: true,
      mobileMenuOpen: false,
      skills: [],
      projects: [],
      blogPosts: [],
      experience: [],
      modalOpen: false,
      modalContent: null,
      performanceMetrics: {},
      preferences: {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'normal'
      }
    };
  }

  /**
   * Create a computed state value
   * @param {Function} computeFn - Function to compute the value
   * @param {Array} dependencies - State keys this computation depends on
   * @param {string} targetKey - Key to store the computed value
   */
  computed(computeFn, dependencies, targetKey) {
    const updateComputed = () => {
      const inputs = dependencies.map(dep => this.getState(dep));
      const result = computeFn(...inputs);
      this.setState(targetKey, result, true); // Silent update to avoid loops
    };

    // Subscribe to all dependencies
    dependencies.forEach(dep => {
      this.subscribe(dep, updateComputed, { immediate: false });
    });

    // Initial computation
    updateComputed();
  }

  /**
   * Batch state updates
   * @param {Function} updateFn - Function that performs multiple state updates
   */
  batch(updateFn) {
    const originalNotify = this._notifySubscribers;
    const changedKeys = new Set();

    // Temporarily override notification to collect changes
    this._notifySubscribers = (key) => {
      changedKeys.add(key);
    };

    try {
      updateFn();
    } finally {
      // Restore original notification function
      this._notifySubscribers = originalNotify;
      
      // Notify all changed keys at once
      changedKeys.forEach(key => {
        originalNotify.call(this, key);
      });
    }
  }

  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Debug mode state
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`StateManager: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get debug information
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    return {
      stateKeys: Object.keys(this.state),
      subscriberCount: this.subscribers.size,
      subscriptions: Array.from(this.subscribers.entries()).map(([key, subs]) => ({
        key,
        count: subs.size
      })),
      historyLength: this.history.length
    };
  }
}

// Create and export global state manager instance
export const stateManager = new StateManager();

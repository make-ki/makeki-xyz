/**
 * DOM Utilities
 * Helper functions for DOM manipulation and queries
 */

/**
 * Query single element
 * @param {string} selector - CSS selector
 * @param {Element} context - Search context (optional)
 * @returns {Element|null} Found element
 */
export function $(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Query multiple elements
 * @param {string} selector - CSS selector
 * @param {Element} context - Search context (optional)
 * @returns {NodeList} Found elements
 */
export function $$(selector, context = document) {
  return context.querySelectorAll(selector);
}

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string|Element|Array} content - Element content
 * @returns {Element} Created element
 */
export function createElement(tag, attributes = {}, content = null) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className' || key === 'class') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else if (key in element) {
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Set content
  if (content !== null) {
    if (typeof content === 'string') {
      element.textContent = content;
    } else if (content instanceof Element) {
      element.appendChild(content);
    } else if (Array.isArray(content)) {
      content.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
          element.appendChild(child);
        }
      });
    }
  }
  
  return element;
}

/**
 * Remove element from DOM
 * @param {Element} element - Element to remove
 */
export function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * Clear element content
 * @param {Element} element - Element to clear
 */
export function clearElement(element) {
  if (element) {
    element.innerHTML = '';
  }
}

/**
 * Check if element matches selector
 * @param {Element} element - Element to test
 * @param {string} selector - CSS selector
 * @returns {boolean} Whether element matches
 */
export function matches(element, selector) {
  return element && element.matches && element.matches(selector);
}

/**
 * Find closest ancestor matching selector
 * @param {Element} element - Starting element
 * @param {string} selector - CSS selector
 * @returns {Element|null} Matching ancestor
 */
export function closest(element, selector) {
  return element && element.closest ? element.closest(selector) : null;
}

/**
 * Get element position relative to viewport
 * @param {Element} element - Target element
 * @returns {Object} Position and dimensions
 */
export function getElementPosition(element) {
  if (!element) return null;
  
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2
  };
}

/**
 * Get element offset relative to document
 * @param {Element} element - Target element
 * @returns {Object} Offset position
 */
export function getElementOffset(element) {
  if (!element) return null;
  
  let top = 0;
  let left = 0;
  
  while (element) {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  }
  
  return { top, left };
}

/**
 * Check if element is in viewport
 * @param {Element} element - Target element
 * @param {number} threshold - Intersection threshold (0-1)
 * @returns {boolean} Whether element is visible
 */
export function isInViewport(element, threshold = 0) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  const verticalThreshold = windowHeight * threshold;
  const horizontalThreshold = windowWidth * threshold;
  
  return (
    rect.top + verticalThreshold < windowHeight &&
    rect.bottom - verticalThreshold > 0 &&
    rect.left + horizontalThreshold < windowWidth &&
    rect.right - horizontalThreshold > 0
  );
}

/**
 * Get computed style property
 * @param {Element} element - Target element
 * @param {string} property - CSS property name
 * @returns {string} Computed value
 */
export function getStyle(element, property) {
  if (!element) return null;
  return window.getComputedStyle(element)[property];
}

/**
 * Set multiple styles on element
 * @param {Element} element - Target element
 * @param {Object} styles - Style properties
 */
export function setStyles(element, styles) {
  if (!element || !styles) return;
  Object.assign(element.style, styles);
}

/**
 * Add CSS class with animation frame timing
 * @param {Element} element - Target element
 * @param {string} className - Class name to add
 * @param {Function} callback - Callback after class is added
 */
export function addClassAnimated(element, className, callback) {
  if (!element) return;
  
  requestAnimationFrame(() => {
    element.classList.add(className);
    if (callback) {
      requestAnimationFrame(callback);
    }
  });
}

/**
 * Remove CSS class with animation frame timing
 * @param {Element} element - Target element
 * @param {string} className - Class name to remove
 * @param {Function} callback - Callback after class is removed
 */
export function removeClassAnimated(element, className, callback) {
  if (!element) return;
  
  requestAnimationFrame(() => {
    element.classList.remove(className);
    if (callback) {
      requestAnimationFrame(callback);
    }
  });
}

/**
 * Wait for transition to complete
 * @param {Element} element - Target element
 * @param {number} timeout - Maximum wait time (ms)
 * @returns {Promise} Promise that resolves when transition ends
 */
export function waitForTransition(element, timeout = 5000) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }
    
    const timeoutId = setTimeout(resolve, timeout);
    
    const handleTransitionEnd = () => {
      clearTimeout(timeoutId);
      element.removeEventListener('transitionend', handleTransitionEnd);
      resolve();
    };
    
    element.addEventListener('transitionend', handleTransitionEnd);
  });
}

/**
 * Get all focusable elements within container
 * @param {Element} container - Container element
 * @returns {Array} Focusable elements
 */
export function getFocusableElements(container = document) {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');
  
  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             el.offsetWidth > 0 && 
             el.offsetHeight > 0;
    });
}

/**
 * Trap focus within container
 * @param {Element} container - Container element
 * @returns {Function} Function to release focus trap
 */
export function trapFocus(container) {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  if (firstElement) {
    firstElement.focus();
  }
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Scroll element into view smoothly
 * @param {Element} element - Target element
 * @param {Object} options - Scroll options
 */
export function scrollToElement(element, options = {}) {
  if (!element) return;
  
  const defaultOptions = {
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
    offset: 0
  };
  
  const scrollOptions = { ...defaultOptions, ...options };
  const { offset, ...nativeOptions } = scrollOptions;
  
  if (offset !== 0) {
    const elementTop = getElementOffset(element).top;
    const targetTop = elementTop - offset;
    
    window.scrollTo({
      top: targetTop,
      behavior: nativeOptions.behavior
    });
  } else {
    element.scrollIntoView(nativeOptions);
  }
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

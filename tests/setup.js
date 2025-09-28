/**
 * Test setup file
 * Sets up global test environment and mocks
 */

// Mock DOM APIs that aren't available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
};

// Mock PerformanceObserver
global.PerformanceObserver = class PerformanceObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods for testing
global.__consoleMock = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
};

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

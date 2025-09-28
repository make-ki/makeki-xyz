/**
 * BaseComponent Tests
 * Tests for the base component class
 */

// Mock the imports first
jest.mock('../../../assets/scripts/eventBus.js', () => ({
  eventBus: {
    emit: jest.fn(),
    on: jest.fn(() => jest.fn())
  },
  EVENTS: {}
}));

jest.mock('../../../assets/scripts/stateManager.js', () => ({
  stateManager: {
    subscribe: jest.fn(() => jest.fn())
  }
}));

import { BaseComponent } from '../../../assets/scripts/components/BaseComponent.js';

describe('BaseComponent', () => {
  let element;
  let component;

  beforeEach(() => {
    element = document.createElement('div');
    element.id = 'test-component';
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (component) {
      component.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('Component Initialization', () => {
    test('should initialize with default config', () => {
      component = new BaseComponent(element);
      
      expect(component.element).toBe(element);
      expect(component.config).toHaveProperty('autoInit', true);
      expect(component.config).toHaveProperty('debug', false);
      expect(component.id).toBeDefined();
    });

    test('should merge custom config with defaults', () => {
      const customConfig = {
        debug: true,
        customOption: 'value'
      };

      component = new BaseComponent(element, customConfig);

      expect(component.config.debug).toBe(true);
      expect(component.config.customOption).toBe('value');
      expect(component.config.autoInit).toBe(true); // Should keep default
    });

    test('should generate unique component ID', () => {
      const component1 = new BaseComponent(element, { autoInit: false });
      const component2 = new BaseComponent(element, { autoInit: false });

      expect(component1.id).not.toBe(component2.id);
      expect(component1.id).toMatch(/basecomponent-/);
      
      component1.destroy();
      component2.destroy();
    });

    test('should set data-component-id attribute', () => {
      component = new BaseComponent(element, { autoInit: false });

      expect(element.getAttribute('data-component-id')).toBe(component.id);
    });
  });

  describe('Component Lifecycle', () => {
    test('should auto-initialize by default', async () => {
      const setupSpy = jest.fn();
      const renderSpy = jest.fn();

      class TestComponent extends BaseComponent {
        async setup() { setupSpy(); }
        async render() { renderSpy(); }
      }

      component = new TestComponent(element);
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(setupSpy).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalled();
      expect(component.isInitialized).toBe(true);
    });

    test('should not auto-initialize when autoInit is false', () => {
      component = new BaseComponent(element, { autoInit: false });

      expect(component.isInitialized).toBe(false);
    });

    test('should not initialize twice', async () => {
      const setupSpy = jest.fn();

      class TestComponent extends BaseComponent {
        async setup() { setupSpy(); }
      }

      component = new TestComponent(element, { autoInit: false });

      await component.init();
      await component.init(); // Second call

      expect(setupSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle initialization errors gracefully', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      class TestComponent extends BaseComponent {
        async setup() {
          throw new Error('Setup failed');
        }
      }

      component = new TestComponent(element, { autoInit: false });
      await component.init();

      expect(component.isInitialized).toBe(false);
      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });
  });

  describe('Event Management', () => {
    beforeEach(() => {
      component = new BaseComponent(element, { autoInit: false });
    });

    test('should add event listeners with cleanup tracking', () => {
      const handler = jest.fn();
      const mockElement = document.createElement('button');

      component.addEventListener(mockElement, 'click', handler);

      expect(component.eventListeners.has(mockElement)).toBe(true);
      expect(component.eventListeners.get(mockElement).has('click')).toBe(true);
    });

    test('should remove specific event listeners', () => {
      const handler = jest.fn();
      const mockElement = document.createElement('button');

      component.addEventListener(mockElement, 'click', handler);
      component.removeEventListener(mockElement, 'click');

      expect(component.eventListeners.has(mockElement)).toBe(false);
    });

    test('should remove all event listeners on destroy', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const mockElement1 = document.createElement('button');
      const mockElement2 = document.createElement('input');

      component.addEventListener(mockElement1, 'click', handler1);
      component.addEventListener(mockElement2, 'change', handler2);

      await component.destroy();

      expect(component.eventListeners.size).toBe(0);
    });
  });

  describe('CSS Class Management', () => {
    beforeEach(() => {
      component = new BaseComponent(element, { autoInit: false });
    });

    test('should add CSS classes', () => {
      component.addClass('test-class');
      expect(element.classList.contains('test-class')).toBe(true);
    });

    test('should remove CSS classes', () => {
      element.classList.add('test-class');
      component.removeClass('test-class');
      expect(element.classList.contains('test-class')).toBe(false);
    });

    test('should toggle CSS classes', () => {
      const result1 = component.toggleClass('test-class');
      expect(element.classList.contains('test-class')).toBe(true);
      expect(result1).toBe(true);

      const result2 = component.toggleClass('test-class');
      expect(element.classList.contains('test-class')).toBe(false);
      expect(result2).toBe(false);
    });

    test('should check for CSS classes', () => {
      element.classList.add('existing-class');
      
      expect(component.hasClass('existing-class')).toBe(true);
      expect(component.hasClass('non-existing-class')).toBe(false);
    });
  });

  describe('Element Queries', () => {
    beforeEach(() => {
      element.innerHTML = `
        <div class="child1">Child 1</div>
        <div class="child2">Child 2</div>
        <div class="child2">Child 3</div>
      `;
      component = new BaseComponent(element, { autoInit: false });
    });

    test('should query single element', () => {
      const child = component.$('.child1');
      expect(child).toBeInstanceOf(Element);
      expect(child.textContent).toBe('Child 1');
    });

    test('should query multiple elements', () => {
      const children = component.$$('.child2');
      expect(children).toHaveLength(2);
      expect(children[0].textContent).toBe('Child 2');
      expect(children[1].textContent).toBe('Child 3');
    });
  });

  describe('Visibility Management', () => {
    beforeEach(() => {
      component = new BaseComponent(element, { autoInit: false });
    });

    test('should show element', () => {
      element.style.display = 'none';
      element.setAttribute('hidden', '');

      component.show();

      expect(element.style.display).toBe('');
      expect(element.hasAttribute('hidden')).toBe(false);
      expect(element.classList.contains('visible')).toBe(true);
      expect(element.classList.contains('hidden')).toBe(false);
    });

    test('should hide element', () => {
      component.hide();

      expect(element.style.display).toBe('none');
      expect(element.hasAttribute('hidden')).toBe(true);
      expect(element.classList.contains('hidden')).toBe(true);
      expect(element.classList.contains('visible')).toBe(false);
    });

    test('should check visibility status', () => {
      expect(component.isVisible()).toBe(true);

      component.hide();
      expect(component.isVisible()).toBe(false);

      component.show();
      expect(component.isVisible()).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    beforeEach(() => {
      component = new BaseComponent(element, { autoInit: false });
    });

    test('should update configuration', () => {
      const newConfig = {
        debug: true,
        newOption: 'value'
      };

      component.updateConfig(newConfig);

      expect(component.config.debug).toBe(true);
      expect(component.config.newOption).toBe('value');
      expect(component.config.autoInit).toBe(false); // Should preserve existing
    });
  });

  describe('Debug Information', () => {
    beforeEach(() => {
      component = new BaseComponent(element, { autoInit: false });
    });

    test('should provide debug information', () => {
      const debugInfo = component.getDebugInfo();

      expect(debugInfo).toHaveProperty('id');
      expect(debugInfo).toHaveProperty('name', 'BaseComponent');
      expect(debugInfo).toHaveProperty('isInitialized');
      expect(debugInfo).toHaveProperty('isDestroyed');
      expect(debugInfo).toHaveProperty('config');
      expect(debugInfo).toHaveProperty('element');
    });
  });
});

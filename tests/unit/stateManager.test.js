/**
 * StateManager Tests
 * Tests for the centralized state management
 */
import { StateManager } from '../../assets/scripts/stateManager.js';

describe('StateManager', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  describe('State Management', () => {
    test('should get initial state', () => {
      expect(stateManager.getState('isLoading')).toBe(false);
      expect(stateManager.getState('currentSection')).toBe('hero');
      expect(stateManager.getState('theme')).toBe('dark');
    });

    test('should set state values', () => {
      stateManager.setState('isLoading', true);
      expect(stateManager.getState('isLoading')).toBe(true);
    });

    test('should handle nested state paths', () => {
      stateManager.setState('preferences.reducedMotion', true);
      expect(stateManager.getState('preferences.reducedMotion')).toBe(true);
      expect(stateManager.getState('preferences')).toHaveProperty('reducedMotion', true);
    });

    test('should handle bulk state updates', () => {
      const updates = {
        isLoading: true,
        currentSection: 'about',
        'preferences.fontSize': 'large'
      };

      stateManager.setState(updates);

      expect(stateManager.getState('isLoading')).toBe(true);
      expect(stateManager.getState('currentSection')).toBe('about');
      expect(stateManager.getState('preferences.fontSize')).toBe('large');
    });
  });

  describe('State Subscriptions', () => {
    test('should subscribe to state changes', () => {
      const callback = jest.fn();
      stateManager.subscribe('isLoading', callback);

      stateManager.setState('isLoading', true);

      expect(callback).toHaveBeenCalledWith(true, 'isLoading');
    });

    test('should call subscriber immediately if immediate option is true', () => {
      const callback = jest.fn();
      stateManager.subscribe('isLoading', callback, { immediate: true });

      expect(callback).toHaveBeenCalledWith(false, 'isLoading');
    });

    test('should not call subscriber immediately if immediate option is false', () => {
      const callback = jest.fn();
      stateManager.subscribe('isLoading', callback, { immediate: false });

      expect(callback).not.toHaveBeenCalled();
    });

    test('should unsubscribe from state changes', () => {
      const callback = jest.fn();
      const unsubscribe = stateManager.subscribe('isLoading', callback, { immediate: false });

      unsubscribe();
      stateManager.setState('isLoading', true);

      expect(callback).not.toHaveBeenCalled();
    });

    test('should handle once subscriptions', () => {
      const callback = jest.fn();
      stateManager.subscribe('isLoading', callback, { once: true, immediate: false });

      stateManager.setState('isLoading', true);
      stateManager.setState('isLoading', false);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('State History', () => {
    test('should track state changes in history', () => {
      stateManager.setState('isLoading', true);
      stateManager.setState('currentSection', 'about');

      const history = stateManager.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0]).toHaveProperty('timestamp');
      expect(history[0]).toHaveProperty('oldState');
      expect(history[0]).toHaveProperty('newState');
    });

    test('should clear history', () => {
      stateManager.setState('isLoading', true);
      stateManager.clearHistory();

      expect(stateManager.getHistory()).toHaveLength(0);
    });
  });

  describe('Batch Updates', () => {
    test('should batch state updates', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      stateManager.subscribe('isLoading', callback1, { immediate: false });
      stateManager.subscribe('currentSection', callback2, { immediate: false });

      stateManager.batch(() => {
        stateManager.setState('isLoading', true);
        stateManager.setState('currentSection', 'about');
        stateManager.setState('isLoading', false);
      });

      // Should be called once for each final state
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback1).toHaveBeenCalledWith(false, 'isLoading');
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledWith('about', 'currentSection');
    });
  });

  describe('Computed State', () => {
    test('should create computed state values', () => {
      stateManager.setState('firstName', 'John');
      stateManager.setState('lastName', 'Doe');

      stateManager.computed(
        (first, last) => `${first} ${last}`,
        ['firstName', 'lastName'],
        'fullName'
      );

      expect(stateManager.getState('fullName')).toBe('John Doe');

      // Update dependency
      stateManager.setState('firstName', 'Jane');
      expect(stateManager.getState('fullName')).toBe('Jane Doe');
    });
  });

  describe('State Reset', () => {
  test('should reset specific state keys', () => {
    stateManager.setState('isLoading', true);
    stateManager.setState('currentSection', 'about');

    stateManager.resetState(['isLoading']);

    expect(stateManager.getState('isLoading')).toBe(false);
    expect(stateManager.getState('currentSection')).toBe('about');
  });    test('should reset all state', () => {
      stateManager.setState('isLoading', true);
      stateManager.setState('currentSection', 'about');

      stateManager.resetState();

      expect(stateManager.getState('isLoading')).toBe(false);
      expect(stateManager.getState('currentSection')).toBe('hero');
    });
  });

  describe('Debug Information', () => {
    test('should provide debug information', () => {
      const callback = jest.fn();
      stateManager.subscribe('isLoading', callback);

      const debugInfo = stateManager.getDebugInfo();

      expect(debugInfo).toHaveProperty('stateKeys');
      expect(debugInfo).toHaveProperty('subscriberCount');
      expect(debugInfo).toHaveProperty('subscriptions');
      expect(debugInfo).toHaveProperty('historyLength');

      expect(debugInfo.stateKeys).toContain('isLoading');
      expect(debugInfo.subscriberCount).toBeGreaterThan(0);
    });
  });
});

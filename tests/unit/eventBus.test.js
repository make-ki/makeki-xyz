/**
 * EventBus Tests
 * Tests for the global event system
 */
import { EventBus, EVENTS } from '../../assets/scripts/eventBus.js';

describe('EventBus', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  afterEach(() => {
    eventBus.removeAllListeners();
  });

  describe('Event Subscription', () => {
    test('should subscribe to events', () => {
      const callback = jest.fn();
      const unsubscribe = eventBus.on('test-event', callback);

      expect(typeof unsubscribe).toBe('function');
      expect(eventBus.getListenerCount('test-event')).toBe(1);
    });

    test('should unsubscribe from events', () => {
      const callback = jest.fn();
      const unsubscribe = eventBus.on('test-event', callback);

      unsubscribe();
      expect(eventBus.getListenerCount('test-event')).toBe(0);
    });

    test('should handle multiple subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);

      expect(eventBus.getListenerCount('test-event')).toBe(2);
    });
  });

  describe('Event Emission', () => {
    test('should emit events to subscribers', () => {
      const callback = jest.fn();
      eventBus.on('test-event', callback);

      const testData = { message: 'hello' };
      eventBus.emit('test-event', testData);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({
        type: 'test-event',
        data: testData,
        timestamp: expect.any(Number),
        source: 'unknown'
      });
    });

    test('should not call subscribers after unsubscription', () => {
      const callback = jest.fn();
      const unsubscribe = eventBus.on('test-event', callback);

      unsubscribe();
      eventBus.emit('test-event', { test: true });

      expect(callback).not.toHaveBeenCalled();
    });

    test('should handle errors in event handlers gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Handler error');
      });
      const normalCallback = jest.fn();

      eventBus.on('test-event', errorCallback);
      eventBus.on('test-event', normalCallback);

      // Should not throw
      expect(() => {
        eventBus.emit('test-event', {});
      }).not.toThrow();

      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
    });
  });

  describe('Once Subscription', () => {
    test('should call once subscribers only once', () => {
      const callback = jest.fn();
      eventBus.once('test-event', callback);

      eventBus.emit('test-event', { first: true });
      eventBus.emit('test-event', { second: true });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({
        type: 'test-event',
        data: { first: true },
        timestamp: expect.any(Number),
        source: 'unknown'
      });
    });
  });

  describe('Priority Handling', () => {
    test('should call higher priority handlers first', () => {
      const calls = [];
      const lowPriority = jest.fn(() => calls.push('low'));
      const highPriority = jest.fn(() => calls.push('high'));

      eventBus.on('test-event', lowPriority, { priority: 1 });
      eventBus.on('test-event', highPriority, { priority: 10 });

      eventBus.emit('test-event', {});

      expect(calls).toEqual(['high', 'low']);
    });
  });

  describe('Namespaced Events', () => {
    test('should create namespaced event bus', () => {
      const namespacedBus = eventBus.namespace('test');
      const callback = jest.fn();

      namespacedBus.on('event', callback);
      namespacedBus.emit('event', { data: true });

      expect(callback).toHaveBeenCalledWith({
        type: 'test:event',
        data: { data: true },
        timestamp: expect.any(Number),
        source: 'test'
      });
    });
  });

  describe('Debug Mode', () => {
    test('should log events in debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      eventBus.setDebugMode(true);

      const callback = jest.fn();
      eventBus.on('test-event', callback);
      eventBus.emit('test-event', {});

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Event Constants', () => {
    test('should have defined event constants', () => {
      expect(EVENTS.APP_INIT).toBe('app:init');
      expect(EVENTS.APP_READY).toBe('app:ready');
      expect(EVENTS.SECTION_CHANGE).toBe('navigation:section-change');
      expect(EVENTS.THEME_CHANGE).toBe('ui:theme-change');
    });
  });
});

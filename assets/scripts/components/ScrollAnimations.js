/**
 * ScrollAnimations Component
 * Handles intersection observer-based scroll animations
 */

import { BaseComponent } from './BaseComponent.js';

export class ScrollAnimations extends BaseComponent {
    constructor() {
        super('ScrollAnimations');
        this.observer = null;
        this.animatedElements = new Set();
    }

    async init() {
        try {
            this.createIntersectionObserver();
            this.observeElements();
            this.emit('scroll-animations:ready');
            this.debug('ScrollAnimations initialized');
        } catch (error) {
            this.handleError('Failed to initialize scroll animations', error);
        }
    }

    createIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -100px 0px', // Trigger 100px before element enters viewport
            threshold: [0.1, 0.5] // Trigger at 10% and 50% visibility
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => this.handleIntersection(entry));
        }, options);
    }

    handleIntersection(entry) {
        const element = entry.target;
        const animationClass = element.dataset.animation || 'fade-in';
        
        if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
            // Element is entering the viewport
            if (!this.animatedElements.has(element)) {
                this.animateElement(element, animationClass);
                this.animatedElements.add(element);
                
                // Emit event for other components to react
                this.emit('element:animated', {
                    element,
                    animationClass,
                    direction: 'in'
                });
            }
        }
    }

    animateElement(element, animationClass) {
        // Add the visible class to trigger CSS animation
        element.classList.add('visible');
        
        // Handle staggered animations
        if (element.classList.contains('stagger-children')) {
            this.handleStaggeredAnimation(element);
        }
        
        this.debug(`Animated element with class: ${animationClass}`, element);
    }

    handleStaggeredAnimation(parent) {
        const children = parent.children;
        Array.from(children).forEach((child, index) => {
            setTimeout(() => {
                child.classList.add('visible');
            }, index * 100); // 100ms delay between each child
        });
    }

    observeElements() {
        // Observe all elements with animation classes
        const animationSelectors = [
            '.fade-in',
            '.fade-in-left',
            '.fade-in-right',
            '.fade-in-up',
            '.fade-in-scale',
            '.stagger-children'
        ];

        animationSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.observer.observe(element);
            });
        });

        this.debug(`Observing ${document.querySelectorAll(animationSelectors.join(', ')).length} elements for scroll animations`);
    }

    // Method to add new elements to observe (for dynamically added content)
    observeElement(element) {
        if (this.observer && element) {
            this.observer.observe(element);
            this.debug('Added new element to scroll observer', element);
        }
    }

    // Method to stop observing an element
    unobserveElement(element) {
        if (this.observer && element) {
            this.observer.unobserve(element);
            this.animatedElements.delete(element);
            this.debug('Removed element from scroll observer', element);
        }
    }

    // Method to manually trigger animation on an element
    triggerAnimation(element, animationClass = 'fade-in') {
        if (!this.animatedElements.has(element)) {
            element.classList.add(animationClass);
            this.animateElement(element, animationClass);
            this.animatedElements.add(element);
        }
    }

    // Method to reset an element's animation
    resetAnimation(element) {
        element.classList.remove('visible');
        this.animatedElements.delete(element);
        
        // Remove any staggered animation states
        if (element.classList.contains('stagger-children')) {
            Array.from(element.children).forEach(child => {
                child.classList.remove('visible');
            });
        }
        
        this.debug('Reset animation for element', element);
    }

    // Method to refresh observer (useful when DOM changes)
    refresh() {
        if (this.observer) {
            this.observer.disconnect();
            this.animatedElements.clear();
            this.observeElements();
            this.debug('Refreshed scroll animations observer');
        }
    }

    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.animatedElements.clear();
        super.cleanup();
    }

    // Utility method to add animation class to an element
    static addAnimationClass(element, animationClass = 'fade-in') {
        element.classList.add(animationClass);
    }

    // Utility method to create animated sections
    static createAnimatedSection(content, animationClass = 'fade-in') {
        const section = document.createElement('section');
        section.classList.add(animationClass);
        section.innerHTML = content;
        return section;
    }
}

/**
 * About Component
 * Handles about section with animated statistics and content
 */
import { BaseComponent } from './BaseComponent.js';
import { $ } from '../utils/dom.js';

export class AboutComponent extends BaseComponent {
  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      className: 'about-section'
    };
  }

  async setup() {
    // Get stat elements for animation
    this.statNumbers = this.$$('.stat-number');
  }

  async render() {
    // Component will use static HTML for now
    console.log('About component initialized');
  }
}

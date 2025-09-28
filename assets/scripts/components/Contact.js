/**
 * Contact Component
 * Handles contact section with form and social links
 */
import { BaseComponent } from './BaseComponent.js';

export class ContactComponent extends BaseComponent {
  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      className: 'contact-section'
    };
  }

  async render() {
    console.log('Contact component initialized');
  }
}

/**
 * Experience Component
 * Handles experience section with timeline
 */
import { BaseComponent } from './BaseComponent.js';

export class ExperienceComponent extends BaseComponent {
  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      className: 'experience-section'
    };
  }

  async render() {
    console.log('Experience component initialized');
  }
}

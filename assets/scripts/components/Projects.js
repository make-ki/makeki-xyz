/**
 * Projects Component
 * Handles projects section with filtering and grid layout
 */
import { BaseComponent } from './BaseComponent.js';

export class ProjectsComponent extends BaseComponent {
  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      className: 'projects-section'
    };
  }

  async render() {
    console.log('Projects component initialized');
  }
}

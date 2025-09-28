/**
 * Application Configuration
 * Central configuration object for the entire application
 */
export const AppConfig = {
  // API endpoints
  api: {
    skillIcons: 'https://skillicons.dev/icons',
    github: 'https://api.github.com/users/make-ki',
    blog: '/api/blog'
  },
  
  // Animation settings
  animations: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    stagger: 100,
    scrollOffset: 100
  },
  
  // Theme settings
  theme: {
    colors: {
      primary: '#ffffff',
      secondary: '#888888',
      background: '#000000',
      accent: '#007acc',
      text: '#ffffff',
      textMuted: '#cccccc'
    },
    fonts: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace"
    },
    breakpoints: {
      mobile: '768px',
      tablet: '1024px',
      desktop: '1200px'
    }
  },
  
  // Component settings
  components: {
    hero: {
      backgroundImage: 'index.gif',
      typingSpeed: 50,
      deleteSpeed: 30,
      pauseDuration: 2000,
      phrases: [
        'Movie enjoyer', 
        'Music enjoyer', 
        'CTFs over weekend enjoyer (no)', 
        'Programming Problems Enjoyer (i suck)', 
        'Anime enjoyer', 
        'cute things enjoyer', 
        'Math enjoyer (other than coursework)', 
        'reddit >> 4chan (boo)', 
        'ADRIAAANNNNNN!!!',
        'That\'s it dude ._.',
        'Movie enjoyer',
        'Music enjoyer',
        'sike...!!..',
        'really?',  
      ]
    },
    skills: {
      categories: {
        'Languages': ['javascript', 'typescript', 'python', 'cpp', 'java'],
        'Frontend': ['react', 'html', 'css', 'tailwindcss', 'sass'],
        'Backend': ['nodejs', 'express', 'fastapi', 'flask', 'postgresql'],
        'Tools': ['git', 'docker', 'linux', 'vscode', 'postman']
      },
      iconsPerRow: 6,
      animationDelay: 100
    },
    projects: {
      itemsPerPage: 6,
      categories: ['all', 'web', 'mobile', 'ai', 'tools']
    },
    navigation: {
      sections: ['hero', 'about', 'skills', 'experience', 'projects', 'blog', 'contact'],
      smoothScrollDuration: 800
    }
  },
  
  // Social links
  social: {
    github: 'https://github.com/make-ki',
    linkedin: 'https://linkedin.com/in/makeki',
    twitter: 'https://twitter.com/makeki',
    email: 'contact@makeki.xyz'
  },
  
  // Performance settings
  performance: {
    enableLazyLoading: true,
    imageQuality: 85,
    enableServiceWorker: true,
    cacheMaxAge: 300000 // 5 minutes
  },
  
  // Development settings
  development: {
    enableDebugMode: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
    enablePerformanceMetrics: true,
    logLevel: 'info'
  }
};

/**
 * Get configuration value by path
 * @param {string} path - Dot notation path (e.g., 'theme.colors.primary')
 * @param {any} defaultValue - Default value if path doesn't exist
 * @returns {any} Configuration value
 */
export function getConfig(path, defaultValue = undefined) {
  return path.split('.').reduce((obj, key) => {
    return obj && obj[key] !== undefined ? obj[key] : defaultValue;
  }, AppConfig);
}

/**
 * Set configuration value by path
 * @param {string} path - Dot notation path
 * @param {any} value - Value to set
 */
export function setConfig(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((obj, key) => {
    if (!obj[key]) obj[key] = {};
    return obj[key];
  }, AppConfig);
  target[lastKey] = value;
}

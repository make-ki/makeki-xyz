# MakeKi.xyz - Modern Modular Portfolio Website

A completely revamped portfolio website built with modern web technologies, emphasizing modularity, maintainability, and performance.

## 🚀 Features

- **Modular Architecture**: Component-based design with clear separation of concerns
- **Modern JavaScript**: ES6+ modules, async/await, and clean code practices  
- **Responsive Design**: Mobile-first approach with smooth animations
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Performance Optimized**: Lazy loading, efficient animations, and optimized assets
- **Test-Driven**: Comprehensive unit and integration tests
- **Type-Safe**: JSDoc annotations for better developer experience

## 🏗️ Architecture

### Core Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Dependency Injection**: Components receive dependencies rather than creating them
3. **Event-Driven**: Loose coupling through centralized event system
4. **Configuration-Based**: Behavior controlled through configuration objects

### Project Structure

```
/
├── assets/
│   ├── scripts/
│   │   ├── components/          # UI Components
│   │   ├── utils/              # Utility functions
│   │   ├── services/           # API services
│   │   ├── config.js           # Application configuration
│   │   ├── eventBus.js         # Global event system
│   │   ├── stateManager.js     # State management
│   │   └── main.js             # Application entry point
│   └── styles/
│       ├── main.css            # Main stylesheet
│       └── components/         # Component-specific styles
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── setup.js               # Test configuration
├── docs/                       # Documentation
├── package.json               # Dependencies and scripts
├── PROJECT_REQUIREMENTS.md    # Detailed requirements
└── ARCHITECTURE.md           # Architecture documentation
```

## 🛠️ Components

### Core System
- **App Controller**: Main application orchestrator
- **Event Bus**: Global publish-subscribe event system
- **State Manager**: Centralized reactive state management
- **Base Component**: Abstract component class with common functionality

### UI Components
- **Navigation**: Smooth scroll navigation with active section tracking
- **Hero**: Animated background with typing effect
- **About**: Personal introduction with animated statistics
- **Skills**: Dynamic skill categories with icons
- **Experience**: Timeline-based work history
- **Projects**: Filterable portfolio grid
- **Blog**: Article listings with RSS integration
- **Contact**: Social links and contact information

## 🧪 Testing

The project includes comprehensive testing with Jest:

- **Unit Tests**: Individual component and utility testing
- **Integration Tests**: Component interaction testing
- **Coverage**: 80%+ code coverage requirement
- **Accessibility**: Automated accessibility testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Development

### Prerequisites
- Node.js 16.0.0 or higher
- Modern web browser with ES6+ support

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/make-ki/makeki-xyz.git
   cd makeki-xyz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

### Development Commands

```bash
# Development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Run Lighthouse audit
npm run lighthouse
```

## 🎨 Customization

### Configuration

The application is highly configurable through `assets/scripts/config.js`:

```javascript
export const AppConfig = {
  // Component settings
  components: {
    hero: {
      phrases: ['Developer', 'Creator', 'Problem Solver'],
      typingSpeed: 100,
      backgroundImage: 'index.gif'
    },
    skills: {
      categories: {
        'Languages': ['javascript', 'typescript', 'python'],
        'Frontend': ['react', 'vue', 'angular'],
        // ...
      }
    }
  },
  
  // Theme settings
  theme: {
    colors: {
      primary: '#ffffff',
      accent: '#007acc',
      // ...
    }
  }
};
```

### Adding New Components

1. **Create component file**
   ```javascript
   // assets/scripts/components/MyComponent.js
   import { BaseComponent } from './BaseComponent.js';

   export class MyComponent extends BaseComponent {
     getDefaultConfig() {
       return {
         ...super.getDefaultConfig(),
         className: 'my-component'
       };
     }

     async setup() {
       // Component initialization
     }

     async render() {
       // Component rendering
     }
   }
   ```

2. **Register in main app**
   ```javascript
   // assets/scripts/main.js
   import { MyComponent } from './components/MyComponent.js';

   // Add to component initialization
   {
     name: 'myComponent',
     class: MyComponent,
     selector: '#my-component',
     config: {}
   }
   ```

3. **Add styles**
   ```css
   /* assets/styles/components/my-component.css */
   .my-component {
     /* Component styles */
   }
   ```

4. **Write tests**
   ```javascript
   // tests/unit/components/MyComponent.test.js
   import { MyComponent } from '../../../assets/scripts/components/MyComponent.js';

   describe('MyComponent', () => {
     // Component tests
   });
   ```

## 🔧 Performance

### Optimization Features
- **Lazy Loading**: Components and images load when needed
- **Event Throttling**: Scroll and resize events are throttled
- **Memory Management**: Automatic cleanup of event listeners and subscriptions
- **Efficient Animations**: RequestAnimationFrame and CSS transforms
- **Cache Management**: Intelligent caching of API responses

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s  
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## ♿ Accessibility

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Semantic HTML and ARIA attributes
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Proper focus indicators and tab order

### Testing Accessibility
```bash
# Validate HTML
npm run validate

# Run Lighthouse accessibility audit
npm run lighthouse
```

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📚 Documentation

- [Project Requirements](PROJECT_REQUIREMENTS.md) - Detailed project specifications
- [Architecture Guide](ARCHITECTURE.md) - Technical architecture documentation
- [Component API](docs/components/) - Individual component documentation
- [Testing Guide](docs/testing.md) - Testing strategies and examples

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- ESLint configuration for code quality
- Prettier for consistent formatting
- JSDoc for function documentation
- Jest for testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [vishalrmahajan.in](https://vishalrmahajan.in/) for design reference
- Built with modern web standards and best practices
- Focused on accessibility and performance

## 📞 Contact

- Website: [makeki.xyz](https://makeki.xyz)
- Email: contact@makeki.xyz
- GitHub: [@make-ki](https://github.com/make-ki)

---

Built with ❤️ by MakeKi

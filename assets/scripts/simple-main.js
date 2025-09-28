/**
 * Simple main script without complex imports
 * Just to get the site loading
 */

console.log('🚀 Simple main script loaded');

// Hide loading screen after a short delay
function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
    console.log('✅ Loading screen hidden');
  }
}

// Initialize basic functionality
function initBasicApp() {
  console.log('⚙️ Initializing basic app...');
  
  // Set up basic navigation
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href');
      if (target && target.startsWith('#')) {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
  
  // Update last updated time
  const lastUpdated = document.getElementById('last-updated');
  if (lastUpdated) {
    const now = new Date();
    lastUpdated.textContent = now.toLocaleDateString();
  }
  
  console.log('✅ Basic app initialized');
  hideLoading();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBasicApp);
} else {
  initBasicApp();
}

// Fallback timeout
setTimeout(hideLoading, 3000);

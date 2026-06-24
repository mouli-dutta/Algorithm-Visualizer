// Theme management (light/dark mode)

import storage from '../utils/storage.js';

class ThemeManager {
    constructor() {
        this.currentTheme = storage.getTheme();
        this.toggleBtn = null;
        this.themeIcon = null;
    }
    
    init() {
        this.toggleBtn = document.getElementById('themeToggle');
        this.themeIcon = this.toggleBtn?.querySelector('.theme-icon');
        
        this.applyTheme(this.currentTheme);
        
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!storage.get('themeManuallySet')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
    
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        storage.set('themeManuallySet', true);
    }
    
    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        storage.saveTheme(theme);
        
        if (this.themeIcon) {
            this.themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
        
        // Animate the theme icon
        if (this.toggleBtn) {
            this.toggleBtn.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.toggleBtn.style.transform = 'rotate(0deg)';
            }, 300);
        }
    }
    
    getTheme() {
        return this.currentTheme;
    }
}

export default new ThemeManager();

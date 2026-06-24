// Sidebar navigation and algorithm selection

class SidebarManager {
    constructor() {
        this.sidebar = null;
        this.menuToggle = null;
        this.searchInput = null;
        this.categories = [];
        this.navItems = [];
        this.currentAlgorithm = null;
        this.onAlgorithmSelect = null;
    }
    
    init() {
        this.sidebar = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menuToggle');
        this.searchInput = document.getElementById('algorithmSearch');
        
        this.categories = Array.from(document.querySelectorAll('.category-title'));
        this.navItems = Array.from(document.querySelectorAll('.nav-item'));
        
        this.attachListeners();
    }
    
    attachListeners() {
        // Menu toggle for mobile
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggle());
        }
        
        // Category collapse/expand
        this.categories.forEach(category => {
            category.addEventListener('click', () => {
                const parent = category.parentElement;
                parent.classList.toggle('collapsed');
            });
        });
        
        // Algorithm selection
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const algorithm = item.dataset.algorithm;
                const category = this.getCategoryForAlgorithm(item);
                this.selectAlgorithm(algorithm, category, item);
            });
        });
        
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.filterAlgorithms(e.target.value);
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                if (!this.sidebar.contains(e.target) && !this.menuToggle.contains(e.target)) {
                    this.close();
                }
            }
        });
    }
    
    toggle() {
        this.sidebar.classList.toggle('active');
    }
    
    open() {
        this.sidebar.classList.add('active');
    }
    
    close() {
        this.sidebar.classList.remove('active');
    }
    
    selectAlgorithm(algorithm, category, element) {
        // Remove active class from all items
        this.navItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to selected item
        if (element) {
            element.classList.add('active');
        }
        
        this.currentAlgorithm = algorithm;
        
        // Trigger callback
        if (this.onAlgorithmSelect) {
            this.onAlgorithmSelect(algorithm, category);
        }
        
        // Close sidebar on mobile after selection
        if (window.innerWidth <= 1024) {
            this.close();
        }
    }
    
    getCategoryForAlgorithm(item) {
        const categoryElement = item.closest('.nav-category');
        const categoryTitle = categoryElement?.querySelector('.category-title');
        return categoryTitle?.dataset.category || 'unknown';
    }
    
    filterAlgorithms(query) {
        const lowerQuery = query.toLowerCase().trim();
        
        this.navItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(lowerQuery);
            
            item.style.display = matches ? 'block' : 'none';
        });
        
        // Show/hide categories based on visible items
        this.categories.forEach(category => {
            const parent = category.parentElement;
            const items = parent.querySelectorAll('.nav-item');
            const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
            
            parent.style.display = visibleItems.length > 0 ? 'block' : 'none';
            
            // Expand categories with matches
            if (visibleItems.length > 0 && lowerQuery) {
                parent.classList.remove('collapsed');
            }
        });
    }
    
    getCurrentAlgorithm() {
        return this.currentAlgorithm;
    }
    
    highlightAlgorithm(algorithm) {
        const item = this.navItems.find(item => item.dataset.algorithm === algorithm);
        if (item) {
            this.navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            this.currentAlgorithm = algorithm;
        }
    }
}

export default new SidebarManager();

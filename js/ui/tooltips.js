// Tooltip system for interactive help

class TooltipManager {
    constructor() {
        this.tooltip = null;
        this.currentTarget = null;
        this.hideTimeout = null;
    }
    
    init() {
        this.tooltip = document.getElementById('tooltip');
        this.attachListeners();
    }
    
    attachListeners() {
        // Add tooltips to elements with data-tooltip attribute
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.show(target, target.dataset.tooltip);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.hide();
            }
        });
    }
    
    show(target, text) {
        if (!this.tooltip || !text) return;
        
        clearTimeout(this.hideTimeout);
        
        this.tooltip.textContent = text;
        this.tooltip.classList.add('visible');
        this.currentTarget = target;
        
        this.position(target);
    }
    
    position(target) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        let top = rect.top - tooltipRect.height - 10;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        
        // Adjust if tooltip goes off screen
        if (top < 0) {
            top = rect.bottom + 10;
        }
        
        if (left < 0) {
            left = 10;
        } else if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        this.tooltip.style.top = `${top + window.scrollY}px`;
        this.tooltip.style.left = `${left + window.scrollX}px`;
    }
    
    hide() {
        this.hideTimeout = setTimeout(() => {
            if (this.tooltip) {
                this.tooltip.classList.remove('visible');
                this.currentTarget = null;
            }
        }, 100);
    }
    
    update(text) {
        if (this.tooltip && this.currentTarget) {
            this.tooltip.textContent = text;
        }
    }
}

export default new TooltipManager();

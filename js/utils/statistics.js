// Real-time statistics tracking during algorithm execution

class StatisticsTracker {
    constructor() {
        this.reset();
        this.elements = {
            comparisons: document.getElementById('statComparisons'),
            swaps: document.getElementById('statSwaps'),
            iterations: document.getElementById('statIterations'),
            time: document.getElementById('statTime'),
        };
        this.startTime = null;
        this.timerInterval = null;
    }
    
    reset() {
        this.stats = {
            comparisons: 0,
            swaps: 0,
            iterations: 0,
            arrayAccesses: 0,
            nodesVisited: 0,
            time: 0,
        };
        
        this.updateDisplay();
        this.stopTimer();
    }
    
    increment(stat, value = 1) {
        if (this.stats.hasOwnProperty(stat)) {
            this.stats[stat] += value;
            this.updateDisplay();
        }
    }
    
    set(stat, value) {
        if (this.stats.hasOwnProperty(stat)) {
            this.stats[stat] = value;
            this.updateDisplay();
        }
    }
    
    get(stat) {
        return this.stats[stat] || 0;
    }
    
    getAll() {
        return { ...this.stats };
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.stats.time = Date.now() - this.startTime;
            this.updateDisplay();
        }, 100);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateDisplay() {
        if (this.elements.comparisons) {
            this.animateValue(this.elements.comparisons, this.stats.comparisons);
        }
        if (this.elements.swaps) {
            this.animateValue(this.elements.swaps, this.stats.swaps);
        }
        if (this.elements.iterations) {
            this.animateValue(this.elements.iterations, this.stats.iterations);
        }
        if (this.elements.time) {
            this.elements.time.textContent = `${this.stats.time}ms`;
        }
    }
    
    animateValue(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue !== newValue) {
            element.textContent = newValue;
            element.style.transform = 'scale(1.2)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    // Format statistics for display
    formatStats() {
        return {
            'Comparisons': this.stats.comparisons.toLocaleString(),
            'Swaps': this.stats.swaps.toLocaleString(),
            'Iterations': this.stats.iterations.toLocaleString(),
            'Array Accesses': this.stats.arrayAccesses.toLocaleString(),
            'Nodes Visited': this.stats.nodesVisited.toLocaleString(),
            'Time': `${this.stats.time}ms`,
        };
    }
    
    // Export statistics as text
    exportAsText() {
        const formatted = this.formatStats();
        let text = 'Algorithm Statistics\n';
        text += '='.repeat(30) + '\n';
        
        Object.entries(formatted).forEach(([key, value]) => {
            text += `${key}: ${value}\n`;
        });
        
        return text;
    }
}

export default new StatisticsTracker();

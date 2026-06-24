// Animation utilities and helpers

export class AnimationQueue {
    constructor() {
        this.queue = [];
        this.isRunning = false;
        this.isPaused = false;
        this.currentIndex = 0;
        this.speed = 500;
        this.onComplete = null;
        this.onStep = null;
    }
    
    add(animation) {
        this.queue.push(animation);
    }
    
    addMultiple(animations) {
        this.queue.push(...animations);
    }
    
    clear() {
        this.queue = [];
        this.currentIndex = 0;
        this.isRunning = false;
        this.isPaused = false;
    }
    
    setSpeed(speed) {
        this.speed = speed;
    }
    
    async play() {
        if (this.isRunning && !this.isPaused) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        while (this.currentIndex < this.queue.length && !this.isPaused) {
            const animation = this.queue[this.currentIndex];
            
            if (this.onStep) {
                this.onStep(this.currentIndex, this.queue.length);
            }
            
            await animation();
            await this.delay(this.speed);
            
            this.currentIndex++;
        }
        
        if (this.currentIndex >= this.queue.length) {
            this.isRunning = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.play();
        }
    }
    
    async step() {
        if (this.currentIndex < this.queue.length) {
            const animation = this.queue[this.currentIndex];
            
            if (this.onStep) {
                this.onStep(this.currentIndex, this.queue.length);
            }
            
            await animation();
            this.currentIndex++;
            
            if (this.currentIndex >= this.queue.length && this.onComplete) {
                this.onComplete();
            }
        }
    }
    
    reset() {
        this.currentIndex = 0;
        this.isRunning = false;
        this.isPaused = false;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getProgress() {
        return {
            current: this.currentIndex,
            total: this.queue.length,
            percentage: this.queue.length > 0 ? (this.currentIndex / this.queue.length) * 100 : 0,
        };
    }
}

// Easing functions
export const Easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

// Animate a value from start to end
export function animateValue(start, end, duration, callback, easing = Easing.easeOutQuad) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        const currentValue = start + (end - start) * easedProgress;
        
        callback(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Highlight element with pulse effect
export function highlightElement(element, color, duration = 300) {
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = color;
    element.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        element.style.backgroundColor = originalBg;
        element.style.transform = 'scale(1)';
    }, duration);
}

// Fade in animation
export function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;
        
        element.style.opacity = Math.min(progress, 1);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Fade out animation
export function fadeOut(element, duration = 300) {
    let start = null;
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;
        
        element.style.opacity = 1 - Math.min(progress, 1);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

// Slide in from direction
export function slideIn(element, direction = 'left', duration = 300) {
    const directions = {
        left: 'translateX(-100%)',
        right: 'translateX(100%)',
        top: 'translateY(-100%)',
        bottom: 'translateY(100%)',
    };
    
    element.style.transform = directions[direction];
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = 'translate(0, 0)';
    }, 10);
}

// Confetti animation for celebrations
export function createConfetti(container) {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#fbbf24', '#ef4444'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        container.appendChild(confetti);
        
        const duration = 2000 + Math.random() * 1000;
        const endY = window.innerHeight + 10;
        const endX = (Math.random() - 0.5) * 200;
        
        confetti.animate([
            { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
            { transform: `translate(${endX}px, ${endY}px) rotate(${360 * 3}deg)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }).onfinish = () => confetti.remove();
    }
}

// Shake animation for errors
export function shake(element, duration = 500) {
    const keyframes = [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0)' },
    ];
    
    element.animate(keyframes, {
        duration: duration,
        easing: 'ease-in-out',
    });
}

export default {
    AnimationQueue,
    Easing,
    animateValue,
    highlightElement,
    fadeIn,
    fadeOut,
    slideIn,
    createConfetti,
    shake,
};

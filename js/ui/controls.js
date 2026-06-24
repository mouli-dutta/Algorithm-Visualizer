// Animation control panel management

import { CONFIG } from '../config.js';
import storage from '../utils/storage.js';

class ControlsManager {
    constructor() {
        this.elements = {};
        this.state = {
            isPlaying: false,
            isPaused: false,
            speed: CONFIG.ANIMATION.DEFAULT_SPEED,
            size: CONFIG.DATASET.DEFAULT_SIZE,
        };
        this.callbacks = {
            onPlay: null,
            onPause: null,
            onReset: null,
            onStep: null,
            onGenerate: null,
            onSpeedChange: null,
            onSizeChange: null,
        };
    }
    
    init() {
        this.elements = {
            playBtn: document.getElementById('playBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            stepBtn: document.getElementById('stepBtn'),
            generateBtn: document.getElementById('generateBtn'),
            speedSlider: document.getElementById('speedSlider'),
            speedValue: document.getElementById('speedValue'),
            sizeSlider: document.getElementById('sizeSlider'),
            sizeValue: document.getElementById('sizeValue'),
        };
        
        // Load saved settings
        const settings = storage.getSettings();
        this.state.speed = settings.animationSpeed;
        this.state.size = settings.datasetSize;
        
        this.updateSliders();
        this.attachListeners();
    }
    
    attachListeners() {
        // Play button
        this.elements.playBtn?.addEventListener('click', () => {
            this.play();
        });
        
        // Pause button
        this.elements.pauseBtn?.addEventListener('click', () => {
            this.pause();
        });
        
        // Reset button
        this.elements.resetBtn?.addEventListener('click', () => {
            this.reset();
        });
        
        // Step button
        this.elements.stepBtn?.addEventListener('click', () => {
            this.step();
        });
        
        // Generate button
        this.elements.generateBtn?.addEventListener('click', () => {
            this.generate();
        });
        
        // Speed slider
        this.elements.speedSlider?.addEventListener('input', (e) => {
            this.setSpeed(parseInt(e.target.value));
        });
        
        // Size slider
        this.elements.sizeSlider?.addEventListener('input', (e) => {
            this.setSize(parseInt(e.target.value));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    if (this.state.isPlaying) {
                        this.pause();
                    } else {
                        this.play();
                    }
                    break;
                case 'r':
                case 'R':
                    this.reset();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.step();
                    break;
                case 'g':
                case 'G':
                    this.generate();
                    break;
            }
        });
    }
    
    play() {
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.updateButtons();
        
        if (this.callbacks.onPlay) {
            this.callbacks.onPlay();
        }
    }
    
    pause() {
        this.state.isPlaying = false;
        this.state.isPaused = true;
        this.updateButtons();
        
        if (this.callbacks.onPause) {
            this.callbacks.onPause();
        }
    }
    
    reset() {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.updateButtons();
        
        if (this.callbacks.onReset) {
            this.callbacks.onReset();
        }
    }
    
    step() {
        if (this.callbacks.onStep) {
            this.callbacks.onStep();
        }
    }
    
    generate() {
        this.reset();
        
        if (this.callbacks.onGenerate) {
            this.callbacks.onGenerate();
        }
    }
    
    setSpeed(speed) {
        this.state.speed = speed;
        
        // Update display
        if (this.elements.speedValue) {
            if (speed <= 200) {
                this.elements.speedValue.textContent = 'Fast';
            } else if (speed <= 800) {
                this.elements.speedValue.textContent = 'Medium';
            } else {
                this.elements.speedValue.textContent = 'Slow';
            }
        }
        
        // Save to storage
        storage.updateSettings({ animationSpeed: speed });
        
        if (this.callbacks.onSpeedChange) {
            this.callbacks.onSpeedChange(speed);
        }
    }
    
    setSize(size) {
        this.state.size = size;
        
        // Update display
        if (this.elements.sizeValue) {
            this.elements.sizeValue.textContent = size;
        }
        
        // Save to storage
        storage.updateSettings({ datasetSize: size });
        
        if (this.callbacks.onSizeChange) {
            this.callbacks.onSizeChange(size);
        }
    }
    
    updateButtons() {
        if (this.elements.playBtn) {
            this.elements.playBtn.disabled = this.state.isPlaying;
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.disabled = !this.state.isPlaying;
        }
        if (this.elements.stepBtn) {
            this.elements.stepBtn.disabled = this.state.isPlaying;
        }
    }
    
    updateSliders() {
        if (this.elements.speedSlider) {
            this.elements.speedSlider.value = this.state.speed;
        }
        if (this.elements.sizeSlider) {
            this.elements.sizeSlider.value = this.state.size;
        }
        
        this.setSpeed(this.state.speed);
        this.setSize(this.state.size);
    }
    
    disable() {
        Object.values(this.elements).forEach(element => {
            if (element && element.tagName === 'BUTTON') {
                element.disabled = true;
            }
        });
    }
    
    enable() {
        Object.values(this.elements).forEach(element => {
            if (element && element.tagName === 'BUTTON') {
                element.disabled = false;
            }
        });
        this.updateButtons();
    }
    
    getState() {
        return { ...this.state };
    }
    
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
            this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
        }
    }
}

export default new ControlsManager();

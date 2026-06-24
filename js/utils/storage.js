// LocalStorage management for persistent data

import { CONFIG } from '../config.js';

class StorageManager {
    constructor() {
        this.isAvailable = this.checkAvailability();
    }
    
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage is not available');
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        if (!this.isAvailable) return defaultValue;
        
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Error reading from localStorage: ${key}`, e);
            return defaultValue;
        }
    }
    
    set(key, value) {
        if (!this.isAvailable) return false;
        
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Error writing to localStorage: ${key}`, e);
            return false;
        }
    }
    
    remove(key) {
        if (!this.isAvailable) return false;
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Error removing from localStorage: ${key}`, e);
            return false;
        }
    }
    
    clear() {
        if (!this.isAvailable) return false;
        
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage', e);
            return false;
        }
    }
    
    // Progress-specific methods
    getProgress() {
        const defaultProgress = {
            algorithmsLearned: [],
            visualizationsRun: 0,
            quizzesCompleted: 0,
            totalQuizScore: 0,
            achievements: [],
            lastVisited: null,
            categoryProgress: {
                sorting: [],
                searching: [],
                graph: [],
                dataStructures: [],
            },
        };
        
        return this.get(CONFIG.STORAGE.PROGRESS, defaultProgress);
    }
    
    saveProgress(progress) {
        return this.set(CONFIG.STORAGE.PROGRESS, progress);
    }
    
    updateProgress(updates) {
        const progress = this.getProgress();
        const updatedProgress = { ...progress, ...updates };
        return this.saveProgress(updatedProgress);
    }
    
    addAlgorithmLearned(algorithm, category) {
        const progress = this.getProgress();
        
        if (!progress.algorithmsLearned.includes(algorithm)) {
            progress.algorithmsLearned.push(algorithm);
        }
        
        if (!progress.categoryProgress[category].includes(algorithm)) {
            progress.categoryProgress[category].push(algorithm);
        }
        
        return this.saveProgress(progress);
    }
    
    incrementVisualizations() {
        const progress = this.getProgress();
        progress.visualizationsRun++;
        return this.saveProgress(progress);
    }
    
    addQuizScore(algorithm, score, totalQuestions) {
        const progress = this.getProgress();
        const quizScores = this.getQuizScores();
        
        quizScores[algorithm] = {
            score,
            totalQuestions,
            percentage: Math.round((score / totalQuestions) * 100),
            date: new Date().toISOString(),
        };
        
        progress.quizzesCompleted++;
        progress.totalQuizScore += score;
        
        this.set(CONFIG.STORAGE.QUIZ_SCORES, quizScores);
        return this.saveProgress(progress);
    }
    
    getQuizScores() {
        return this.get(CONFIG.STORAGE.QUIZ_SCORES, {});
    }
    
    addAchievement(achievementId) {
        const progress = this.getProgress();
        
        if (!progress.achievements.includes(achievementId)) {
            progress.achievements.push(achievementId);
            return this.saveProgress(progress);
        }
        
        return false;
    }
    
    hasAchievement(achievementId) {
        const progress = this.getProgress();
        return progress.achievements.includes(achievementId);
    }
    
    // Theme methods
    getTheme() {
        return this.get(CONFIG.STORAGE.THEME, 'light');
    }
    
    saveTheme(theme) {
        return this.set(CONFIG.STORAGE.THEME, theme);
    }
    
    // Settings methods
    getSettings() {
        const defaultSettings = {
            animationSpeed: CONFIG.ANIMATION.DEFAULT_SPEED,
            datasetSize: CONFIG.DATASET.DEFAULT_SIZE,
            soundEnabled: false,
        };
        
        return this.get(CONFIG.STORAGE.SETTINGS, defaultSettings);
    }
    
    saveSettings(settings) {
        return this.set(CONFIG.STORAGE.SETTINGS, settings);
    }
    
    updateSettings(updates) {
        const settings = this.getSettings();
        const updatedSettings = { ...settings, ...updates };
        return this.saveSettings(updatedSettings);
    }
    
    // Clear all data
    clearAllData() {
        Object.values(CONFIG.STORAGE).forEach(key => {
            this.remove(key);
        });
        return true;
    }
}

export default new StorageManager();

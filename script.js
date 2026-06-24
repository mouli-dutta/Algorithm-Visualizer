// Main application orchestration

import { CONFIG } from './js/config.js';
import storage from './js/utils/storage.js';
import statistics from './js/utils/statistics.js';
import { AnimationQueue } from './js/utils/animations.js';
import theme from './js/ui/theme.js';
import notifications from './js/ui/notifications.js';
import tooltips from './js/ui/tooltips.js';
import sidebar from './js/ui/sidebar.js';
import controls from './js/ui/controls.js';

// Application state
const appState = {
    currentAlgorithm: null,
    currentCategory: null,
    animationQueue: new AnimationQueue(),
    data: [],
    canvas: null,
    ctx: null,
    isInitialized: false,
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Check if main app is already active (from inline script)
    const mainApp = document.getElementById('mainApp');
    if (mainApp && mainApp.classList.contains('active')) {
        initMainApp();
    } else {
        // Wait for main app to become active
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    initMainApp();
                    observer.disconnect();
                }
            });
        });
        
        if (mainApp) {
            observer.observe(mainApp, { attributes: true, attributeFilter: ['class'] });
        }
    }
});

function initMainApp() {
    const mainApp = document.getElementById('mainApp');
    mainApp.classList.add('active');
    
    // Initialize all managers
    theme.init();
    notifications.init();
    tooltips.init();
    sidebar.init();
    controls.init();
    
    // Initialize canvas
    appState.canvas = document.getElementById('visualizationCanvas');
    appState.ctx = appState.canvas.getContext('2d');
    resizeCanvas();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup control callbacks
    setupControlCallbacks();
    
    // Setup sidebar callback
    sidebar.onAlgorithmSelect = handleAlgorithmSelect;
    
    // Show welcome notification
    notifications.success('Welcome to Algorithm Visualizer!');
    
    appState.isInitialized = true;
}

function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        if (appState.data.length > 0) {
            drawArray(appState.data);
        }
    });
    
    // Progress button
    const progressBtn = document.getElementById('progressBtn');
    progressBtn?.addEventListener('click', showProgressModal);
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Clear progress button
    const clearProgressBtn = document.getElementById('clearProgressBtn');
    clearProgressBtn?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
            storage.clearAllData();
            notifications.success('Progress cleared successfully');
            updateProgressDisplay();
            location.reload();
        }
    });
    
    // Education panel tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Code language tabs
    document.querySelectorAll('.lang-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            switchCodeLanguage(lang);
        });
    });
    
    // Copy code button
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    copyCodeBtn?.addEventListener('click', copyCode);
}

function setupControlCallbacks() {
    controls.on('play', () => {
        if (appState.animationQueue.queue.length === 0) {
            startVisualization();
        } else {
            appState.animationQueue.resume();
        }
    });
    
    controls.on('pause', () => {
        appState.animationQueue.pause();
    });
    
    controls.on('reset', () => {
        resetVisualization();
    });
    
    controls.on('step', () => {
        appState.animationQueue.step();
    });
    
    controls.on('generate', () => {
        generateNewData();
    });
    
    controls.on('speedChange', (speed) => {
        appState.animationQueue.setSpeed(speed);
    });
    
    controls.on('sizeChange', (size) => {
        generateNewData();
    });
}

function handleAlgorithmSelect(algorithm, category) {
    appState.currentAlgorithm = algorithm;
    appState.currentCategory = category;
    
    // Reset visualization
    resetVisualization();
    
    // Generate initial data
    generateNewData();
    
    // Update education panel
    updateEducationPanel(algorithm, category);
    
    // Mark algorithm as learned
    storage.addAlgorithmLearned(algorithm, category);
    
    // Show notification
    const algorithmNames = getAlgorithmNames();
    notifications.info(`Selected: ${algorithmNames[algorithm] || algorithm}`);
}

function generateNewData() {
    const size = controls.getState().size;
    
    if (appState.currentCategory === 'sorting' || appState.currentCategory === 'searching') {
        appState.data = Array.from({ length: size }, () => 
            Math.floor(Math.random() * (CONFIG.DATASET.MAX_VALUE - CONFIG.DATASET.MIN_VALUE + 1)) + CONFIG.DATASET.MIN_VALUE
        );
        
        // Sort for binary search and jump search
        if (appState.currentAlgorithm === 'binarySearch' || appState.currentAlgorithm === 'jumpSearch') {
            appState.data.sort((a, b) => a - b);
        }
        
        drawArray(appState.data);
    }
    
    statistics.reset();
    clearLog();
}

function startVisualization() {
    if (!appState.currentAlgorithm) {
        notifications.warning('Please select an algorithm first');
        return;
    }
    
    resetVisualization();
    statistics.reset();
    statistics.startTimer();
    clearLog();
    
    // Import and run the appropriate algorithm
    runAlgorithm();
    
    // Increment visualizations counter
    storage.incrementVisualizations();
}

async function runAlgorithm() {
    const { currentAlgorithm, currentCategory } = appState;
    
    try {
        if (currentCategory === 'sorting') {
            await runSortingAlgorithm(currentAlgorithm);
        } else if (currentCategory === 'searching') {
            await runSearchingAlgorithm(currentAlgorithm);
        } else {
            notifications.info('This algorithm visualization is coming soon!');
        }
    } catch (error) {
        console.error('Error running algorithm:', error);
        notifications.error('An error occurred during visualization');
    }
}

async function runSortingAlgorithm(algorithm) {
    const { default: sortingAlgorithms } = await import('./js/algorithms/sorting.js');
    const arrayCopy = [...appState.data];
    
    const algorithmMap = {
        bubbleSort: sortingAlgorithms.bubbleSort,
        selectionSort: sortingAlgorithms.selectionSort,
        insertionSort: sortingAlgorithms.insertionSort,
        mergeSort: sortingAlgorithms.mergeSort,
        quickSort: sortingAlgorithms.quickSort,
        heapSort: sortingAlgorithms.heapSort,
    };
    
    const generator = algorithmMap[algorithm](arrayCopy);
    
    appState.animationQueue.clear();
    
    for (const step of generator) {
        appState.animationQueue.add(async () => {
            handleSortingStep(step, arrayCopy);
        });
    }
    
    appState.animationQueue.onComplete = () => {
        statistics.stopTimer();
        notifications.success('Sorting complete!');
        controls.reset();
    };
    
    appState.animationQueue.play();
}

async function runSearchingAlgorithm(algorithm) {
    const { default: searchingAlgorithms } = await import('./js/algorithms/searching.js');
    const arrayCopy = [...appState.data];
    const target = arrayCopy[Math.floor(Math.random() * arrayCopy.length)];
    
    addLog(`Searching for target: ${target}`, true);
    
    const algorithmMap = {
        linearSearch: searchingAlgorithms.linearSearch,
        binarySearch: searchingAlgorithms.binarySearch,
        jumpSearch: searchingAlgorithms.jumpSearch,
    };
    
    const generator = algorithmMap[algorithm](arrayCopy, target);
    
    appState.animationQueue.clear();
    
    for (const step of generator) {
        appState.animationQueue.add(async () => {
            handleSearchingStep(step, arrayCopy);
        });
    }
    
    appState.animationQueue.onComplete = () => {
        statistics.stopTimer();
        controls.reset();
    };
    
    appState.animationQueue.play();
}

function handleSortingStep(step, array) {
    const { type, indices, message } = step;
    
    statistics.increment('iterations');
    
    if (type === 'compare') {
        statistics.increment('comparisons');
        drawArray(array, indices, CONFIG.COLORS.COMPARING);
    } else if (type === 'swap') {
        statistics.increment('swaps');
        drawArray(array, indices, CONFIG.COLORS.SWAPPING);
    } else if (type === 'sorted') {
        drawArray(array, indices, CONFIG.COLORS.SORTED);
    } else if (type === 'complete') {
        drawArray(array, indices, CONFIG.COLORS.SORTED);
    } else {
        drawArray(array, indices, CONFIG.COLORS.COMPARING);
    }
    
    addLog(message);
}

function handleSearchingStep(step, array) {
    const { type, indices, message } = step;
    
    statistics.increment('iterations');
    
    if (type === 'check') {
        statistics.increment('comparisons');
        drawArray(array, indices, CONFIG.COLORS.SEARCHING);
    } else if (type === 'found') {
        drawArray(array, indices, CONFIG.COLORS.FOUND);
        notifications.success(message);
    } else if (type === 'not_found') {
        drawArray(array, [], CONFIG.COLORS.NOT_FOUND);
        notifications.warning(message);
    } else {
        drawArray(array, indices, CONFIG.COLORS.COMPARING);
    }
    
    addLog(message);
}

function resetVisualization() {
    appState.animationQueue.clear();
    appState.animationQueue.reset();
    statistics.reset();
    
    if (appState.data.length > 0) {
        drawArray(appState.data);
    }
}

function resizeCanvas() {
    if (!appState.canvas) return;
    
    const container = appState.canvas.parentElement;
    appState.canvas.width = container.clientWidth;
    appState.canvas.height = container.clientHeight;
}

function drawArray(array, highlightIndices = [], highlightColor = CONFIG.COLORS.DEFAULT) {
    if (!appState.ctx || !appState.canvas) return;
    
    const { ctx, canvas } = appState;
    const { width, height } = canvas;
    
    ctx.clearRect(0, 0, width, height);
    
    const barWidth = (width - CONFIG.CANVAS.PADDING * 2) / array.length - CONFIG.CANVAS.BAR_GAP;
    const maxValue = Math.max(...array);
    
    array.forEach((value, index) => {
        const barHeight = (value / maxValue) * (height - CONFIG.CANVAS.PADDING * 2);
        const x = CONFIG.CANVAS.PADDING + index * (barWidth + CONFIG.CANVAS.BAR_GAP);
        const y = height - CONFIG.CANVAS.PADDING - barHeight;
        
        let color = CONFIG.COLORS.DEFAULT;
        if (highlightIndices.includes(index)) {
            color = highlightColor;
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw value on top for small arrays
        if (array.length <= 20) {
            ctx.fillStyle = theme.getTheme() === 'dark' ? '#fff' : '#000';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(value, x + barWidth / 2, y - 5);
        }
    });
}

function addLog(message, highlight = false) {
    const logContent = document.getElementById('logContent');
    if (!logContent) return;
    
    const entry = document.createElement('div');
    entry.className = 'log-entry' + (highlight ? ' highlight' : '');
    entry.textContent = `> ${message}`;
    
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
    
    // Limit log entries
    while (logContent.children.length > 100) {
        logContent.removeChild(logContent.firstChild);
    }
}

function clearLog() {
    const logContent = document.getElementById('logContent');
    if (logContent) {
        logContent.innerHTML = '';
    }
}

function updateEducationPanel(algorithm, category) {
    // This would load algorithm information
    // For now, show basic info
    const algoName = document.getElementById('algoName');
    const algoDescription = document.getElementById('algoDescription');
    
    const names = getAlgorithmNames();
    if (algoName) algoName.textContent = names[algorithm] || algorithm;
    if (algoDescription) algoDescription.textContent = 'Select Play to start the visualization.';
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
}

function switchCodeLanguage(lang) {
    document.querySelectorAll('.lang-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update code display (placeholder)
    const codeDisplay = document.getElementById('codeDisplay');
    if (codeDisplay) {
        codeDisplay.textContent = `// ${lang} code for ${appState.currentAlgorithm} will be displayed here`;
    }
}

function copyCode() {
    const codeDisplay = document.getElementById('codeDisplay');
    if (codeDisplay) {
        navigator.clipboard.writeText(codeDisplay.textContent);
        notifications.success('Code copied to clipboard!');
    }
}

function showProgressModal() {
    const modal = document.getElementById('progressModal');
    const progress = storage.getProgress();
    
    // Update progress stats
    document.getElementById('algorithmsLearned').textContent = progress.algorithmsLearned.length;
    document.getElementById('visualizationsRun').textContent = progress.visualizationsRun;
    document.getElementById('quizzesCompleted').textContent = progress.quizzesCompleted;
    
    const avgScore = progress.quizzesCompleted > 0 
        ? Math.round((progress.totalQuizScore / progress.quizzesCompleted) * 100) 
        : 0;
    document.getElementById('averageScore').textContent = `${avgScore}%`;
    
    // Update achievements
    updateAchievementsDisplay(progress);
    
    modal.classList.add('active');
}

function updateAchievementsDisplay(progress) {
    const achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;
    
    achievementsGrid.innerHTML = '';
    
    CONFIG.ACHIEVEMENTS.forEach(achievement => {
        const badge = document.createElement('div');
        badge.className = 'achievement-badge';
        badge.title = achievement.description;
        
        const isUnlocked = progress.achievements.includes(achievement.id);
        if (!isUnlocked) {
            badge.classList.add('locked');
        }
        
        badge.textContent = achievement.icon;
        achievementsGrid.appendChild(badge);
    });
}

function updateProgressDisplay() {
    const progress = storage.getProgress();
    updateAchievementsDisplay(progress);
}

function getAlgorithmNames() {
    return {
        bubbleSort: 'Bubble Sort',
        selectionSort: 'Selection Sort',
        insertionSort: 'Insertion Sort',
        mergeSort: 'Merge Sort',
        quickSort: 'Quick Sort',
        heapSort: 'Heap Sort',
        linearSearch: 'Linear Search',
        binarySearch: 'Binary Search',
        jumpSearch: 'Jump Search',
        bfs: 'Breadth First Search',
        dfs: 'Depth First Search',
        dijkstra: "Dijkstra's Algorithm",
        aStar: 'A* Pathfinding',
        stack: 'Stack',
        queue: 'Queue',
        linkedList: 'Linked List',
        bst: 'Binary Search Tree',
    };
}

// Export for debugging
window.appState = appState;

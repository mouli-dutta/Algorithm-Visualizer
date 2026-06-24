// Complete bundled application without ES6 modules

// ===== Configuration =====
const CONFIG = {
    ANIMATION: {
        SPEED_FAST: 50,
        SPEED_MEDIUM: 500,
        SPEED_SLOW: 2000,
        DEFAULT_SPEED: 500,
    },
    DATASET: {
        MIN_SIZE: 10,
        MAX_SIZE: 100,
        DEFAULT_SIZE: 50,
        MIN_VALUE: 5,
        MAX_VALUE: 100,
    },
    CANVAS: {
        PADDING: 20,
        BAR_GAP: 2,
        MIN_BAR_WIDTH: 3,
    },
    COLORS: {
        DEFAULT: '#3b82f6',
        COMPARING: '#fbbf24',
        SWAPPING: '#ef4444',
        SORTED: '#10b981',
        SEARCHING: '#fbbf24',
        FOUND: '#10b981',
        NOT_FOUND: '#ef4444',
    },
    STORAGE: {
        THEME: 'algo_viz_theme',
        PROGRESS: 'algo_viz_progress',
    },
    GRAPH: {
        MIN_NODES: 5,
        MAX_NODES: 30,
        DEFAULT_NODES: 12,
        MIN_DENSITY: 0.2,
        MAX_DENSITY: 0.8,
        DEFAULT_DENSITY: 0.4,
        NODE_RADIUS: 20,
        MIN_WEIGHT: 1,
        MAX_WEIGHT: 10,
    },
};

// ===== Graph Class =====
class Graph {
    constructor() {
        this.nodes = new Map(); // id -> {x, y, label}
        this.edges = new Map(); // "nodeA-nodeB" -> weight
        this.adjacencyList = new Map(); // id -> [neighbor ids]
    }
    
    addNode(id, x, y, label) {
        this.nodes.set(id, { x, y, label });
        if (!this.adjacencyList.has(id)) {
            this.adjacencyList.set(id, []);
        }
    }
    
    removeNode(id) {
        this.nodes.delete(id);
        this.adjacencyList.delete(id);
        
        // Remove all edges connected to this node
        const edgesToRemove = [];
        for (const edgeKey of this.edges.keys()) {
            if (edgeKey.includes(id)) {
                edgesToRemove.push(edgeKey);
            }
        }
        edgesToRemove.forEach(key => this.edges.delete(key));
        
        // Remove from other nodes' adjacency lists
        for (const neighbors of this.adjacencyList.values()) {
            const index = neighbors.indexOf(id);
            if (index > -1) neighbors.splice(index, 1);
        }
    }
    
    addEdge(from, to, weight = 1) {
        const edgeKey = `${from}-${to}`;
        const reverseKey = `${to}-${from}`;
        
        this.edges.set(edgeKey, weight);
        this.edges.set(reverseKey, weight); // Undirected graph
        
        if (!this.adjacencyList.has(from)) this.adjacencyList.set(from, []);
        if (!this.adjacencyList.has(to)) this.adjacencyList.set(to, []);
        
        if (!this.adjacencyList.get(from).includes(to)) {
            this.adjacencyList.get(from).push(to);
        }
        if (!this.adjacencyList.get(to).includes(from)) {
            this.adjacencyList.get(to).push(from);
        }
    }
    
    removeEdge(from, to) {
        this.edges.delete(`${from}-${to}`);
        this.edges.delete(`${to}-${from}`);
        
        const fromNeighbors = this.adjacencyList.get(from);
        const toNeighbors = this.adjacencyList.get(to);
        
        if (fromNeighbors) {
            const index = fromNeighbors.indexOf(to);
            if (index > -1) fromNeighbors.splice(index, 1);
        }
        if (toNeighbors) {
            const index = toNeighbors.indexOf(from);
            if (index > -1) toNeighbors.splice(index, 1);
        }
    }
    
    getNeighbors(id) {
        return this.adjacencyList.get(id) || [];
    }
    
    getWeight(from, to) {
        return this.edges.get(`${from}-${to}`) || 1;
    }
    
    clear() {
        this.nodes.clear();
        this.edges.clear();
        this.adjacencyList.clear();
    }
    
    generateRandom(nodeCount, density, width = 800, height = 400) {
        this.clear();
        
        const padding = 60;
        const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        // Generate nodes in a circular or grid pattern
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * 2 * Math.PI;
            const radius = Math.min(width, height) * 0.35;
            const centerX = width / 2;
            const centerY = height / 2;
            
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            this.addNode(i, x, y, labels[i % labels.length] + (i >= labels.length ? Math.floor(i / labels.length) : ''));
        }
        
        // Generate edges based on density
        const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
        const targetEdges = Math.floor(maxEdges * density);
        
        let edgesCreated = 0;
        const attempts = targetEdges * 3; // Prevent infinite loop
        
        for (let i = 0; i < attempts && edgesCreated < targetEdges; i++) {
            const from = Math.floor(Math.random() * nodeCount);
            const to = Math.floor(Math.random() * nodeCount);
            
            if (from !== to && !this.edges.has(`${from}-${to}`)) {
                const weight = Math.floor(Math.random() * (CONFIG.GRAPH.MAX_WEIGHT - CONFIG.GRAPH.MIN_WEIGHT + 1)) + CONFIG.GRAPH.MIN_WEIGHT;
                this.addEdge(from, to, weight);
                edgesCreated++;
            }
        }
    }
}

// ===== Maze Class =====
class Maze {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.start = null;
        this.target = null;
    }
    
    // Cell types: 0 = wall, 1 = path
    generateMaze(algorithm = 'recursive') {
        // Initialize grid with all walls
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        
        if (algorithm === 'recursive') {
            this.generateRecursiveBacktracking();
        } else {
            this.generateRandomWalls(0.3);
        }
        
        // Set start and target
        this.start = { row: 1, col: 1 };
        this.target = { row: this.rows - 2, col: this.cols - 2 };
        this.grid[this.start.row][this.start.col] = 1;
        this.grid[this.target.row][this.target.col] = 1;
    }
    
    generateRecursiveBacktracking() {
        const stack = [];
        const startRow = 1;
        const startCol = 1;
        
        this.grid[startRow][startCol] = 1;
        stack.push([startRow, startCol]);
        
        const directions = [
            [-2, 0], [2, 0], [0, -2], [0, 2]
        ];
        
        while (stack.length > 0) {
            const [row, col] = stack[stack.length - 1];
            const neighbors = [];
            
            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow > 0 && newRow < this.rows - 1 && 
                    newCol > 0 && newCol < this.cols - 1 && 
                    this.grid[newRow][newCol] === 0) {
                    neighbors.push([newRow, newCol, dr, dc]);
                }
            }
            
            if (neighbors.length > 0) {
                const [newRow, newCol, dr, dc] = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.grid[row + dr / 2][col + dc / 2] = 1;
                this.grid[newRow][newCol] = 1;
                stack.push([newRow, newCol]);
            } else {
                stack.pop();
            }
        }
    }
    
    generateRandomWalls(density) {
        // Initialize all as paths
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = 1;
            }
        }
        
        // Add random walls
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (Math.random() < density) {
                    this.grid[r][c] = 0;
                }
            }
        }
        
        // Ensure borders are walls
        for (let r = 0; r < this.rows; r++) {
            this.grid[r][0] = 0;
            this.grid[r][this.cols - 1] = 0;
        }
        for (let c = 0; c < this.cols; c++) {
            this.grid[0][c] = 0;
            this.grid[this.rows - 1][c] = 0;
        }
    }
    
    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < this.rows && 
                newCol >= 0 && newCol < this.cols && 
                !this.isWall(newRow, newCol)) {
                neighbors.push({ row: newRow, col: newCol });
            }
        }
        
        return neighbors;
    }
    
    isWall(row, col) {
        return this.grid[row][col] === 0;
    }
    
    setStart(row, col) {
        if (!this.isWall(row, col)) {
            this.start = { row, col };
        }
    }
    
    setTarget(row, col) {
        if (!this.isWall(row, col)) {
            this.target = { row, col };
        }
    }
    
    clear() {
        this.grid = [];
        this.start = null;
        this.target = null;
    }
}

// ===== Storage Manager =====
const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },
    
    getTheme() {
        return this.get(CONFIG.STORAGE.THEME, 'light');
    },
    
    saveTheme(theme) {
        return this.set(CONFIG.STORAGE.THEME, theme);
    },
};

// ===== Statistics Tracker =====
const statistics = {
    stats: {
        comparisons: 0,
        swaps: 0,
        iterations: 0,
        time: 0,
    },
    
    elements: {},
    startTime: null,
    timerInterval: null,
    
    init() {
        this.elements = {
            comparisons: document.getElementById('statComparisons'),
            swaps: document.getElementById('statSwaps'),
            iterations: document.getElementById('statIterations'),
            time: document.getElementById('statTime'),
        };
    },
    
    reset() {
        this.stats = {
            comparisons: 0,
            swaps: 0,
            iterations: 0,
            time: 0,
        };
        this.updateDisplay();
        this.stopTimer();
    },
    
    increment(stat, value = 1) {
        if (this.stats.hasOwnProperty(stat)) {
            this.stats[stat] += value;
            this.updateDisplay();
        }
    },
    
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.stats.time = Date.now() - this.startTime;
            this.updateDisplay();
        }, 100);
    },
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    updateDisplay() {
        if (this.elements.comparisons) {
            this.elements.comparisons.textContent = this.stats.comparisons;
        }
        if (this.elements.swaps) {
            this.elements.swaps.textContent = this.stats.swaps;
        }
        if (this.elements.iterations) {
            this.elements.iterations.textContent = this.stats.iterations;
        }
        if (this.elements.time) {
            this.elements.time.textContent = `${this.stats.time}ms`;
        }
    },
};

// ===== Theme Manager =====
const theme = {
    currentTheme: 'light',
    toggleBtn: null,
    themeIcon: null,
    
    init() {
        this.currentTheme = storage.getTheme();
        this.toggleBtn = document.getElementById('themeToggle');
        this.themeIcon = this.toggleBtn?.querySelector('.theme-icon');
        
        this.applyTheme(this.currentTheme);
        
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
    },
    
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    },
    
    applyTheme(themeName) {
        this.currentTheme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);
        storage.saveTheme(themeName);
        
        if (this.themeIcon) {
            this.themeIcon.textContent = themeName === 'light' ? '🌙' : '☀️';
        }
    },
};

// ===== Notifications =====
const notifications = {
    container: null,
    toasts: [],
    
    init() {
        this.container = document.getElementById('toastContainer');
    },
    
    show(message, type = 'info', duration = 3000) {
        if (!this.container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));
        
        this.container.appendChild(toast);
        this.toasts.push(toast);
        
        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }
    },
    
    remove(toast) {
        if (!toast || !toast.parentNode) return;
        toast.parentNode.removeChild(toast);
        this.toasts = this.toasts.filter(t => t !== toast);
    },
    
    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error'); },
    warning(message) { this.show(message, 'warning'); },
    info(message) { this.show(message, 'info'); },
};

// ===== Sidebar Manager =====
const sidebar = {
    sidebar: null,
    menuToggle: null,
    currentAlgorithm: null,
    onAlgorithmSelect: null,
    
    init() {
        this.sidebar = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menuToggle');
        
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggle());
        }
        
        // Category toggles
        document.querySelectorAll('.category-title').forEach(category => {
            category.addEventListener('click', () => {
                category.parentElement.classList.toggle('collapsed');
            });
        });
        
        // Algorithm selection
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const algorithm = item.dataset.algorithm;
                const category = this.getCategoryForAlgorithm(item);
                this.selectAlgorithm(algorithm, category, item);
            });
        });
    },
    
    toggle() {
        this.sidebar.classList.toggle('active');
    },
    
    selectAlgorithm(algorithm, category, element) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        if (element) {
            element.classList.add('active');
        }
        
        this.currentAlgorithm = algorithm;
        
        if (this.onAlgorithmSelect) {
            this.onAlgorithmSelect(algorithm, category);
        }
        
        if (window.innerWidth <= 1024) {
            this.sidebar.classList.remove('active');
        }
    },
    
    getCategoryForAlgorithm(item) {
        const categoryElement = item.closest('.nav-category');
        const categoryTitle = categoryElement?.querySelector('.category-title');
        return categoryTitle?.dataset.category || 'unknown';
    },
};

// ===== Controls Manager =====
const controls = {
    elements: {},
    state: {
        isPlaying: false,
        speed: CONFIG.ANIMATION.DEFAULT_SPEED,
        size: CONFIG.DATASET.DEFAULT_SIZE,
    },
    callbacks: {},
    
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
        
        this.attachListeners();
        this.updateSliders();
    },
    
    attachListeners() {
        this.elements.playBtn?.addEventListener('click', () => this.play());
        this.elements.pauseBtn?.addEventListener('click', () => this.pause());
        this.elements.resetBtn?.addEventListener('click', () => this.reset());
        this.elements.stepBtn?.addEventListener('click', () => this.step());
        this.elements.generateBtn?.addEventListener('click', () => this.generate());
        
        this.elements.speedSlider?.addEventListener('input', (e) => {
            this.setSpeed(parseInt(e.target.value));
        });
        
        this.elements.sizeSlider?.addEventListener('input', (e) => {
            this.setSize(parseInt(e.target.value));
        });
    },
    
    play() {
        this.state.isPlaying = true;
        this.updateButtons();
        if (this.callbacks.onPlay) this.callbacks.onPlay();
    },
    
    pause() {
        this.state.isPlaying = false;
        this.updateButtons();
        if (this.callbacks.onPause) this.callbacks.onPause();
    },
    
    reset() {
        this.state.isPlaying = false;
        this.updateButtons();
        if (this.callbacks.onReset) this.callbacks.onReset();
    },
    
    step() {
        if (this.callbacks.onStep) this.callbacks.onStep();
    },
    
    generate() {
        this.reset();
        if (this.callbacks.onGenerate) this.callbacks.onGenerate();
    },
    
    setSpeed(speed) {
        this.state.speed = speed;
        if (this.elements.speedValue) {
            if (speed <= 200) this.elements.speedValue.textContent = 'Fast';
            else if (speed <= 800) this.elements.speedValue.textContent = 'Medium';
            else this.elements.speedValue.textContent = 'Slow';
        }
        if (this.callbacks.onSpeedChange) this.callbacks.onSpeedChange(speed);
    },
    
    setSize(size) {
        this.state.size = size;
        if (this.elements.sizeValue) {
            this.elements.sizeValue.textContent = size;
        }
        if (this.callbacks.onSizeChange) this.callbacks.onSizeChange(size);
    },
    
    updateButtons() {
        if (this.elements.playBtn) {
            this.elements.playBtn.disabled = this.state.isPlaying;
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.disabled = !this.state.isPlaying;
        }
    },
    
    updateSliders() {
        if (this.elements.speedSlider) {
            this.elements.speedSlider.value = this.state.speed;
        }
        if (this.elements.sizeSlider) {
            this.elements.sizeSlider.value = this.state.size;
        }
        this.setSpeed(this.state.speed);
        this.setSize(this.state.size);
    },
    
    on(event, callback) {
        const eventName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
        this.callbacks[eventName] = callback;
    },
    
    getState() {
        return { ...this.state };
    },
};

// ===== Sorting Algorithms =====
function* bubbleSort(array) {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            yield { type: 'compare', indices: [j, j + 1], message: `Comparing ${array[j]} and ${array[j + 1]}` };
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                yield { type: 'swap', indices: [j, j + 1], message: `Swapping ${array[j + 1]} and ${array[j]}` };
            }
        }
        yield { type: 'sorted', indices: [n - i - 1], message: `Position ${n - i - 1} sorted` };
    }
    yield { type: 'complete', indices: Array.from({ length: n }, (_, i) => i), message: 'Bubble Sort complete!' };
}

function* selectionSort(array) {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            yield { type: 'compare', indices: [minIdx, j], message: `Comparing elements` };
            if (array[j] < array[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
            [array[i], array[minIdx]] = [array[minIdx], array[i]];
            yield { type: 'swap', indices: [i, minIdx], message: `Swapping elements` };
        }
        yield { type: 'sorted', indices: [i], message: `Position ${i} sorted` };
    }
    yield { type: 'complete', indices: Array.from({ length: n }, (_, i) => i), message: 'Selection Sort complete!' };
}

function* insertionSort(array) {
    const n = array.length;
    for (let i = 1; i < n; i++) {
        const key = array[i];
        let j = i - 1;
        while (j >= 0 && array[j] > key) {
            yield { type: 'compare', indices: [j, j + 1], message: `Comparing and shifting` };
            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = key;
        yield { type: 'insert', indices: [j + 1], message: `Inserted element` };
    }
    yield { type: 'complete', indices: Array.from({ length: n }, (_, i) => i), message: 'Insertion Sort complete!' };
}

function* mergeSort(array, start = 0, end = array.length - 1) {
    if (start >= end) return;
    
    const mid = Math.floor((start + end) / 2);
    
    yield { type: 'divide', indices: [start, mid, end], message: `Dividing array [${start}..${end}] at ${mid}` };
    
    yield* mergeSort(array, start, mid);
    yield* mergeSort(array, mid + 1, end);
    yield* merge(array, start, mid, end);
    
    if (start === 0 && end === array.length - 1) {
        yield { type: 'complete', indices: Array.from({ length: array.length }, (_, i) => i), message: 'Merge Sort complete!' };
    }
}

function* merge(array, start, mid, end) {
    const left = array.slice(start, mid + 1);
    const right = array.slice(mid + 1, end + 1);
    
    let i = 0, j = 0, k = start;
    
    while (i < left.length && j < right.length) {
        yield { type: 'compare', indices: [start + i, mid + 1 + j], message: `Comparing during merge` };
        
        if (left[i] <= right[j]) {
            array[k] = left[i];
            i++;
        } else {
            array[k] = right[j];
            j++;
        }
        yield { type: 'merge', indices: [k], message: `Merged element at position ${k}` };
        k++;
    }
    
    while (i < left.length) {
        array[k] = left[i];
        yield { type: 'merge', indices: [k], message: `Copying remaining left element` };
        i++;
        k++;
    }
    
    while (j < right.length) {
        array[k] = right[j];
        yield { type: 'merge', indices: [k], message: `Copying remaining right element` };
        j++;
        k++;
    }
}

function* quickSort(array, low = 0, high = array.length - 1) {
    if (low < high) {
        const pivotIndex = yield* partition(array, low, high);
        yield* quickSort(array, low, pivotIndex - 1);
        yield* quickSort(array, pivotIndex + 1, high);
    }
    
    if (low === 0 && high === array.length - 1) {
        yield { type: 'complete', indices: Array.from({ length: array.length }, (_, i) => i), message: 'Quick Sort complete!' };
    }
}

function* partition(array, low, high) {
    const pivot = array[high];
    let i = low - 1;
    
    yield { type: 'pivot', indices: [high], message: `Pivot: ${pivot} at index ${high}` };
    
    for (let j = low; j < high; j++) {
        yield { type: 'compare', indices: [j, high], message: `Comparing with pivot` };
        
        if (array[j] < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
            yield { type: 'swap', indices: [i, j], message: `Swapping elements` };
        }
    }
    
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    yield { type: 'swap', indices: [i + 1, high], message: `Placing pivot at position ${i + 1}` };
    yield { type: 'sorted', indices: [i + 1], message: `Pivot in final position` };
    
    return i + 1;
}

function* heapSort(array) {
    const n = array.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        yield* heapify(array, n, i);
    }
    
    yield { type: 'heap_built', indices: Array.from({ length: n }, (_, i) => i), message: 'Max heap built' };
    
    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
        [array[0], array[i]] = [array[i], array[0]];
        yield { type: 'swap', indices: [0, i], message: `Moving max to position ${i}` };
        yield { type: 'sorted', indices: [i], message: `Position ${i} sorted` };
        
        yield* heapify(array, i, 0);
    }
    
    yield { type: 'complete', indices: Array.from({ length: n }, (_, i) => i), message: 'Heap Sort complete!' };
}

function* heapify(array, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < n) {
        yield { type: 'compare', indices: [left, largest], message: `Comparing left child` };
        if (array[left] > array[largest]) {
            largest = left;
        }
    }
    
    if (right < n) {
        yield { type: 'compare', indices: [right, largest], message: `Comparing right child` };
        if (array[right] > array[largest]) {
            largest = right;
        }
    }
    
    if (largest !== i) {
        [array[i], array[largest]] = [array[largest], array[i]];
        yield { type: 'swap', indices: [i, largest], message: `Maintaining heap property` };
        yield* heapify(array, n, largest);
    }
}

// ===== Searching Algorithms =====
function* linearSearch(array, target) {
    const n = array.length;
    
    for (let i = 0; i < n; i++) {
        yield { type: 'check', indices: [i], message: `Checking index ${i}: ${array[i]}` };
        
        if (array[i] === target) {
            yield { type: 'found', indices: [i], message: `Target ${target} found at index ${i}!` };
            return i;
        }
    }
    
    yield { type: 'not_found', indices: [], message: `Target ${target} not found` };
    return -1;
}

function* binarySearch(array, target) {
    let left = 0;
    let right = array.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        yield { type: 'range', indices: [left, right], message: `Searching in range [${left}, ${right}]` };
        yield { type: 'check', indices: [mid], message: `Checking middle: ${array[mid]}` };
        
        if (array[mid] === target) {
            yield { type: 'found', indices: [mid], message: `Target ${target} found at index ${mid}!` };
            return mid;
        }
        
        if (array[mid] < target) {
            yield { type: 'eliminate', indices: Array.from({ length: mid - left + 1 }, (_, i) => left + i), message: `Eliminating left half` };
            left = mid + 1;
        } else {
            yield { type: 'eliminate', indices: Array.from({ length: right - mid + 1 }, (_, i) => mid + i), message: `Eliminating right half` };
            right = mid - 1;
        }
    }
    
    yield { type: 'not_found', indices: [], message: `Target ${target} not found` };
    return -1;
}

function* jumpSearch(array, target) {
    const n = array.length;
    const jump = Math.floor(Math.sqrt(n));
    let prev = 0;
    let step = jump;
    
    // Jump through blocks
    while (array[Math.min(step, n) - 1] < target) {
        yield { type: 'jump', indices: [prev, Math.min(step, n) - 1], message: `Jumping from ${prev} to ${Math.min(step, n) - 1}` };
        
        prev = step;
        step += jump;
        
        if (prev >= n) {
            yield { type: 'not_found', indices: [], message: `Target ${target} not found` };
            return -1;
        }
    }
    
    // Linear search in block
    yield { type: 'block', indices: Array.from({ length: Math.min(step, n) - prev }, (_, i) => prev + i), message: `Linear search in block` };
    
    while (prev < Math.min(step, n)) {
        yield { type: 'check', indices: [prev], message: `Checking index ${prev}: ${array[prev]}` };
        
        if (array[prev] === target) {
            yield { type: 'found', indices: [prev], message: `Target ${target} found at index ${prev}!` };
            return prev;
        }
        prev++;
    }
    
    yield { type: 'not_found', indices: [], message: `Target ${target} not found` };
    return -1;
}

function* interpolationSearch(array, target) {
    let low = 0;
    let high = array.length - 1;
    
    while (low <= high && target >= array[low] && target <= array[high]) {
        if (low === high) {
            yield { type: 'check', indices: [low], message: `Checking final position ${low}` };
            
            if (array[low] === target) {
                yield { type: 'found', indices: [low], message: `Target ${target} found at index ${low}!` };
                return low;
            }
            break;
        }
        
        // Interpolation formula
        const pos = low + Math.floor(
            ((target - array[low]) * (high - low)) / (array[high] - array[low])
        );
        
        yield { type: 'range', indices: [low, high], message: `Searching in range [${low}, ${high}]` };
        yield { type: 'check', indices: [pos], message: `Interpolated position: ${pos}, value: ${array[pos]}` };
        
        if (array[pos] === target) {
            yield { type: 'found', indices: [pos], message: `Target ${target} found at index ${pos}!` };
            return pos;
        }
        
        if (array[pos] < target) {
            yield { type: 'eliminate', indices: Array.from({ length: pos - low + 1 }, (_, i) => low + i), message: `Eliminating left portion` };
            low = pos + 1;
        } else {
            yield { type: 'eliminate', indices: Array.from({ length: high - pos + 1 }, (_, i) => pos + i), message: `Eliminating right portion` };
            high = pos - 1;
        }
    }
    
    yield { type: 'not_found', indices: [], message: `Target ${target} not found` };
    return -1;
}

function* exponentialSearch(array, target) {
    const n = array.length;
    
    // Check first element
    yield { type: 'check', indices: [0], message: `Checking first element: ${array[0]}` };
    if (array[0] === target) {
        yield { type: 'found', indices: [0], message: `Target ${target} found at index 0!` };
        return 0;
    }
    
    // Find range for binary search
    let i = 1;
    while (i < n && array[i] <= target) {
        yield { type: 'jump', indices: [i], message: `Checking position ${i}: ${array[i]}` };
        i *= 2;
    }
    
    // Binary search in found range
    const left = Math.floor(i / 2);
    const right = Math.min(i, n - 1);
    
    yield { type: 'range', indices: [left, right], message: `Binary search in range [${left}, ${right}]` };
    
    // Perform binary search
    let low = left;
    let high = right;
    
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        
        yield { type: 'check', indices: [mid], message: `Checking middle: ${array[mid]}` };
        
        if (array[mid] === target) {
            yield { type: 'found', indices: [mid], message: `Target ${target} found at index ${mid}!` };
            return mid;
        }
        
        if (array[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    
    yield { type: 'not_found', indices: [], message: `Target ${target} not found` };
    return -1;
}

function* ternarySearch(array, target) {
    let left = 0;
    let right = array.length - 1;
    
    while (left <= right) {
        const mid1 = left + Math.floor((right - left) / 3);
        const mid2 = right - Math.floor((right - left) / 3);
        
        yield { type: 'range', indices: [left, right], message: `Searching in range [${left}, ${right}]` };
        yield { type: 'check', indices: [mid1, mid2], message: `Checking positions ${mid1} and ${mid2}` };
        
        if (array[mid1] === target) {
            yield { type: 'found', indices: [mid1], message: `Target ${target} found at index ${mid1}!` };
            return mid1;
        }
        
        if (array[mid2] === target) {
            yield { type: 'found', indices: [mid2], message: `Target ${target} found at index ${mid2}!` };
            return mid2;
        }
        
        if (target < array[mid1]) {
            yield { type: 'eliminate', indices: Array.from({ length: right - mid1 + 1 }, (_, i) => mid1 + i), message: `Eliminating right 2/3` };
            right = mid1 - 1;
        } else if (target > array[mid2]) {
            yield { type: 'eliminate', indices: Array.from({ length: mid2 - left + 1 }, (_, i) => left + i), message: `Eliminating left 2/3` };
            left = mid2 + 1;
        } else {
            yield { type: 'eliminate', indices: [...Array.from({ length: mid1 - left }, (_, i) => left + i), ...Array.from({ length: right - mid2 }, (_, i) => mid2 + 1 + i)], message: `Eliminating outer thirds` };
            left = mid1 + 1;
            right = mid2 - 1;
        }
    }
    
    yield { type: 'not_found', indices: [], message: `Target ${target} not found` };
    return -1;
}

// ===== Data Structures =====
// Note: Data structures work differently - they maintain state and perform operations
// These are simplified visualizations

function* stackVisualization(operations) {
    const stack = [];
    
    for (const op of operations) {
        if (op.type === 'push') {
            stack.push(op.value);
            yield {
                type: 'push',
                indices: [stack.length - 1],
                data: [...stack],
                message: `Pushed ${op.value} onto stack. Stack size: ${stack.length}`
            };
        } else if (op.type === 'pop') {
            if (stack.length === 0) {
                yield {
                    type: 'error',
                    indices: [],
                    data: [...stack],
                    message: 'Cannot pop from empty stack!'
                };
            } else {
                const value = stack.pop();
                yield {
                    type: 'pop',
                    indices: [stack.length],
                    data: [...stack],
                    message: `Popped ${value} from stack. Stack size: ${stack.length}`
                };
            }
        } else if (op.type === 'peek') {
            if (stack.length === 0) {
                yield {
                    type: 'error',
                    indices: [],
                    data: [...stack],
                    message: 'Stack is empty!'
                };
            } else {
                yield {
                    type: 'peek',
                    indices: [stack.length - 1],
                    data: [...stack],
                    message: `Top element: ${stack[stack.length - 1]}`
                };
            }
        }
    }
    
    yield {
        type: 'complete',
        indices: [],
        data: [...stack],
        message: 'Stack operations complete!'
    };
}

function* queueVisualization(operations) {
    const queue = [];
    
    for (const op of operations) {
        if (op.type === 'enqueue') {
            queue.push(op.value);
            yield {
                type: 'enqueue',
                indices: [queue.length - 1],
                data: [...queue],
                message: `Enqueued ${op.value}. Queue size: ${queue.length}`
            };
        } else if (op.type === 'dequeue') {
            if (queue.length === 0) {
                yield {
                    type: 'error',
                    indices: [],
                    data: [...queue],
                    message: 'Cannot dequeue from empty queue!'
                };
            } else {
                const value = queue.shift();
                yield {
                    type: 'dequeue',
                    indices: [0],
                    data: [...queue],
                    message: `Dequeued ${value}. Queue size: ${queue.length}`
                };
            }
        }
    }
    
    yield {
        type: 'complete',
        indices: [],
        data: [...queue],
        message: 'Queue operations complete!'
    };
}

// ===== Graph Algorithms =====

function reconstructPath(parent, start, end) {
    const path = [end];
    let current = end;
    while (parent.has(current) && current !== start) {
        current = parent.get(current);
        path.unshift(current);
    }
    return path;
}

function* bfs(graph, startId, targetId) {
    const queue = [startId];
    const visited = new Set([startId]);
    const parent = new Map();
    
    const startLabel = graph.nodes.get(startId).label;
    const targetLabel = graph.nodes.get(targetId).label;
    
    yield { type: 'start', node: startId, message: `🎯 Finding path from ${startLabel} to ${targetLabel}` };
    yield { type: 'start', node: startId, message: `Starting BFS from node ${startLabel}` };
    
    while (queue.length > 0) {
        const current = queue.shift();
        const currentLabel = graph.nodes.get(current).label;
        yield { type: 'visiting', node: current, message: `Visiting node ${currentLabel}` };
        
        if (current === targetId) {
            yield { type: 'found', node: current, message: 'Target found!' };
            const path = reconstructPath(parent, startId, targetId);
            
            // Calculate total distance
            let totalDistance = 0;
            const pathLabels = [];
            for (let i = 0; i < path.length; i++) {
                pathLabels.push(graph.nodes.get(path[i]).label);
                if (i < path.length - 1) {
                    totalDistance += graph.getWeight(path[i], path[i + 1]);
                }
            }
            
            yield { type: 'path', nodes: path, message: `Shortest path: ${pathLabels.join(' → ')} (Distance: ${totalDistance})` };
            return;
        }
        
        for (const neighbor of graph.getNeighbors(current)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                parent.set(neighbor, current);
                queue.push(neighbor);
                const neighborLabel = graph.nodes.get(neighbor).label;
                const weight = graph.getWeight(current, neighbor);
                yield { type: 'explore', from: current, to: neighbor, message: `Exploring edge ${currentLabel} → ${neighborLabel} (weight: ${weight})` };
            }
        }
        
        yield { type: 'visited', node: current, message: `Node ${currentLabel} fully explored` };
    }
    
    yield { type: 'not_found', message: 'Target not reachable from start' };
}

function* dfs(graph, startId, targetId) {
    const stack = [startId];
    const visited = new Set();
    const parent = new Map();
    
    const startLabel = graph.nodes.get(startId).label;
    const targetLabel = graph.nodes.get(targetId).label;
    
    yield { type: 'start', node: startId, message: `🎯 Finding path from ${startLabel} to ${targetLabel}` };
    yield { type: 'start', node: startId, message: `Starting DFS from node ${startLabel}` };
    
    while (stack.length > 0) {
        const current = stack.pop();
        
        if (visited.has(current)) continue;
        visited.add(current);
        
        const currentLabel = graph.nodes.get(current).label;
        yield { type: 'visiting', node: current, message: `Visiting node ${currentLabel}` };
        
        if (current === targetId) {
            yield { type: 'found', node: current, message: 'Target found!' };
            const path = reconstructPath(parent, startId, targetId);
            
            // Calculate total distance
            let totalDistance = 0;
            const pathLabels = [];
            for (let i = 0; i < path.length; i++) {
                pathLabels.push(graph.nodes.get(path[i]).label);
                if (i < path.length - 1) {
                    totalDistance += graph.getWeight(path[i], path[i + 1]);
                }
            }
            
            yield { type: 'path', nodes: path, message: `Path found: ${pathLabels.join(' → ')} (Distance: ${totalDistance})` };
            return;
        }
        
        const neighbors = graph.getNeighbors(current);
        for (let i = neighbors.length - 1; i >= 0; i--) {
            const neighbor = neighbors[i];
            if (!visited.has(neighbor)) {
                parent.set(neighbor, current);
                stack.push(neighbor);
                const neighborLabel = graph.nodes.get(neighbor).label;
                const weight = graph.getWeight(current, neighbor);
                yield { type: 'explore', from: current, to: neighbor, message: `Exploring edge ${currentLabel} → ${neighborLabel} (weight: ${weight})` };
            }
        }
        
        yield { type: 'visited', node: current, message: `Backtracking from ${currentLabel}` };
    }
    
    yield { type: 'not_found', message: 'Target not reachable from start' };
}

function* dijkstra(graph, startId, targetId) {
    const distances = new Map();
    const parent = new Map();
    const visited = new Set();
    const unvisited = [];
    
    const startLabel = graph.nodes.get(startId).label;
    const targetLabel = graph.nodes.get(targetId).label;
    
    // Initialize distances
    for (const nodeId of graph.nodes.keys()) {
        distances.set(nodeId, Infinity);
        unvisited.push(nodeId);
    }
    distances.set(startId, 0);
    
    yield { type: 'start', node: startId, message: `🎯 Finding path from ${startLabel} to ${targetLabel}` };
    yield { type: 'start', node: startId, message: `Starting Dijkstra from node ${startLabel}` };
    
    while (unvisited.length > 0) {
        // Find node with minimum distance
        let current = null;
        let minDist = Infinity;
        for (const node of unvisited) {
            if (distances.get(node) < minDist) {
                minDist = distances.get(node);
                current = node;
            }
        }
        
        if (current === null || minDist === Infinity) break;
        
        unvisited.splice(unvisited.indexOf(current), 1);
        visited.add(current);
        
        const currentLabel = graph.nodes.get(current).label;
        yield { type: 'visiting', node: current, distance: distances.get(current), 
                message: `Visiting node ${currentLabel} (distance: ${distances.get(current)})` };
        
        if (current === targetId) {
            yield { type: 'found', node: current, distance: distances.get(current),
                    message: `Target found! Shortest distance: ${distances.get(current)}` };
            const path = reconstructPath(parent, startId, targetId);
            
            // Build path with labels
            const pathLabels = path.map(id => graph.nodes.get(id).label);
            
            yield { type: 'path', nodes: path, distance: distances.get(current),
                    message: `Shortest path: ${pathLabels.join(' → ')} (Distance: ${distances.get(current)})` };
            return;
        }
        
        for (const neighbor of graph.getNeighbors(current)) {
            if (visited.has(neighbor)) continue;
            
            const weight = graph.getWeight(current, neighbor);
            const newDist = distances.get(current) + weight;
            const neighborLabel = graph.nodes.get(neighbor).label;
            
            yield { type: 'explore', from: current, to: neighbor, weight: weight,
                    message: `Checking edge ${currentLabel} → ${neighborLabel} (weight: ${weight})` };
            
            if (newDist < distances.get(neighbor)) {
                distances.set(neighbor, newDist);
                parent.set(neighbor, current);
                yield { type: 'update', node: neighbor, distance: newDist,
                        message: `Updated distance to ${neighborLabel}: ${newDist}` };
            }
        }
        
        yield { type: 'visited', node: current };
    }
    
    yield { type: 'not_found', message: 'No path to target' };
}

function* aStar(graph, startId, targetId) {
    const gScore = new Map();
    const fScore = new Map();
    const parent = new Map();
    const openSet = new Set([startId]);
    const closedSet = new Set();
    
    // Heuristic: Euclidean distance
    const heuristic = (nodeA, nodeB) => {
        const a = graph.nodes.get(nodeA);
        const b = graph.nodes.get(nodeB);
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) / 20; // Normalize
    };
    
    // Initialize
    for (const nodeId of graph.nodes.keys()) {
        gScore.set(nodeId, Infinity);
        fScore.set(nodeId, Infinity);
    }
    gScore.set(startId, 0);
    fScore.set(startId, heuristic(startId, targetId));
    
    const startLabel = graph.nodes.get(startId).label;
    const targetLabel = graph.nodes.get(targetId).label;
    
    yield { type: 'start', node: startId, message: `🎯 Finding path from ${startLabel} to ${targetLabel}` };
    yield { type: 'start', node: startId, message: `Starting A* from node ${startLabel}` };
    
    while (openSet.size > 0) {
        // Get node with lowest fScore
        let current = null;
        let lowestF = Infinity;
        for (const node of openSet) {
            if (fScore.get(node) < lowestF) {
                lowestF = fScore.get(node);
                current = node;
            }
        }
        
        if (current === null) break;
        
        const currentLabel = graph.nodes.get(current).label;
        yield { type: 'visiting', node: current, gScore: gScore.get(current), 
                fScore: fScore.get(current).toFixed(1),
                message: `Visiting node ${currentLabel} (g=${gScore.get(current).toFixed(1)}, f=${fScore.get(current).toFixed(1)})` };
        
        if (current === targetId) {
            yield { type: 'found', node: current, distance: gScore.get(current),
                    message: `Target found! Distance: ${gScore.get(current).toFixed(1)}` };
            const path = reconstructPath(parent, startId, targetId);
            
            // Build path with labels
            const pathLabels = path.map(id => graph.nodes.get(id).label);
            
            yield { type: 'path', nodes: path, distance: gScore.get(current),
                    message: `Shortest path: ${pathLabels.join(' → ')} (Distance: ${gScore.get(current).toFixed(1)})` };
            return;
        }
        
        openSet.delete(current);
        closedSet.add(current);
        
        for (const neighbor of graph.getNeighbors(current)) {
            if (closedSet.has(neighbor)) continue;
            
            const weight = graph.getWeight(current, neighbor);
            const tentativeG = gScore.get(current) + weight;
            const neighborLabel = graph.nodes.get(neighbor).label;
            
            yield { type: 'explore', from: current, to: neighbor, weight: weight,
                    message: `Exploring edge ${currentLabel} → ${neighborLabel} (weight: ${weight})` };
            
            if (tentativeG < gScore.get(neighbor)) {
                parent.set(neighbor, current);
                gScore.set(neighbor, tentativeG);
                fScore.set(neighbor, tentativeG + heuristic(neighbor, targetId));
                
                if (!openSet.has(neighbor)) {
                    openSet.add(neighbor);
                }
                
                yield { type: 'update', node: neighbor, gScore: tentativeG,
                        fScore: fScore.get(neighbor).toFixed(1),
                        message: `Updated ${neighborLabel}: g=${tentativeG.toFixed(1)}, f=${fScore.get(neighbor).toFixed(1)}` };
            }
        }
        
        yield { type: 'visited', node: current };
    }
    
    yield { type: 'not_found', message: 'No path to target' };
}

// ===== Maze Algorithms =====
function* dijkstraMaze(maze) {
    const start = maze.start;
    const target = maze.target;
    
    if (!start || !target) {
        yield { type: 'error', message: 'Please select both start and target cells' };
        return;
    }
    
    const distances = new Map();
    const parent = new Map();
    const visited = new Set();
    const unvisited = [];
    
    // Initialize distances for all path cells
    for (let r = 0; r < maze.rows; r++) {
        for (let c = 0; c < maze.cols; c++) {
            if (!maze.isWall(r, c)) {
                const key = `${r},${c}`;
                distances.set(key, Infinity);
                unvisited.push({row: r, col: c});
            }
        }
    }
    
    const startKey = `${start.row},${start.col}`;
    distances.set(startKey, 0);
    
    yield { type: 'start', cell: start, message: `🎯 Finding path in ${maze.rows}x${maze.cols} maze` };
    yield { type: 'start', cell: start, message: `Starting Dijkstra from cell (${start.row}, ${start.col})` };
    
    while (unvisited.length > 0) {
        // Find unvisited cell with minimum distance
        let current = null;
        let minDist = Infinity;
        let minIndex = -1;
        
        for (let i = 0; i < unvisited.length; i++) {
            const cell = unvisited[i];
            const key = `${cell.row},${cell.col}`;
            if (distances.get(key) < minDist) {
                minDist = distances.get(key);
                current = cell;
                minIndex = i;
            }
        }
        
        if (!current || minDist === Infinity) break;
        
        unvisited.splice(minIndex, 1);
        visited.add(`${current.row},${current.col}`);
        
        yield { type: 'visiting', cell: current, distance: minDist,
                message: `Visiting cell (${current.row}, ${current.col}) [distance: ${minDist}]` };
        
        if (current.row === target.row && current.col === target.col) {
            yield { type: 'found', cell: current, distance: minDist,
                    message: `Target found at (${target.row}, ${target.col})!` };
            
            // Reconstruct path
            const path = [];
            let curr = target;
            while (curr) {
                path.unshift(curr);
                const key = `${curr.row},${curr.col}`;
                curr = parent.get(key);
            }
            
            yield { type: 'path', cells: path, distance: minDist,
                    message: `Shortest path: ${path.length} cells (Distance: ${minDist})` };
            return;
        }
        
        const neighbors = maze.getNeighbors(current.row, current.col);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;
            if (visited.has(neighborKey)) continue;
            
            const newDist = distances.get(`${current.row},${current.col}`) + 1;
            
            yield { type: 'explore', from: current, to: neighbor,
                    message: `Exploring neighbor (${neighbor.row}, ${neighbor.col})` };
            
            if (newDist < distances.get(neighborKey)) {
                distances.set(neighborKey, newDist);
                parent.set(neighborKey, current);
                yield { type: 'update', cell: neighbor, distance: newDist,
                        message: `Updated distance to (${neighbor.row}, ${neighbor.col}): ${newDist}` };
            }
        }
        
        yield { type: 'visited', cell: current };
    }
    
    yield { type: 'not_found', message: 'No path to target' };
}

function* aStarMaze(maze) {
    const start = maze.start;
    const target = maze.target;
    
    if (!start || !target) {
        yield { type: 'error', message: 'Please select both start and target cells' };
        return;
    }
    
    // Manhattan distance heuristic
    const heuristic = (r1, c1, r2, c2) => {
        return Math.abs(r1 - r2) + Math.abs(c1 - c2);
    };
    
    const gScore = new Map();
    const fScore = new Map();
    const parent = new Map();
    const openSet = new Set();
    const closedSet = new Set();
    
    // Initialize
    for (let r = 0; r < maze.rows; r++) {
        for (let c = 0; c < maze.cols; c++) {
            if (!maze.isWall(r, c)) {
                const key = `${r},${c}`;
                gScore.set(key, Infinity);
                fScore.set(key, Infinity);
            }
        }
    }
    
    const startKey = `${start.row},${start.col}`;
    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(start.row, start.col, target.row, target.col));
    openSet.add(startKey);
    
    yield { type: 'start', cell: start, message: `🎯 Finding path in ${maze.rows}x${maze.cols} maze` };
    yield { type: 'start', cell: start, message: `Starting A* from cell (${start.row}, ${start.col})` };
    
    while (openSet.size > 0) {
        // Find cell in openSet with lowest fScore
        let currentKey = null;
        let lowestF = Infinity;
        
        for (const key of openSet) {
            if (fScore.get(key) < lowestF) {
                lowestF = fScore.get(key);
                currentKey = key;
            }
        }
        
        if (!currentKey) break;
        
        const [row, col] = currentKey.split(',').map(Number);
        const current = {row, col};
        
        yield { type: 'visiting', cell: current, 
                gScore: gScore.get(currentKey), 
                fScore: fScore.get(currentKey),
                message: `Visiting cell (${row}, ${col}) [g=${gScore.get(currentKey)}, f=${fScore.get(currentKey)}]` };
        
        if (row === target.row && col === target.col) {
            yield { type: 'found', cell: current, distance: gScore.get(currentKey),
                    message: `Target found! Distance: ${gScore.get(currentKey)}` };
            
            // Reconstruct path
            const path = [];
            let curr = target;
            while (curr) {
                path.unshift(curr);
                const key = `${curr.row},${curr.col}`;
                curr = parent.get(key);
            }
            
            yield { type: 'path', cells: path, distance: gScore.get(currentKey),
                    message: `Shortest path: ${path.length} cells (Distance: ${gScore.get(currentKey)})` };
            return;
        }
        
        openSet.delete(currentKey);
        closedSet.add(currentKey);
        
        const neighbors = maze.getNeighbors(row, col);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;
            if (closedSet.has(neighborKey)) continue;
            
            const tentativeG = gScore.get(currentKey) + 1;
            
            yield { type: 'explore', from: current, to: neighbor,
                    message: `Exploring neighbor (${neighbor.row}, ${neighbor.col})` };
            
            if (tentativeG < gScore.get(neighborKey)) {
                parent.set(neighborKey, current);
                gScore.set(neighborKey, tentativeG);
                fScore.set(neighborKey, tentativeG + heuristic(neighbor.row, neighbor.col, target.row, target.col));
                
                if (!openSet.has(neighborKey)) {
                    openSet.add(neighborKey);
                }
                
                yield { type: 'update', cell: neighbor, 
                        gScore: tentativeG,
                        fScore: fScore.get(neighborKey),
                        message: `Updated (${neighbor.row}, ${neighbor.col}): g=${tentativeG}, f=${fScore.get(neighborKey)}` };
            }
        }
        
        yield { type: 'visited', cell: current };
    }
    
    yield { type: 'not_found', message: 'No path to target' };
}

// ===== Graph Renderer =====
const graphRenderer = {
    svg: null,
    graph: null,
    selectedStart: null,
    selectedTarget: null,
    mode: null,
    
    init(svgElement, graph) {
        this.svg = svgElement;
        this.graph = graph;
        this.setupEventListeners();
    },
    
    render() {
        if (!this.svg) return;
        this.svg.innerHTML = '';
        
        // Draw edges first
        const drawnEdges = new Set();
        for (const [edgeKey, weight] of this.graph.edges) {
            if (!drawnEdges.has(edgeKey)) {
                const [fromId, toId] = edgeKey.split('-');
                const reverseKey = `${toId}-${fromId}`;
                drawnEdges.add(edgeKey);
                drawnEdges.add(reverseKey);
                this.drawEdge(parseInt(fromId), parseInt(toId), weight);
            }
        }
        
        // Draw nodes
        for (const [nodeId, node] of this.graph.nodes) {
            this.drawNode(nodeId, node);
        }
    },
    
    drawNode(id, node) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', CONFIG.GRAPH.NODE_RADIUS);
        circle.setAttribute('class', 'node node-default');
        circle.setAttribute('data-id', id);
        
        if (id === this.selectedStart) circle.classList.add('node-start');
        if (id === this.selectedTarget) circle.classList.add('node-target');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + 5);
        text.setAttribute('class', 'node-label');
        text.setAttribute('data-id', id);
        text.textContent = node.label;
        
        this.svg.appendChild(circle);
        this.svg.appendChild(text);
    },
    
    drawEdge(fromId, toId, weight) {
        const from = this.graph.nodes.get(fromId);
        const to = this.graph.nodes.get(toId);
        
        if (!from || !to) return;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', from.x);
        line.setAttribute('y1', from.y);
        line.setAttribute('x2', to.x);
        line.setAttribute('y2', to.y);
        line.setAttribute('class', 'edge edge-default');
        line.setAttribute('data-edge', `${fromId}-${toId}`);
        
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        
        const weightBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        weightBg.setAttribute('x', midX - 12);
        weightBg.setAttribute('y', midY - 12);
        weightBg.setAttribute('width', 24);
        weightBg.setAttribute('height', 16);
        weightBg.setAttribute('class', 'edge-weight-bg');
        
        const weightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        weightText.setAttribute('x', midX);
        weightText.setAttribute('y', midY);
        weightText.setAttribute('class', 'edge-weight');
        weightText.textContent = weight;
        
        this.svg.appendChild(line);
        this.svg.appendChild(weightBg);
        this.svg.appendChild(weightText);
    },
    
    highlightNode(nodeId, className) {
        const node = this.svg.querySelector(`circle[data-id="${nodeId}"]`);
        if (node) {
            node.className.baseVal = `node ${className}`;
        }
    },
    
    highlightEdge(fromId, toId, className) {
        let edge = this.svg.querySelector(`line[data-edge="${fromId}-${toId}"]`);
        if (!edge) {
            edge = this.svg.querySelector(`line[data-edge="${toId}-${fromId}"]`);
        }
        if (edge) {
            edge.className.baseVal = `edge ${className}`;
        }
    },
    
    setupEventListeners() {
        if (!this.svg) return;
        this.svg.addEventListener('click', (e) => {
            let nodeId = null;
            
            // Check if clicked on circle
            if (e.target.tagName === 'circle') {
                nodeId = parseInt(e.target.getAttribute('data-id'));
            }
            // Check if clicked on text label
            else if (e.target.tagName === 'text' && e.target.classList.contains('node-label')) {
                nodeId = parseInt(e.target.getAttribute('data-id'));
            }
            
            if (nodeId !== null && !isNaN(nodeId)) {
                this.handleNodeClick(nodeId);
            }
        });
    },
    
    handleNodeClick(nodeId) {
        if (this.mode === 'select-start') {
            this.selectedStart = nodeId;
            this.mode = null;
            this.render();
            const node = this.graph.nodes.get(nodeId);
            notifications.success(`Start node set to ${node.label}`);
            document.getElementById('selectStartBtn')?.classList.remove('active');
            this.updateSelectedDisplay();
        } else if (this.mode === 'select-target') {
            this.selectedTarget = nodeId;
            this.mode = null;
            this.render();
            const node = this.graph.nodes.get(nodeId);
            notifications.success(`Target node set to ${node.label}`);
            document.getElementById('selectTargetBtn')?.classList.remove('active');
            this.updateSelectedDisplay();
        }
    },
    
    updateSelectedDisplay() {
        const display = document.getElementById('selectedNodes');
        if (display) {
            const startLabel = this.selectedStart !== null ? this.graph.nodes.get(this.selectedStart).label : 'None';
            const targetLabel = this.selectedTarget !== null ? this.graph.nodes.get(this.selectedTarget).label : 'None';
            display.textContent = `Start: ${startLabel} | Target: ${targetLabel}`;
        }
    },
    
    reset() {
        this.selectedStart = null;
        this.selectedTarget = null;
        this.mode = null;
        this.render();
        this.updateSelectedDisplay();
    }
};

// ===== Maze Renderer =====
const MazeRenderer = {
    maze: null,
    container: null,
    cellSize: 20,
    mode: null,
    
    init(mazeInstance, containerId) {
        this.maze = mazeInstance;
        this.container = document.getElementById(containerId);
        this.setupEventListeners();
    },
    
    render() {
        if (!this.container || !this.maze || this.maze.grid.length === 0) return;
        
        this.container.innerHTML = '';
        
        const gridDiv = document.createElement('div');
        gridDiv.className = 'maze-grid';
        gridDiv.style.gridTemplateColumns = `repeat(${this.maze.cols}, ${this.cellSize}px)`;
        gridDiv.style.gridTemplateRows = `repeat(${this.maze.rows}, ${this.cellSize}px)`;
        
        for (let r = 0; r < this.maze.rows; r++) {
            for (let c = 0; c < this.maze.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                if (this.maze.isWall(r, c)) {
                    cell.classList.add('wall');
                } else {
                    cell.classList.add('path');
                }
                
                if (this.maze.start && r === this.maze.start.row && c === this.maze.start.col) {
                    cell.classList.add('start');
                }
                if (this.maze.target && r === this.maze.target.row && c === this.maze.target.col) {
                    cell.classList.add('target');
                }
                
                gridDiv.appendChild(cell);
            }
        }
        
        this.container.appendChild(gridDiv);
    },
    
    highlightCell(row, col, className) {
        const cell = this.container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell && !cell.classList.contains('start') && !cell.classList.contains('target')) {
            cell.className = `maze-cell ${className}`;
        }
    },
    
    drawPath(cells) {
        for (const {row, col} of cells) {
            this.highlightCell(row, col, 'path-final');
        }
    },
    
    setupEventListeners() {
        if (!this.container) return;
        
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('maze-cell')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.handleCellClick(row, col);
            }
        });
    },
    
    handleCellClick(row, col) {
        if (this.maze.isWall(row, col)) return;
        
        if (this.mode === 'select-start') {
            this.maze.setStart(row, col);
            this.mode = null;
            this.render();
            notifications.success(`Start set to (${row}, ${col})`);
            document.getElementById('selectMazeStartBtn')?.classList.remove('active');
            this.updateSelectedDisplay();
        } else if (this.mode === 'select-target') {
            this.maze.setTarget(row, col);
            this.mode = null;
            this.render();
            notifications.success(`Target set to (${row}, ${col})`);
            document.getElementById('selectMazeTargetBtn')?.classList.remove('active');
            this.updateSelectedDisplay();
        }
    },
    
    updateSelectedDisplay() {
        const display = document.getElementById('selectedCells');
        if (display) {
            const startText = this.maze.start ? `(${this.maze.start.row}, ${this.maze.start.col})` : 'None';
            const targetText = this.maze.target ? `(${this.maze.target.row}, ${this.maze.target.col})` : 'None';
            display.textContent = `Start: ${startText} | Target: ${targetText}`;
        }
    },
    
    reset() {
        this.mode = null;
        document.getElementById('selectMazeStartBtn')?.classList.remove('active');
        document.getElementById('selectMazeTargetBtn')?.classList.remove('active');
    }
};

// ===== Main Application =====
const app = {
    currentAlgorithm: null,
    currentCategory: null,
    data: [],
    canvas: null,
    ctx: null,
    animationQueue: [],
    currentStep: 0,
    isAnimating: false,
    animationSpeed: 500,
    graph: null,
    graphRenderer: null,
    maze: null,
    mazeRenderer: null,
    searchTarget: null,
    
    init() {
        console.log('Initializing main app...');
        
        // Initialize managers
        theme.init();
        notifications.init();
        sidebar.init();
        controls.init();
        statistics.init();
        
        // Setup canvas
        this.canvas = document.getElementById('visualizationCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            console.log('Canvas initialized:', this.canvas.width, 'x', this.canvas.height);
        } else {
            console.error('Canvas not found!');
        }
        
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            if (this.data.length > 0) this.drawArray(this.data);
        });
        
        // Setup callbacks
        sidebar.onAlgorithmSelect = (algorithm, category) => {
            this.handleAlgorithmSelect(algorithm, category);
        };
        
        controls.on('play', () => this.play());
        controls.on('pause', () => this.pause());
        controls.on('reset', () => this.reset());
        controls.on('step', () => this.step());
        controls.on('generate', () => this.generateNewData());
        controls.on('speedChange', (speed) => { this.animationSpeed = speed; });
        controls.on('sizeChange', () => this.generateNewData());
        
        // Setup education panel tabs
        this.setupEducationPanel();
        
        // Setup search target input
        this.setupSearchTargetInput();
        
        // Setup panel collapse functionality
        this.setupPanelCollapse();
        
        // Initialize graph system
        this.graph = new Graph();
        const graphContainer = document.getElementById('graphContainer');
        if (graphContainer) {
            let graphSvg = graphContainer.querySelector('svg');
            if (!graphSvg) {
                graphSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                graphSvg.id = 'graphSvg';
                graphSvg.setAttribute('width', '100%');
                graphSvg.setAttribute('height', '100%');
                graphContainer.appendChild(graphSvg);
            }
            this.graphRenderer = Object.create(graphRenderer);
            this.graphRenderer.init(graphSvg, this.graph);
        }
        
        // Initialize maze system
        this.maze = new Maze(30, 30);
        const mazeContainer = document.getElementById('mazeContainer');
        if (mazeContainer) {
            this.mazeRenderer = Object.create(MazeRenderer);
            this.mazeRenderer.init(this.maze, 'mazeContainer');
        }
        
        // Setup graph controls
        this.setupGraphControls();
        
        // Setup maze controls
        this.setupMazeControls();
        
        console.log('App initialized successfully');
    },
    
    setupSearchTargetInput() {
        const searchTargetInput = document.getElementById('searchTarget');
        const randomTargetBtn = document.getElementById('randomTargetBtn');
        
        if (randomTargetBtn) {
            randomTargetBtn.addEventListener('click', () => {
                this.setRandomSearchTarget();
            });
        }
        
        if (searchTargetInput) {
            // Enforce limits on input
            searchTargetInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                // Clamp value between 1 and 100
                if (value < 1) e.target.value = 1;
                if (value > 100) e.target.value = 100;
                
                value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= 100) {
                    this.searchTarget = value;
                }
            });
            
            // Update target when user changes input
            searchTargetInput.addEventListener('change', () => {
                let value = parseInt(searchTargetInput.value);
                // Enforce limits
                if (isNaN(value) || value < 1) {
                    searchTargetInput.value = 1;
                    value = 1;
                }
                if (value > 100) {
                    searchTargetInput.value = 100;
                    value = 100;
                }
                this.searchTarget = value;
                console.log('Search target updated to:', value);
            });
            
            // Add enter key support
            searchTargetInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    let value = parseInt(e.target.value);
                    // Enforce limits
                    if (isNaN(value) || value < 1) value = 1;
                    if (value > 100) value = 100;
                    
                    e.target.value = value;
                    this.searchTarget = value;
                    notifications.success(`Search target set to ${value}`);
                }
            });
            
            // Validate on blur
            searchTargetInput.addEventListener('blur', (e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 1) {
                    e.target.value = 1;
                    this.searchTarget = 1;
                } else if (value > 100) {
                    e.target.value = 100;
                    this.searchTarget = 100;
                }
            });
        }
    },
    
    setRandomSearchTarget() {
        if (this.data.length === 0) return;
        
        // Pick a random value from the current data
        this.searchTarget = this.data[Math.floor(Math.random() * this.data.length)];
        
        const searchTargetInput = document.getElementById('searchTarget');
        if (searchTargetInput) {
            searchTargetInput.value = this.searchTarget;
        }
    },
    
    getSearchTarget() {
        const searchTargetInput = document.getElementById('searchTarget');
        if (searchTargetInput && searchTargetInput.value) {
            const value = parseInt(searchTargetInput.value);
            if (!isNaN(value)) {
                return value;
            }
        }
        // Fallback to random target
        return this.searchTarget || this.data[Math.floor(Math.random() * this.data.length)];
    },
    
    setupPanelCollapse() {
        const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
        const infoPanelCollapseBtn = document.getElementById('infoPanelCollapseBtn');
        const sidebar = document.getElementById('sidebar');
        const infoPanel = document.getElementById('educationPanel');
        
        // Sidebar collapse
        if (sidebarCollapseBtn && sidebar) {
            sidebarCollapseBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                
                // Update icon
                const icon = sidebarCollapseBtn.querySelector('.collapse-icon');
                if (icon) {
                    icon.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
                }
                
                // Resize canvas after transition
                setTimeout(() => {
                    this.resizeCanvas();
                    if (this.data.length > 0) this.drawArray(this.data);
                }, 300);
            });
        }
        
        // Info panel collapse
        if (infoPanelCollapseBtn && infoPanel) {
            infoPanelCollapseBtn.addEventListener('click', () => {
                infoPanel.classList.toggle('collapsed');
                
                // Update icon
                const icon = infoPanelCollapseBtn.querySelector('.collapse-icon');
                if (icon) {
                    icon.textContent = infoPanel.classList.contains('collapsed') ? '◀' : '▶';
                }
                
                // Resize canvas after transition
                setTimeout(() => {
                    this.resizeCanvas();
                    if (this.data.length > 0) this.drawArray(this.data);
                }, 300);
            });
        }
        
        // Optional: Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Only trigger if not typing in an input
            if (e.target.tagName === 'INPUT') return;
            
            if (e.key === '[') {
                sidebarCollapseBtn?.click();
            } else if (e.key === ']') {
                infoPanelCollapseBtn?.click();
            }
        });
    },
    
    setupEducationPanel() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`${tabName}Tab`).classList.add('active');
            });
        });
    },
    
    setupGraphControls() {
        // Generate graph button
        const generateGraphBtn = document.getElementById('generateGraphBtn');
        if (generateGraphBtn) {
            generateGraphBtn.addEventListener('click', () => {
                const container = document.getElementById('graphContainer');
                const width = container ? container.clientWidth : 800;
                const height = container ? container.clientHeight : 400;
                
                // Get and validate node count (5-30)
                let nodeCount = parseInt(document.getElementById('nodeCount')?.value || CONFIG.GRAPH.DEFAULT_NODES);
                nodeCount = Math.max(5, Math.min(30, nodeCount));
                
                // Get and validate density (0.2-0.8)
                let density = parseFloat(document.getElementById('graphDensity')?.value || CONFIG.GRAPH.DEFAULT_DENSITY);
                density = Math.max(0.2, Math.min(0.8, density));
                
                this.graph.generateRandom(nodeCount, density, width, height);
                this.graphRenderer.reset();
                this.graphRenderer.render();
                notifications.success(`Generated graph with ${nodeCount} nodes`);
            });
        }
        
        // Select start button
        const selectStartBtn = document.getElementById('selectStartBtn');
        if (selectStartBtn) {
            selectStartBtn.addEventListener('click', () => {
                this.graphRenderer.mode = 'select-start';
                selectStartBtn.classList.add('active');
                document.getElementById('selectTargetBtn')?.classList.remove('active');
                notifications.info('Click a node to set as start');
            });
        }
        
        // Select target button
        const selectTargetBtn = document.getElementById('selectTargetBtn');
        if (selectTargetBtn) {
            selectTargetBtn.addEventListener('click', () => {
                this.graphRenderer.mode = 'select-target';
                selectTargetBtn.classList.add('active');
                document.getElementById('selectStartBtn')?.classList.remove('active');
                notifications.info('Click a node to set as target');
            });
        }
        
        // Clear graph button
        const clearGraphBtn = document.getElementById('clearGraphBtn');
        if (clearGraphBtn) {
            clearGraphBtn.addEventListener('click', () => {
                this.graph.clear();
                this.graphRenderer.reset();
                this.graphRenderer.render();
                notifications.info('Graph cleared');
            });
        }
        
        // Density slider value display
        const densitySlider = document.getElementById('graphDensity');
        const densityValue = document.getElementById('densityValue');
        if (densitySlider && densityValue) {
            densitySlider.addEventListener('input', (e) => {
                densityValue.textContent = parseFloat(e.target.value).toFixed(1);
            });
        }
        
        // Node count input validation
        const nodeCountInput = document.getElementById('nodeCount');
        if (nodeCountInput) {
            nodeCountInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                if (value < 5) e.target.value = 5;
                if (value > 30) e.target.value = 30;
            });
            nodeCountInput.addEventListener('blur', (e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 5) e.target.value = 5;
                if (value > 30) e.target.value = 30;
            });
        }
    },
    
    setupMazeControls() {
        // Generate maze button
        const generateMazeBtn = document.getElementById('generateMazeBtn');
        if (generateMazeBtn) {
            generateMazeBtn.addEventListener('click', () => {
                const size = document.getElementById('mazeSize')?.value || 'medium';
                const algorithm = document.getElementById('mazeAlgorithm')?.value || 'recursive';
                
                let rows, cols;
                if (size === 'small') {
                    rows = cols = 21;
                } else if (size === 'large') {
                    rows = cols = 41;
                } else {
                    rows = cols = 31;
                }
                
                this.maze = new Maze(rows, cols);
                this.maze.generateMaze(algorithm);
                this.mazeRenderer.maze = this.maze;
                this.mazeRenderer.render();
                this.mazeRenderer.updateSelectedDisplay();
                notifications.success(`Generated ${size} maze (${rows}x${cols})`);
            });
        }
        
        // Clear maze button
        const clearMazeBtn = document.getElementById('clearMazeBtn');
        if (clearMazeBtn) {
            clearMazeBtn.addEventListener('click', () => {
                this.maze.clear();
                this.mazeRenderer.render();
                notifications.info('Maze cleared');
            });
        }
        
        // Select start button
        const selectMazeStartBtn = document.getElementById('selectMazeStartBtn');
        if (selectMazeStartBtn) {
            selectMazeStartBtn.addEventListener('click', () => {
                this.mazeRenderer.mode = 'select-start';
                selectMazeStartBtn.classList.add('active');
                document.getElementById('selectMazeTargetBtn')?.classList.remove('active');
                notifications.info('Click a cell to set as start');
            });
        }
        
        // Select target button
        const selectMazeTargetBtn = document.getElementById('selectMazeTargetBtn');
        if (selectMazeTargetBtn) {
            selectMazeTargetBtn.addEventListener('click', () => {
                this.mazeRenderer.mode = 'select-target';
                selectMazeTargetBtn.classList.add('active');
                document.getElementById('selectMazeStartBtn')?.classList.remove('active');
                notifications.info('Click a cell to set as target');
            });
        }
    },
    
    handleAlgorithmSelect(algorithm, category) {
        // Stop any running animation
        this.isAnimating = false;
        
        this.currentAlgorithm = algorithm;
        this.currentCategory = category;
        
        // Show/hide appropriate containers
        const canvas = this.canvas;
        const graphContainer = document.getElementById('graphContainer');
        const mazeContainer = document.getElementById('mazeContainer');
        const dsContainer = document.getElementById('dsContainer');
        
        // Control sections
        const dataSection = document.getElementById('dataSection');
        const graphSection = document.getElementById('graphSection');
        const mazeSection = document.getElementById('mazeSection');
        const sizeControl = document.getElementById('sizeControl');
        const searchTargetControl = document.getElementById('searchTargetControl');
        const nodeCountControl = document.getElementById('nodeCountControl');
        const densityControl = document.getElementById('densityControl');
        const nodeSelectionSection = document.getElementById('nodeSelectionSection');
        const mazeCellSelection = document.getElementById('mazeCellSelection');
        
        if (category === 'graph') {
            // Check if Dijkstra or A* (use maze), or BFS/DFS (use graph)
            if (algorithm === 'dijkstra' || algorithm === 'aStar') {
                // Show maze for Dijkstra and A*
                if (canvas) canvas.style.display = 'none';
                if (graphContainer) graphContainer.classList.add('hidden');
                if (mazeContainer) mazeContainer.classList.remove('hidden');
                if (dsContainer) dsContainer.classList.add('hidden');
                
                // Show maze controls
                dataSection?.classList.add('hidden');
                graphSection?.classList.add('hidden');
                mazeSection?.classList.remove('hidden');
                sizeControl?.classList.add('hidden');
                searchTargetControl?.classList.add('hidden');
                nodeCountControl?.classList.add('hidden');
                densityControl?.classList.add('hidden');
                nodeSelectionSection?.classList.add('hidden');
                mazeCellSelection?.classList.remove('hidden');
                
                // Generate initial maze if empty
                if (this.maze.grid.length === 0) {
                    this.maze.generateMaze('recursive');
                    this.mazeRenderer.render();
                    this.mazeRenderer.updateSelectedDisplay();
                }
            } else {
                // Show graph for BFS and DFS
                if (canvas) canvas.style.display = 'none';
                if (graphContainer) graphContainer.classList.remove('hidden');
                if (mazeContainer) mazeContainer.classList.add('hidden');
                if (dsContainer) dsContainer.classList.add('hidden');
                
                // Show graph controls
                dataSection?.classList.add('hidden');
                graphSection?.classList.remove('hidden');
                mazeSection?.classList.add('hidden');
                sizeControl?.classList.add('hidden');
                searchTargetControl?.classList.add('hidden');
                nodeCountControl?.classList.remove('hidden');
                densityControl?.classList.remove('hidden');
                nodeSelectionSection?.classList.remove('hidden');
                mazeCellSelection?.classList.add('hidden');
                
                // Generate initial graph if empty
                if (this.graph.nodes.size === 0) {
                    const width = graphContainer ? graphContainer.clientWidth : 800;
                    const height = graphContainer ? graphContainer.clientHeight : 400;
                    this.graph.generateRandom(CONFIG.GRAPH.DEFAULT_NODES, CONFIG.GRAPH.DEFAULT_DENSITY, width, height);
                    this.graphRenderer.render();
                }
            }
        } else if (category === 'searching') {
            // Show canvas, hide graph, maze and ds
            if (canvas) canvas.style.display = 'block';
            if (graphContainer) graphContainer.classList.add('hidden');
            if (mazeContainer) mazeContainer.classList.add('hidden');
            if (dsContainer) dsContainer.classList.add('hidden');
            
            // Show array controls + search target
            dataSection?.classList.remove('hidden');
            graphSection?.classList.add('hidden');
            mazeSection?.classList.add('hidden');
            sizeControl?.classList.remove('hidden');
            searchTargetControl?.classList.remove('hidden');
            nodeCountControl?.classList.add('hidden');
            densityControl?.classList.add('hidden');
            nodeSelectionSection?.classList.add('hidden');
            mazeCellSelection?.classList.add('hidden');
            
            this.setRandomSearchTarget();
            this.reset();
            this.generateNewData();
        } else {
            // Show canvas, hide graph, maze and ds
            if (canvas) canvas.style.display = 'block';
            if (graphContainer) graphContainer.classList.add('hidden');
            if (mazeContainer) mazeContainer.classList.add('hidden');
            if (dsContainer) dsContainer.classList.add('hidden');
            
            // Show array controls only
            dataSection?.classList.remove('hidden');
            graphSection?.classList.add('hidden');
            mazeSection?.classList.add('hidden');
            sizeControl?.classList.remove('hidden');
            searchTargetControl?.classList.add('hidden');
            nodeCountControl?.classList.add('hidden');
            densityControl?.classList.add('hidden');
            nodeSelectionSection?.classList.add('hidden');
            mazeCellSelection?.classList.add('hidden');
            
            // Reset everything
            this.reset();
            this.generateNewData();
        }
        
        const algorithmInfo = {
            bubbleSort: {
                name: 'Bubble Sort',
                description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
                timeBest: 'O(n)',
                timeAverage: 'O(n²)',
                timeWorst: 'O(n²)',
                space: 'O(1)',
                properties: ['Stable', 'In-place', 'Comparison-based'],
                useCases: 'Best for small datasets or nearly sorted data. Educational purposes.'
            },
            selectionSort: {
                name: 'Selection Sort',
                description: 'Divides the input into a sorted and unsorted region, repeatedly selecting the smallest element from the unsorted region.',
                timeBest: 'O(n²)',
                timeAverage: 'O(n²)',
                timeWorst: 'O(n²)',
                space: 'O(1)',
                properties: ['Not stable', 'In-place', 'Comparison-based'],
                useCases: 'Useful when memory writes are expensive. Simple implementation.'
            },
            insertionSort: {
                name: 'Insertion Sort',
                description: 'Builds the final sorted array one item at a time by inserting each element into its proper position.',
                timeBest: 'O(n)',
                timeAverage: 'O(n²)',
                timeWorst: 'O(n²)',
                space: 'O(1)',
                properties: ['Stable', 'In-place', 'Adaptive'],
                useCases: 'Efficient for small datasets and nearly sorted data. Online algorithm.'
            },
            mergeSort: {
                name: 'Merge Sort',
                description: 'A divide-and-conquer algorithm that divides the array into halves, sorts them, and merges them back together.',
                timeBest: 'O(n log n)',
                timeAverage: 'O(n log n)',
                timeWorst: 'O(n log n)',
                space: 'O(n)',
                properties: ['Stable', 'Not in-place', 'Divide-and-conquer'],
                useCases: 'Excellent for large datasets. Guaranteed O(n log n) performance. Used in external sorting.'
            },
            quickSort: {
                name: 'Quick Sort',
                description: 'A divide-and-conquer algorithm that selects a pivot element and partitions the array around it.',
                timeBest: 'O(n log n)',
                timeAverage: 'O(n log n)',
                timeWorst: 'O(n²)',
                space: 'O(log n)',
                properties: ['Not stable', 'In-place', 'Divide-and-conquer'],
                useCases: 'Very efficient for large datasets. Often faster than merge sort in practice. Default sort in many libraries.'
            },
            heapSort: {
                name: 'Heap Sort',
                description: 'Uses a binary heap data structure to sort elements. Builds a max heap and repeatedly extracts the maximum.',
                timeBest: 'O(n log n)',
                timeAverage: 'O(n log n)',
                timeWorst: 'O(n log n)',
                space: 'O(1)',
                properties: ['Not stable', 'In-place', 'Comparison-based'],
                useCases: 'Guaranteed O(n log n) with O(1) space. Good for memory-constrained systems.'
            },
            linearSearch: {
                name: 'Linear Search',
                description: 'Sequentially checks each element until the target is found or the end is reached.',
                timeBest: 'O(1)',
                timeAverage: 'O(n)',
                timeWorst: 'O(n)',
                space: 'O(1)',
                properties: ['Simple', 'Works on unsorted data'],
                useCases: 'Small datasets or unsorted data. When data is not frequently searched.'
            },
            binarySearch: {
                name: 'Binary Search',
                description: 'Efficiently searches sorted arrays by repeatedly dividing the search interval in half.',
                timeBest: 'O(1)',
                timeAverage: 'O(log n)',
                timeWorst: 'O(log n)',
                space: 'O(1)',
                properties: ['Requires sorted data', 'Very efficient'],
                useCases: 'Large sorted datasets. When search is performed frequently.'
            },
            jumpSearch: {
                name: 'Jump Search',
                description: 'Searches sorted arrays by jumping ahead by fixed steps, then performing linear search in the block.',
                timeBest: 'O(1)',
                timeAverage: 'O(√n)',
                timeWorst: 'O(√n)',
                space: 'O(1)',
                properties: ['Requires sorted data', 'Better than linear'],
                useCases: 'When jumping back is costly. Alternative to binary search for certain systems.'
            },
            interpolationSearch: {
                name: 'Interpolation Search',
                description: 'Improved binary search for uniformly distributed data. Estimates position based on value.',
                timeBest: 'O(1)',
                timeAverage: 'O(log log n)',
                timeWorst: 'O(n)',
                space: 'O(1)',
                properties: ['Requires sorted data', 'Best for uniform distribution'],
                useCases: 'Large sorted datasets with uniform distribution. Phone books, dictionaries.'
            },
            exponentialSearch: {
                name: 'Exponential Search',
                description: 'Finds range where element exists by doubling index, then performs binary search.',
                timeBest: 'O(1)',
                timeAverage: 'O(log n)',
                timeWorst: 'O(log n)',
                space: 'O(1)',
                properties: ['Requires sorted data', 'Good for unbounded arrays'],
                useCases: 'When size is unknown or infinite. Better than binary for elements near beginning.'
            },
            ternarySearch: {
                name: 'Ternary Search',
                description: 'Divides array into three parts instead of two. Checks two midpoints per iteration.',
                timeBest: 'O(1)',
                timeAverage: 'O(log₃ n)',
                timeWorst: 'O(log₃ n)',
                space: 'O(1)',
                properties: ['Requires sorted data', 'More comparisons than binary'],
                useCases: 'Finding maximum/minimum of unimodal functions. Theoretical interest.'
            },
            stack: {
                name: 'Stack (LIFO)',
                description: 'Last-In-First-Out data structure. Elements added and removed from the same end (top).',
                timeBest: 'O(1)',
                timeAverage: 'O(1)',
                timeWorst: 'O(1)',
                space: 'O(n)',
                properties: ['LIFO', 'Push/Pop operations', 'Top access'],
                useCases: 'Function call stack, undo mechanisms, expression evaluation, backtracking.'
            },
            queue: {
                name: 'Queue (FIFO)',
                description: 'First-In-First-Out data structure. Elements added at rear, removed from front.',
                timeBest: 'O(1)',
                timeAverage: 'O(1)',
                timeWorst: 'O(1)',
                space: 'O(n)',
                properties: ['FIFO', 'Enqueue/Dequeue operations', 'Front/Rear access'],
                useCases: 'Task scheduling, breadth-first search, printer queues, request handling.'
            },
            linkedList: {
                name: 'Linked List',
                description: 'Linear data structure where elements are linked using pointers. Dynamic size.',
                timeBest: 'O(1) insert/delete',
                timeAverage: 'O(n) search',
                timeWorst: 'O(n) search',
                space: 'O(n)',
                properties: ['Dynamic size', 'Efficient insertion/deletion', 'Sequential access'],
                useCases: 'When frequent insertions/deletions needed. Implementing stacks and queues.'
            },
            bst: {
                name: 'Binary Search Tree',
                description: 'Tree structure where left child < parent < right child. Enables fast search.',
                timeBest: 'O(log n)',
                timeAverage: 'O(log n)',
                timeWorst: 'O(n)',
                space: 'O(n)',
                properties: ['Hierarchical', 'Ordered', 'Fast search/insert/delete'],
                useCases: 'Databases, file systems, maintaining sorted data with frequent updates.'
            },
            bfs: {
                name: 'Breadth-First Search',
                description: 'Explores graph level by level. Guarantees shortest path in unweighted graphs.',
                timeBest: 'O(V + E)',
                timeAverage: 'O(V + E)',
                timeWorst: 'O(V + E)',
                space: 'O(V)',
                properties: ['Level-order traversal', 'Shortest path (unweighted)', 'Uses queue'],
                useCases: 'Social networks, web crawling, shortest path in unweighted graphs.'
            },
            dfs: {
                name: 'Depth-First Search',
                description: 'Explores as far as possible before backtracking. Uses stack (recursion).',
                timeBest: 'O(V + E)',
                timeAverage: 'O(V + E)',
                timeWorst: 'O(V + E)',
                space: 'O(V)',
                properties: ['Depth-first traversal', 'Uses stack', 'May not find shortest path'],
                useCases: 'Maze solving, topological sorting, cycle detection, pathfinding.'
            },
            dijkstra: {
                name: "Dijkstra's Algorithm",
                description: 'Finds shortest path in weighted graphs with non-negative weights.',
                timeBest: 'O((V + E) log V)',
                timeAverage: 'O((V + E) log V)',
                timeWorst: 'O((V + E) log V)',
                space: 'O(V)',
                properties: ['Shortest path (weighted)', 'Non-negative weights only', 'Uses priority queue'],
                useCases: 'GPS navigation, network routing, flight paths, game AI.'
            },
            aStar: {
                name: 'A* Pathfinding',
                description: 'Heuristic-based shortest path. Faster than Dijkstra by using distance estimation.',
                timeBest: 'O(E)',
                timeAverage: 'O(E)',
                timeWorst: 'O(V²)',
                space: 'O(V)',
                properties: ['Heuristic-based', 'Optimal with admissible heuristic', 'Faster than Dijkstra'],
                useCases: 'Game pathfinding, robotics, map navigation, puzzle solving.'
            }
        };
        
        const info = algorithmInfo[algorithm];
        if (info) {
            document.getElementById('algoName').textContent = info.name;
            document.getElementById('algoDescription').textContent = info.description;
            document.getElementById('timeBest').textContent = info.timeBest;
            document.getElementById('timeAverage').textContent = info.timeAverage;
            document.getElementById('timeWorst').textContent = info.timeWorst;
            document.getElementById('spaceComplexity').textContent = info.space;
            document.getElementById('useCases').textContent = info.useCases;
            
            const propertiesList = document.getElementById('propertiesList');
            propertiesList.innerHTML = '';
            info.properties.forEach(prop => {
                const li = document.createElement('li');
                li.textContent = prop;
                propertiesList.appendChild(li);
            });
        }
        
        notifications.info(`Selected: ${info ? info.name : algorithm}`);
    },
    
    generateNewData() {
        const size = controls.getState().size;
        this.data = Array.from({ length: size }, () => 
            Math.floor(Math.random() * (CONFIG.DATASET.MAX_VALUE - CONFIG.DATASET.MIN_VALUE + 1)) + CONFIG.DATASET.MIN_VALUE
        );
        this.drawArray(this.data);
        statistics.reset();
        this.clearLog();
        
        // Set random search target if in searching category
        if (this.currentCategory === 'searching') {
            this.setRandomSearchTarget();
        }
    },
    
    play() {
        if (!this.currentAlgorithm) {
            notifications.warning('Please select an algorithm first');
            return;
        }
        
        if (this.animationQueue.length === 0) {
            this.startVisualization();
        } else {
            this.resumeAnimation();
        }
    },
    
    pause() {
        this.isAnimating = false;
    },
    
    reset() {
        this.isAnimating = false;
        this.animationQueue = [];
        this.currentStep = 0;
        statistics.reset();
        this.clearLog();
        
        // Reset graph visualization if in graph mode
        if (this.currentCategory === 'graph' && this.graphRenderer) {
            // Clear all highlighting and re-render the graph
            this.graphRenderer.render();
        } else if (this.data.length > 0) {
            this.drawArray(this.data);
        }
    },
    
    step() {
        // If no animation queue, start visualization first
        if (this.animationQueue.length === 0) {
            this.startVisualization();
            return;
        }
        
        if (this.currentStep < this.animationQueue.length) {
            this.executeStep(this.animationQueue[this.currentStep]);
            this.currentStep++;
            statistics.increment('iterations');
        } else {
            notifications.info('Visualization complete');
        }
    },
    
    startVisualization() {
        this.reset();
        statistics.startTimer();
        
        const arrayCopy = [...this.data];
        let generator;
        
        // Sorting algorithms
        if (this.currentCategory === 'sorting') {
            if (this.currentAlgorithm === 'bubbleSort') {
                generator = bubbleSort(arrayCopy);
            } else if (this.currentAlgorithm === 'selectionSort') {
                generator = selectionSort(arrayCopy);
            } else if (this.currentAlgorithm === 'insertionSort') {
                generator = insertionSort(arrayCopy);
            } else if (this.currentAlgorithm === 'mergeSort') {
                generator = mergeSort(arrayCopy);
            } else if (this.currentAlgorithm === 'quickSort') {
                generator = quickSort(arrayCopy);
            } else if (this.currentAlgorithm === 'heapSort') {
                generator = heapSort(arrayCopy);
            }
        }
        // Searching algorithms
        else if (this.currentCategory === 'searching') {
            // Get target from user input or use random
            const target = this.getSearchTarget();
            
            // Validate target exists in array or notify user
            const targetExists = arrayCopy.includes(target);
            if (!targetExists) {
                this.addLog(`⚠️ Target ${target} not in array. Adding it...`, true);
                // Add target to a random position
                const randomIndex = Math.floor(Math.random() * arrayCopy.length);
                arrayCopy[randomIndex] = target;
                this.data = [...arrayCopy];
                this.drawArray(this.data);
            }
            
            this.addLog(`🎯 Searching for target: ${target}`, true);
            
            if (this.currentAlgorithm === 'linearSearch') {
                generator = linearSearch(arrayCopy, target);
            } else if (this.currentAlgorithm === 'binarySearch') {
                // Binary search requires sorted array
                arrayCopy.sort((a, b) => a - b);
                this.data = [...arrayCopy];
                this.drawArray(this.data);
                generator = binarySearch(arrayCopy, target);
            } else if (this.currentAlgorithm === 'jumpSearch') {
                // Jump search requires sorted array
                arrayCopy.sort((a, b) => a - b);
                this.data = [...arrayCopy];
                this.drawArray(this.data);
                generator = jumpSearch(arrayCopy, target);
            } else if (this.currentAlgorithm === 'interpolationSearch') {
                // Interpolation search requires sorted array
                arrayCopy.sort((a, b) => a - b);
                this.data = [...arrayCopy];
                this.drawArray(this.data);
                generator = interpolationSearch(arrayCopy, target);
            } else if (this.currentAlgorithm === 'exponentialSearch') {
                // Exponential search requires sorted array
                arrayCopy.sort((a, b) => a - b);
                this.data = [...arrayCopy];
                this.drawArray(this.data);
                generator = exponentialSearch(arrayCopy, target);
            } else if (this.currentAlgorithm === 'ternarySearch') {
                // Ternary search requires sorted array
                arrayCopy.sort((a, b) => a - b);
                this.data = [...arrayCopy];
                this.drawArray(this.data);
                generator = ternarySearch(arrayCopy, target);
            }
        }
        // Data structures
        else if (this.currentCategory === 'dataStructures') {
            // Generate random operations for demonstration
            const operations = [];
            const numOps = Math.min(10, Math.floor(arrayCopy.length / 2));
            
            if (this.currentAlgorithm === 'stack') {
                for (let i = 0; i < numOps; i++) {
                    operations.push({ type: 'push', value: arrayCopy[i] });
                }
                operations.push({ type: 'peek' });
                for (let i = 0; i < Math.floor(numOps / 2); i++) {
                    operations.push({ type: 'pop' });
                }
                generator = stackVisualization(operations);
            } else if (this.currentAlgorithm === 'queue') {
                for (let i = 0; i < numOps; i++) {
                    operations.push({ type: 'enqueue', value: arrayCopy[i] });
                }
                for (let i = 0; i < Math.floor(numOps / 2); i++) {
                    operations.push({ type: 'dequeue' });
                }
                generator = queueVisualization(operations);
            }
        }
        // Graph algorithms
        else if (this.currentCategory === 'graph') {
            // Check if using maze (Dijkstra/A*) or graph (BFS/DFS)
            if (this.currentAlgorithm === 'dijkstra' || this.currentAlgorithm === 'aStar') {
                // Use maze
                if (!this.maze.start || !this.maze.target) {
                    notifications.warning('Please select start and target cells');
                    return;
                }
                
                this.addLog(`🎯 Finding path in ${this.maze.rows}x${this.maze.cols} maze`, true);
                
                // Reset maze visualization
                this.mazeRenderer.render();
                
                if (this.currentAlgorithm === 'dijkstra') {
                    generator = dijkstraMaze(this.maze);
                } else if (this.currentAlgorithm === 'aStar') {
                    generator = aStarMaze(this.maze);
                }
            } else {
                // Use graph for BFS/DFS
                if (!this.graphRenderer.selectedStart || !this.graphRenderer.selectedTarget) {
                    notifications.warning('Please select start and target nodes');
                    return;
                }
                
                const start = this.graphRenderer.selectedStart;
                const target = this.graphRenderer.selectedTarget;
                
                this.addLog(`🎯 Finding path from ${this.graph.nodes.get(start).label} to ${this.graph.nodes.get(target).label}`, true);
                
                // Reset graph visualization
                this.graphRenderer.render();
                
                if (this.currentAlgorithm === 'bfs') {
                    generator = bfs(this.graph, start, target);
                } else if (this.currentAlgorithm === 'dfs') {
                    generator = dfs(this.graph, start, target);
                }
            }
        }
        
        if (!generator) {
            notifications.info('This algorithm is coming soon!');
            return;
        }
        
        this.animationQueue = [];
        for (const step of generator) {
            this.animationQueue.push({ step, array: [...arrayCopy] });
        }
        
        this.currentStep = 0;
        this.resumeAnimation();
    },
    
    resumeAnimation() {
        this.isAnimating = true;
        this.animate();
    },
    
    animate() {
        if (!this.isAnimating) {
            console.log('Animation paused');
            return;
        }
        
        if (this.currentStep >= this.animationQueue.length) {
            console.log('Animation complete');
            this.isAnimating = false;
            statistics.stopTimer();
            notifications.success('Visualization complete!');
            // Update button states without resetting the visualization
            controls.state.isPlaying = false;
            controls.updateButtons();
            return;
        }
        
        this.executeStep(this.animationQueue[this.currentStep]);
        this.currentStep++;
        
        setTimeout(() => this.animate(), this.animationSpeed);
    },
    
    executeStep(stepData) {
        const { step, array } = stepData;
        const { type, indices, message } = step;
        
        statistics.increment('iterations');
        
        // Graph algorithm steps
        if (this.currentCategory === 'graph') {
            // Check if using maze or graph
            if (this.currentAlgorithm === 'dijkstra' || this.currentAlgorithm === 'aStar') {
                // Maze-specific steps
                const { cell, from, to, cells } = step;
                
                if (type === 'start') {
                    // Just log, start is already highlighted
                } else if (type === 'visiting') {
                    this.mazeRenderer.highlightCell(cell.row, cell.col, 'visiting');
                    statistics.increment('comparisons');
                } else if (type === 'visited') {
                    this.mazeRenderer.highlightCell(cell.row, cell.col, 'visited');
                } else if (type === 'explore') {
                    // Briefly highlight neighbor being explored
                    statistics.increment('comparisons');
                } else if (type === 'update') {
                    this.mazeRenderer.highlightCell(cell.row, cell.col, 'visiting');
                } else if (type === 'found') {
                    this.mazeRenderer.highlightCell(cell.row, cell.col, 'target');
                } else if (type === 'path') {
                    // Highlight entire path
                    this.mazeRenderer.drawPath(cells);
                } else if (type === 'error') {
                    notifications.error(message);
                }
                
                this.addLog(message);
                return;
            } else {
                // Graph-specific steps (BFS/DFS)
                const { node, from, to, nodes } = step;
                
                if (type === 'start') {
                    this.graphRenderer.highlightNode(node, 'node-start');
                } else if (type === 'visiting') {
                    this.graphRenderer.highlightNode(node, 'node-visiting');
                    statistics.increment('comparisons');
                } else if (type === 'visited') {
                    this.graphRenderer.highlightNode(node, 'node-visited');
                } else if (type === 'explore') {
                    this.graphRenderer.highlightEdge(from, to, 'edge-exploring');
                    statistics.increment('comparisons');
                } else if (type === 'update') {
                    this.graphRenderer.highlightNode(node, 'node-visiting');
                } else if (type === 'found') {
                    this.graphRenderer.highlightNode(node, 'node-target');
                } else if (type === 'path') {
                    // Highlight entire path
                    for (let i = 0; i < nodes.length; i++) {
                        this.graphRenderer.highlightNode(nodes[i], 'node-path');
                        if (i < nodes.length - 1) {
                            this.graphRenderer.highlightEdge(nodes[i], nodes[i + 1], 'edge-path');
                        }
                    }
                }
                
                this.addLog(message);
                return;
            }
        }
        
        // Sorting step types
        if (type === 'compare') {
            statistics.increment('comparisons');
            this.drawArray(array, indices, CONFIG.COLORS.COMPARING);
        } else if (type === 'swap') {
            statistics.increment('swaps');
            this.drawArray(array, indices, CONFIG.COLORS.SWAPPING);
        } else if (type === 'sorted') {
            this.drawArray(array, indices, CONFIG.COLORS.SORTED);
        } else if (type === 'complete') {
            this.drawArray(array, indices, CONFIG.COLORS.SORTED);
        }
        // Searching step types
        else if (type === 'check') {
            statistics.increment('comparisons');
            this.drawArray(array, indices, CONFIG.COLORS.SEARCHING);
        } else if (type === 'found') {
            this.drawArray(array, indices, CONFIG.COLORS.FOUND);
        } else if (type === 'not_found') {
            this.drawArray(array, [], CONFIG.COLORS.DEFAULT);
        }
        // Other step types
        else if (type === 'insert' || type === 'merge' || type === 'divide' || type === 'pivot' || type === 'heap_built') {
            this.drawArray(array, indices, CONFIG.COLORS.COMPARING);
        } else if (type === 'range' || type === 'eliminate' || type === 'jump' || type === 'block') {
            this.drawArray(array, indices, CONFIG.COLORS.COMPARING);
        }
        // Data structure step types
        else if (type === 'push' || type === 'enqueue') {
            // Use step.data if available (for data structures)
            const dataToShow = step.data || array;
            this.drawArray(dataToShow, indices, CONFIG.COLORS.SORTED);
        } else if (type === 'pop' || type === 'dequeue') {
            const dataToShow = step.data || array;
            this.drawArray(dataToShow, indices, CONFIG.COLORS.SWAPPING);
        } else if (type === 'peek') {
            const dataToShow = step.data || array;
            this.drawArray(dataToShow, indices, CONFIG.COLORS.SEARCHING);
        } else if (type === 'error') {
            const dataToShow = step.data || array;
            this.drawArray(dataToShow, [], CONFIG.COLORS.NOT_FOUND);
        } else {
            this.drawArray(array, indices, CONFIG.COLORS.DEFAULT);
        }
        
        this.addLog(message);
    },
    
    resizeCanvas() {
        if (!this.canvas) {
            console.error('Canvas not available for resize');
            return;
        }
        const container = this.canvas.parentElement;
        if (!container) {
            console.error('Canvas container not found');
            return;
        }
        
        // Set canvas size to match container
        const width = container.clientWidth || 600;
        const height = container.clientHeight || 400;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        console.log('Canvas resized to:', width, 'x', height);
    },
    
    drawArray(array, highlightIndices = [], highlightColor = CONFIG.COLORS.DEFAULT) {
        if (!this.ctx || !this.canvas) {
            console.error('Canvas or context not available');
            return;
        }
        
        if (!array || array.length === 0) {
            console.warn('No array data to draw');
            return;
        }
        
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        
        if (width === 0 || height === 0) {
            console.error('Canvas has zero dimensions:', width, 'x', height);
            return;
        }
        
        ctx.clearRect(0, 0, width, height);
        
        const barWidth = Math.max(CONFIG.CANVAS.MIN_BAR_WIDTH, (width - CONFIG.CANVAS.PADDING * 2) / array.length - CONFIG.CANVAS.BAR_GAP);
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
            
            // Draw value label above the bar
            const fontSize = Math.max(8, Math.min(14, barWidth * 0.8));
            ctx.font = `${fontSize}px Arial`;
            
            // Theme-aware text color
            const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
            ctx.fillStyle = isDarkTheme ? '#e5e7eb' : '#374151';
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            
            // Check if search target star will be displayed
            const hasTargetStar = this.currentCategory === 'searching' && 
                                  this.searchTarget && 
                                  value === this.searchTarget && 
                                  !highlightIndices.includes(index);
            
            // Position text above bar (with extra space if star is present)
            const textY = hasTargetStar ? y - 25 : y - 5;
            
            ctx.fillText(value, x + barWidth / 2, textY);
            
            // Draw target indicator for searching algorithms
            if (hasTargetStar) {
                // Draw a small star/marker above the bar
                ctx.fillStyle = '#FFD700'; // Gold color
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('★', x + barWidth / 2, y - 10);
            }
        });
    },
    
    addLog(message) {
        const logContent = document.getElementById('logContent');
        if (!logContent) return;
        
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `> ${message}`;
        
        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;
        
        while (logContent.children.length > 100) {
            logContent.removeChild(logContent.firstChild);
        }
    },
    
    clearLog() {
        const logContent = document.getElementById('logContent');
        if (logContent) logContent.innerHTML = '';
    },
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

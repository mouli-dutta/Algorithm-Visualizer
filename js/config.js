// Configuration constants for the Algorithm Visualizer

export const CONFIG = {
    // Animation settings
    ANIMATION: {
        SPEED_FAST: 50,
        SPEED_MEDIUM: 500,
        SPEED_SLOW: 2000,
        DEFAULT_SPEED: 500,
    },
    
    // Dataset settings
    DATASET: {
        MIN_SIZE: 10,
        MAX_SIZE: 100,
        DEFAULT_SIZE: 50,
        MIN_VALUE: 5,
        MAX_VALUE: 100,
    },
    
    // Canvas settings
    CANVAS: {
        PADDING: 20,
        BAR_GAP: 2,
        MIN_BAR_WIDTH: 3,
    },
    
    // Colors
    COLORS: {
        DEFAULT: '#3b82f6',
        COMPARING: '#fbbf24',
        SWAPPING: '#ef4444',
        SORTED: '#10b981',
        SEARCHING: '#fbbf24',
        FOUND: '#10b981',
        NOT_FOUND: '#ef4444',
        VISITING: '#fbbf24',
        VISITED: '#3b82f6',
        PATH: '#10b981',
    },
    
    // Graph settings
    GRAPH: {
        NODE_RADIUS: 20,
        DEFAULT_NODES: 8,
        EDGE_WIDTH: 2,
        GRID_SIZE: 50,
    },
    
    // Storage keys
    STORAGE: {
        THEME: 'algo_viz_theme',
        PROGRESS: 'algo_viz_progress',
        QUIZ_SCORES: 'algo_viz_quiz_scores',
        SETTINGS: 'algo_viz_settings',
    },
    
    // Toast settings
    TOAST: {
        DURATION: 3000,
        MAX_TOASTS: 3,
    },
    
    // Quiz settings
    QUIZ: {
        QUESTIONS_PER_QUIZ: 5,
        PASSING_SCORE: 60,
    },
    
    // Challenge settings
    CHALLENGE: {
        POINTS_CORRECT: 10,
        POINTS_INCORRECT: -5,
    },
    
    // Achievements
    ACHIEVEMENTS: [
        { id: 'first_viz', name: 'First Steps', icon: '🎯', description: 'Run your first visualization', requirement: 1 },
        { id: 'ten_viz', name: 'Getting Started', icon: '🚀', description: 'Run 10 visualizations', requirement: 10 },
        { id: 'fifty_viz', name: 'Dedicated Learner', icon: '📚', description: 'Run 50 visualizations', requirement: 50 },
        { id: 'all_sorting', name: 'Sorting Master', icon: '🔄', description: 'Learn all sorting algorithms', requirement: 6 },
        { id: 'all_searching', name: 'Search Expert', icon: '🔍', description: 'Learn all searching algorithms', requirement: 3 },
        { id: 'all_graph', name: 'Graph Guru', icon: '🕸️', description: 'Learn all graph algorithms', requirement: 4 },
        { id: 'quiz_master', name: 'Quiz Master', icon: '🎓', description: 'Complete 10 quizzes', requirement: 10 },
        { id: 'perfect_score', name: 'Perfect Score', icon: '💯', description: 'Get 100% on a quiz', requirement: 1 },
    ],
};

export default CONFIG;

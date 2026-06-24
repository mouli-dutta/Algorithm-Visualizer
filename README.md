# Algorithm Visualizer

A modern, interactive web application for learning algorithms and data structures through beautiful visualizations.

## Features

### 🎯 Comprehensive Algorithm Coverage
- **Sorting Algorithms**: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, Heap Sort
- **Searching Algorithms**: Linear Search, Binary Search, Jump Search
- **Graph Algorithms**: BFS, DFS, Dijkstra's Algorithm, A* Pathfinding (Coming Soon)
- **Data Structures**: Stack, Queue, Linked List, Binary Search Tree (Coming Soon)

### 🎨 Modern UI/UX
- Glassmorphism-inspired design
- Light and dark mode support
- Fully responsive (desktop, tablet, mobile)
- Smooth animations and transitions
- Interactive controls with visual feedback

### 📊 Real-Time Statistics
- Comparisons counter
- Swaps counter
- Iterations tracker
- Execution time display
- Live execution log

### 🎓 Educational Features
- Algorithm descriptions and complexity analysis
- Code examples in JavaScript, Python, and Java (Coming Soon)
- Interactive quizzes (Coming Soon)
- Challenge mode (Coming Soon)
- Progress tracking with achievements

### ⚡ Interactive Controls
- Play/Pause animation
- Step-by-step execution
- Adjustable animation speed (Fast, Medium, Slow)
- Adjustable dataset size (10-100 elements)
- Generate new random data
- Keyboard shortcuts support

### 💾 Persistent Progress
- Tracks algorithms learned
- Saves visualization count
- Stores quiz scores
- Remembers theme preference
- Achievement system

## Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. No build process or dependencies required!

### Usage

1. **Welcome Screen**: Click "Get Started" to enter the application
2. **Select Algorithm**: Choose an algorithm from the sidebar
3. **Adjust Settings**: Use the speed and size sliders to customize
4. **Start Visualization**: Click the Play button or press Space
5. **Learn**: Watch the step-by-step animation and read the execution log

### Keyboard Shortcuts

- `Space` - Play/Pause animation
- `R` - Reset visualization
- `G` - Generate new data
- `→` - Step forward (when paused)

## Project Structure

```
Algorithm Visualizer/
├── index.html              # Main HTML structure
├── style.css               # Complete styling
├── script.js               # Main application logic
├── js/
│   ├── config.js          # Configuration constants
│   ├── algorithms/
│   │   ├── sorting.js     # Sorting implementations
│   │   └── searching.js   # Searching implementations
│   ├── utils/
│   │   ├── storage.js     # LocalStorage management
│   │   ├── statistics.js  # Statistics tracking
│   │   └── animations.js  # Animation utilities
│   └── ui/
│       ├── theme.js       # Theme management
│       ├── notifications.js # Toast notifications
│       ├── tooltips.js    # Tooltip system
│       ├── sidebar.js     # Navigation
│       └── controls.js    # Control panel
└── README.md              # This file
```

## Technologies Used

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with custom properties
- **Vanilla JavaScript** - No frameworks, pure ES6+ modules
- **Canvas API** - High-performance visualizations
- **LocalStorage API** - Persistent data storage

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Features in Development

- [ ] Complete quiz system with questions for all algorithms
- [ ] Challenge mode with predict-the-next-step gameplay
- [ ] Graph algorithm visualizations with interactive node creation
- [ ] Data structure visualizations (Stack, Queue, Linked List, BST)
- [ ] Code examples in Python and Java
- [ ] Export visualization as GIF
- [ ] Sound effects toggle
- [ ] More algorithms (Radix Sort, Interpolation Search, etc.)

## Customization

### Changing Colors

Edit the CSS variables in `style.css`:

```css
:root {
    --primary-color: #3b82f6;
    --secondary-color: #8b5cf6;
    --success-color: #10b981;
    /* ... more colors */
}
```

### Adding New Algorithms

1. Implement the algorithm as a generator function in the appropriate file
2. Add the algorithm to the sidebar in `index.html`
3. Update the algorithm map in `script.js`
4. Add algorithm information and code examples

### Adjusting Animation Speed

Modify the speed presets in `js/config.js`:

```javascript
ANIMATION: {
    SPEED_FAST: 50,
    SPEED_MEDIUM: 500,
    SPEED_SLOW: 2000,
}
```

## Performance

- Optimized canvas rendering
- Efficient DOM updates
- RequestAnimationFrame for smooth animations
- Debounced resize handlers
- Minimal reflows and repaints

## Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Screen reader friendly
- High contrast mode support
- Reduced motion preference support
- Focus indicators

## Contributing

Contributions are welcome! Areas for improvement:

- Additional algorithms
- More code examples
- Quiz questions
- UI/UX enhancements
- Bug fixes
- Documentation

## License

This project is open source and available for educational purposes.

## Credits

Created as an educational tool for learning algorithms and data structures.

## Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Happy Learning! 🚀**

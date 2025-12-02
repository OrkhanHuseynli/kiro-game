# Project Structure

## File Organization
```
/
├── index.html          # Main HTML entry point with embedded CSS
├── game.js             # Complete game logic and classes
├── kiro_logo.png       # Player character sprite
└── .kiro/              # Kiro AI configuration
    └── steering/       # AI steering rules
```

## Code Architecture

### game.js Structure
- **CONFIG object**: Centralized game configuration (canvas size, player physics, camera settings)
- **Player class**: Character movement, physics, collision detection
- **Platform class**: Static level geometry
- **Collectible class**: Rotating collectible items with collision detection
- **Game class**: Main game controller, level management, game loop

### Conventions
- Use ES6 class syntax for game entities
- Configuration values stored in top-level CONFIG object
- Camera follows player with smooth interpolation
- Collision detection uses AABB (axis-aligned bounding box)
- Game state managed through string literals: 'playing', 'gameOver', 'levelComplete'
- Event listeners handle keyboard input (Arrow keys, WASD, Space)

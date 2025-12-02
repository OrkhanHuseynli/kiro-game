# 🎮 Super Kiro World

A browser-based 2D platformer game featuring the Kiro mascot with stunning visual effects, score persistence, and fireball shooting mechanics!

![Super Kiro World](kiro_logo.png)

## ✨ Features

### 🎯 Core Gameplay
- **Smooth platforming mechanics** with physics-based movement
- **Collectible items** scattered throughout levels
- **Lives system** with respawn functionality
- **Level progression** with increasing difficulty
- **Camera following** for seamless exploration

### 🔥 Combat System
- **Fireball shooting** - Press `F` or `Shift` to shoot fireballs
- **Direction-based firing** - Fireballs travel in the direction Kiro is facing
- **Enemy anti-heroes** - Defeat Google and Azure enemies patrolling the levels
- **Enemy AI** - Enemies patrol back and forth on platforms
- **Collision detection** - Fireballs explode on impact with platforms and enemies
- **Multiple projectiles** - Up to 10 active fireballs at once
- **Enemy rewards** - Earn 500 points for each defeated enemy

### 🎨 Visual Effects
- **Trail particles** - Dynamic particles follow Kiro during movement
- **Explosion effects** - Spectacular explosions on collisions and fireball impacts
- **Sparkle effects** - Rewarding sparkles when collecting items
- **Confetti celebration** - Festive confetti when achieving new high scores
- **Smooth animations** - 60 FPS particle system with physics

### 💾 Score System
- **Persistent high scores** - Scores saved to browser localStorage
- **Real-time score tracking** - Current score and high score displayed
- **Automatic saving** - High scores saved automatically
- **New high score detection** - Triggers special confetti effect

## 🎮 Controls

| Action | Keys |
|--------|------|
| Move Left | `←` or `A` |
| Move Right | `→` or `D` |
| Jump | `↑`, `Space`, or `W` |
| Shoot Fireball | `F` or `Shift` |

## 🚀 Getting Started

### Play Locally

1. Clone the repository:
```bash
git clone https://github.com/OrkhanHuseynli/kiro-game.git
cd kiro-game
```

2. Open `index.html` in your browser:
```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx serve
```

3. Navigate to `http://localhost:8000` and start playing!

### Play Online

Simply open `index.html` directly in any modern web browser - no build step required!

## 🛠️ Technology Stack

- **Vanilla JavaScript (ES6+)** - Pure JavaScript with class-based OOP
- **HTML5 Canvas API** - For rendering graphics
- **CSS3** - For UI styling
- **localStorage API** - For persistent high scores

## 📁 Project Structure

```
kiro-game/
├── index.html          # Main HTML entry point
├── game.js             # Complete game logic
├── kiro_logo.png       # Player character sprite
├── README.md           # This file
└── .kiro/              # Kiro AI configuration
    ├── specs/          # Feature specifications
    └── steering/       # AI steering rules
```

## 🎯 Game Architecture

### Core Classes

- **`Particle`** - Individual particle with physics and rendering
- **`ParticleSystem`** - Manages particle lifecycle and effects
- **`Fireball`** - Projectile entity with collision detection
- **`ProjectileManager`** - Manages multiple fireballs
- **`ScoreManager`** - Handles score tracking and persistence
- **`Player`** - Character movement, physics, and collision
- **`Platform`** - Static level geometry
- **`Collectible`** - Rotating collectible items
- **`Enemy`** - AI-controlled anti-heroes with patrol behavior
- **`Game`** - Main game controller and loop

## 🎨 Visual Effects System

The game features a sophisticated particle system with multiple effect types:

- **Trail Particles**: Follow Kiro during movement with fading opacity
- **Explosion Particles**: Radiate outward with gravity physics
- **Sparkle Particles**: Float upward with twinkling animation
- **Confetti Particles**: Fall with rotation and varied trajectories
- **Fireball Trails**: Leave glowing trails behind projectiles

## 🏆 Scoring

- **Collectibles**: +100 points each
- **Defeated Enemies**: +500 points each
- **High Score**: Automatically saved to browser storage
- **Confetti Celebration**: Triggered on new high score achievement

## 🎮 Gameplay Tips

1. **Master the jump timing** - Use momentum to reach higher platforms
2. **Collect everything** - Each collectible brings you closer to a high score
3. **Defeat enemies** - Use fireballs to eliminate Google and Azure anti-heroes for big points
4. **Avoid enemy contact** - Touching enemies costs a life!
5. **Use fireballs strategically** - Clear obstacles and enemies with spectacular explosions
6. **Watch your lives** - Falling off the map or touching enemies costs a life!
7. **Aim for the high score** - Beat your personal best and trigger confetti!

## 🔧 Configuration

Game settings can be adjusted in the `CONFIG` object in `game.js`:

```javascript
const CONFIG = {
    canvas: { width: 800, height: 600 },
    player: { speed: 5, jumpPower: 12, gravity: 0.5 },
    particles: { /* particle effect settings */ }
};
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Kiro AI](https://kiro.dev) - AI-powered development assistant
- Inspired by classic platformer games
- Particle system design based on modern game development practices

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Enjoy playing Super Kiro World! 🎮✨**

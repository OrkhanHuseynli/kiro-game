# Design Document: Game Enhancements

## Overview

This design extends Super Kiro World with score persistence, visual effects systems, and combat mechanics. The enhancements maintain the vanilla JavaScript architecture while adding a particle system for visual feedback, a storage layer for score persistence, and a projectile system for fireball shooting. The design prioritizes performance (60 FPS), minimal memory overhead, and seamless integration with the existing class-based game loop.

## Architecture

### High-Level Architecture

The enhancements follow the existing architecture pattern:
- **ScoreManager class**: Handles score tracking, high score persistence via localStorage
- **ParticleSystem class**: Manages particle lifecycle, rendering, and pooling
- **Particle class**: Individual particle entity with physics properties
- **Effect factory functions**: Create specific particle effects (trail, explosion, sparkle, confetti)
- **Fireball class**: Projectile entity with collision detection and visual effects
- **ProjectileManager class**: Manages active fireballs, updates, and collision detection

### Integration Points

1. **Game class modifications**:
   - Add `scoreManager` instance for persistence
   - Add `particleSystem` instance for effects
   - Hook particle generation into existing collision detection
   - Update draw loop to render particles

2. **Player class modifications**:
   - Emit trail particles during movement
   - Trigger explosion effects on collision
   - Track previous position for trail generation
   - Track facing direction for fireball launch
   - Handle fire input to create fireballs

3. **UI modifications**:
   - Add high score display element
   - Update score display to show both current and high score

4. **Game class modifications for projectiles**:
   - Add `projectileManager` instance for fireball management
   - Add fire key to input handling
   - Update game loop to update and draw fireballs
   - Check fireball collisions with platforms

## Components and Interfaces

### ScoreManager Class

```javascript
class ScoreManager {
    constructor()
    getCurrentScore(): number
    getHighScore(): number
    addScore(points: number): void
    resetCurrentScore(): void
    saveHighScore(): void
    loadHighScore(): void
    isNewHighScore(): boolean
}
```

**Responsibilities:**
- Track current session score
- Load/save high score from/to localStorage
- Detect when current score exceeds high score
- Emit events when new high score is achieved

**Storage Key:** `'superKiroWorld_highScore'`

### ParticleSystem Class

```javascript
class ParticleSystem {
    constructor(maxParticles: number)
    addParticle(particle: Particle): void
    update(deltaTime: number): void
    draw(ctx: CanvasRenderingContext2D, cameraX: number): void
    createTrailParticle(x, y, velocityX, velocityY): void
    createExplosion(x, y, count): void
    createSparkles(x, y, count): void
    createConfetti(canvasWidth, canvasHeight): void
    clear(): void
}
```

**Responsibilities:**
- Manage particle pool (max 500 particles)
- Update particle physics each frame
- Remove dead particles
- Render all active particles
- Provide factory methods for different effect types

### Particle Class

```javascript
class Particle {
    constructor(x, y, velocityX, velocityY, color, size, lifetime, type)
    update(deltaTime: number): void
    draw(ctx: CanvasRenderingContext2D, cameraX: number): void
    isDead(): boolean
}
```

**Properties:**
- Position (x, y)
- Velocity (velocityX, velocityY)
- Color (string or gradient)
- Size (radius)
- Lifetime (frames remaining)
- Opacity (0-1, fades over time)
- Type (trail, explosion, sparkle, confetti)
- Rotation (for confetti)
- Gravity factor (for physics)

### Fireball Class

```javascript
class Fireball {
    constructor(x, y, direction, speed)
    update(): void
    draw(ctx: CanvasRenderingContext2D, cameraX: number): void
    checkCollision(platforms: Platform[]): boolean
    isOffScreen(canvasWidth: number, cameraX: number): boolean
    isDead(): boolean
}
```

**Properties:**
- Position (x, y)
- Velocity (velocityX)
- Direction (1 for right, -1 for left)
- Speed (pixels per frame)
- Size (width, height)
- Lifetime (frames remaining)
- Active state (boolean)

**Responsibilities:**
- Move horizontally based on direction
- Detect collisions with platforms
- Render fireball with visual effects
- Emit trail particles while traveling
- Determine when to be removed (off-screen or collision)

### ProjectileManager Class

```javascript
class ProjectileManager {
    constructor(particleSystem: ParticleSystem)
    addFireball(fireball: Fireball): void
    update(platforms: Platform[], canvasWidth: number, cameraX: number): void
    draw(ctx: CanvasRenderingContext2D, cameraX: number): void
    createFireball(x, y, direction): void
    clear(): void
    getActiveCount(): number
}
```

**Responsibilities:**
- Manage array of active fireballs
- Update all fireballs each frame
- Check fireball collisions with platforms
- Remove dead fireballs
- Trigger explosion effects on collision
- Render all active fireballs
- Limit maximum active fireballs (e.g., 10)

## Data Models

### Score Data

```javascript
{
    currentScore: number,      // Current session score
    highScore: number,         // All-time high score
    isNewHighScore: boolean    // Flag for triggering confetti
}
```

### Particle Data

```javascript
{
    x: number,                 // World position X
    y: number,                 // World position Y
    velocityX: number,         // Horizontal velocity
    velocityY: number,         // Vertical velocity
    color: string,             // CSS color or gradient
    size: number,              // Radius in pixels
    lifetime: number,          // Frames until removal
    maxLifetime: number,       // Initial lifetime for fade calculation
    opacity: number,           // Current opacity (0-1)
    type: string,              // 'trail', 'explosion', 'sparkle', 'confetti'
    rotation: number,          // Rotation angle (confetti only)
    rotationSpeed: number,     // Rotation velocity (confetti only)
    gravity: number            // Gravity multiplier
}
```

### Fireball Data

```javascript
{
    x: number,                 // World position X
    y: number,                 // World position Y
    velocityX: number,         // Horizontal velocity
    direction: number,         // 1 for right, -1 for left
    width: number,             // Fireball width
    height: number,            // Fireball height
    lifetime: number,          // Frames until auto-removal
    active: boolean,           // Whether fireball is active
    color: string              // Fireball color
}
```

### Effect Configurations

```javascript
const PARTICLE_CONFIG = {
    trail: {
        size: 3-6,
        lifetime: 15-30,
        colors: ['#FFD700', '#FFA500', '#FF6B6B'],
        velocityRange: 0.5
    },
    explosion: {
        count: 8-12,
        size: 4-8,
        lifetime: 20-40,
        colors: ['#FF6B6B', '#FF8C00', '#FFD700'],
        speed: 2-5
    },
    sparkle: {
        count: 5-8,
        size: 2-4,
        lifetime: 30-50,
        colors: ['#FFFFFF', '#FFD700', '#00FFFF'],
        floatSpeed: -1 to -2
    },
    confetti: {
        count: 50-80,
        size: 4-8,
        lifetime: 60-120,
        colors: ['#FF6B6B', '#4CAF50', '#2196F3', '#FFD700', '#9C27B0'],
        speed: 3-8,
        gravity: 0.1-0.3
    },
    fireball: {
        width: 16,
        height: 16,
        speed: 8,
        lifetime: 180,
        colors: ['#FF4500', '#FF6B00', '#FFD700'],
        trailInterval: 2,
        maxActive: 10
    }
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Score display synchronization
*For any* score change event, the displayed score in the UI should immediately reflect the internal score state.
**Validates: Requirements 1.2**

### Property 2: High score persistence
*For any* game session where the current score exceeds the high score, the new high score should be persisted to localStorage and retrievable in subsequent sessions.
**Validates: Requirements 1.3**

### Property 3: Trail particle generation during movement
*For any* player state where velocity is non-zero, trail particles should be generated at the player's position.
**Validates: Requirements 2.1**

### Property 4: Particle opacity decay
*For any* trail particle, its opacity should decrease over time until it reaches zero.
**Validates: Requirements 2.2**

### Property 5: Particle lifecycle management
*For any* particle (trail, explosion, sparkle, or confetti), when its lifetime reaches zero or opacity reaches zero, it should be removed from the particle system.
**Validates: Requirements 2.3, 3.4, 4.3, 5.4**

### Property 6: Trail generation stops when stationary
*For any* player state where velocity is zero, trail particle generation should be stopped or significantly reduced.
**Validates: Requirements 2.4**

### Property 7: Collision triggers explosion
*For any* collision between the player and a platform, an explosion effect should be generated at the collision point.
**Validates: Requirements 3.1**

### Property 8: Explosion particles radiate outward
*For any* explosion effect, all generated particles should have velocities pointing away from the explosion center point.
**Validates: Requirements 3.2**

### Property 9: Particle physics simulation
*For any* particle with gravity enabled (explosion or confetti), gravity should be applied to its velocity each frame, and for confetti particles, rotation should be applied each frame.
**Validates: Requirements 3.3, 5.3**

### Property 10: Obstacle passage triggers sparkles
*For any* player position that intersects an obstacle's designated area, sparkle effect particles should be generated.
**Validates: Requirements 4.1**

### Property 11: Sparkle particles float upward
*For any* sparkle particle, it should have negative Y velocity (upward motion) and its opacity should oscillate or twinkle.
**Validates: Requirements 4.2**

### Property 12: Sparkle color palette
*For any* sparkle particle, its color should be selected from the bright color palette defined in the configuration.
**Validates: Requirements 4.4**

### Property 13: Multiple sparkle effects
*For any* sequence of obstacle passages, each passage should generate a distinct sparkle effect instance.
**Validates: Requirements 4.5**

### Property 14: High score triggers confetti
*For any* score update where the new current score exceeds the previous high score, a confetti effect should be triggered.
**Validates: Requirements 5.1**

### Property 15: Confetti particle variety
*For any* confetti effect, the generated particles should have varied velocities, colors from the confetti palette, and different trajectories.
**Validates: Requirements 5.2**

### Property 16: Gameplay continues during effects
*For any* active particle effect (including confetti), the game state should remain 'playing' and gameplay should not be interrupted.
**Validates: Requirements 5.5**

### Property 17: Fire input creates fireball
*For any* fire key press event, a fireball should be created at the player's position traveling in the player's facing direction.
**Validates: Requirements 6.1**

### Property 18: Fireball moves horizontally
*For any* active fireball, its position should update each frame based on its velocity and direction.
**Validates: Requirements 6.2**

### Property 19: Fireball removal conditions
*For any* fireball that travels off-screen or exceeds its maximum lifetime, it should be removed from the projectile manager.
**Validates: Requirements 6.3**

### Property 20: Fireball collision triggers explosion
*For any* fireball that collides with a platform or obstacle, the fireball should be removed and an explosion effect should be generated at the collision point.
**Validates: Requirements 6.4**

### Property 21: Independent fireball tracking
*For any* set of active fireballs, each fireball should be updated and tracked independently without affecting other fireballs.
**Validates: Requirements 6.5**

## Error Handling

### localStorage Unavailability
- Wrap all localStorage operations in try-catch blocks
- Gracefully degrade to in-memory score tracking if localStorage is unavailable
- Log warnings to console but don't crash the game
- Display high score as 0 if unable to load

### Particle System Overflow
- Implement maximum particle limit (500 particles)
- When limit is reached, remove oldest particles first (FIFO)
- Prevent memory leaks by ensuring dead particles are garbage collected
- Log warning if particle limit is frequently hit

### Performance Degradation
- Monitor particle count each frame
- If particle count exceeds threshold (400), reduce particle generation rate
- Skip particle updates for off-screen particles beyond camera bounds
- Use object pooling to reduce garbage collection pressure

### Invalid Particle Data
- Validate particle parameters before creation
- Clamp values to reasonable ranges (size: 1-20, lifetime: 1-200)
- Default to safe values if invalid parameters provided
- Prevent NaN or Infinity values in physics calculations

### Projectile System Overflow
- Implement maximum fireball limit (10 active fireballs)
- When limit is reached, prevent new fireball creation or remove oldest
- Ensure dead fireballs are properly removed from memory
- Log warning if fireball limit is reached

### Invalid Fireball Data
- Validate fireball direction (must be 1 or -1)
- Ensure fireball speed is positive and reasonable
- Clamp fireball position to valid world coordinates
- Handle edge cases where player direction is undefined

## Testing Strategy

### Unit Testing

We will use vanilla JavaScript with a simple test runner for unit tests. Unit tests will cover:

**ScoreManager:**
- Loading high score from localStorage on initialization
- Saving high score when current score exceeds it
- Handling localStorage unavailability gracefully
- Resetting current score while preserving high score

**ParticleSystem:**
- Adding particles to the system
- Removing dead particles from the array
- Enforcing maximum particle limit
- Clearing all particles

**Particle:**
- Opacity decreasing over lifetime
- Position updating based on velocity
- Gravity application to velocity
- Rotation for confetti particles

**Fireball:**
- Horizontal movement based on direction
- Collision detection with platforms
- Off-screen detection
- Lifetime expiration

**ProjectileManager:**
- Adding fireballs to the system
- Removing dead fireballs
- Enforcing maximum fireball limit
- Collision checking with platforms

### Property-Based Testing

We will use **fast-check** (a JavaScript property-based testing library) for property-based tests. Each property-based test will run a minimum of 100 iterations.

Each property-based test MUST be tagged with a comment explicitly referencing the correctness property using this format: `**Feature: game-enhancements, Property {number}: {property_text}**`

Property-based tests will verify:

**Property 1 (Score display synchronization):**
- Generate random score values
- Verify UI updates match internal state

**Property 2 (High score persistence):**
- Generate random score sequences
- Verify high score is correctly identified and persisted

**Property 3 (Trail particle generation):**
- Generate random player velocities
- Verify particles are created when velocity is non-zero

**Property 5 (Particle lifecycle):**
- Generate random particles with various lifetimes
- Verify particles are removed when lifetime expires

**Property 6 (Trail stops when stationary):**
- Test with zero velocity states
- Verify no particles or minimal particles are generated

**Property 8 (Explosion particles radiate):**
- Generate random explosion centers
- Verify all particle velocities point away from center

**Property 9 (Particle physics):**
- Generate random particles with gravity
- Verify velocity changes correctly each frame

**Property 11 (Sparkle particles float):**
- Generate random sparkle particles
- Verify Y velocity is negative (upward)

**Property 15 (Confetti variety):**
- Generate confetti effects
- Verify particles have varied properties (not all identical)

**Property 18 (Fireball moves horizontally):**
- Generate random fireballs with different directions
- Verify position updates correctly each frame

**Property 19 (Fireball removal conditions):**
- Generate fireballs at various positions and lifetimes
- Verify removal when off-screen or lifetime expires

**Property 20 (Fireball collision triggers explosion):**
- Generate random fireball and platform configurations
- Verify collision detection and explosion generation

**Property 21 (Independent fireball tracking):**
- Generate multiple fireballs with different properties
- Verify each updates independently

### Integration Testing

Integration tests will verify:
- Particle system integrates with game loop without frame drops
- Score manager integrates with UI updates
- Collision detection triggers appropriate particle effects
- High score achievement triggers confetti while gameplay continues
- Fireball system integrates with player input and collision detection
- Fireball collisions trigger explosion effects correctly
- Multiple fireballs can be active simultaneously without interference

### Test Utilities

Create helper functions for:
- Mocking localStorage for testing
- Creating test particle instances with known properties
- Simulating game frames for time-based tests
- Asserting particle properties within tolerance ranges

# Implementation Plan

- [x] 1. Implement ScoreManager class for score persistence
  - Create ScoreManager class with localStorage integration
  - Implement getCurrentScore, getHighScore, addScore methods
  - Add saveHighScore and loadHighScore with error handling
  - Handle localStorage unavailability gracefully
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [ ]* 1.1 Write property test for score display synchronization
  - **Property 1: Score display synchronization**
  - **Validates: Requirements 1.2**

- [ ]* 1.2 Write property test for high score persistence
  - **Property 2: High score persistence**
  - **Validates: Requirements 1.3**

- [ ]* 1.3 Write unit tests for ScoreManager
  - Test loading high score on initialization
  - Test saving when current exceeds high score
  - Test localStorage unavailability handling
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 2. Integrate ScoreManager with Game class
  - Add scoreManager instance to Game constructor
  - Replace direct score manipulation with scoreManager.addScore()
  - Update UI to display both current score and high score
  - Trigger confetti flag when new high score is achieved
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Implement Particle class with physics
  - Create Particle class with position, velocity, color, size, lifetime properties
  - Implement update method with gravity, velocity, opacity decay
  - Add rotation properties and logic for confetti type
  - Implement draw method with camera offset support
  - Add isDead method to check lifetime/opacity
  - _Requirements: 2.2, 2.3, 3.3, 5.3_

- [ ]* 3.1 Write property test for particle opacity decay
  - **Property 4: Particle opacity decay**
  - **Validates: Requirements 2.2**

- [ ]* 3.2 Write property test for particle physics simulation
  - **Property 9: Particle physics simulation**
  - **Validates: Requirements 3.3, 5.3**

- [ ]* 3.3 Write unit tests for Particle class
  - Test opacity decreasing over time
  - Test position updates from velocity
  - Test gravity application
  - Test rotation for confetti
  - _Requirements: 2.2, 3.3, 5.3_

- [x] 4. Implement ParticleSystem class
  - Create ParticleSystem class with particle array and max limit (500)
  - Implement addParticle method with overflow handling (FIFO removal)
  - Implement update method to update all particles and remove dead ones
  - Implement draw method to render all particles
  - Add clear method to remove all particles
  - _Requirements: 2.3, 3.4, 4.3, 5.4_

- [ ]* 4.1 Write property test for particle lifecycle management
  - **Property 5: Particle lifecycle management**
  - **Validates: Requirements 2.3, 3.4, 4.3, 5.4**

- [ ]* 4.2 Write unit tests for ParticleSystem
  - Test adding particles to system
  - Test removing dead particles
  - Test max particle limit enforcement
  - Test clearing all particles
  - _Requirements: 2.3, 3.4, 4.3, 5.4_

- [x] 5. Implement particle effect factory methods
  - Add createTrailParticle method to ParticleSystem
  - Add createExplosion method with radial particle emission
  - Add createSparkles method with upward floating motion
  - Add createConfetti method with varied colors and trajectories
  - Use PARTICLE_CONFIG for effect parameters
  - _Requirements: 2.1, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2_

- [ ]* 5.1 Write property test for explosion particles radiate outward
  - **Property 8: Explosion particles radiate outward**
  - **Validates: Requirements 3.2**

- [ ]* 5.2 Write property test for sparkle particles float upward
  - **Property 11: Sparkle particles float upward**
  - **Validates: Requirements 4.2**

- [ ]* 5.3 Write property test for confetti particle variety
  - **Property 15: Confetti particle variety**
  - **Validates: Requirements 5.2**

- [x] 6. Integrate ParticleSystem with Game class
  - Add particleSystem instance to Game constructor
  - Update game loop to call particleSystem.update() and draw()
  - Pass deltaTime to particle updates for frame-independent physics
  - _Requirements: 2.1, 2.5, 3.5, 5.5_

- [x] 7. Add trail particle generation to Player class
  - Track previous player position
  - Generate trail particles when velocity is non-zero
  - Reduce/stop generation when stationary
  - Call particleSystem.createTrailParticle() from Player.update()
  - _Requirements: 2.1, 2.4_

- [ ]* 7.1 Write property test for trail particle generation during movement
  - **Property 3: Trail particle generation during movement**
  - **Validates: Requirements 2.1**

- [ ]* 7.2 Write property test for trail stops when stationary
  - **Property 6: Trail generation stops when stationary**
  - **Validates: Requirements 2.4**

- [x] 8. Add explosion effects to collision detection
  - Modify Player.handleCollisions to detect collision events
  - Call particleSystem.createExplosion() at collision points
  - Pass collision position to explosion factory
  - _Requirements: 3.1, 3.2_

- [ ]* 8.1 Write property test for collision triggers explosion
  - **Property 7: Collision triggers explosion**
  - **Validates: Requirements 3.1**

- [x] 9. Implement obstacle detection and sparkle effects
  - Define obstacle zones in level (or use existing platforms)
  - Detect when player passes through obstacle areas
  - Call particleSystem.createSparkles() on passage
  - Ensure distinct effects for multiple passages
  - _Requirements: 4.1, 4.4, 4.5_

- [ ]* 9.1 Write property test for obstacle passage triggers sparkles
  - **Property 10: Obstacle passage triggers sparkles**
  - **Validates: Requirements 4.1**

- [ ]* 9.2 Write property test for sparkle color palette
  - **Property 12: Sparkle color palette**
  - **Validates: Requirements 4.4**

- [ ]* 9.3 Write property test for multiple sparkle effects
  - **Property 13: Multiple sparkle effects**
  - **Validates: Requirements 4.5**

- [x] 10. Add confetti effect for new high scores
  - Check scoreManager.isNewHighScore() in Game.update()
  - Call particleSystem.createConfetti() when new high score achieved
  - Ensure confetti doesn't interrupt gameplay
  - Reset high score flag after confetti is triggered
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ]* 10.1 Write property test for high score triggers confetti
  - **Property 14: High score triggers confetti**
  - **Validates: Requirements 5.1**

- [ ]* 10.2 Write property test for gameplay continues during effects
  - **Property 16: Gameplay continues during effects**
  - **Validates: Requirements 5.5**

- [x] 11. Update HTML UI for high score display
  - Add high score display element to #ui div
  - Style high score to match existing UI
  - Update Game.updateUI() to refresh high score display
  - _Requirements: 1.1_

- [x] 12. Add PARTICLE_CONFIG to game configuration
  - Define particle configuration object with effect parameters
  - Include trail, explosion, sparkle, confetti, and fireball configs
  - Document color palettes and physics parameters
  - _Requirements: 2.1, 3.1, 4.1, 4.4, 5.1, 6.2_

- [x] 13. Implement Fireball class
  - Create Fireball class with position, velocity, direction properties
  - Implement update method to move fireball horizontally
  - Add collision detection method for platforms
  - Implement draw method with visual effects (gradient, glow)
  - Add isOffScreen and isDead methods
  - Emit trail particles while traveling
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 13.1 Write property test for fireball moves horizontally
  - **Property 18: Fireball moves horizontally**
  - **Validates: Requirements 6.2**

- [ ]* 13.2 Write property test for fireball removal conditions
  - **Property 19: Fireball removal conditions**
  - **Validates: Requirements 6.3**

- [ ]* 13.3 Write unit tests for Fireball class
  - Test horizontal movement based on direction
  - Test collision detection with platforms
  - Test off-screen detection
  - Test lifetime expiration
  - _Requirements: 6.2, 6.3, 6.4_

- [x] 14. Implement ProjectileManager class
  - Create ProjectileManager class with fireballs array
  - Implement addFireball and createFireball methods
  - Implement update method to update all fireballs and check collisions
  - Implement draw method to render all fireballs
  - Add maximum fireball limit (10) with overflow handling
  - Trigger explosion effects on fireball collision
  - _Requirements: 6.3, 6.4, 6.5_

- [ ]* 14.1 Write property test for fireball collision triggers explosion
  - **Property 20: Fireball collision triggers explosion**
  - **Validates: Requirements 6.4**

- [ ]* 14.2 Write property test for independent fireball tracking
  - **Property 21: Independent fireball tracking**
  - **Validates: Requirements 6.5**

- [ ]* 14.3 Write unit tests for ProjectileManager
  - Test adding fireballs to system
  - Test removing dead fireballs
  - Test max fireball limit enforcement
  - Test collision checking with platforms
  - _Requirements: 6.3, 6.4, 6.5_

- [x] 15. Add fireball shooting to Player class
  - Track player facing direction (left/right)
  - Update facing direction based on movement input
  - Add method to create fireball at player position
  - _Requirements: 6.1_

- [x] 16. Integrate ProjectileManager with Game class
  - Add projectileManager instance to Game constructor
  - Add fire key to input handling (e.g., 'f' or 'Shift')
  - Call projectileManager.createFireball() on fire input
  - Update game loop to call projectileManager.update() and draw()
  - Pass platforms to projectileManager for collision detection
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 16.1 Write property test for fire input creates fireball
  - **Property 17: Fire input creates fireball**
  - **Validates: Requirements 6.1**

- [x] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

// Game configuration
const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    player: {
        width: 40,
        height: 40,
        speed: 5,
        jumpPower: 12,
        gravity: 0.5,
        friction: 0.8
    },
    camera: {
        smoothness: 0.1
    },
    enemy: {
        width: 40,
        height: 40,
        speed: 2,
        patrolDistance: 150
    },
    particles: {
        trail: {
            sizeMin: 3,
            sizeMax: 6,
            lifetimeMin: 15,
            lifetimeMax: 30,
            colors: ['#FFD700', '#FFA500', '#FF6B6B'],
            velocityRange: 0.5
        },
        explosion: {
            count: 10,
            sizeMin: 4,
            sizeMax: 8,
            lifetimeMin: 20,
            lifetimeMax: 40,
            colors: ['#FF6B6B', '#FF8C00', '#FFD700'],
            speedMin: 2,
            speedMax: 5
        },
        sparkle: {
            count: 6,
            sizeMin: 2,
            sizeMax: 4,
            lifetimeMin: 30,
            lifetimeMax: 50,
            colors: ['#FFFFFF', '#FFD700', '#00FFFF'],
            floatSpeedMin: -2,
            floatSpeedMax: -1
        },
        confetti: {
            count: 60,
            sizeMin: 4,
            sizeMax: 8,
            lifetimeMin: 60,
            lifetimeMax: 120,
            colors: ['#FF6B6B', '#4CAF50', '#2196F3', '#FFD700', '#9C27B0'],
            speedMin: 3,
            speedMax: 8
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
};

// Particle class for visual effects
class Particle {
    constructor(x, y, velocityX, velocityY, color, size, lifetime, type = 'default') {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
        this.size = size;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.opacity = 1;
        this.type = type;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.gravity = type === 'confetti' || type === 'explosion' ? 0.15 : 0;
    }

    update() {
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Apply gravity
        this.velocityY += this.gravity;

        // Update rotation for confetti
        if (this.type === 'confetti') {
            this.rotation += this.rotationSpeed;
        }

        // Decrease lifetime
        this.lifetime--;

        // Fade opacity based on remaining lifetime
        this.opacity = this.lifetime / this.maxLifetime;
    }

    draw(ctx, cameraX) {
        if (this.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (this.type === 'confetti') {
            // Draw rotated rectangle for confetti
            ctx.translate(this.x - cameraX, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            // Draw circle for other particles
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x - cameraX, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    isDead() {
        return this.lifetime <= 0 || this.opacity <= 0;
    }
}

// Fireball class for projectiles
class Fireball {
    constructor(x, y, direction, particleSystem) {
        this.x = x;
        this.y = y;
        this.direction = direction; // 1 for right, -1 for left
        this.width = CONFIG.particles.fireball.width;
        this.height = CONFIG.particles.fireball.height;
        this.speed = CONFIG.particles.fireball.speed;
        this.velocityX = this.speed * this.direction;
        this.lifetime = CONFIG.particles.fireball.lifetime;
        this.active = true;
        this.particleSystem = particleSystem;
        this.trailCounter = 0;
    }

    update() {
        if (!this.active) return;

        // Move horizontally
        this.x += this.velocityX;

        // Decrease lifetime
        this.lifetime--;

        // Emit trail particles
        if (this.particleSystem && this.trailCounter++ % CONFIG.particles.fireball.trailInterval === 0) {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            this.particleSystem.createTrailParticle(centerX, centerY, this.velocityX * 0.5, 0);
        }
    }

    draw(ctx, cameraX) {
        if (!this.active) return;

        ctx.save();
        
        // Draw fireball with gradient
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2 - cameraX, 
            this.y + this.height / 2,
            0,
            this.x + this.width / 2 - cameraX,
            this.y + this.height / 2,
            this.width / 2
        );
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FF6B00');
        gradient.addColorStop(1, '#FF4500');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - cameraX, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    checkCollision(platforms) {
        for (let platform of platforms) {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                return platform;
            }
        }
        return null;
    }

    isOffScreen(canvasWidth, cameraX) {
        return this.x + this.width < cameraX || this.x > cameraX + canvasWidth;
    }

    isDead() {
        return !this.active || this.lifetime <= 0;
    }

    deactivate() {
        this.active = false;
    }
}

// ProjectileManager class for managing fireballs
class ProjectileManager {
    constructor(particleSystem) {
        this.fireballs = [];
        this.particleSystem = particleSystem;
        this.maxFireballs = CONFIG.particles.fireball.maxActive;
    }

    addFireball(fireball) {
        // Enforce max limit
        if (this.fireballs.length >= this.maxFireballs) {
            this.fireballs.shift(); // Remove oldest
        }
        this.fireballs.push(fireball);
    }

    createFireball(x, y, direction) {
        const fireball = new Fireball(x, y, direction, this.particleSystem);
        this.addFireball(fireball);
    }

    update(platforms, canvasWidth, cameraX) {
        this.fireballs.forEach(fireball => {
            fireball.update();

            // Check collision with platforms
            const collidedPlatform = fireball.checkCollision(platforms);
            if (collidedPlatform) {
                // Trigger explosion at collision point
                if (this.particleSystem) {
                    this.particleSystem.createExplosion(
                        fireball.x + fireball.width / 2,
                        fireball.y + fireball.height / 2
                    );
                }
                fireball.deactivate();
            }

            // Check if off-screen
            if (fireball.isOffScreen(canvasWidth, cameraX)) {
                fireball.deactivate();
            }
        });

        // Remove dead fireballs
        this.fireballs = this.fireballs.filter(fireball => !fireball.isDead());
    }

    draw(ctx, cameraX) {
        this.fireballs.forEach(fireball => fireball.draw(ctx, cameraX));
    }

    clear() {
        this.fireballs = [];
    }

    getActiveCount() {
        return this.fireballs.length;
    }
}

// ParticleSystem class for managing particles
class ParticleSystem {
    constructor(maxParticles = 500) {
        this.particles = [];
        this.maxParticles = maxParticles;
    }

    addParticle(particle) {
        // If at max capacity, remove oldest particle (FIFO)
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
        }
        this.particles.push(particle);
    }

    update() {
        // Update all particles
        this.particles.forEach(particle => particle.update());

        // Remove dead particles
        this.particles = this.particles.filter(particle => !particle.isDead());
    }

    draw(ctx, cameraX) {
        this.particles.forEach(particle => particle.draw(ctx, cameraX));
    }

    clear() {
        this.particles = [];
    }

    getCount() {
        return this.particles.length;
    }

    createTrailParticle(x, y, velocityX, velocityY) {
        const config = CONFIG.particles.trail;
        const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
        const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        
        const vx = velocityX * -0.3 + (Math.random() - 0.5) * config.velocityRange;
        const vy = velocityY * -0.3 + (Math.random() - 0.5) * config.velocityRange;
        
        this.addParticle(new Particle(x, y, vx, vy, color, size, lifetime, 'trail'));
    }

    createExplosion(x, y) {
        const config = CONFIG.particles.explosion;
        const count = config.count;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];
            
            this.addParticle(new Particle(x, y, vx, vy, color, size, lifetime, 'explosion'));
        }
    }

    createSparkles(x, y) {
        const config = CONFIG.particles.sparkle;
        const count = config.count;
        
        for (let i = 0; i < count; i++) {
            const vx = (Math.random() - 0.5) * 2;
            const vy = config.floatSpeedMin + Math.random() * (config.floatSpeedMax - config.floatSpeedMin);
            
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];
            
            this.addParticle(new Particle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, vx, vy, color, size, lifetime, 'sparkle'));
        }
    }

    createConfetti(canvasWidth, canvasHeight) {
        const config = CONFIG.particles.confetti;
        const count = config.count;
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * canvasWidth;
            const y = -20 - Math.random() * 50;
            const vx = (Math.random() - 0.5) * 4;
            const vy = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
            
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];
            
            this.addParticle(new Particle(x, y, vx, vy, color, size, lifetime, 'confetti'));
        }
    }
}

// ScoreManager class for score persistence
class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.highScore = 0;
        this.newHighScoreAchieved = false;
        this.storageKey = 'superKiroWorld_highScore';
        this.loadHighScore();
    }

    getCurrentScore() {
        return this.currentScore;
    }

    getHighScore() {
        return this.highScore;
    }

    addScore(points) {
        this.currentScore += points;
        
        // Check if new high score
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.newHighScoreAchieved = true;
            this.saveHighScore();
        }
    }

    resetCurrentScore() {
        this.currentScore = 0;
        this.newHighScoreAchieved = false;
    }

    saveHighScore() {
        try {
            localStorage.setItem(this.storageKey, this.highScore.toString());
        } catch (e) {
            console.warn('Failed to save high score to localStorage:', e);
        }
    }

    loadHighScore() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved !== null) {
                this.highScore = parseInt(saved, 10);
                if (isNaN(this.highScore)) {
                    this.highScore = 0;
                }
            }
        } catch (e) {
            console.warn('Failed to load high score from localStorage:', e);
            this.highScore = 0;
        }
    }

    isNewHighScore() {
        return this.newHighScoreAchieved;
    }

    clearNewHighScoreFlag() {
        this.newHighScoreAchieved = false;
    }
}

class Player {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.player.width;
        this.height = CONFIG.player.height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.image = image;
        this.trailCounter = 0;
        this.facingDirection = 1; // 1 for right, -1 for left
    }

    update(keys, platforms, particleSystem) {
        // Horizontal movement
        if (keys.left) {
            this.velocityX = -CONFIG.player.speed;
            this.facingDirection = -1;
        } else if (keys.right) {
            this.velocityX = CONFIG.player.speed;
            this.facingDirection = 1;
        } else {
            this.velocityX *= CONFIG.player.friction;
        }

        // Jump
        if (keys.jump && this.isGrounded) {
            this.velocityY = -CONFIG.player.jumpPower;
            this.isGrounded = false;
        }

        // Apply gravity
        this.velocityY += CONFIG.player.gravity;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Collision detection
        this.isGrounded = false;
        this.handleCollisions(platforms, particleSystem);

        // Generate trail particles when moving
        if (particleSystem) {
            const speed = Math.abs(this.velocityX) + Math.abs(this.velocityY);
            if (speed > 1) {
                this.trailCounter++;
                if (this.trailCounter >= 3) {
                    this.trailCounter = 0;
                    const centerX = this.x + this.width / 2;
                    const centerY = this.y + this.height / 2;
                    particleSystem.createTrailParticle(centerX, centerY, this.velocityX, this.velocityY);
                }
            }
        }
    }

    handleCollisions(platforms, particleSystem) {
        for (let platform of platforms) {
            if (this.intersects(platform)) {
                // Calculate overlap on each axis
                const overlapX = Math.min(
                    this.x + this.width - platform.x,
                    platform.x + platform.width - this.x
                );
                const overlapY = Math.min(
                    this.y + this.height - platform.y,
                    platform.y + platform.height - this.y
                );

                let collisionX, collisionY;

                // Resolve collision on the axis with smallest overlap
                if (overlapX < overlapY) {
                    // Horizontal collision
                    if (this.x < platform.x) {
                        this.x = platform.x - this.width;
                        collisionX = platform.x;
                        collisionY = this.y + this.height / 2;
                    } else {
                        this.x = platform.x + platform.width;
                        collisionX = platform.x + platform.width;
                        collisionY = this.y + this.height / 2;
                    }
                    this.velocityX = 0;
                    
                    // Trigger explosion on horizontal collision
                    if (particleSystem && Math.abs(this.velocityX) > 2) {
                        particleSystem.createExplosion(collisionX, collisionY);
                    }
                } else {
                    // Vertical collision
                    if (this.y < platform.y) {
                        this.y = platform.y - this.height;
                        this.velocityY = 0;
                        this.isGrounded = true;
                        collisionX = this.x + this.width / 2;
                        collisionY = platform.y;
                        
                        // Trigger explosion on hard landing
                        if (particleSystem && this.velocityY > 5) {
                            particleSystem.createExplosion(collisionX, collisionY);
                        }
                    } else {
                        this.y = platform.y + platform.height;
                        this.velocityY = 0;
                    }
                }
            }
        }
    }

    intersects(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }

    shootFireball(projectileManager) {
        if (projectileManager) {
            const fireballX = this.facingDirection > 0 ? this.x + this.width : this.x;
            const fireballY = this.y + this.height / 2 - CONFIG.particles.fireball.height / 2;
            projectileManager.createFireball(fireballX, fireballY, this.facingDirection);
        }
    }

    draw(ctx, cameraX) {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x - cameraX, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#FF6B6B';
            ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
        }
    }
}

class Platform {
    constructor(x, y, width, height, color = '#8B4513') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx, cameraX) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - cameraX, this.y, this.width, this.height);
    }
}

class Collectible {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.collected = false;
        this.rotation = 0;
    }

    update() {
        this.rotation += 0.05;
    }

    draw(ctx, cameraX) {
        if (!this.collected) {
            ctx.save();
            ctx.translate(this.x + this.width / 2 - cameraX, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }

    checkCollision(player) {
        if (!this.collected) {
            if (player.x < this.x + this.width &&
                player.x + player.width > this.x &&
                player.y < this.y + this.height &&
                player.y + player.height > this.y) {
                this.collected = true;
                return true;
            }
        }
        return false;
    }
}

class Enemy {
    constructor(x, y, type, image) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.width = CONFIG.enemy.width;
        this.height = CONFIG.enemy.height;
        this.type = type; // 'google' or 'azure'
        this.image = image;
        this.velocityX = CONFIG.enemy.speed;
        this.patrolDistance = CONFIG.enemy.patrolDistance;
        this.alive = true;
        this.health = 1;
    }

    update() {
        if (!this.alive) return;

        // Patrol back and forth
        this.x += this.velocityX;

        // Reverse direction at patrol boundaries
        if (this.x > this.startX + this.patrolDistance || this.x < this.startX - this.patrolDistance) {
            this.velocityX *= -1;
        }
    }

    draw(ctx, cameraX) {
        if (!this.alive) return;

        if (this.image && this.image.complete) {
            ctx.drawImage(this.image, this.x - cameraX, this.y, this.width, this.height);
        } else {
            // Fallback color based on type
            ctx.fillStyle = this.type === 'google' ? '#4285F4' : '#0078D4';
            ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - cameraX, this.y, this.width, this.height);
        }
    }

    checkCollisionWithPlayer(player) {
        if (!this.alive) return false;

        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }

    checkCollisionWithFireball(fireball) {
        if (!this.alive) return false;

        return fireball.x < this.x + this.width &&
               fireball.x + fireball.width > this.x &&
               fireball.y < this.y + this.height &&
               fireball.y + fireball.height > this.y;
    }

    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.alive = false;
        }
    }

    isDead() {
        return !this.alive;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = { left: false, right: false, jump: false, fire: false };
        this.scoreManager = new ScoreManager();
        this.particleSystem = new ParticleSystem();
        this.projectileManager = new ProjectileManager(this.particleSystem);
        this.lives = 3;
        this.cameraX = 0;
        this.currentLevel = 1;
        this.gameState = 'playing'; // playing, gameOver, levelComplete
        
        // Load Kiro image
        this.kiroImage = new Image();
        this.kiroImage.src = 'kiro_logo.png';
        
        // Load enemy images
        this.googleImage = new Image();
        this.googleImage.src = 'google.png';
        this.azureImage = new Image();
        this.azureImage.src = 'azure.png';
        
        this.init();
        this.setupEventListeners();
        this.gameLoop();
    }

    init() {
        this.player = new Player(100, 100, this.kiroImage);
        this.platforms = this.createLevel(this.currentLevel);
        this.collectibles = this.createCollectibles(this.currentLevel);
        this.enemies = this.createEnemies(this.currentLevel);
        this.cameraX = 0;
    }

    createLevel(level) {
        const platforms = [];
        
        // Ground
        platforms.push(new Platform(0, 550, 3000, 50, '#228B22'));
        
        // Starting area
        platforms.push(new Platform(200, 450, 150, 20));
        platforms.push(new Platform(400, 380, 120, 20));
        platforms.push(new Platform(600, 320, 150, 20));
        
        // Mid section
        platforms.push(new Platform(850, 400, 100, 20));
        platforms.push(new Platform(1050, 350, 120, 20));
        platforms.push(new Platform(1250, 280, 100, 20));
        
        // Challenge section
        platforms.push(new Platform(1400, 450, 80, 20));
        platforms.push(new Platform(1550, 400, 80, 20));
        platforms.push(new Platform(1700, 350, 80, 20));
        
        // Upper path
        platforms.push(new Platform(1900, 250, 150, 20));
        platforms.push(new Platform(2100, 200, 120, 20));
        
        // Final stretch
        platforms.push(new Platform(2300, 350, 200, 20));
        platforms.push(new Platform(2600, 450, 300, 20));
        
        return platforms;
    }

    createCollectibles(level) {
        const collectibles = [];
        
        // Place collectibles on platforms
        collectibles.push(new Collectible(250, 420));
        collectibles.push(new Collectible(440, 350));
        collectibles.push(new Collectible(650, 290));
        collectibles.push(new Collectible(880, 370));
        collectibles.push(new Collectible(1080, 320));
        collectibles.push(new Collectible(1280, 250));
        collectibles.push(new Collectible(1430, 420));
        collectibles.push(new Collectible(1580, 370));
        collectibles.push(new Collectible(1730, 320));
        collectibles.push(new Collectible(1950, 220));
        collectibles.push(new Collectible(2130, 170));
        collectibles.push(new Collectible(2400, 320));
        collectibles.push(new Collectible(2700, 420));
        
        return collectibles;
    }

    createEnemies(level) {
        const enemies = [];
        
        // Place Google enemies (blue)
        enemies.push(new Enemy(500, 510, 'google', this.googleImage));
        enemies.push(new Enemy(900, 360, 'google', this.googleImage));
        enemies.push(new Enemy(1300, 240, 'google', this.googleImage));
        enemies.push(new Enemy(1800, 310, 'google', this.googleImage));
        enemies.push(new Enemy(2400, 310, 'google', this.googleImage));
        
        // Place Azure enemies (blue)
        enemies.push(new Enemy(700, 510, 'azure', this.azureImage));
        enemies.push(new Enemy(1100, 310, 'azure', this.azureImage));
        enemies.push(new Enemy(1500, 360, 'azure', this.azureImage));
        enemies.push(new Enemy(2000, 160, 'azure', this.azureImage));
        enemies.push(new Enemy(2700, 410, 'azure', this.azureImage));
        
        return enemies;
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
            if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') this.keys.jump = true;
            if (e.key === 'f' || e.key === 'F' || e.key === 'Shift') {
                if (!this.keys.fire) {
                    this.keys.fire = true;
                    this.player.shootFireball(this.projectileManager);
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
            if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') this.keys.jump = false;
            if (e.key === 'f' || e.key === 'F' || e.key === 'Shift') this.keys.fire = false;
        });
    }

    update() {
        if (this.gameState !== 'playing') return;

        this.player.update(this.keys, this.platforms, this.particleSystem);

        // Update particle system
        this.particleSystem.update();

        // Update projectiles
        this.projectileManager.update(this.platforms, CONFIG.canvas.width, this.cameraX);

        // Update collectibles
        this.collectibles.forEach(collectible => {
            collectible.update();
            if (collectible.checkCollision(this.player)) {
                this.scoreManager.addScore(100);
                this.updateUI();
                // Trigger sparkle effect when collecting
                this.particleSystem.createSparkles(
                    collectible.x + collectible.width / 2,
                    collectible.y + collectible.height / 2
                );
                
                // Check for new high score and trigger confetti
                if (this.scoreManager.isNewHighScore()) {
                    this.particleSystem.createConfetti(CONFIG.canvas.width, CONFIG.canvas.height);
                    this.scoreManager.clearNewHighScoreFlag();
                }
            }
        });

        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update();
            
            // Check collision with player
            if (enemy.checkCollisionWithPlayer(this.player)) {
                this.lives--;
                this.updateUI();
                // Trigger explosion at collision point
                this.particleSystem.createExplosion(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2
                );
                
                if (this.lives <= 0) {
                    this.endGame();
                } else {
                    // Respawn player
                    this.player.x = 100;
                    this.player.y = 100;
                    this.player.velocityX = 0;
                    this.player.velocityY = 0;
                    this.cameraX = 0;
                }
            }
        });

        // Check fireball collisions with enemies
        this.projectileManager.fireballs.forEach(fireball => {
            this.enemies.forEach(enemy => {
                if (enemy.checkCollisionWithFireball(fireball)) {
                    enemy.takeDamage();
                    fireball.deactivate();
                    
                    // Trigger explosion
                    this.particleSystem.createExplosion(
                        enemy.x + enemy.width / 2,
                        enemy.y + enemy.height / 2
                    );
                    
                    // Award points for killing enemy
                    if (enemy.isDead()) {
                        this.scoreManager.addScore(500);
                        this.updateUI();
                        
                        // Check for new high score
                        if (this.scoreManager.isNewHighScore()) {
                            this.particleSystem.createConfetti(CONFIG.canvas.width, CONFIG.canvas.height);
                            this.scoreManager.clearNewHighScoreFlag();
                        }
                    }
                }
            });
        });

        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => !enemy.isDead());

        // Smooth camera follow
        const targetCameraX = this.player.x - CONFIG.canvas.width / 3;
        this.cameraX += (targetCameraX - this.cameraX) * CONFIG.camera.smoothness;
        this.cameraX = Math.max(0, this.cameraX);

        // Check if player fell off
        if (this.player.y > CONFIG.canvas.height) {
            this.lives--;
            this.updateUI();
            if (this.lives <= 0) {
                this.endGame();
            } else {
                this.player.x = 100;
                this.player.y = 100;
                this.player.velocityX = 0;
                this.player.velocityY = 0;
                this.cameraX = 0;
            }
        }

        // Check level completion
        if (this.player.x > 2800) {
            this.completeLevel();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Draw clouds
        this.drawClouds();

        // Draw platforms
        this.platforms.forEach(platform => platform.draw(this.ctx, this.cameraX));

        // Draw collectibles
        this.collectibles.forEach(collectible => collectible.draw(this.ctx, this.cameraX));

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx, this.cameraX));

        // Draw particles
        this.particleSystem.draw(this.ctx, this.cameraX);

        // Draw projectiles
        this.projectileManager.draw(this.ctx, this.cameraX);

        // Draw player
        this.player.draw(this.ctx, this.cameraX);
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const cloudOffset = this.cameraX * 0.3;
        
        this.ctx.beginPath();
        this.ctx.arc(200 - cloudOffset, 100, 30, 0, Math.PI * 2);
        this.ctx.arc(230 - cloudOffset, 100, 40, 0, Math.PI * 2);
        this.ctx.arc(260 - cloudOffset, 100, 30, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(500 - cloudOffset, 150, 35, 0, Math.PI * 2);
        this.ctx.arc(535 - cloudOffset, 150, 45, 0, Math.PI * 2);
        this.ctx.arc(570 - cloudOffset, 150, 35, 0, Math.PI * 2);
        this.ctx.fill();
    }

    updateUI() {
        document.getElementById('score').textContent = this.scoreManager.getCurrentScore();
        document.getElementById('highScore').textContent = this.scoreManager.getHighScore();
        document.getElementById('lives').textContent = this.lives;
    }

    endGame() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.scoreManager.getCurrentScore();
        document.getElementById('gameOver').style.display = 'block';
    }

    completeLevel() {
        this.gameState = 'levelComplete';
        document.getElementById('completeScore').textContent = this.scoreManager.getCurrentScore();
        document.getElementById('levelComplete').style.display = 'block';
    }

    restart() {
        this.scoreManager.resetCurrentScore();
        this.lives = 3;
        this.currentLevel = 1;
        this.gameState = 'playing';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('levelComplete').style.display = 'none';
        this.init();
        this.updateUI();
    }

    nextLevel() {
        this.currentLevel++;
        this.gameState = 'playing';
        document.getElementById('levelComplete').style.display = 'none';
        this.init();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game
const game = new Game();

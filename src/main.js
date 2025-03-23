var c = document.createElement("canvas");
var ctx = c.getContext("2d");

var screenWidth = 500;
var screenHeight = 800;
c.width = screenWidth;
c.height = screenHeight;

// Get the game container and add the canvas to it
var gameContainer = document.getElementById('game-container');
gameContainer.appendChild(c);

// Make canvas responsive for mobile devices
function resizeCanvas() {
    let windowRatio = window.innerWidth / window.innerHeight;
    let gameRatio = screenWidth / screenHeight;
    
    if (isMobile) {
        // For mobile, try to take up more screen space
        if (windowRatio < gameRatio) {
            // Window is taller than game ratio
            c.style.width = '95vw';
            c.style.height = 'auto';
        } else {
            // Window is wider than game ratio
            c.style.height = '95vh';
            c.style.width = 'auto';
        }
    } else {
        // For desktop, maintain aspect ratio with some padding
        if (windowRatio < gameRatio) {
            c.style.width = '90vw';
            c.style.height = 'auto';
        } else {
            c.style.height = '90vh';
            c.style.width = 'auto';
        }
    }
}

// Input events for keyboard and touch
window.addEventListener('keydown', this.keydown, false);
window.addEventListener('keyup', this.keyup, false);
c.addEventListener('touchstart', this.touchstart, false);
window.addEventListener('touchend', this.touchend, false);
window.addEventListener('touchmove', this.touchmove, false);
c.addEventListener('click', this.handleClick, false);
window.addEventListener('resize', resizeCanvas, false);

//Variables
const gravity = 0.34;
var holdingLeftKey = false;
var holdingRightKey = false;
var keycode;
var dead = false;
var difficulty = 0;
var lowestBlock = 0;
var score = 0;
var yDistanceTravelled = 0;
var isShooting = false;
var bullets = [];
var isMobile = false;
var touchX = 0;
var showShootButton = true; // Always show shoot button on mobile

// Add background music
var backgroundMusic = new Audio("Sprites/Music.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5; // 50% volume
var musicEnabled = true;

// Add crypto count variable
var cryptoCount = 0;

// Add music button dimensions and position
var musicButtonX = screenWidth - 50;
var musicButtonY = 50;
var musicButtonRadius = 25;

var blocks = [];
var powerups = [];

// Define Bullet class if not already defined
function bullet(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 25;
    this.speed = 15;
    this.active = true;
    this.justCreated = true; // Track if bullet was just created for initial effect
    this.creationFrame = 0; // Animation frame counter
    
    this.update = function() {
        this.y -= this.speed;
        
        // Mark as inactive if off screen
        if (this.y < -this.height) {
            this.active = false;
        }
        
        // Update creation effect
        if (this.justCreated) {
            this.creationFrame++;
            if (this.creationFrame > 5) { // Effect lasts for 5 frames
                this.justCreated = false;
            }
        }
    }
    
    this.draw = function() {
        ctx.save();
        
        // Bullet glow
        ctx.shadowColor = "#00f6ff";
        ctx.shadowBlur = 15;
        
        // Draw bullet with cyberpunk style
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, "#ff2f6d");
        gradient.addColorStop(1, "#00f6ff");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add particle trail effect
        for (let i = 0; i < 3; i++) {
            const trailX = this.x + Math.random() * this.width;
            const trailY = this.y + this.height + Math.random() * 15;
            const size = Math.random() * 4 + 2;
            ctx.globalAlpha = Math.random() * 0.7;
            ctx.fillStyle = "#00f6ff";
            ctx.fillRect(trailX, trailY, size, size);
        }
        
        // Add muzzle flash effect only on creation (no screen flash)
        if (this.justCreated) {
            // Draw a small flash at the bullet's position
            const flashSize = 20 - this.creationFrame * 3;
            ctx.globalAlpha = 0.7 - this.creationFrame * 0.1;
            
            // Radial gradient for muzzle flash
            const flash = ctx.createRadialGradient(
                this.x + this.width/2, this.y + this.height, 0,
                this.x + this.width/2, this.y + this.height, flashSize
            );
            flash.addColorStop(0, "#ffffff");
            flash.addColorStop(0.5, "#ff2f6d");
            flash.addColorStop(1, "transparent");
            
            ctx.fillStyle = flash;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height, flashSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    this.checkCollision = function() {
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i] !== 0 && blocks[i].monster !== 0 && blocks[i].monster !== undefined) {
                // Get monster size from monster data
                let monster = monsterFunctions[blocks[i].monster];
                let monsterX = blocks[i].x + monster.xDif;
                let monsterY = blocks[i].y + monster.yDif;
                let monsterWidth = monster.width;
                let monsterHeight = monster.height;
                
                // Check collision with monster
                if (this.x < monsterX + monsterWidth && 
                    this.x + this.width > monsterX && 
                    this.y < monsterY + monsterHeight && 
                    this.y + this.height > monsterY) {
                    
                    // Visual feedback for hit
                    ctx.save();
                    ctx.fillStyle = 'rgba(255, 47, 109, 0.5)';
                    ctx.fillRect(monsterX, monsterY, monsterWidth, monsterHeight);
                    ctx.restore();
                    
                    // Bullet hit monster - remove monster and this bullet
                    blocks[i].monster = 0;
                    score += 50; // More points for shooting a monster
                    
                    // If it's a standalone monster (no platform), convert to invisible platform
                    if (blocks[i].type === "none") {
                        blocks[i].type = 0; // Convert to regular platform
                    }
                    
                    this.active = false; // Mark bullet as inactive
                    return true; // Bullet hit something
                }
            }
        }
        return false; // No collision
    }
}

// Check if device is mobile
function detectMobile() {
    return (('ontouchstart' in window) || 
            (navigator.maxTouchPoints > 0) || 
            (navigator.msMaxTouchPoints > 0));
}

// Draw shoot button for mobile
function drawShootButton() {
    if (isMobile && !dead) {
        // Draw a much larger, more visible button
        ctx.save();
        
        // Outer glow effect
        ctx.beginPath();
        ctx.arc(screenWidth / 2, screenHeight - 80, 65, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 47, 109, 0.4)';
        ctx.fill();
        
        // Button background
        ctx.beginPath();
        ctx.arc(screenWidth / 2, screenHeight - 80, 55, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 47, 109, 0.9)';
        ctx.fill();
        
        // Button border
        ctx.strokeStyle = '#ff75a0';
        ctx.lineWidth = 5;
        ctx.stroke();
        
        // Button text
        ctx.font = "bold 30px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("FIRE", screenWidth / 2, screenHeight - 72);
        
        // Add pulsing effect
        const pulseSize = Math.sin(Date.now() / 200) * 7 + 3;
        ctx.beginPath();
        ctx.arc(screenWidth / 2, screenHeight - 80, 55 + pulseSize, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        ctx.restore();
    }
}

// Draw music toggle button
function drawMusicButton() {
    ctx.save();
    
    // Button background with glow effect
    ctx.beginPath();
    ctx.arc(musicButtonX, musicButtonY, musicButtonRadius, 0, Math.PI * 2);
    
    // Create gradient for button
    const gradient = ctx.createRadialGradient(
        musicButtonX, musicButtonY, musicButtonRadius * 0.5,
        musicButtonX, musicButtonY, musicButtonRadius
    );
    
    if (musicEnabled) {
        gradient.addColorStop(0, 'rgba(0, 246, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(0, 246, 255, 0.4)');
        ctx.fillStyle = gradient;
    } else {
        gradient.addColorStop(0, 'rgba(255, 47, 109, 0.9)');
        gradient.addColorStop(1, 'rgba(255, 47, 109, 0.4)');
        ctx.fillStyle = gradient;
    }
    
    ctx.fill();
    
    // Button border
    ctx.strokeStyle = musicEnabled ? '#00f6ff' : '#ff2f6d';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw music icon (either on or off)
    ctx.fillStyle = '#ffffff';
    
    if (musicEnabled) {
        // Music on icon
        ctx.beginPath();
        ctx.moveTo(musicButtonX - 9, musicButtonY - 7);
        ctx.lineTo(musicButtonX - 9, musicButtonY + 7);
        ctx.lineTo(musicButtonX - 3, musicButtonY + 7);
        ctx.lineTo(musicButtonX + 4, musicButtonY + 12);
        ctx.lineTo(musicButtonX + 4, musicButtonY - 12);
        ctx.lineTo(musicButtonX - 3, musicButtonY - 7);
        ctx.closePath();
        ctx.fill();
        
        // Sound waves
        ctx.beginPath();
        ctx.arc(musicButtonX + 4, musicButtonY, 7, -Math.PI/4, Math.PI/4);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(musicButtonX + 4, musicButtonY, 12, -Math.PI/3, Math.PI/3);
        ctx.stroke();
    } else {
        // Music off icon (speaker with X)
        ctx.beginPath();
        ctx.moveTo(musicButtonX - 9, musicButtonY - 7);
        ctx.lineTo(musicButtonX - 9, musicButtonY + 7);
        ctx.lineTo(musicButtonX - 3, musicButtonY + 7);
        ctx.lineTo(musicButtonX + 4, musicButtonY + 12);
        ctx.lineTo(musicButtonX + 4, musicButtonY - 12);
        ctx.lineTo(musicButtonX - 3, musicButtonY - 7);
        ctx.closePath();
        ctx.fill();
        
        // X over the speaker
        ctx.beginPath();
        ctx.moveTo(musicButtonX + 6, musicButtonY - 8);
        ctx.lineTo(musicButtonX + 14, musicButtonY + 8);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(musicButtonX + 14, musicButtonY - 8);
        ctx.lineTo(musicButtonX + 6, musicButtonY + 8);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Check if touch/click is on the music button
function isTouchOnMusicButton(x, y) {
    const distanceX = x - musicButtonX;
    const distanceY = y - musicButtonY;
    return Math.sqrt(distanceX * distanceX + distanceY * distanceY) <= musicButtonRadius;
}

// Check if touch is on the shoot button (enlarged touch area)
function isTouchOnShootButton(x, y) {
    const distanceX = x - screenWidth / 2;
    const distanceY = y - (screenHeight - 80); // Updated to match new button position
    return Math.sqrt(distanceX * distanceX + distanceY * distanceY) <= 80; // Even larger touch area
}

function shoot() {
    console.log("Attempting to shoot");
    if (!dead) {
        var newBullet = new bullet(player.x + player.width / 2 - 5, player.y);
        bullets.push(newBullet);
        
        // Sound effect removed - no more file not found errors
    }
}

function handleClick(e) {
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale touch coordinates based on canvas size
    const scaleX = screenWidth / rect.width;
    const scaleY = screenHeight / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    // Check if music button was clicked
    if (isTouchOnMusicButton(canvasX, canvasY)) {
        toggleMusic();
        return;
    }
    
    if (isMobile) {
        // If game is over, any tap will restart
        if (dead) {
            restartGame();
            return;
        }
        
        // Debug touch location
        console.log("Touch at: " + canvasX + ", " + canvasY);
        
        // Otherwise check if touching the shoot button with scaled coordinates
        if (isTouchOnShootButton(canvasX, canvasY)) {
            console.log("Shoot button pressed!");
            shoot();
            return;
        }
    }
}

function touchstart(e) {
    if (dead) {
        if (isMobile) {
            restartGame();
        }
        return;
    }
    
    // Try to start music on first interaction (to handle autoplay restrictions)
    if (musicEnabled && backgroundMusic.paused) {
        backgroundMusic.play().catch(error => {
            console.log("Music autoplay prevented by browser:", error);
        });
    }
    
    const rect = c.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Scale touch coordinates based on canvas size
    const scaleX = screenWidth / rect.width;
    const scaleY = screenHeight / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    // Check if touching the music button
    if (isTouchOnMusicButton(canvasX, canvasY)) {
        toggleMusic();
        return;
    }
    
    touchX = canvasX;
    
    // Check if touching the shoot button
    if (isTouchOnShootButton(canvasX, canvasY)) {
        console.log("Shoot button touched!");
        shoot();
        return;
    }
    
    // Otherwise handle movement
    if (canvasX < screenWidth / 2) {
        holdingLeftKey = true;
        holdingRightKey = false;
    } else {
        holdingRightKey = true;
        holdingLeftKey = false;
    }
}

function touchend(e) {
    holdingLeftKey = false;
    holdingRightKey = false;
}

function touchmove(e) {
    if (dead) return;
    
    const rect = c.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    
    // Scale touch coordinates
    const scaleX = screenWidth / rect.width;
    const canvasX = x * scaleX;
    
    // Simpler direction change based on absolute position
    if (canvasX < screenWidth / 2) {
        holdingLeftKey = true;
        holdingRightKey = false;
    } else {
        holdingRightKey = true;
        holdingLeftKey = false;
    }
    
    touchX = canvasX;
}

//Time variables
var fps = 60;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;

function keydown(e) {
    // Add M key to toggle music
    if (e.keyCode === 77) { // M key
        toggleMusic();
    }
    
    if (e.keyCode === 65 || e.keyCode === 37) { // A or Left Arrow
        holdingLeftKey = true;
    } else if (e.keyCode === 68 || e.keyCode === 39) { // D or Right Arrow
        holdingRightKey = true;
    } else if (e.keyCode === 32) { // Space bar
        shoot();
    }

    if (e.keyCode === 82 && dead) {
        restartGame();
    }
}

function keyup(e) {
    if (e.keyCode === 65 || e.keyCode === 37) { // A or Left Arrow
        holdingLeftKey = false;
    } else if (e.keyCode === 68 || e.keyCode === 39) { // D or Right Arrow
        holdingRightKey = false;
    }
}

function showScore() {
    if (yDistanceTravelled > score) {
        score = Math.round(yDistanceTravelled);
    }

    // Cyber style score
    ctx.save();
    
    // "SCORE" label
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#00f6ff"; // Cyan
    ctx.textAlign = "left";
    ctx.fillText("$SCORE", 15, 30);
    
    // Create a glowing effect for the actual score
    ctx.shadowColor = "#00f6ff";
    ctx.shadowBlur = 8;
    ctx.font = "bold 36px monospace";
    ctx.fillStyle = "#7df9ff";
    ctx.textAlign = "left";
    ctx.fillText(score, 15, 70);
    
    ctx.restore();
}

function loop() {
    requestAnimationFrame(loop);

    //This sets the FPS to 60
    now = Date.now();
    delta = now - then;
     
    if (delta > interval) {
        // Clear the canvas
        ctx.clearRect(0, 0, screenWidth, screenHeight);
        
        // Draw the background
        drawBackground();
        
        // Update and draw blocks
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i] !== 0) {
                blocks[i].update();
                blocks[i].draw();
            }
        }

        // Update and draw bullets - fixed bullet handling
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].update();
            bullets[i].draw();
            
            // Check for collisions
            if (bullets[i].checkCollision() || !bullets[i].active) {
                bullets.splice(i, 1);
            }
        }

        player.update();
        player.draw();

        showScore();
        
        // Show instructions for controls
        showInstructions();
        
        // Draw mobile shoot button if needed
        drawShootButton();
        
        // Draw music toggle button
        drawMusicButton();

        then = now - (delta % interval);
    }
}

// Check if device is mobile once on init and resize canvas
isMobile = detectMobile();
resizeCanvas();

// Add instructions
function showInstructions() {
    if (!dead && score < 100) {
        ctx.save();
        ctx.font = "16px monospace";
        ctx.fillStyle = "#d87df9";
        ctx.textAlign = "center";
        
        if (isMobile) {
            ctx.fillText("TAP LEFT/RIGHT OF SCREEN TO MOVE", screenWidth / 2, 120);
            ctx.fillText("TAP RED BUTTON TO SHOOT", screenWidth / 2, 145);
            ctx.fillText("TAP MUSIC ICON TO TOGGLE SOUND", screenWidth / 2, 170);
        } else {
            ctx.fillText("ARROWS OR A/D TO MOVE", screenWidth / 2, 120);
            ctx.fillText("SPACE TO SHOOT", screenWidth / 2, 145);
            ctx.fillText("CLICK MUSIC ICON OR PRESS M TO TOGGLE SOUND", screenWidth / 2, 170);
        }
        
        ctx.restore();
    }
}

blocks.push(new block);
blocks[0].x = 300;
blocks[0].y = 650;
blocks[0].monster = 0;
blocks[0].type = 0;
blocks[0].powerup = 0;

blockSpawner();

loop();

// Function to restart the game
function restartGame() {
    // Try to start music if it was enabled but paused
    if (musicEnabled && backgroundMusic.paused) {
        backgroundMusic.play().catch(error => {
            console.log("Music autoplay prevented by browser:", error);
        });
    }
    
    blocks = [];
    lowestBlock = 0;
    difficulty = 0;
    score = 0;
    yDistanceTravelled = 0;
    player.springBootsDurability = 0;
    bullets = [];

    blocks.push(new block);
    blocks[0].x = 300;
    blocks[0].y = 650;
    blocks[0].monster = 0;
    blocks[0].type = 0;
    blocks[0].powerup = 0;

    blockSpawner();
    
    player.x = 300;
    player.y = 550;

    dead = false;
}

// Add missing drawBackground function
function drawBackground() {
    // Create a dark cyberpunk background with gradient
    let gradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
    gradient.addColorStop(0, '#0c0c17');
    gradient.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    // Add neon grid lines for cyberpunk effect
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.2)'; // Purple neon
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let y = 0; y < screenHeight; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(screenWidth, y);
        ctx.stroke();
    }
    
    // Vertical grid lines
    for (let x = 0; x < screenWidth; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, screenHeight);
        ctx.stroke();
    }
    
    // Add some random "crypto" dots in the background
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
        let x = Math.random() * screenWidth;
        let y = Math.random() * screenHeight;
        let size = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Function to toggle music
function toggleMusic() {
    if (musicEnabled) {
        backgroundMusic.pause();
        musicEnabled = false;
    } else {
        backgroundMusic.play().catch(error => {
            console.log("Music autoplay prevented by browser:", error);
        });
        musicEnabled = true;
    }
}

// Initialize the game - start music when game starts
try {
    backgroundMusic.play().catch(error => {
        console.log("Music autoplay prevented by browser:", error);
        console.log("Music will start on first interaction");
    });
} catch (error) {
    console.log("Music autoplay error:", error);
}


// Monster spawn counter - to control frequency
var jumpCounter = 0; // Count player jumps instead of block creation
var nextMonsterSpawn = Math.floor(Math.random() * 7) + 10; // Random between 10-16 jumps (much more frequent)

function spawnMonster() {
    // Don't increment counter here - it's now incremented on player jumps
    
    // Check if we've reached the target number of jumps
    if (jumpCounter >= nextMonsterSpawn) {
        // Reset counter and set new random spawn target (10-16 jumps - more frequent)
        jumpCounter = 0;
        nextMonsterSpawn = Math.floor(Math.random() * 7) + 10;
        
        // Let's ensure the monster actually spawns by returning a random monster type
        console.log("Spawning monster after " + nextMonsterSpawn + " jumps");
        return getRandomMonster();
    }
    
    // Increased random chance to spawn monsters regardless of jump counter
    // This makes them even more frequent
    if (Math.random() < 0.15) { // 15% chance on every block to spawn a monster
        console.log("Random monster spawn triggered!");
        return getRandomMonster();
    }
    
    return 0;
}

// Helper function to randomly select a monster type
function getRandomMonster() {
    const monsterTypes = ["smallRed", "monster1", "monster3", "monster4", "monster5", "monster6"];
    const randomIndex = Math.floor(Math.random() * monsterTypes.length);
    return monsterTypes[randomIndex];
}

// Function to increment jump counter - called when player jumps
function incrementJumpCounter() {
    jumpCounter++;
    console.log("Jump counter: " + jumpCounter + " / " + nextMonsterSpawn);
}

var smallRed = new function() {
    this.img = new Image();
    this.img.src = "Sprites/Monsters/smallRed.png";
    this.xDif = 5; // Adjusted position 
    this.yDif = -40; // Raised position
    this.width = 75; // Slightly bigger than original (69)
    this.height = 65; // Slightly bigger than original (60)
    this.animationOffset = 0; // For floating animation
    
    this.draw = function(blockX, blockY) {
        // Add a floating animation effect
        this.animationOffset = Math.sin(Date.now() / 300) * 3;
        
        ctx.drawImage(
            this.img, 
            blockX + this.xDif, 
            blockY + this.yDif + this.animationOffset, 
            this.width, 
            this.height
        );
    }
}

// Add monster1 type
var monster1 = new function() {
    this.img = new Image();
    this.img.src = "Sprites/Monsters/monster1.png";
    this.xDif = 0; // Adjusted position
    this.yDif = -42; // Raised position
    this.width = 80; // Slightly bigger than original
    this.height = 69; // Slightly bigger than original
    this.animationOffset = 0; // For floating animation
    
    this.draw = function(blockX, blockY) {
        // Add a floating animation effect
        this.animationOffset = Math.sin(Date.now() / 400) * 4;
        
        ctx.drawImage(
            this.img, 
            blockX + this.xDif, 
            blockY + this.yDif + this.animationOffset, 
            this.width, 
            this.height
        );
    }
}

// Add monster3 type
var monster3 = new function() {
    this.img = new Image();
    this.img.src = "Sprites/Monsters/monster3.png";
    this.xDif = 0; // Adjusted position
    this.yDif = -45; // Raised position
    this.width = 85; // Slightly bigger than original
    this.height = 73; // Slightly bigger than original
    this.animationOffset = 0; // For floating animation
    
    this.draw = function(blockX, blockY) {
        // Add a bobbing animation effect
        this.animationOffset = Math.sin(Date.now() / 350) * 5;
        
        ctx.drawImage(
            this.img, 
            blockX + this.xDif, 
            blockY + this.yDif + this.animationOffset, 
            this.width, 
            this.height
        );
    }
}

// Add monster4 type
var monster4 = new function() {
    this.img = new Image();
    this.img.src = "Sprites/Monsters/monster4.png";
    this.xDif = 0; // Adjusted position
    this.yDif = -44; // Raised position
    this.width = 78; // Slightly bigger than original
    this.height = 68; // Slightly bigger than original
    this.animationOffset = 0; // For floating animation
    this.rotationAngle = 0; // For subtle rotation
    
    this.draw = function(blockX, blockY) {
        // Add a floating and rotation animation
        this.animationOffset = Math.sin(Date.now() / 380) * 4;
        this.rotationAngle = Math.sin(Date.now() / 1000) * 0.1;
        
        ctx.save();
        ctx.translate(blockX + this.xDif + this.width/2, blockY + this.yDif + this.height/2 + this.animationOffset);
        ctx.rotate(this.rotationAngle);
        ctx.drawImage(
            this.img, 
            -this.width/2, 
            -this.height/2, 
            this.width, 
            this.height
        );
        ctx.restore();
    }
}

// Add monster5 type
var monster5 = new function() {
    this.img = new Image();
    this.img.src = "Sprites/Monsters/monster5.png";
    this.xDif = 0; // Adjusted position
    this.yDif = -45; // Raised position
    this.width = 82; // Slightly bigger than original
    this.height = 70; // Slightly bigger than original
    this.animationOffset = 0; // For floating animation
    
    this.draw = function(blockX, blockY) {
        // Add a more aggressive bobbing animation
        this.animationOffset = Math.sin(Date.now() / 250) * 6;
        
        ctx.drawImage(
            this.img, 
            blockX + this.xDif, 
            blockY + this.yDif + this.animationOffset, 
            this.width, 
            this.height
        );
    }
}

// Add monster6 type
var monster6 = new function() {
    this.img = new Image();
    this.img.src = "Sprites/Monsters/monster6.png";
    this.xDif = 0; // Adjusted position
    this.yDif = -42; // Raised position
    this.width = 76; // Slightly bigger than original
    this.height = 66; // Slightly bigger than original
    this.animationOffset = 0; // For floating animation
    this.sideOffset = 0; // For side-to-side movement
    
    this.draw = function(blockX, blockY) {
        // Add both vertical and horizontal animation
        this.animationOffset = Math.sin(Date.now() / 300) * 4;
        this.sideOffset = Math.sin(Date.now() / 500) * 8;
        
        ctx.drawImage(
            this.img, 
            blockX + this.xDif + this.sideOffset, 
            blockY + this.yDif + this.animationOffset, 
            this.width, 
            this.height
        );
    }
}

var monsterFunctions = {
    "smallRed": smallRed,
    "monster1": monster1,
    "monster3": monster3,
    "monster4": monster4,
    "monster5": monster5,
    "monster6": monster6
}
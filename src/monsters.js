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
    this.xDif = 10;
    this.yDif = -30;
    this.width = 69;
    this.height = 60;
    
    this.draw = function(blockX, blockY) {
        ctx.drawImage(
            this.img, 
            blockX + this.xDif, 
            blockY + this.yDif, 
            this.width, 
            this.height
        );
    }
}

// Add monster1 type
var monster1 = new function() {
    this.img = new Image();
    this.img.src = "Sprites/Monsters/monster1.png";
    this.xDif = 10;
    this.yDif = -30;
    this.width = 69; 
    this.height = 60;
    
    this.draw = function(blockX, blockY) {
        ctx.drawImage(
            this.img, 
            blockX + this.xDif, 
            blockY + this.yDif, 
            this.width, 
            this.height
        );
    }
}

// Add monster3 type
var monster3 = new function() {
    this.img = new Image();
    this.img.src = "Sprites/Monsters/monster3.png";
    this.xDif = 10;
    this.yDif = -30;
    this.width = 69;
    this.height = 60;
    
    this.draw = function(blockX, blockY) {
        ctx.drawImage(
            this.img, 
            blockX + this.xDif, 
            blockY + this.yDif, 
            this.width, 
            this.height
        );
    }
}

// Add monster4 type
var monster4 = new function() {
    this.img = new Image();
    this.img.src = "Sprites/Monsters/monster4.png";
    this.xDif = 10;
    this.yDif = -30;
    this.width = 69;
    this.height = 60;
    
    this.draw = function(blockX, blockY) {
        ctx.drawImage(
            this.img, 
            blockX + this.xDif, 
            blockY + this.yDif, 
            this.width, 
            this.height
        );
    }
}

// Add monster5 type
var monster5 = new function() {
    this.img = new Image();
    this.img.src = "Sprites/Monsters/monster5.png";
    this.xDif = 10;
    this.yDif = -30;
    this.width = 69;
    this.height = 60;
    
    this.draw = function(blockX, blockY) {
        ctx.drawImage(
            this.img, 
            blockX + this.xDif, 
            blockY + this.yDif, 
            this.width, 
            this.height
        );
    }
}

// Add monster6 type
var monster6 = new function() {
    this.img = new Image();
    this.img.src = "Sprites/Monsters/monster6.png";
    this.xDif = 10;
    this.yDif = -30;
    this.width = 69;
    this.height = 60;
    
    this.draw = function(blockX, blockY) {
        ctx.drawImage(
            this.img, 
            blockX + this.xDif, 
            blockY + this.yDif, 
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
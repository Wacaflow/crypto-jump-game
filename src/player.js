var player = new function() {
    this.x = 300;
    this.y = 550;
    
    // Pre-load both player images to prevent blinking
    this.rightImg = new Image();
    this.rightImg.src = "Sprites/rightPlayer.png";
    this.leftImg = new Image();
    this.leftImg.src = "Sprites/leftPlayer.png";
    
    this.img = this.rightImg; // Current displayed image
    this.width = 80;
    this.height = 80;
    this.xSpeed = 6.7;
    this.ySpeed = 0;
    this.springBootsDurability = 0;
    this.direction = "right";

    this.update = function() {
        if (!dead) {
            this.ySpeed += gravity;
            if (this.y <= screen.height / 2 - 200 && this.ySpeed <= 0) {
                for (var i = 0; i < blocks.length; i++) {
                    blocks[i].y -= this.ySpeed;
                }
            } else {
                this.y += this.ySpeed;
            }
            yDistanceTravelled -= this.ySpeed;
        } else {
            // Cyberpunk style game over screen
            ctx.save();
            
            // Darkened overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, screenWidth, screenHeight);
            
            // Glitchy "GAME OVER" text - adjusted size
            ctx.font = "bold 50px monospace";  // Reduced from 60px to 50px
            ctx.shadowColor = "#ff2f6d";
            ctx.shadowBlur = 15;
            ctx.fillStyle = "#ff2f6d";
            ctx.textAlign = "center";
            ctx.fillText("CONNECTION LOST", screenWidth / 2, screenHeight / 2 - 50);
            
            // Score display
            ctx.font = "bold 36px monospace";
            ctx.shadowColor = "#00f6ff";
            ctx.shadowBlur = 10;
            ctx.fillStyle = "#00f6ff";
            ctx.fillText(`$SCORE: ${score}`, screenWidth / 2, screenHeight / 2 + 20);
            
            // Restart instructions
            ctx.font = "24px monospace";
            ctx.fillStyle = "#d87df9";
            ctx.shadowColor = "#d87df9";
            ctx.shadowBlur = 5;
            if (isMobile) {
                ctx.fillText("// TAP SCREEN TO RESTART", screenWidth / 2, screenHeight / 2 + 70);
            } else {
                ctx.fillText("// PRESS R TO RESTART NETWORK", screenWidth / 2, screenHeight / 2 + 70);
            }
            
            // Add some glitch effects
            for (let i = 0; i < 5; i++) {
                let x = Math.random() * screenWidth;
                let y = Math.random() * screenHeight;
                let width = Math.random() * 100 + 50;
                let height = Math.random() * 5 + 2;
                ctx.fillStyle = `rgba(0, 246, 255, ${Math.random() * 0.5})`;
                ctx.fillRect(x, y, width, height);
            }
            
            ctx.restore();
        }

        //A key pressed
        if (holdingLeftKey) {
            this.direction = "left";
            this.img = this.leftImg; // Switch image reference instead of reloading
            player.moveLeft();
        }
        //D key pressed 
        if (holdingRightKey) {
            this.direction = "right";
            this.img = this.rightImg; // Switch image reference instead of reloading
            player.moveRight();
        }

        //Check for jump
        for (var i = 0; i < blocks.length; i++) {
            if (this.ySpeed >= 0) {
                // Skip collision with "none" type blocks (monster-only)
                if (blocks[i].type === "none") {
                    // Check if player is landing on top of the monster
                    if (blocks[i] !== 0 && blocks[i].monster !== 0 && blocks[i].monster !== undefined) {
                        let monster = monsterFunctions[blocks[i].monster];
                        let monsterX = blocks[i].x + monster.xDif;
                        let monsterY = blocks[i].y + monster.yDif;
                        let monsterWidth = monster.width;
                        let monsterHeight = monster.height;
                        
                        // Check if player's feet are near the monster's head (landing on top of monster)
                        if (this.x + 20 < monsterX + monsterWidth && 
                            this.x + this.width - 20 > monsterX && 
                            this.y + this.height > monsterY && 
                            this.y + this.height < monsterY + monsterHeight/2) {
                            
                            // Player landed on monster - jump higher and kill monster
                            this.ySpeed = -20; // Higher jump than normal
                            
                            // Instead of removing the block, convert it to a temporary invisible platform
                            blocks[i].monster = 0;
                            blocks[i].type = 0; // Regular platform type
                            score += 25; // Bonus points for killing monster by jumping
                            
                            // Increment jump counter for monster spawning
                            if (typeof incrementJumpCounter === 'function') {
                                incrementJumpCounter();
                            }
                            
                            continue;
                        }
                    }
                    continue;
                }
                
                if (this.x >= blocks[i].x - this.width + 15 && this.x <= blocks[i].x + blocks[i].width - 15 &&
                    this.y >= blocks[i].y - this.height && this.y <= blocks[i].y + blocks[i].height - this.height) {
                    
                    if (blocks[i].type === "break") {
                        blocks[i] = 0;
                    } else if (blocks[i].monster !== 0) {
                        // Jump higher when landing on platform with monster (kill the monster too)
                        this.jump(blocks[i].powerup, blocks[i].type);
                        blocks[i].monster = 0; // Remove the monster but keep the platform
                        score += 25; // Bonus points for killing monster
                    } else {
                        this.jump(blocks[i].powerup, blocks[i].type);
                    }
                }
            } 
            
            // Check for monster collision (only if hitting monster from sides or below)
            // Separate check for any monster - platform or standalone
            if (blocks[i] !== 0 && blocks[i].monster !== 0 && blocks[i].monster !== undefined) {
                // Get monster size from monster data
                let monster = monsterFunctions[blocks[i].monster];
                let monsterX = blocks[i].x + monster.xDif;
                let monsterY = blocks[i].y + monster.yDif;
                let monsterWidth = monster.width;
                let monsterHeight = monster.height;
                
                // Collision with monster - but exclude top collision (which is handled above)
                if (this.x + 20 < monsterX + monsterWidth && 
                    this.x + this.width - 20 > monsterX && 
                    this.y + 20 < monsterY + monsterHeight && 
                    this.y + this.height - 10 > monsterY &&
                    !(this.ySpeed > 0 && this.y + this.height < monsterY + monsterHeight/2)) {
                    dead = true;
                }
            }
        }

        for (var i = blocks.length-1; i > 0; i--) {
            if (blocks[i].y > screenHeight) {
                lowestBlock = i+1;
                break;
            }
        }

        if (this.y >= blocks[lowestBlock].y) {
            dead = true;
        }

        if (lowestBlock >= 45) {
            if (difficulty < 6) {
                difficulty += 1;
            }
            blockSpawner();
        }
    }
    
    this.jump = function(powerup, type) {
        this.ySpeed = -13.2;
        
        // Increment jump counter for monster spawning
        if (typeof incrementJumpCounter === 'function') {
            incrementJumpCounter();
        }

        if (powerup === "springBoots") {
            this.springBootsDurability = 6;
        }
        
        if (type === 0) {
            if (powerup === "spring") {
                this.ySpeed = -20;
            } 
        }

        if (this.springBootsDurability !== 0) {
            this.ySpeed = -20;
            this.springBootsDurability -= 1;
        }  
    }

    this.moveLeft = function() {
        this.x -= this.xSpeed;
        if (this.x <= -this.width) {
            this.x = screenWidth;
        }
    }

    this.moveRight = function() {
        this.x += this.xSpeed;
        if (this.x >= screenWidth) {
            this.x = -this.width;
        }
    }

    this.draw = function() {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

        if (this.springBootsDurability !== 0) {
            if (this.direction === "right") {
                ctx.fillStyle = "blue";
                ctx.fillRect(this.x + 10, this.y + 66, 15, 10);
                ctx.fillRect(this.x + 33, this.y + 66, 15, 10);  
                ctx.fillStyle = "grey";
                ctx.fillRect(this.x + 10, this.y + 76, 15, 15);
                ctx.fillRect(this.x + 33, this.y + 76, 15, 15);
            } else {
                ctx.fillStyle = "blue";
                ctx.fillRect(this.x + 30, this.y + 66, 15, 10);
                ctx.fillRect(this.x + 53, this.y + 66, 15, 10);  
                ctx.fillStyle = "grey";
                ctx.fillRect(this.x + 30, this.y + 76, 15, 15);
                ctx.fillRect(this.x + 53, this.y + 76, 15, 15);
            }
        }
    }
}

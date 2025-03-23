function block() {
    this.x;
    this.y;
    this.width = 100;
    this.height = 15;
    this.powerup;
    this.type;
    this.monster;
    this.direction = "right";
    this.moveTime = 10;
    this.glow = Math.random() * 0.3 + 0.7; // For animated glow effect

    this.draw = function() {
        // Update glow animation
        this.glow += 0.03;
        if (this.glow > 1) this.glow = 0.7;
        
        // If this is a monster-only block (no platform), only draw the monster
        if (this.type === "none") {
            if (this.monster !== 0 && this.monster !== undefined) {
                monsterFunctions[this.monster].draw(this.x, this.y);
            }
            return;
        }
        
        // Save context for glow effects
        ctx.save();
        
        // Different platform types with cyberpunk/crypto styling
        if (this.type === "break") {
            // Breakable platform - red neon
            ctx.shadowColor = '#ff2f6d';
            ctx.shadowBlur = 10 * this.glow;
            ctx.fillStyle = '#ff2f6d';
            
            // Platform outline
            ctx.strokeStyle = '#ff75a0';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Platform fill with grid pattern
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Add digital pattern
            ctx.fillStyle = '#ff75a0';
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(this.x + i*20 + 5, this.y + 3, 10, 2);
                ctx.fillRect(this.x + i*20 + 5, this.y + 10, 10, 2);
            }
            
        } else if (this.type === "sideways") {
            // Moving platform - cyan neon
            ctx.shadowColor = '#00f6ff';
            ctx.shadowBlur = 10 * this.glow;
            ctx.fillStyle = '#00f6ff';
            
            // Platform outline
            ctx.strokeStyle = '#7df9ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Platform fill
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Add digital circuit pattern
            ctx.fillStyle = '#7df9ff';
            ctx.fillRect(this.x + 10, this.y + 7, this.width - 20, 1);
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(this.x + i*25 + 12, this.y + 4, 2, 7);
            }
            
        } else {
            // Regular platform - purple neon
            ctx.shadowColor = '#b829ea';
            ctx.shadowBlur = 10 * this.glow;
            ctx.fillStyle = '#b829ea';
            
            // Platform outline with pixel effect
            ctx.strokeStyle = '#d87df9';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Platform fill
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Add pixelated pattern
            ctx.fillStyle = '#d87df9';
            for (let i = 0; i < 10; i++) {
                if (i % 2 === 0) {
                    ctx.fillRect(this.x + i*10, this.y + 3, 8, 3);
                } else {
                    ctx.fillRect(this.x + i*10, this.y + 9, 8, 3);
                }
            }
        }
        
        ctx.restore();

        if (this.monster === 0) {
            // We already drew the platform
        } else {
            monsterFunctions[this.monster].draw(this.x, this.y);
        }

        if (this.powerup === "spring") {
            // Neon spring
            ctx.save();
            ctx.shadowColor = '#00f6ff';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#00f6ff';
            ctx.fillRect(this.x + 35, this.y - 10, 30, 10);
            ctx.strokeStyle = '#7df9ff';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x + 35, this.y - 10, 30, 10);
            ctx.restore();
        } else if (this.powerup === "springBoots") {
            // Neon spring boots
            ctx.save();
            ctx.shadowColor = '#b829ea';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#b829ea';
            ctx.fillRect(this.x + 30, this.y - 25, 15, 10);
            ctx.fillRect(this.x + 53, this.y - 25, 15, 10);
            ctx.fillStyle = '#d87df9';
            ctx.fillRect(this.x + 30, this.y - 15, 15, 15);
            ctx.fillRect(this.x + 53, this.y - 15, 15, 15);
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x + 30, this.y - 25, 15, 10);
            ctx.strokeRect(this.x + 53, this.y - 25, 15, 10);
            ctx.strokeRect(this.x + 30, this.y - 15, 15, 15);
            ctx.strokeRect(this.x + 53, this.y - 15, 15, 15);
            ctx.restore();
        }
    }

    this.update = function() {
        if (this.type === "sideways") {
            if (this.x >= screenWidth - this.width) {
                this.direction = "left";
            } else if (this.x <= 0) {
                this.direction = "right";
            }

            if (this.direction === "right") {
                this.x += 2.5;
            } else {
                this.x -= 2.5;
            }
        }

        if (this.monster) {
            if (this.direction === "right") {
                this.x += 1;
                this.moveTime -= 1;

                if (this.moveTime === 0) {
                    this.direction = "left";
                    this.moveTime = 10;
                }
            } else {
                this.x -= 1;
                this.moveTime -= 1;

                if (this.moveTime === 0) {
                    this.direction = "right";
                    this.moveTime = 10;
                }
            }
        }
    }
}

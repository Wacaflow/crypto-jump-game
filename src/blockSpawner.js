function blockSpawner() {
    if (lowestBlock === 0) {
        var i = 1;
    } else {
        var i = lowestBlock;
    }

    // Track consecutive standalone monsters to prevent gaps
    let consecutiveMonsters = 0;
    const MAX_CONSECUTIVE_MONSTERS = 2;

    for (i; i < lowestBlock + 60; i++) {
        if (i >= blocks.length) {
            blocks.push(new block);

            // Decide if this should be a standalone monster or a regular block
            let isStandaloneMonster = Math.random() < 0.25; // Increased chance from 10% to 25%
            
            // Prevent too many consecutive standalone monsters
            if (isStandaloneMonster && consecutiveMonsters >= MAX_CONSECUTIVE_MONSTERS) {
                isStandaloneMonster = false;
                consecutiveMonsters = 0;
            }
            
            if (isStandaloneMonster) {
                // Create a monster-only block (no platform)
                blocks[i].type = "none"; // Not a real platform
                blocks[i].powerup = 0;
                blocks[i].monster = spawnMonster();
                if (blocks[i].monster === 0) {
                    // If no monster spawned, make it a regular block instead
                    blocks[i].type = spawnBlock();
                    if (blocks[i].type === 0) {
                        blocks[i].powerup = spawnPowerup();
                    }
                    consecutiveMonsters = 0;
                } else {
                    consecutiveMonsters++;
                }
            } else {
                // Regular block logic
                if (blocks[i-1].type === "break") {
                    blocks[i].type = 0;
                } else {
                    blocks[i].type = spawnBlock();
                }
                
                blocks[i].powerup = 0;
                blocks[i].monster = 0;
                
                if (blocks[i].type === 0) {
                    blocks[i].powerup = spawnPowerup();
                }
                consecutiveMonsters = 0;
            }
    
            blocks[i].x = Math.random()*(screenWidth - blocks[i].width);
    
            // Adjust vertical spacing to prevent excessive gaps
            if (blocks[i].type === "break" || blocks[i-1].type === "break") {
                blocks[i].y = (blocks[i-1].y) - (((Math.random()*(80 + (difficulty * 25))) + 30) / 2);
            } else if (blocks[i].monster !== 0) {
                // Reduce the gap for blocks with monsters
                blocks[i].y = (blocks[i-1].y) - ((Math.random()*(70 + (difficulty*20)))+45);
            } else if (blocks[i-1].monster !== 0) {
                // Ensure there's a reachable platform after a monster
                blocks[i].y = (blocks[i-1].y) - ((Math.random()*(60 + (difficulty*15)))+40);
            } else {
                blocks[i].y = (blocks[i-1].y) - ((Math.random()*(80 + (difficulty*25)))+30);
            }
        } 
    }

    //Remove blocks that are below us now
    for (var i = 0; i < lowestBlock - 2; i++) {
        blocks.shift();
    }
}

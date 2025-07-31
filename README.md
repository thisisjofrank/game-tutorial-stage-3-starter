# 🦕 Dino Runner Game - Stage 3 Starter

Welcome to Stage 3 of the Dino Runner Game tutorial! Having built the foundation
in Stage 1 and added a jumping dino in Stage 2, you'll now **complete the core
gameplay** with obstacles, collision detection, and game over mechanics.

## What you'll build in this stage

By the end of Stage 3, you'll have:

- ✅ Moving obstacles (cacti) that spawn randomly
- ✅ Collision detection between dino and obstacles
- ✅ Game over mechanics when collisions occur
- ✅ High score tracking with localStorage persistence
- ✅ Progressive difficulty that increases over time
- ✅ Complete game state management (waiting/playing/gameOver)
- ✅ Polished game over screen with restart functionality
- ✅ Enhanced visual design with varied obstacle types

## Getting started

### Prerequisites

- Completed Stage 2 (or clone the Stage 2 starter as your foundation)
- [Deno](https://deno.com/) installed on your system
- A code editor (VS Code recommended)
- Understanding of JavaScript classes, arrays, and collision detection concepts

## Setup

1.
   1. Copy your Stage 2 project or deploy this starter kit:
      [![Deploy on Deno](https://deno.com/button)](https://app.deno.com/new?clone=https://github.com/thisisjofrank/game-tutorial-stage-3-starter.git&install=deno+install&entrypoint=src/main.ts&mode=dynamic)
2. Ensure your `.env` file is configured
3. Install dependencies: `deno install`

## Update HTML for high score display

We'll add a high score to the game UI, alongside the current score.

<details>
<summary>📁 public/index.html (click to expand)</summary>

Update your `public/index.html` file. The key change is in the game UI section:

```html
<section class="container canvas-container">
  <canvas id="gameCanvas" width="800" height="200"></canvas>
  <div class="game-ui">
    <div class="score">Score: <span id="score">0</span></div>
    <!-- NEW: High Score Display -->
    <div class="high-score">
      High Score: <span id="highScore">0</span>
    </div>
    <!-- end NEW: High Score Display -->
    <div class="game-status" id="gameStatus">Click to Start!</div>
  </div>
</section>
```

</details>

## Style the high score display

Copy the enhanced styles from
[this CSS file](https://raw.githubusercontent.com/thisisjofrank/game-tutorial-stage-3/refs/heads/main/public/css/styles.css)
and update your `public/css/styles.css`.

## Enhance the game engine

Nor for the exciting part! We'll add some obstacles, collision detection, and
game over mechanics to our existing game!

### Add new properties to the DinoGame constructor

Add these new properties to your existing `DinoGame` class constructor, to set
up the obstacle system, game speed, and high score tracking:

<details>
<summary>📁 Add to public/js/game.js constructor (click to expand)</summary>

```javascript
// Add these NEW properties to your existing constructor:

// Reference to high score element
this.highScoreElement = document.getElementById("highScore");

// Update game speed properties
this.gameSpeed = 3; // Starting speed (update from 2 to 3)
this.initialGameSpeed = 3; // Remember initial speed for resets

// NEW: Obstacle system
this.obstacles = []; // Array to store all obstacles
this.obstacleSpawnTimer = 0; // Timer for spawning new obstacles
this.obstacleSpawnRate = 120; // Frames between obstacle spawns (2 seconds at 60fps)
this.minObstacleSpawnRate = 60; // Fastest possible spawn rate

// NEW: Animation and difficulty tracking
this.frameCount = 0; // Track total frames for animations

// NEW: High score system
this.highScore = this.loadHighScore(); // Load saved high score from browser
```

</details>

### Add high score initialization

Update the `init()` method with a new function to display the high score:

<details>
<summary>📁 Update init() method (click to expand)</summary>

```javascript
init() {
  this.setupEventListeners();
  this.gameLoop();
  this.updateStatus("Click to Start!");
  this.updateHighScore(); // NEW: Display the high score
}
```

</details>

### Add obstacle management methods

Add a `spawnObstacle()` method to your DinoGame class to handle obstacle
spawning. Add a `updateObstacles()` method to manage obstacle movement and
cleanup. Add a `checkCollisions()` method to detect collisions between the dino
and obstacles. Progressively increase difficulty with a new
`updateGameDifficulty()` method.

<details>
<summary>📁 Add new methods to DinoGame class (click to expand)</summary>

```javascript
// NEW: Create different types of obstacles randomly
spawnObstacle() {
  // Define different obstacle types with varying sizes
  const obstacleTypes = [
    { width: 20, height: 40, type: "cactus-small" },   // Small, easy to jump
    { width: 25, height: 50, type: "cactus-medium" },  // Medium challenge
    { width: 30, height: 35, type: "cactus-wide" },    // Wide but shorter
  ];

  // Randomly select an obstacle type
  const obstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

  // Create the obstacle at the right edge of the screen
  this.obstacles.push({
    x: this.canvas.width,                    // Start off-screen to the right
    y: this.groundY - obstacle.height,      // Position on the ground
    width: obstacle.width,
    height: obstacle.height,
    type: obstacle.type,
  });

  console.log(`🌵 Spawned ${obstacle.type} obstacle`);
}

// NEW: Update all obstacles - movement, spawning, and cleanup
updateObstacles() {
  if (this.gameState !== "playing") return;

  // Spawn new obstacles based on timer
  this.obstacleSpawnTimer++;
  if (this.obstacleSpawnTimer >= this.obstacleSpawnRate) {
    this.spawnObstacle();
    this.obstacleSpawnTimer = 0; // Reset timer
  }

  // Move all obstacles left and remove off-screen ones
  for (let i = this.obstacles.length - 1; i >= 0; i--) {
    this.obstacles[i].x -= this.gameSpeed; // Move left

    // Remove obstacles that have moved completely off-screen
    if (this.obstacles[i].x + this.obstacles[i].width < 0) {
      this.obstacles.splice(i, 1);           // Remove from array
      this.score += 10;                      // Bonus points for successfully avoiding
    }
  }
}

// NEW: Check if dino collides with any obstacle
checkCollisions() {
  if (this.gameState !== "playing") return;

  // Check collision with each obstacle using rectangle collision detection
  for (let obstacle of this.obstacles) {
    if (
      this.dino.x < obstacle.x + obstacle.width &&          // Dino's left edge is left of obstacle's right edge
      this.dino.x + this.dino.width > obstacle.x &&         // Dino's right edge is right of obstacle's left edge
      this.dino.y < obstacle.y + obstacle.height &&         // Dino's top edge is above obstacle's bottom edge
      this.dino.y + this.dino.height > obstacle.y           // Dino's bottom edge is below obstacle's top edge
    ) {
      this.gameOver(); // Collision detected!
      return;
    }
  }
}

// NEW: Increase difficulty as the game progresses
updateGameDifficulty() {
  if (this.gameState !== "playing") return;

  // Increase difficulty every 200 points
  const difficultyLevel = Math.floor(this.score / 200);
  
  // Increase game speed (obstacles move faster)
  this.gameSpeed = this.initialGameSpeed + (difficultyLevel * 0.5);
  
  // Spawn obstacles more frequently (but not too fast)
  this.obstacleSpawnRate = Math.max(
    this.minObstacleSpawnRate,           // Don't go below minimum
    120 - (difficultyLevel * 10)        // Reduce spawn delay
  );
}
```

</details>

### Game over and high score methods

Add methods to handle game over state, high score loading/saving, and resetting
the game, well need a `gameOver()` method to handle the game over state, a
`loadHighScore()` method to load the high score from localStorage, a
`saveHighScore()` method to save the current score if it's a new high score, and
an `updateHighScore()` method to update the display. Finally, a `resetGame()`
method to reset the game state and dino position.

<details>
<summary>📁 Add game over and scoring methods (click to expand)</summary>

```javascript
// NEW: Handle game over state
gameOver() {
  this.gameState = "gameOver";
  this.saveHighScore();      // Save if this is a new high score
  this.updateHighScore();    // Update the display
  this.updateStatus("Game Over! Click to restart");
  console.log(`💀 Game Over! Final Score: ${Math.floor(this.score)}`);
}

// NEW: Load high score from browser's local storage
loadHighScore() {
  const saved = localStorage.getItem("dinoHighScore");
  const highScore = saved ? parseInt(saved) : 0;
  console.log(`🏆 Loaded high score: ${highScore}`);
  return highScore;
}

// NEW: Save high score to browser's local storage
saveHighScore() {
  const currentScore = Math.floor(this.score);
  if (currentScore > this.highScore) {
    this.highScore = currentScore;
    localStorage.setItem("dinoHighScore", this.highScore);
    console.log(`🏆 New High Score: ${this.highScore}!`);
  }
}

// NEW: Update high score display
updateHighScore() {
  if (this.highScoreElement) {
    this.highScoreElement.textContent = this.highScore;
  }
}

// UPDATE: Reset game to initial state
resetGame() {
  this.dino.y = this.dino.groundY;
  this.dino.velocityY = 0;
  this.dino.isJumping = false;
  this.startGame(); // Use startGame to initialize everything properly
}
```

</details>

### Update existing methods

Update your existing `startGame()`, `updatePhysics()`, and `render()` methods to
incorporate the new obstacle system, game over state, and high score tracking.

<details>
<summary>📁 Update existing methods (click to expand)</summary>

```javascript
// UPDATE: Enhanced startGame method
startGame() {
  this.gameState = "playing";
  this.score = 0;
  this.gameSpeed = this.initialGameSpeed;    // Reset speed
  this.obstacles = [];                       // Clear all obstacles
  this.obstacleSpawnTimer = 0;              // Reset spawn timer
  this.frameCount = 0;                      // Reset frame counter
  this.updateScore();
  this.updateStatus("");
  console.log("🎮 Game started!");
}

// UPDATE: Enhanced updatePhysics method
updatePhysics() {
  if (this.gameState !== "playing") return;

  this.frameCount++; // NEW: Track total frames for timing

  // Existing dino physics code stays the same...
  this.dino.velocityY += this.gravity;
  this.dino.y += this.dino.velocityY;

  if (this.dino.y >= this.dino.groundY) {
    this.dino.y = this.dino.groundY;
    this.dino.velocityY = 0;
    this.dino.isJumping = false;
  }

  this.score += 0.1;
  this.updateScore();

  // NEW: Add these three lines to update game systems
  this.updateObstacles();      // Move obstacles and spawn new ones
  this.checkCollisions();      // Check for game over conditions
  this.updateGameDifficulty(); // Make game progressively harder
}

// UPDATE: Enhanced render method
render() {
  // Existing rendering code stays the same...
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Draw ground line (unchanged)
  this.ctx.strokeStyle = "#8B4513";
  this.ctx.lineWidth = 2;
  this.ctx.beginPath();
  this.ctx.moveTo(0, this.groundY);
  this.ctx.lineTo(this.canvas.width, this.groundY);
  this.ctx.stroke();

  // NEW: Add this line to draw obstacles
  this.drawObstacles();

  // Existing dino drawing code stays the same...
  this.drawDino();

  // NEW: Add state-specific overlays
  if (this.gameState === "waiting") {
    this.drawInstructions();
  } else if (this.gameState === "gameOver") {
    this.drawGameOver();
  }
}
```

</details>

### Draw the obstacles and game state

<details>
<summary>📁 Add new drawing methods (click to expand)</summary>

```javascript
// NEW: Draw all obstacles with different visual styles
drawObstacles() {
  this.ctx.fillStyle = "#2E7D32"; // Dark green for cacti

  for (let obstacle of this.obstacles) {
    // Draw main cactus body
    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    // Add cactus details based on type for visual variety
    this.ctx.fillStyle = "#1B5E20"; // Darker green for details
    
    if (obstacle.type === "cactus-small") {
      // Small spikes
      this.ctx.fillRect(obstacle.x - 3, obstacle.y + 10, 6, 4);
      this.ctx.fillRect(obstacle.x + obstacle.width - 3, obstacle.y + 20, 6, 4);
    } else if (obstacle.type === "cactus-medium") {
      // Medium spikes
      this.ctx.fillRect(obstacle.x - 4, obstacle.y + 8, 8, 6);
      this.ctx.fillRect(obstacle.x + obstacle.width - 4, obstacle.y + 15, 8, 6);
      this.ctx.fillRect(obstacle.x + obstacle.width / 2 - 2, obstacle.y + 25, 4, 8);
    } else if (obstacle.type === "cactus-wide") {
      // Wide cactus with multiple arms
      this.ctx.fillRect(obstacle.x - 5, obstacle.y + 5, 10, 6);
      this.ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y + 8, 10, 6);
      this.ctx.fillRect(obstacle.x + obstacle.width / 3, obstacle.y + 12, 6, 8);
    }

    this.ctx.fillStyle = "#2E7D32"; // Reset color for next obstacle
  }
}

// NEW: Draw instructions when waiting to start
  drawInstructions() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.font = "24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Press SPACE or ↑ to jump!",
      this.canvas.width / 2,
      this.canvas.height / 2 - 20,
    );

    this.ctx.font = "16px Arial";
    this.ctx.fillText(
      "Click anywhere to start",
      this.canvas.width / 2,
      this.canvas.height / 2 + 10,
    );
  }


// NEW: Draw game over screen with final score
 drawGameOver() {
    // Semi-transparent overlay
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Game Over text
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "36px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "GAME OVER",
      this.canvas.width / 2,
      this.canvas.height / 2 - 40,
    );

    // Final score
    this.ctx.font = "20px Arial";
    this.ctx.fillText(
      `Final Score: ${Math.floor(this.score)}`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 5,
    );

    // High score
    if (Math.floor(this.score) === this.highScore && this.highScore > 0) {
      this.ctx.fillStyle = "#FFD700";
      this.ctx.fillText(
        "🏆 NEW HIGH SCORE! 🏆",
        this.canvas.width / 2,
        this.canvas.height / 2 + 25,
      );
    } else if (this.highScore > 0) {
      this.ctx.fillStyle = "#CCCCCC";
      this.ctx.fillText(
        `High Score: ${this.highScore}`,
        this.canvas.width / 2,
        this.canvas.height / 2 + 25,
      );
    }

    // Restart instruction
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(
      "Click or press SPACE to restart",
      this.canvas.width / 2,
      this.canvas.height / 2 + 55,
    );
  }
```

And enhance your existing `drawDino()` method to make the dinosaur run:

```javascript
// UPDATE: Cute running legs on the dino
drawDino() {
    // Animate dino legs when running (simple animation)
    const legOffset = this.gameState === "playing" && !this.dino.isJumping
      ? Math.floor(this.frameCount / 10) % 2 * 2
      : 0;

    this.ctx.fillStyle = "#4CAF50";
    this.ctx.fillRect(
      this.dino.x,
      this.dino.y,
      this.dino.width,
      this.dino.height,
    );

    // Simple dino face
    this.ctx.fillStyle = "#2E7D32";
    // Eye
    this.ctx.fillRect(this.dino.x + 25, this.dino.y + 8, 4, 4);
    // Mouth
    this.ctx.fillRect(this.dino.x + 30, this.dino.y + 20, 8, 2);

    // Simple legs with running animation
    if (!this.dino.isJumping) {
      this.ctx.fillStyle = "#4CAF50";
      this.ctx.fillRect(
        this.dino.x + 10,
        this.dino.y + 40 + legOffset,
        6,
        8 - legOffset,
      );
      this.ctx.fillRect(
        this.dino.x + 24,
        this.dino.y + 40 - legOffset,
        6,
        8 + legOffset,
      );
    }
  }
```

</details>

You have now created:

1. An obstacle system with random obstacle generation for different cactus types
2. Collision Detection using rectangle-based boxes for dino and the obstacles
3. High Score Persistence with localStorage to save and load high scores across
   sessions
4. Progressive difficulty, the game speed and spawn rates increase as score gets
   higher
5. A game over screen with score summary and restart

## Understanding the complete game architecture

### Obstacle management system

The obstacle system is the heart of the gameplay challenge:

```javascript
// Obstacles are stored in an array as objects
this.obstacles = [
  { x: 800, y: 140, width: 20, height: 40, type: "cactus-small" },
  { x: 950, y: 130, width: 25, height: 50, type: "cactus-medium" },
];
```

Each frame, obstacles:

1. **Move left** at the current game speed
2. **Get removed** when they move off-screen
3. **Award points** when successfully avoided
4. **Spawn randomly** based on difficulty timers

### Collision detection algorithm

Our collision detection uses **Axis-Aligned Bounding Box (AABB)** collision:

```javascript
// Four conditions must ALL be true for collision
if (
  dinoLeft < obstacleRight && // Dino hasn't passed obstacle
  dinoRight > obstacleLeft && // Dino has reached obstacle
  dinoTop < obstacleBottom && // Dino isn't above obstacle
  dinoBottom > obstacleTop // Dino isn't below obstacle
) {
  // COLLISION DETECTED!
}
```

This method is fast, accurate, and perfect for rectangular game objects.

### High score persistence

We use the browser's `localStorage` API for data persistence:

```javascript
// Save data (survives browser restarts)
localStorage.setItem("dinoHighScore", score);

// Load data (returns null if not found)
const highScore = localStorage.getItem("dinoHighScore");
```

This creates a personalized experience where players can compete against their
own best scores.

### Progressive difficulty system

The game becomes more challenging over time in two ways:

1. **Speed Increase**: Obstacles move faster, requiring quicker reflexes
2. **Spawn Rate Increase**: More obstacles appear, requiring more frequent
   jumping

```javascript
// Every 200 points = new difficulty level
const difficultyLevel = Math.floor(score / 200);
gameSpeed = baseSpeed + (difficultyLevel * 0.5); // Faster movement
spawnRate = Math.max(60, 120 - (difficultyLevel * 10)); // More frequent spawns
```

### Game state management

Our game now has three distinct states with different behaviors:

- **Waiting**: Show instructions, gray dino, accept input to start
- **Playing**: Run physics, spawn obstacles, check collisions, update scores
- **Game Over**: Show final score, save high score, accept input to restart

## Testing your complete game

1. **Start the server**:
   ```bash
   deno task dev
   ```

2. **Open your browser**: Navigate to
   [http://localhost:8000](http://localhost:8000)

3. **Test core gameplay**:
   - Start the game and let an obstacle hit you
   - Verify game over screen appears
   - Check that high score is saved and displayed
   - Restart and try to beat your score

4. **Test difficulty progression**:
   - Play for a while and notice speed increases
   - Observe more frequent obstacle spawning
   - Check console logs for difficulty level updates

5. **Test persistence**:
   - Achieve a high score
   - Refresh the page or restart the browser
   - Verify your high score is still displayed

## Deploy your updated game

Commit your changes and push them to your repository, Deno Deploy will
automatically deploy your updated game. You can see the live version at your
Deno Deploy URL.

## Make it your own

You can of course edit the game physics if you want, to make the dino jump
higher, or fall faster. You can also change the dino's color, or add more
features like power-ups or different obstacles, or even enemy characters. Test
it out and see how it feels!

## Learning objectives completed

After completing Stage 3, you should understand:

- [x] **Obstacle Systems**: Creating, moving, and managing game objects
- [x] **Collision Detection**: AABB collision algorithm for game interactions
- [x] **Data Persistence**: Using localStorage for high score tracking
- [x] **Progressive Difficulty**: Scaling challenge to maintain engagement
- [x] **Game State Management**: Handling waiting, playing, and game over states
- [x] **Array Management**: Adding, removing, and iterating through game objects
- [x] **Performance Optimization**: Efficient rendering and object cleanup

## Ready for Stage 4?

Congratulations! You now have a **complete, playable infinite runner game**. In
Stage 4, you'll add data storage features:

- Database integration for persistent leaderboards
- Player customization system with different dino colors
- A global leaderboard display

**Continue to:**
[Stage 4 Starter](https://github.com/thisisjofrank/game-tutorial-stage-4-starter)

You've built a real game - now let's make it professional! 🦕🏆

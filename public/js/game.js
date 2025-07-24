// Stage 2: Dino Runner Game with Canvas and Basic Controls
console.log("🦕 Stage 2: Canvas and Basic Controls loaded!");

class DinoGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.scoreElement = document.getElementById("score");
    this.statusElement = document.getElementById("gameStatus");

    // Game state
    this.gameState = "waiting"; // 'waiting', 'playing', 'gameOver'
    this.score = 0;
    this.gameSpeed = 2;

    // Dino properties
    this.dino = {
      x: 50,
      y: 150,
      width: 40,
      height: 40,
      velocityY: 0,
      isJumping: false,
      groundY: 150,
    };

    // Physics
    this.gravity = 0.6;
    this.jumpStrength = -12;

    // Ground
    this.groundY = 180;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.gameLoop();
    this.updateStatus("Click to Start!");
  }

  setupEventListeners() {
    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        this.handleJump();
      }
    });

    // Mouse/touch controls
    this.canvas.addEventListener("click", () => {
      this.handleJump();
    });

    // Prevent space bar from scrolling
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
      }
    });
  }

  handleJump() {
    if (this.gameState === "waiting") {
      this.startGame();
    } else if (this.gameState === "playing" && !this.dino.isJumping) {
      this.jump();
    } else if (this.gameState === "gameOver") {
      this.resetGame();
    }
  }

  startGame() {
    this.gameState = "playing";
    this.score = 0;
    this.updateScore();
    this.updateStatus("");
    console.log("� Game started!");
  }

  jump() {
    if (!this.dino.isJumping) {
      this.dino.velocityY = this.jumpStrength;
      this.dino.isJumping = true;
      console.log("🦘 Dino jumped!");
    }
  }

  updatePhysics() {
    if (this.gameState !== "playing") return;

    // Apply gravity
    this.dino.velocityY += this.gravity;
    this.dino.y += this.dino.velocityY;

    // Ground collision
    if (this.dino.y >= this.dino.groundY) {
      this.dino.y = this.dino.groundY;
      this.dino.velocityY = 0;
      this.dino.isJumping = false;
    }

    // Update score
    this.score += 0.1;
    this.updateScore();
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground line
    this.ctx.strokeStyle = "#8B4513";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.groundY);
    this.ctx.lineTo(this.canvas.width, this.groundY);
    this.ctx.stroke();

    // Draw dino
    this.drawDino();

    // Draw instructions if waiting
    if (this.gameState === "waiting") {
      this.drawInstructions();
    }
  }

  drawDino() {
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

    // Simple legs (only when on ground)
    if (!this.dino.isJumping) {
      this.ctx.fillStyle = "#4CAF50";
      this.ctx.fillRect(this.dino.x + 10, this.dino.y + 40, 6, 8);
      this.ctx.fillRect(this.dino.x + 24, this.dino.y + 40, 6, 8);
    }
  }

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

  updateScore() {
    this.scoreElement.textContent = Math.floor(this.score);
  }

  updateStatus(message) {
    this.statusElement.textContent = message;
    this.statusElement.style.display = message ? "block" : "none";
  }

  resetGame() {
    this.gameState = "waiting";
    this.score = 0;
    this.dino.y = this.dino.groundY;
    this.dino.velocityY = 0;
    this.dino.isJumping = false;
    this.updateScore();
    this.updateStatus("Click to Start!");
    console.log("� Game reset!");
  }

  gameLoop() {
    this.updatePhysics();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Health check for server
async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    console.log("� Server health check:", data);
  } catch (error) {
    console.error("❌ Health check failed:", error);
  }
}

// Initialize game when page loads
window.addEventListener("load", () => {
  checkHealth();
  new DinoGame();
  console.log("🎯 Stage 2 complete: Canvas game with controls ready!");
});

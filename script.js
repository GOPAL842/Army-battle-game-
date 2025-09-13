const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

class Unit {
  constructor(x, y, team, type="swordsman") {
    this.x = x;
    this.y = y;
    this.team = team;
    this.type = type;

    if (type === "swordsman") {
      this.hp = 100; this.speed = 1.5; this.attackRange = 25; this.attackDamage = 10;
    } else if (type === "archer") {
      this.hp = 70; this.speed = 1.2; this.attackRange = 120; this.attackDamage = 7;
    } else if (type === "tank") {
      this.hp = 200; this.speed = 0.7; this.attackRange = 30; this.attackDamage = 15;
    }

    this.target = null;
  }

  isAlive() { return this.hp > 0; }

  draw() {
    ctx.fillStyle = this.team === "red" ? "red" : "blue";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI*2);
    ctx.fill();

    // HP Bar
    ctx.fillStyle = "green";
    ctx.fillRect(this.x - 10, this.y - 15, (this.hp / 100) * 20, 3);
  }
}

// दो सेनाएँ
let redArmy = [
  new Unit(100, 200, "red", "swordsman"),
  new Unit(100, 250, "red", "archer"),
  new Unit(100, 300, "red", "tank")
];

let blueArmy = [
  new Unit(800, 200, "blue", "tank"),
  new Unit(800, 250, "blue", "archer"),
  new Unit(800, 300, "blue", "swordsman")
];

function gameLoop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  [...redArmy, ...blueArmy].forEach(u => u.draw());

  requestAnimationFrame(gameLoop);
}
gameLoop();

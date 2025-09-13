const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusDiv = document.getElementById("status");

// Load images
const assets = {};
const types = ["swordsman","archer","tank"];
const teams = ["red","blue"];
types.forEach(type => {
  teams.forEach(team => {
    const img = new Image();
    img.src = `assets/${type}_${team}.png`;
    assets[`${type}_${team}`] = img;
  });
});

// Load sounds
const sounds = {
  sword: new Audio("assets/sword_attack.mp3"),
  arrow: new Audio("assets/arrow_shot.mp3"),
  death: new Audio("assets/death.mp3")
};

class Unit {
  constructor(x, y, team, type="swordsman") {
    this.x = x; this.y = y;
    this.team = team; this.type = type;

    if (type === "swordsman") { this.hp=100; this.speed=1.5; this.attackRange=25; this.attackDamage=10; this.ranged=false;}
    else if (type === "archer") { this.hp=70; this.speed=1.2; this.attackRange=120; this.attackDamage=7; this.ranged=true;}
    else if (type === "tank") { this.hp=200; this.speed=0.7; this.attackRange=30; this.attackDamage=15; this.ranged=false;}

    this.target = null;
    this.reload = 0;
    this.dead = false;
    this.opacity = 1;
  }

  isAlive() { return this.hp > 0 && !this.dead; }

  distanceTo(other) { return Math.hypot(this.x - other.x, this.y - other.y); }

  update(enemies) {
    if (!this.isAlive()) return;

    if (!this.target || !this.target.isAlive()) {
      this.target = enemies.find(e => e.isAlive());
    }

    if (this.target) {
      let dist = this.distanceTo(this.target);

      if (dist > this.attackRange) {
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let len = Math.hypot(dx, dy);
        this.x += (dx / len) * this.speed;
        this.y += (dy / len) * this.speed;
      } else {
        if (this.reload <= 0) {
          if (this.ranged) {
            projectiles.push(new Projectile(this.x, this.y, this.target, this.attackDamage, this.team));
            sounds.arrow.currentTime = 0;
            sounds.arrow.play();
          } else {
            this.target.hp -= this.attackDamage;
            sounds.sword.currentTime = 0;
            sounds.sword.play();
          }
          this.reload = 60;
        }
      }
    }

    if (this.reload > 0) this.reload--;

    if (this.hp <=0 && !this.dead) {
      this.dead = true;
      sounds.death.currentTime = 0;
      sounds.death.play();
    }

    // Fade-out death animation
    if (this.dead) this.opacity -= 0.02;
  }

  draw() {
    const img = assets[`${this.type}_${this.team}`];
    if (img.complete) {
      ctx.globalAlpha = this.opacity;
      ctx.drawImage(img, this.x - 15, this.y - 25, 30, 50);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "green";
    ctx.fillRect(this.x - 15, this.y - 30, (this.hp/100)*30, 3);
  }
}

class Projectile {
  constructor(x, y, target, damage, team) {
    this.x=x; this.y=y; this.target=target; this.damage=damage; this.team=team;
    this.speed=4; this.active=true;
  }

  update() {
    if (!this.active || !this.target.isAlive()) return;
    let dx=this.target.x-this.x, dy=this.target.y-this.y, dist=Math.hypot(dx,dy);
    if (dist<5){ this.target.hp-=this.damage; this.active=false; sounds.death.currentTime=0; sounds.death.play(); return;}
    this.x += (dx/dist)*this.speed;
    this.y += (dy/dist)*this.speed;
  }

  draw() {
    if(!this.active) return;
    ctx.strokeStyle = this.team==="red" ? "darkred":"darkblue";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(this.x,this.y);
    ctx.lineTo(this.x-5,this.y-2);
    ctx.stroke();
  }
}

let redArmy = [new Unit(100,200,"red","swordsman"), new Unit(100,250,"red","archer"), new Unit(100,300,"red","tank")];
let blueArmy = [new Unit(800,200,"blue","tank"), new Unit(800,250,"blue","archer"), new Unit(800,300,"blue","swordsman")];
let projectiles = [];

function checkWin(){
  if(redArmy.length===0){ statusDiv.innerText="Blue Team Wins! 🏆"; return true;}
  if(blueArmy.length===0){ statusDiv.innerText="Red Team Wins! 🏆"; return true;}
  return false;
}

function gameLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  redArmy.forEach(u=>u.update(blueArmy));
  blueArmy.forEach(u=>u.update(redArmy));
  projectiles.forEach(p=>p.update());

  redArmy = redArmy.filter(u=>u.isAlive()||u.opacity>0);
  blueArmy = blueArmy.filter(u=>u.isAlive()||u.opacity>0);
  projectiles = projectiles.filter(p=>p.active);

  [...redArmy,...blueArmy].forEach(u=>u.draw());
  projectiles.forEach(p=>p.draw());

  if(!checkWin()) requestAnimationFrame(gameLoop);
}
gameLoop();

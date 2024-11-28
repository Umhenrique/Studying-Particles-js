const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let particles = [];
let mouse = { x: null, y: null };
let isMouseHeld = false;

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 1;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.size *= 0.95;
  }

  draw() {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class HoldClick {
  constructor(target, callback) {
    this.target = target;
    this.callback = callback;
    this.isHeld = false;

    ["mousedown", "touchstart"].forEach(type => {
      this.target.addEventListener(type, this._onHoldStart.bind(this));
    });
    ["mouseup", "mouseleave", "mouseout", "touchend", "touchcancel"].forEach(type => {
      this.target.addEventListener(type, this._onHoldEnd.bind(this));
    });
  }

  _onHoldStart(e) {
    isMouseHeld = true;
    this.isHeld = true;
    const loop = () => {
      if (this.isHeld) {
        this.callback();
        requestAnimationFrame(loop);
      }
    };
    loop();
  }

  _onHoldEnd() {
    isMouseHeld = false;
    this.isHeld = false;
  }
}

const createParticle = () => {
  particles.push(new Particle(mouse.x, mouse.y));
};

new HoldClick(canvas, createParticle);

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  if (isMouseHeld) {
    createParticle();
  }
});

canvas.addEventListener('touchmove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.touches[0].clientX - rect.left;
  mouse.y = e.touches[0].clientY - rect.top;
  if (isMouseHeld) {
    createParticle();
  }
});

function drawText() {
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.fillText('Left click and hold', canvas.width / 2 - 100, canvas.height / 2);
}

function handleParticles() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].size <= 0.5) {
      particles.splice(i, 1);
      i--;
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleParticles();
  if (!isMouseHeld && particles.length === 0) {
    drawText();
  }
  requestAnimationFrame(animate);
}

animate();
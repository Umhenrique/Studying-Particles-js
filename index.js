const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let particles = [];
const mouse = { x: null, y: null };
let isMouseHeld = false;

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * (Particle.baseSize.max - Particle.baseSize.min) + Particle.baseSize.min;
    this.speedX = Math.random() * (Particle.baseSpeed.x * 2) - Particle.baseSpeed.x;
    this.speedY = Math.random() * (Particle.baseSpeed.y * 2) - Particle.baseSpeed.y;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.size *= Particle.decayRate;
  }

  draw() {
    ctx.fillStyle = Particle.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

Particle.baseSize = { min: 1, max: 5 };
Particle.baseSpeed = { x: 1.5, y: 1.5 };
Particle.color = '#ffffff';
Particle.decayRate = 0.95;

class HoldClick {
  constructor(target, callback) {
    this.target = target;
    this.callback = callback;
    this.isHeld = false;

    ['mousedown', 'touchstart'].forEach(type => {
      this.target.addEventListener(type, this._onHoldStart.bind(this));
    });
    ['mouseup', 'mouseleave', 'mouseout', 'touchend', 'touchcancel'].forEach(type => {
      this.target.addEventListener(type, this._onHoldEnd.bind(this));
    });
  }

  _onHoldStart() {
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

const updateMousePosition = (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  mouse.y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  if (isMouseHeld) createParticle();
};

canvas.addEventListener('mousemove', updateMousePosition);
canvas.addEventListener('touchmove', updateMousePosition);

const drawText = () => {
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.fillText('Click and drag', canvas.width / 2 - 100, canvas.height / 2);
};

const handleParticles = () => {
  particles = particles.filter(particle => {
    particle.update();
    particle.draw();
    return particle.size > 0.5;
  });
};

const animate = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleParticles();
  if (!isMouseHeld && particles.length === 0) drawText();
  requestAnimationFrame(animate);
};

class ParticleConfigManager {
  constructor() {
    this.configPanel = document.getElementById('config-panel');
    this.configToggle = document.getElementById('config-toggle');
    this.resetButton = document.getElementById('reset-defaults');

    this.sizeMinEl = document.getElementById('size-min');
    this.sizeMaxEl = document.getElementById('size-max');
    this.speedXEl = document.getElementById('speed-x');
    this.speedYEl = document.getElementById('speed-y');
    this.particleColorEl = document.getElementById('particle-color');
    this.decayRateEl = document.getElementById('decay-rate');
    this.bgColorEl = document.getElementById('bg-color');

    this.defaultConfig = {
      sizeMin: 1,
      sizeMax: 5,
      speedX: 1.5,
      speedY: 1.5,
      particleColor: '#ffffff',
      decayRate: 0.95,
      bgColor: '#000000'
    };

    this.initEventListeners();
    this.loadConfig();
  }

  initEventListeners() {
    this.configToggle.addEventListener('click', () => {
      this.configPanel.classList.toggle('open');
    });

    this.resetButton.addEventListener('click', () => {
      this.resetToDefaults();
    });

    [
      this.sizeMinEl, this.sizeMaxEl,
      this.speedXEl, this.speedYEl,
      this.particleColorEl,
      this.decayRateEl,
      this.bgColorEl
    ].forEach(el => {
      el.addEventListener('input', () => this.updateConfig());
    });
  }

  updateConfig() {
    Particle.baseSize = {
      min: parseFloat(this.sizeMinEl.value),
      max: parseFloat(this.sizeMaxEl.value)
    };
    Particle.baseSpeed = {
      x: parseFloat(this.speedXEl.value),
      y: parseFloat(this.speedYEl.value)
    };
    Particle.color = this.particleColorEl.value;
    Particle.decayRate = parseFloat(this.decayRateEl.value);

    canvas.style.backgroundColor = this.bgColorEl.value;

    this.saveConfig();
  }

  resetToDefaults() {
    Object.entries(this.defaultConfig).forEach(([key, value]) => {
      this[`${key}El`].value = value;
    });

    this.updateConfig();
  }

  saveConfig() {
    const config = {
      sizeMin: this.sizeMinEl.value,
      sizeMax: this.sizeMaxEl.value,
      speedX: this.speedXEl.value,
      speedY: this.speedYEl.value,
      particleColor: this.particleColorEl.value,
      decayRate: this.decayRateEl.value,
      bgColor: this.bgColorEl.value
    };
    localStorage.setItem('particleConfig', JSON.stringify(config));
  }

  loadConfig() {
    const savedConfig = localStorage.getItem('particleConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      Object.entries(config).forEach(([key, value]) => {
        this[`${key}El`].value = value;
      });
      this.updateConfig();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParticleConfigManager();
});

animate();
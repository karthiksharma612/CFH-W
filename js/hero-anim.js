// hero-anim.js
// Lightweight canvas-backed hero animation that uses an image if available
// Place an image at assets/graphics/molecule.jpg to enable the textured animation.
(function () {
  const selector = '#hero-graphic';
  const imgPath = (document.currentScript?.getAttribute('data-src')) || 'assets/graphics/molecule.jpg';
  const el = document.querySelector(selector);
  if (!el) return;

  // Respect reduced motion preference
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    el.classList.add('hero-graphic--reduced');
    return;
  }

  // Create canvas overlay
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'all'; // Enable pointer events for interactivity
  el.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let width = 0, height = 0;
  let img = new Image();
  img.crossOrigin = 'anonymous';

  let pattern = null;
  let offset = 0;
  const speed = 0.03; // px per frame at base scale
  
  // Molecular interaction state
  const MAX_MOLECULES = 100;
  let mouseX = 0, mouseY = 0;
  let isPointerDown = false;
  const molecules = [];

  // Molecule class for animation
  class Molecule {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4;
      this.radius = 15 + Math.random() * 10;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.1;
      this.alpha = 0;
      this.targetAlpha = 0.8 + Math.random() * 0.2;
      this.life = 1;
    }

    update() {
      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Apply gravity towards center
      const dx = width / 2 - this.x;
      const dy = height / 2 - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.max(0, 1 - dist / 200) * 0.2;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;

      // Apply drag
      this.vx *= 0.98;
      this.vy *= 0.98;

      // Update rotation
      this.rotation += this.rotationSpeed;

      // Fade in/out
      this.alpha += (this.targetAlpha - this.alpha) * 0.1;
      this.life -= 0.003;
      if (this.life < 0.2) {
        this.alpha *= this.life / 0.2;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      // Draw molecule shape
      ctx.beginPath();
      ctx.moveTo(-this.radius, 0);
      ctx.lineTo(this.radius, 0);
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(0, this.radius);
      ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
      
      ctx.strokeStyle = 'var(--brand-strong, #004AAD)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    isDead() {
      return this.life <= 0;
    }
  }
  class Molecule {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.scale = 0.1;
      this.opacity = 0;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.1;
      this.targetScale = 0.8 + Math.random() * 0.4;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.scale = Math.min(this.targetScale, this.scale + 0.05);
      this.opacity = Math.min(0.6, this.opacity + 0.05);
      
      // Fade out if too far from center
      const dist = Math.hypot(this.x - width/2, this.y - height/2);
      if (dist > Math.max(width, height) * 0.6) {
        this.opacity *= 0.95;
      }

      return this.opacity > 0.01;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.scale, this.scale);
      
      // Draw molecule
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(130,80,220,0.4)';
      ctx.fill();
      
      // Draw bonds
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * 40, Math.sin(angle) * 40);
      }
      ctx.strokeStyle = 'rgba(30,200,140,0.3)';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      ctx.restore();
    }
  }

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    width = Math.max(1, Math.floor(el.clientWidth));
    height = Math.max(1, Math.floor(el.clientHeight));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFallback() {
    // simple animated radial gradient fallback (CSS also provides background)
    ctx.clearRect(0,0,width,height);
    const g = ctx.createRadialGradient(width * 0.5 + Math.sin(offset * 0.002) * 40, height * 0.45, Math.min(width, height) * 0.08,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.9);
    g.addColorStop(0, 'rgba(120, 80, 200, 0.14)');
    g.addColorStop(0.6, 'rgba(60, 160, 140, 0.08)');
    g.addColorStop(1, 'rgba(10,10,10,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,width,height);
  }

  function drawImage() {
    if (!pattern) return drawFallback();
    ctx.clearRect(0,0,width,height);
    // subtle slow moving offset for a parallax-like effect
    offset += speed;
    const dx = (offset % img.width);
    // draw pattern repeated by drawing the image tiled manually for more control
    const scale = Math.max(width / img.width, height / img.height) * 1.2; // slight zoom
    const sw = img.width * scale;
    const sh = img.height * scale;

    // compute start positions to center the texture and animate horizontally
    const startX = -((dx * scale) % sw) - sw;
    const startY = -Math.round((sh - height) / 2);

    for (let x = startX; x < width; x += sw) {
      for (let y = startY - sh; y < height; y += sh) {
        ctx.globalAlpha = 0.55; // semi-transparent so content remains readable
        ctx.drawImage(img, x, y, sw, sh);
      }
    }

    // soft color overlay to match site brand
    ctx.fillStyle = 'rgba(8,123,54,0.06)';
    ctx.fillRect(0,0,width,height);
  }

  function tick() {
    if (!el.isConnected) return; // stop if element removed
    
    // Draw background
    if (pattern) drawImage(); else drawFallback();
    
    // Update and draw molecules
    molecules.forEach((molecule, i) => {
      molecule.update();
      molecule.draw(ctx);
      if (molecule.isDead()) {
        molecules.splice(i, 1);
      }
    });
    
    // Generate molecules occasionally when pointer is down
    if (isPointerDown && molecules.length < MAX_MOLECULES && Math.random() < 0.3) {
      molecules.push(new Molecule(mouseX, mouseY));
    }
    
    requestAnimationFrame(tick);
  }

  function start() {
    resize();
    requestAnimationFrame(tick);
  }

  // attempt to load image, on success use it; on error fallback to CSS background
  img.onload = function () {
    try {
      pattern = ctx.createPattern(img, 'repeat');
    } catch (err) {
      pattern = null;
    }
    start();
  };
  img.onerror = function () {
    // if the image isn't available, rely on CSS background + canvas fallback
    pattern = null;
    start();
  };

  // Add interaction handlers
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (width / rect.width);
    mouseY = (e.clientY - rect.top) * (height / rect.height);
    
    if (isPointerDown && molecules.length < MAX_MOLECULES) {
      molecules.push(new Molecule(mouseX, mouseY));
    }
  });

  canvas.addEventListener('mousedown', () => {
    isPointerDown = true;
  });

  canvas.addEventListener('mouseup', () => {
    isPointerDown = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isPointerDown = false;
  });

  // Touch event support
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isPointerDown = true;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouseX = (touch.clientX - rect.left) * (width / rect.width);
    mouseY = (touch.clientY - rect.top) * (height / rect.height);
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouseX = (touch.clientX - rect.left) * (width / rect.width);
    mouseY = (touch.clientY - rect.top) * (height / rect.height);
    
    if (molecules.length < MAX_MOLECULES) {
      molecules.push(new Molecule(mouseX, mouseY));
    }
  });

  canvas.addEventListener('touchend', () => {
    isPointerDown = false;
  });

  // begin loading
  img.src = imgPath;

  // handle resize
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 120);
  });

  // initial resize after DOM paint
  requestAnimationFrame(resize);
})();

    const canvas = document.getElementById('neuronCanvas');
    const ctx = canvas.getContext('2d');
    let W = canvas.width = innerWidth;
    let H = canvas.height = innerHeight;

    const config = {
      nodeCount: 50,
      nodeRadius: 3,
      nodeSpeed: 0.5,
      maxLinkDist: 120
    };

    const nodes = [];

    class Node {
      constructor() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * config.nodeSpeed;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      }

      move() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, config.nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; // white neurons
        ctx.shadowColor = 'rgba(180,255,120,0.7)';
            
        /*  ctx.fillStyle = 'rgba(180,255,120,0.9)'; // Golden-green neurons */
       
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow
      }
    }

    function init() {
      for (let i = 0; i < config.nodeCount; i++) {
        nodes.push(new Node());
      }
    }

    function drawLinks() {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < config.maxLinkDist) {
            const alpha = 1 - dist / config.maxLinkDist;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.3})`; // white links
           /*  ctx.strokeStyle = `rgba(219, 11, 108,${alpha * 0.3})`; // pink */
          /*  ctx.strokeStyle = `rgba(180,255,120,${alpha * 0.3})`; // Golden-green links */
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      drawLinks();
      for (const n of nodes) {
        n.move();
        n.draw();
      }
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
      W = canvas.width = innerWidth;
      H = canvas.height = innerHeight;
    });

    init();
    animate();
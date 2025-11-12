// Neural Network Background Animation
class NeuralBackground {
    constructor() {
        this.canvas = document.getElementById('neuronCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.neurons = [];
        this.connections = [];
        this.brandColors = {
            primary: '#0b7a28',
            accent: '#e9f6e6',
            gradient: ['rgba(129,199,132,0.9)', 'rgba(255,241,118,0.8)']
        };
        this.pulseTime = 0;
        
        this.resize();
        this.init();
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        // Create neurons
        const neuronCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 15000), 150); // Further increased neuron count and density
        
        for (let i = 0; i < neuronCount; i++) {
            this.neurons.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 2,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                pulsePhase: Math.random() * Math.PI * 2, // Random pulse phase
                energyLevel: Math.random() // Random energy level for varying effects
            });
        }

        // Enhanced connection system with distance-based probability and cluster formation
        const baseProbability = 0.12; // Adjusted base probability for increased neuron count
        const maxConnections = Math.floor(this.neurons.length * 0.3); // Limit max connections per neuron
        
        // Initialize connection counts for each neuron
        const connectionCounts = new Array(this.neurons.length).fill(0);
        
        for (let i = 0; i < this.neurons.length; i++) {
            // Sort potential connections by distance
            const potentialConnections = [];
            for (let j = i + 1; j < this.neurons.length; j++) {
                const dx = this.neurons[i].x - this.neurons[j].x;
                const dy = this.neurons[i].y - this.neurons[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                potentialConnections.push({ index: j, distance: distance });
            }
            
            // Sort by distance for proximity-based connections
            potentialConnections.sort((a, b) => a.distance - b.distance);
            
            // Create connections with dynamic probability
            for (const potential of potentialConnections) {
                if (connectionCounts[i] >= maxConnections) break; // Stop if max connections reached
                
                const j = potential.index;
                if (connectionCounts[j] >= maxConnections) continue; // Skip if target has max connections
                
                const distance = potential.distance;
                const proximityFactor = Math.max(0.1, 1 - (distance / (this.canvas.width * 0.25)));
                const clusterFactor = Math.min(1, (maxConnections - connectionCounts[i]) / maxConnections);
                
                if (Math.random() < baseProbability * proximityFactor * clusterFactor) {
                    this.connections.push([i, j]);
                    connectionCounts[i]++;
                    connectionCounts[j]++;
                }
            }
        }
    }

    drawNeuron(x, y, radius, pulsePhase, energyLevel) {
        // Draw glow effect
        const gradient = this.ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 3);
        gradient.addColorStop(0, `rgba(11, 122, 40, ${0.15 * energyLevel})`);
        gradient.addColorStop(1, 'rgba(11, 122, 40, 0)');
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Draw pulsing neuron
        const pulseRadius = radius * (1 + Math.sin(pulsePhase + this.pulseTime * 0.003) * 0.3);
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.brandColors.primary;
        this.ctx.fill();

        // Add highlight
        this.ctx.beginPath();
        this.ctx.arc(x - pulseRadius * 0.3, y - pulseRadius * 0.3, pulseRadius * 0.4, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fill();
    }

    drawConnection(n1, n2) {
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 400) {
            this.ctx.beginPath();
            this.ctx.moveTo(n1.x, n1.y);
            this.ctx.lineTo(n2.x, n2.y);
            
            // Calculate energy level for the connection
            const energyFactor = (n1.energyLevel + n2.energyLevel) * 0.5;
            const pulseEffect = Math.sin(this.pulseTime * 0.002 + (n1.pulsePhase + n2.pulsePhase) * 0.5) * 0.3 + 0.7;
            
            const alpha = (1 - distance / 400) * pulseEffect;
            this.ctx.strokeStyle = `rgba(11, 122, 40, ${alpha * 0.25 * energyFactor})`;
            
            // Dynamic line width based on distance and energy
            this.ctx.lineWidth = Math.max(0.5, 2 * (1 - distance / 400) * energyFactor);
            
            // Draw the main connection
            this.ctx.stroke();
            
            // Add subtle glow to connections
            this.ctx.strokeStyle = `rgba(129, 199, 132, ${alpha * 0.1 * energyFactor})`;
            this.ctx.lineWidth = Math.max(1, 3 * (1 - distance / 400) * energyFactor);
            this.ctx.stroke();
        }
    }

    updateNeurons() {
        for (let neuron of this.neurons) {
            neuron.x += neuron.vx;
            neuron.y += neuron.vy;

            // Bounce off walls
            if (neuron.x < 0 || neuron.x > this.canvas.width) neuron.vx *= -1;
            if (neuron.y < 0 || neuron.y > this.canvas.height) neuron.vy *= -1;
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.pulseTime++;
        
        // Draw connections with layered effect
        this.ctx.globalCompositeOperation = 'destination-over';
        for (let [i, j] of this.connections) {
            this.drawConnection(this.neurons[i], this.neurons[j]);
        }
        
        // Draw neurons with glow
        this.ctx.globalCompositeOperation = 'source-over';
        for (let neuron of this.neurons) {
            this.drawNeuron(neuron.x, neuron.y, neuron.radius, neuron.pulsePhase, neuron.energyLevel);
            
            // Gradually change energy levels for dynamic effect
            neuron.energyLevel = 0.3 + Math.sin(this.pulseTime * 0.002 + neuron.pulsePhase) * 0.7;
        }
        
        this.updateNeurons();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the animation when the page loads
window.addEventListener('load', () => {
    if (document.getElementById('neuronCanvas')) {
        new NeuralBackground();
    }
});
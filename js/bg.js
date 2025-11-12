const numMolecules = 10; // Number of floating molecules
  const molecules = [];

  for (let i = 0; i < numMolecules; i++) {
    const img = document.createElement('img');
    img.src = '51dd9619-4b54-4294-8f1b-a329f60f99df.png'; // <-- replace with your molecule image path
    img.classList.add('molecule');
    
    // Random initial position
    img.style.left = Math.random() * window.innerWidth + 'px';
    img.style.top = Math.random() * window.innerHeight + 'px';
    
    // Random motion and animation timing
    const tx = (Math.random() - 0.5) * window.innerWidth;
    const ty = (Math.random() - 0.5) * window.innerHeight;
    const duration = 15 + Math.random() * 15; // 15–30 seconds
    
    img.style.setProperty('--tx', `${tx}px`);
    img.style.setProperty('--ty', `${ty}px`);
    img.style.animationDuration = `${duration}s`;
    
    document.body.appendChild(img);
    molecules.push(img);
  }

  // Make them move to new random places every few seconds
  setInterval(() => {
    molecules.forEach(img => {
      const tx = (Math.random() - 0.5) * window.innerWidth;
      const ty = (Math.random() - 0.5) * window.innerHeight;
      img.style.setProperty('--tx', `${tx}px`);
      img.style.setProperty('--ty', `${ty}px`);
      img.style.animationDuration = `${10 + Math.random() * 20}s`;
    });
  }, 15000);

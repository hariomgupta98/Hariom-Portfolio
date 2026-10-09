// Portrait tilt and cursor glow
const portrait = document.querySelector('#portraitCard');
if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  portrait.addEventListener('pointermove', (event) => {
    const rect = portrait.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    portrait.style.transform = `rotateY(${x * 9}deg) rotateX(${y * -9}deg) rotate(3deg)`;
  });
  portrait.addEventListener('pointerleave', () => portrait.style.transform = 'rotate(3deg)');

  const glow = document.querySelector('#cursorGlow');
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

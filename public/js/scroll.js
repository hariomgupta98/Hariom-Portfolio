// Homepage section reveal effects
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.13 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

// Highlight the current navigation section
const sections = document.querySelectorAll('main section[id]');
const navItems = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navItems.forEach((item) => item.classList.toggle('active', item.getAttribute('href') === `/#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

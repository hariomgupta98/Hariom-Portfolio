// Shared by the portfolio, admin dashboard, and project forms.
(() => {
 const header = document.querySelector('#siteHeader');
 const toggle = document.querySelector('#menuToggle');
 const links = document.querySelector('#navLinks');
 const year = document.querySelector('#year');
 if (year) year.textContent = new Date().getFullYear();
 if (header) {
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive:true});
 }
 if (!toggle || !links) return;
 const desktop = window.matchMedia('(min-width: 1201px)');
 const label = toggle.querySelector('.sr-only');
 function setOpen(open) {
  links.classList.toggle('open', open);
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  if(label) label.textContent = open ? 'Close navigation' : 'Open navigation';
 }
 toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
 links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
 document.addEventListener('click', event => { if (!header?.contains(event.target)) setOpen(false); });
 document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
 });
 if(desktop.addEventListener) desktop.addEventListener('change', () => setOpen(false));
 else if(desktop.addListener) desktop.addListener(() => setOpen(false));
})();

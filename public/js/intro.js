// Welcome animation
const intro = document.querySelector('#intro');
const siteShell = document.querySelector('#siteShell');
const introSkip = document.querySelector('#introSkip');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let introDone = false;
function enterPortfolio() {
  if (introDone) return;
  introDone = true;
  intro.classList.add('is-leaving');
  siteShell.classList.add('is-visible');
  document.body.classList.remove('is-intro');
  window.setTimeout(() => intro.setAttribute('aria-hidden', 'true'), 800);
}

introSkip.addEventListener('click', enterPortfolio);
if (window.location.hash || document.referrer.startsWith(window.location.origin + '/admin') || document.referrer.startsWith(window.location.origin + '/projects/')) {
  enterPortfolio();
} else {
  window.setTimeout(enterPortfolio, reducedMotion ? 0 : 3700);
}

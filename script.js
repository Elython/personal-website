const scrollCue = document.querySelector('.scroll-cue');

function updateLandingFade() {
  const scrolled = window.scrollY > 8;
  document.body.classList.toggle('has-scrolled', scrolled);
  scrollCue.inert = scrolled;
}

window.addEventListener('scroll', updateLandingFade, { passive: true });
updateLandingFade();

async function initializePage() {
  const includes = [...document.querySelectorAll('[data-include]')];
  try {
    const fragments = await Promise.all(includes.map(async (container) => {
      const response = await fetch(container.dataset.include, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Could not load ${container.dataset.include}`);
      return response.text();
    }));
    includes.forEach((container, index) => {
      container.outerHTML = fragments[index];
    });
  } catch (error) {
    console.error(error);
    const message = document.createElement('p');
    message.textContent = 'The page could not load its sections. Preview with a local web server and refresh.';
    document.querySelector('main').append(message);
    return;
  }

  const sideHeader = document.querySelector('.side-header');
  const sections = [...document.querySelectorAll('.content')];
  const links = [...sideHeader.querySelectorAll('a')];

  function updateNavigation() {
    const visible = window.scrollY > 80;
    sideHeader.classList.toggle('is-visible', visible);
    sideHeader.inert = !visible;
    sideHeader.setAttribute('aria-hidden', String(!visible));

    // The section crossing the upper third of the screen is current.
    const position = window.innerHeight * 0.35;
    let current = sections.find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= position && rect.bottom > position;
    });
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    links.forEach((link) => {
      const active = link.hash === `#${current?.id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', updateNavigation, { passive: true });
  window.addEventListener('resize', updateNavigation);
  // Restore direct links after the target sections have loaded.
  const target = document.getElementById(window.location.hash.slice(1));
  if (target) target.scrollIntoView({ behavior: 'instant' });
  updateNavigation();
}

initializePage();

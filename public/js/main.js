import { h } from './dom.js';
import { api } from './api.js';
import { mountSurvey } from './survey/Survey.js';

async function boot() {
  let config;
  try {
    config = await api.config();
  } catch (err) {
    document.getElementById('survey').append(h('p.sv-error', `Could not load the site: ${err.message}`));
    return;
  }
  const { story } = config;

  if (story.meta?.title) document.title = story.meta.title;
  setupNav(story.nav);
  renderFooter(story.footer);

  // The story is optional at runtime: if it fails, the survey must still work.
  try {
    const { renderStory } = await import('./story/Story.js');
    renderStory(document.getElementById('story'), config);
  } catch (err) {
    console.error('Story failed to render', err);
  }

  mountSurvey(document.getElementById('survey'), config);

  // Any element with data-survey-goto="awards|taglines|note" jumps into the form.
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-survey-goto]');
    if (!target) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('survey:goto', { detail: target.dataset.surveyGoto }));
  });

  // Deep link: /#vote opens straight on the awards.
  if (location.hash === '#vote') {
    window.dispatchEvent(new CustomEvent('survey:goto', { detail: 'awards' }));
  }
}

function setupNav(nav = {}) {
  if (nav.logo) document.getElementById('logo-text').textContent = nav.logo;

  // Past the hero the bar hides on scroll down and comes back on scroll up.
  const bar = document.getElementById('topbar');
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const past = y > window.innerHeight * 0.6;
    bar.classList.toggle('is-scrolled', past);
    bar.classList.toggle('is-hidden', past && y > lastY);
    lastY = y;
  }, { passive: true });
}

function renderFooter(footer = {}) {
  // replaceChildren() would print a null as the text "null", so filter it out.
  document.getElementById('footer').replaceChildren(
    ...[h('p.display', footer.line || ''), footer.credit ? h('p.credit', footer.credit) : null].filter(Boolean)
  );
}

boot();

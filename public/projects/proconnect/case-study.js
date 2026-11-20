// Project popup content: edit project information here
const projectData = {
  proconnect: {
    kicker: 'Campus platform · Full-stack concept',
    title: 'ProConnect',
    summary: 'A single digital home for the people and processes that keep a campus moving.',
    problem: 'Student updates, hostel requests, and faculty communication often live in disconnected channels, making simple tasks harder to track.',
    approach: 'Create role-aware dashboards with clear actions, timely notices, request tracking, and one consistent experience across devices.',
    tags: ['React', 'Node.js', 'MongoDB', 'REST APIs']
  }
};

// Open and close the project popup
const modal = document.querySelector('#caseModal');
function openCaseStudy(key) {
  const project = projectData[key];
  if (!project) return;
  document.querySelector('#modalKicker').textContent = project.kicker;
  document.querySelector('#modalTitle').textContent = project.title;
  document.querySelector('#modalSummary').textContent = project.summary;
  document.querySelector('#modalProblem').textContent = project.problem;
  document.querySelector('#modalApproach').textContent = project.approach;
  document.querySelector('#modalTags').innerHTML = project.tags.map((tag) => `<span>${tag}</span>`).join('');
  modal.showModal();
}
document.querySelectorAll('[data-open-project]').forEach((button) => button.addEventListener('click', () => openCaseStudy(button.dataset.openProject)));
document.querySelectorAll('.project-card').forEach((card) => card.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') openCaseStudy(card.dataset.project);
}));
document.querySelector('#modalClose').addEventListener('click', () => modal.close());
modal.addEventListener('click', (event) => {
  const box = modal.getBoundingClientRect();
  const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  if (outside) modal.close();
});

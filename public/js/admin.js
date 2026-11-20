document.querySelectorAll('[data-delete-project]').forEach(form => {
 form.addEventListener('submit', event => {
  if (!window.confirm('Delete this project from your portfolio? This cannot be undone.')) event.preventDefault();
 });
});

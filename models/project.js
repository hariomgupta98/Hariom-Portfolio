const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '../data/projects.json');

function all() {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function clean(body) {
  const text = key => typeof body[key] === 'string' ? body[key].trim() : '';
  return { title: text('title'), description: text('description'), url: text('url'), liveUrl: text('liveUrl') };
}

function validate(project) {
  if (!project.title || project.title.length > 100) return 'Enter a name of 1–100 characters.';
  if (!project.description || project.description.length > 600) return 'Enter a description of 1–600 characters.';
  for (const [field, label] of [['url', 'project'], ['liveUrl', 'live project']]) {
    if (!project[field]) continue;
    try {
      const url = new URL(project[field]);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || project[field].length > 2048) return `Use a valid http or https ${label} link without login credentials (up to 2048 characters).`;
    } catch {
      return `Enter a valid ${label} link, including https://.`;
    }
  }
  return '';
}

function save(projects) {
  fs.writeFileSync(file + '.tmp', JSON.stringify(projects, null, 2));
  fs.renameSync(file + '.tmp', file);
}
function add(project) { save([...all(), {...project, id:require('node:crypto').randomUUID()}]); }
function update(id, project) { save(all().map(p=>p.id === id ? {...p,...project} : p)); }
function remove(id) {
 const projects = all(); const remaining = projects.filter(p=>p.id !== id);
 if(remaining.length === projects.length) return false;
 save(remaining); return true;
}
module.exports = {all, clean, validate, add, update, remove};

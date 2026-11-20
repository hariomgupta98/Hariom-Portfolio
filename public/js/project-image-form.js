(() => {
 const input = document.querySelector('#projectImage');
 const data = document.querySelector('#imageData');
 const preview = document.querySelector('#imagePreview');
 const error = document.querySelector('#imageError');
 const save = document.querySelector('#saveProject');
 const remove = document.querySelector('#removeImage');
 const original = preview.getAttribute('src');
 let reader;
 function restore() { preview.src = original; preview.hidden = !original || !!remove?.checked; }
 input.addEventListener('change', () => {
  if(reader) reader.abort();
  data.value = ''; error.hidden = true; save.disabled = false;
  const file = input.files[0];
  if(!file) { restore(); return; }
  function fail(message) { error.textContent = message; error.hidden = false; input.value = ''; data.value = ''; save.disabled = false; restore(); }
  if(!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 2*1024*1024) { fail('Choose a PNG, JPG, or WebP image no larger than 2 MB.'); return; }
  save.disabled = true;
  reader = new FileReader();
  reader.onload = () => {
   data.value = reader.result; preview.src = reader.result; preview.hidden = false;
   if(remove) remove.checked = false;
   save.disabled = false;
  };
  reader.onerror = () => fail('Unable to read this image. Please choose it again.');
  reader.readAsDataURL(file);
 });
 remove?.addEventListener('change', () => {
  if(remove.checked) { if(reader) reader.abort(); input.value=''; data.value=''; save.disabled=false; }
  restore();
 });
})();

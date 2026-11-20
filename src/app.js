const dialog = document.querySelector('.lightbox');
let opener;
document.querySelectorAll('[data-lightbox]').forEach(link => link.addEventListener('click', event => {
  if(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !dialog.showModal) return;
  event.preventDefault();
  opener = link;
  const full = dialog.querySelector('.lightbox-image');
  full.src = link.href;
  full.alt = link.querySelector('img').alt;
  dialog.showModal();
  dialog.querySelector('.close-lightbox').focus();
}));
dialog.querySelector('.close-lightbox').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => opener?.focus());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
const sections = [...document.querySelectorAll('.research-project')];
if(sections.length && 'IntersectionObserver' in window) {
  const nav = [...document.querySelectorAll('.project-nav a')];
  const observer = new IntersectionObserver(entries => {
    for(const entry of entries) if(entry.isIntersecting) {
      nav.forEach(link => {
        if(link.hash === `#${entry.target.id}`) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }
  },{rootMargin:'-10% 0px -65% 0px',threshold:0});
  sections.forEach(section => observer.observe(section));
}

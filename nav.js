// Mobile navigation
const menuButton=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('#mobile-nav');
menuButton.addEventListener('click',()=>{
  const open=menuButton.getAttribute('aria-expanded')!=='true';
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  mobileMenu.hidden=!open;
});
mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  mobileMenu.hidden=true;
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Open navigation');
}));
// Close the menu with Escape.
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileMenu.hidden){mobileMenu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');menuButton.focus()}});

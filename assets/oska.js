(()=>{const d=document;const q=(s,e=d)=>e.querySelector(s);const qa=(s,e=d)=>[...e.querySelectorAll(s)];
d.addEventListener('click',e=>{
  const menu=e.target.closest?.('[data-oska-menu]');if(menu){const drawer=q('[data-oska-drawer]');if(drawer){const open=drawer.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));}}
  const heroBtn=e.target.closest?.('[data-oska-sound]');if(heroBtn){const v=q('[data-oska-hero-video]');if(v){v.muted=!v.muted;heroBtn.textContent=v.muted?(heroBtn.dataset.soundOff||'Sound off'):(heroBtn.dataset.soundOn||'Sound on');v.play().catch(()=>{});}}
},true);
/* OSKA_PERFORMANCE_GUARD */
const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData=!!(navigator.connection&&navigator.connection.saveData);
const autoMotion=!(reduceMotion||saveData);
const hero=q('[data-oska-hero-video]');if(hero){hero.muted=true;hero.defaultMuted=true;if(autoMotion)hero.play().catch(()=>{});else hero.pause();}
qa('video[autoplay],video[data-oska-autoplay]').forEach(v=>{if(!autoMotion)v.pause()});
if('IntersectionObserver' in window&&autoMotion){const io=new IntersectionObserver(entries=>entries.forEach(entry=>{const v=entry.target;if(entry.isIntersecting){if(v.autoplay||v.hasAttribute('autoplay')||v.hasAttribute('data-oska-autoplay'))v.play().catch(()=>{})}else{v.pause()}}),{rootMargin:'120px 0px',threshold:.05});qa('video[autoplay],video[data-oska-autoplay]').forEach(v=>io.observe(v));}
const p=new URLSearchParams(location.search);const ref=p.get('ref')||p.get('product')||p.get('sample');if(ref){const field=q('input[name="contact[reference]"]');if(field)field.value=ref}
const megaDetails=qa('details[data-oska-mega]');
const megaDesktop=window.matchMedia('(min-width:1051px)');
const closeMega=(except)=>megaDetails.forEach(x=>{if(x!==except)x.open=false});
const openMega=(el)=>{if(!megaDesktop.matches)return;closeMega(el);el.open=true};
let megaCloseTimer=0;
const cancelMegaClose=()=>{if(megaCloseTimer){clearTimeout(megaCloseTimer);megaCloseTimer=0}};
megaDetails.forEach(el=>{
  const summary=q('summary',el);
  el.addEventListener('mouseenter',()=>{if(megaDesktop.matches){cancelMegaClose();openMega(el)}});
  el.addEventListener('pointerenter',e=>{if(megaDesktop.matches&&e.pointerType==='mouse'){cancelMegaClose();openMega(el)}});
  if(summary)summary.addEventListener('click',e=>{if(megaDesktop.matches){e.preventDefault();cancelMegaClose();openMega(el)}});
  el.addEventListener('focusin',()=>{if(megaDesktop.matches){cancelMegaClose();openMega(el)}});
  el.addEventListener('focusout',()=>{setTimeout(()=>{if(megaDesktop.matches&&!el.contains(d.activeElement)&&!d.activeElement?.closest?.('.oska-header'))el.open=false},0)});
  el.addEventListener('toggle',()=>{if(el.open)closeMega(el)});
});
const megaHeader=q('.oska-header');
if(megaHeader){
  megaHeader.addEventListener('mouseenter',cancelMegaClose);
  megaHeader.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')cancelMegaClose()});
  megaHeader.addEventListener('mouseleave',()=>{if(megaDesktop.matches){cancelMegaClose();megaCloseTimer=setTimeout(()=>closeMega(),50)}});
  megaHeader.addEventListener('pointerleave',e=>{if(megaDesktop.matches&&e.pointerType==='mouse'){cancelMegaClose();megaCloseTimer=setTimeout(()=>closeMega(),50)}});
}
d.addEventListener('pointerdown',e=>{if(megaDesktop.matches&&!e.target.closest?.('.oska-header'))closeMega()});
megaDesktop.addEventListener?.('change',()=>{cancelMegaClose();if(!megaDesktop.matches)closeMega()});
/* OSKA_KEYBOARD_A11Y */
d.addEventListener('keydown',e=>{if(e.key==='Escape'){const drawer=q('[data-oska-drawer]');const menu=q('[data-oska-menu]');if(drawer&&drawer.classList.contains('open')){drawer.classList.remove('open');if(menu)menu.setAttribute('aria-expanded','false')}qa('details.oska-nav-detail').forEach(x=>x.open=false)}});
const header=q('.oska-header');if(header){const placeholder=d.createElement('div');placeholder.className='oska-header-placeholder';placeholder.setAttribute('aria-hidden','true');header.before(placeholder);let lastY=Math.max(0,window.scrollY||0),ticking=false,lastHeight=0;const syncHeight=()=>{const height=Math.ceil(header.getBoundingClientRect().height);if(height>0&&height!==lastHeight){lastHeight=height;d.documentElement.style.setProperty('--oska-sticky-header-height',height+'px');placeholder.style.setProperty('--oska-sticky-header-height',height+'px')}};const isNavigationOpen=()=>{const drawer=q('[data-oska-drawer]',header);const menuOpen=!!(drawer&&drawer.classList.contains('open'));const submenuOpen=qa('details.oska-nav-detail',header).some(x=>x.open);return menuOpen||submenuOpen||header.contains(d.activeElement)};const show=()=>header.classList.remove('oska-header--hidden');const update=()=>{const y=Math.max(0,window.scrollY||0),delta=y-lastY,nearTop=y<48;syncHeight();if(nearTop){header.classList.remove('oska-header--hidden','oska-header--floating');placeholder.classList.remove('is-active')}else{header.classList.add('oska-header--floating');placeholder.classList.add('is-active');if(isNavigationOpen()){show()}else if(delta>4){header.classList.add('oska-header--hidden');qa('details.oska-nav-detail',header).forEach(x=>x.open=false)}else if(delta<-2){show()}}lastY=y;ticking=false};const requestUpdate=()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}};window.addEventListener('scroll',requestUpdate,{passive:true});window.addEventListener('resize',()=>{lastY=Math.max(0,window.scrollY||0);syncHeight();requestUpdate()},{passive:true});header.addEventListener('focusin',show);header.addEventListener('toggle',show,true);header.addEventListener('click',()=>{requestAnimationFrame(()=>{syncHeight();if(isNavigationOpen())show()})},true);if('ResizeObserver' in window)new ResizeObserver(syncHeight).observe(header);syncHeight();update();}
})();

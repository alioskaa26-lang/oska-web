(()=>{
  const intro=document.querySelector('[data-oska-intro]');
  if(!intro)return;
  const key='oska_intro_seen_v1';
  let seen=true;
  try{
    seen=sessionStorage.getItem(key)==='1';
    if(!seen)sessionStorage.setItem(key,'1');
  }catch(error){
    intro.hidden=true;
    return;
  }
  if(seen)return;
  const video=intro.querySelector('[data-oska-intro-video]');
  const skip=intro.querySelector('[data-oska-intro-skip]');
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let timer=0;
  const close=()=>{
    clearTimeout(timer);
    intro.classList.add('is-leaving');
    const done=()=>{
      intro.hidden=true;
      intro.setAttribute('aria-hidden','true');
      if(video)video.pause();
    };
    if(reduced)done();else window.setTimeout(done,320);
  };
  try{
    intro.hidden=false;
    intro.setAttribute('aria-hidden','false');
    requestAnimationFrame(()=>intro.classList.add('is-active'));
    if(video&&!reduced)video.play().catch(()=>{});
    if(video&&reduced)video.pause();
    skip.addEventListener('click',close);
    timer=window.setTimeout(close,Number(intro.dataset.duration)||2600);
  }catch(error){
    intro.hidden=true;
    intro.setAttribute('aria-hidden','true');
  }
})();

(()=>{
  const root=document.querySelector('[data-oska-concierge]');
  if(!root)return;
  const panel=root.querySelector('[data-oska-concierge-panel]');
  const aiOpenButtons=[...document.querySelectorAll('[data-oska-concierge-open-top]')];
  const liveOpenButtons=[...document.querySelectorAll('[data-oska-live-chat-open]')];
  const openButtons=[...aiOpenButtons,...liveOpenButtons];
  const closeButton=root.querySelector('[data-oska-concierge-close]');
  const voiceButton=root.querySelector('[data-oska-voice]');
  const status=root.querySelector('[data-oska-status]');
  const roleLabel=root.querySelector('[data-oska-role-label]');
  const title=root.querySelector('[data-oska-title]');
  const description=root.querySelector('[data-oska-description]');
  const handoff=root.querySelector('[data-oska-handoff]');
  const log=root.querySelector('[data-oska-chat-log]');
  const form=root.querySelector('[data-oska-chat-form]');
  const input=root.querySelector('[data-oska-chat-input]');
  const mic=root.querySelector('[data-oska-mic]');
  const endpoint=window.OSKA_AI_ENDPOINT||'';
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const lang=root.dataset.lang==='tr'?'tr':'en';
  const greetings={
    ai:lang==='tr'?'OSKA Genel Müdür AI hazır. Kadın, erkek, koleksiyon, üretim veya private label konusunda sizi yönlendirebilirim.':'OSKA General Manager AI is ready. I can guide you through women, men, collections, manufacturing or private label.',
    chat:lang==='tr'?'OSKA yazılı sohbet hazır. Sorunuzu yazabilirsiniz.':'OSKA text chat is ready. Type your question.'
  };
  let mode='ai';
  let voiceOn=true;
  let previousFocus=null;
  let hideTimer=0;

  const routes={
    women_rings:'/pages/women-rings',women_necklaces:'/pages/women-necklaces',women_earrings:'/pages/women-earrings',women_bracelets:'/pages/women-bracelets',
    men_rings:'/pages/men-rings',men_necklaces:'/pages/men-necklaces',men_earrings:'/pages/men-earrings',men_bracelets:'/pages/men-bracelets',
    collections:'/pages/collections',manufacturing:'/pages/manufacturing',private_label:'/pages/private-label',about:'/pages/about',rfq:'/pages/contact-rfq',contact:'/pages/contact',search:'/search'
  };
  const labels={
    tr:{open:'Sayfayı aç',rfq:'RFQ aç',contact:'İletişimi aç'},
    en:{open:'Open page',rfq:'Open RFQ',contact:'Open contact'}
  };
  const focusable=()=>[...panel.querySelectorAll('a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hidden&&el.offsetParent!==null);
  const speak=text=>{
    if(mode==='chat'||!voiceOn||!('speechSynthesis' in window))return;
    try{
      speechSynthesis.cancel();
      const utterance=new SpeechSynthesisUtterance(text);
      utterance.lang=lang==='tr'?'tr-TR':'en-US';
      utterance.rate=.92;
      speechSynthesis.speak(utterance);
    }catch(error){}
  };
  const addMessage=(text,kind='assistant',href='',linkText='')=>{
    const item=document.createElement('div');
    item.className='oska-concierge__message oska-concierge__message--'+kind;
    const copy=document.createElement('p');
    copy.textContent=text;
    item.appendChild(copy);
    if(href){
      const link=document.createElement('a');
      link.href=href;
      link.textContent=linkText||labels[lang].open;
      item.appendChild(link);
    }
    log.appendChild(item);
    log.scrollTop=log.scrollHeight;
  };
  const normalized=text=>text.toLocaleLowerCase(lang==='tr'?'tr-TR':'en-US').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
  const safeIntent=text=>{
    const q=normalized(text);
    const women=/\b(kadin|women|woman|female)\b/.test(q);
    const men=/\b(erkek|men|man|male)\b/.test(q);
    const ring=/\b(yuzuk|ring|rings)\b/.test(q);
    const necklace=/\b(kolye|necklace|necklaces)\b/.test(q);
    const earring=/\b(kupe|earring|earrings)\b/.test(q);
    const bracelet=/\b(bileklik|bracelet|bracelets|cuff)\b/.test(q);
    let route='';
    if(women&&ring)route=routes.women_rings;
    else if(women&&necklace)route=routes.women_necklaces;
    else if(women&&earring)route=routes.women_earrings;
    else if(women&&bracelet)route=routes.women_bracelets;
    else if(men&&ring)route=routes.men_rings;
    else if(men&&necklace)route=routes.men_necklaces;
    else if(men&&earring)route=routes.men_earrings;
    else if(men&&bracelet)route=routes.men_bracelets;
    if(route)return{answer:lang==='tr'?'İlgili OSKA kategori sayfasını buldum.':'I found the matching OSKA category page.',route,label:labels[lang].open};
    if(women)return{answer:lang==='tr'?'Kadın koleksiyonlarını açıyorum. Yüzük, kolye, küpe ve bileklik kategorilerinden ilerleyebilirsiniz.':'Opening the women’s collection path. Continue with rings, necklaces, earrings or bracelets.',route:routes.collections,label:labels[lang].open};
    if(men)return{answer:lang==='tr'?'Erkek koleksiyonlarını açıyorum. Yüzük, kolye, bileklik ve küpe kategorilerinden ilerleyebilirsiniz.':'Opening the men’s collection path. Continue with rings, necklaces, bracelets or earrings.',route:routes.collections,label:labels[lang].open};
    if(/koleksiyon|collection|catalog|katalog/.test(q))return{answer:lang==='tr'?'OSKA kadın ve erkek koleksiyonlarını kategori yapısıyla inceleyebilirsiniz.':'Browse OSKA women’s and men’s collections by category.',route:routes.collections,label:labels[lang].open};
    if(/uretim|manufactur|atelier|atolye|production/.test(q))return{answer:lang==='tr'?'OSKA, İstanbul’daki atölye yapısıyla B2B üretim ve ürün geliştirme hizmetleri sunar.':'OSKA provides B2B manufacturing and product development through its Istanbul atelier.',route:routes.manufacturing,label:labels[lang].open};
    if(/private|label|ozel marka|custom brand/.test(q))return{answer:lang==='tr'?'Private label talepleri tasarım, ürün geliştirme ve üretim kapsamına göre değerlendirilir.':'Private-label requests are evaluated by design, development and production scope.',route:routes.private_label,label:labels[lang].open};
    if(/malzeme|material|925|silver|gumus|brass|pirinc|bronze|gold|altin/.test(q))return{answer:lang==='tr'?'OSKA’nın üretim seçenekleri 925 gümüş, pirinç/bronz ve seçili altın üretimlerini kapsar. Model ve adet için RFQ gönderin.':'OSKA production options include 925 silver, brass/bronze and selected gold production. Submit an RFQ for model-specific details.',route:routes.rfq,label:labels[lang].rfq};
    if(/hakkinda|about|firma|company|kimdir|history|tarih|oska/.test(q))return{answer:lang==='tr'?'OSKA, İstanbul merkezli B2B takı tasarım ve üretim markasıdır. Kapalıçarşı ve Sirkeci kuyumculuk geleneğinden gelen üretim kültürünü; 925 gümüş, pirinç/bronz, seçili altın, CAD, numune ve private label kabiliyetleriyle birleştirir.':'OSKA is an Istanbul-based B2B jewelry design and manufacturing brand, combining Grand Bazaar and Sirkeci craftsmanship with 925 silver, brass/bronze, selected gold, CAD, sampling and private-label capabilities.',route:routes.about,label:labels[lang].open};
    if(/moq|minim|fiyat|price|cost|teslim|delivery|sure|timeline|kargo|shipping/.test(q))return{answer:lang==='tr'?'MOQ, fiyat ve teslim süresi modele, materyale, adede ve hedef ülkeye göre doğrulanmalıdır; burada sayı uydurmuyorum. RFQ ile net bilgi alın.':'MOQ, price and delivery timing must be confirmed by model, material, quantity and destination; no unverified figure is provided here. Use RFQ for an exact answer.',route:routes.rfq,label:labels[lang].rfq};
    if(/rfq|teklif|quote|quotation/.test(q))return{answer:lang==='tr'?'Ürün, materyal, adet ve teslim ülkesini RFQ formunda paylaşabilirsiniz.':'Share product, material, quantity and destination country in the RFQ form.',route:routes.rfq,label:labels[lang].rfq};
    if(/iletisim|contact|whatsapp|canli|live chat/.test(q))return{answer:lang==='tr'?'Mevcut doğrulanmış iletişim kanalını açıyorum.':'Open the verified contact channel.',route:routes.contact,label:labels[lang].contact};
    if(/ara|search|bul|find/.test(q))return{answer:lang==='tr'?'Site aramasını kullanabilirsiniz.':'Use the site search.',route:routes.search,label:labels[lang].open};
    return{answer:lang==='tr'?'Bu konuda doğrulanmış bir yanıtım yok. Bilgi uydurmak yerine talebinizi RFQ veya İletişim üzerinden OSKA ekibine aktarın.':'I do not have a verified answer for that. Rather than invent information, please send the request to OSKA through RFQ or Contact.',route:routes.contact,label:labels[lang].contact};
  };
  const askBackend=async message=>{
    if(!endpoint)return null;
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,language:lang,country:root.dataset.country,context:root.dataset.context,contextUrl:root.dataset.url,mode,scope:'OSKA verified storefront content'})});
      if(!response.ok)return null;
      const data=await response.json();
      return data&&typeof data.reply==='string'&&data.reply.trim()?data.reply.trim():null;
    }catch(error){return null}
  };
  const handleMessage=async message=>{
    addMessage(message,'user');
    status.textContent=lang==='tr'?'DOĞRULANIYOR':'VERIFYING';
    const backendReply=await askBackend(message);
    if(backendReply){
      addMessage(backendReply);
      status.textContent=lang==='tr'?'ÜRETİME HAZIR':'READY FOR PRODUCTION';
      speak(backendReply);
      return;
    }
    const result=safeIntent(message);
    addMessage(result.answer,'assistant',result.route,result.label);
    status.textContent=endpoint?(lang==='tr'?'GÜVENLİ YEREL YÖNLENDİRME':'SAFE LOCAL GUIDANCE'):(lang==='tr'?'GÜVENLİ OSKA BİLGİ KATMANI':'SAFE OSKA KNOWLEDGE');
    speak(result.answer);
  };
  const setMode=nextMode=>{
    const next=nextMode==='chat'?'chat':'ai';
    const changed=mode!==next;
    mode=next;
    root.dataset.mode=mode;
    const textOnly=mode==='chat';
    if(changed)log.innerHTML='';
    if(roleLabel)roleLabel.textContent=textOnly?(lang==='tr'?'YAZILI SOHBET':'TEXT CHAT'):(lang==='tr'?'GENEL MÜDÜR AI':'GENERAL MANAGER AI');
    if(title)title.textContent=textOnly?(lang==='tr'?'Nasıl yardımcı olabilirim?':'How can I help?'):(lang==='tr'?'Nasıl yönlendireyim?':'How can I guide you?');
    if(description)description.textContent=textOnly?(lang==='tr'?'OSKA hakkında yazılı bilgi ve güvenli yönlendirme.':'Written OSKA information and safe guidance.'):(lang==='tr'?'Koleksiyon, üretim, private label ve RFQ için OSKA’nın merkezi asistanı.':'OSKA’s central assistant for collections, manufacturing, private label and RFQ.');
    if(handoff)handoff.textContent=lang==='tr'?'İletişim formu':'Contact form';
    voiceButton.hidden=textOnly;
    mic.hidden=textOnly;
    voiceOn=!textOnly;
    voiceButton.setAttribute('aria-pressed',String(voiceOn));
    voiceButton.setAttribute('aria-label',voiceOn?(lang==='tr'?'Sesi kapat':'Mute voice'):(lang==='tr'?'Sesi aç':'Enable voice'));
    if(textOnly&&'speechSynthesis' in window)speechSynthesis.cancel();
  };
  const show=(nextMode='ai')=>{
    setMode(nextMode);
    clearTimeout(hideTimer);
    previousFocus=document.activeElement;
    root.hidden=false;
    root.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('oska-ai-open');
    openButtons.forEach(button=>button.setAttribute('aria-expanded','true'));
    status.textContent=mode==='chat'?(lang==='tr'?'YAZILI SOHBET HAZIR':'TEXT CHAT READY'):(endpoint?(lang==='tr'?'AI BAĞLANTISI HAZIR':'AI CONNECTION READY'):(lang==='tr'?'GÜVENLİ OSKA BİLGİ KATMANI':'SAFE OSKA KNOWLEDGE'));
    if(!log.children.length)addMessage(greetings[mode]);
    requestAnimationFrame(()=>{
      root.classList.add('is-open');
      closeButton.focus({preventScroll:true});
      speak(greetings[mode]);
    });
  };
  const hide=()=>{
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('oska-ai-open');
    openButtons.forEach(button=>button.setAttribute('aria-expanded','false'));
    if('speechSynthesis' in window)speechSynthesis.cancel();
    const finish=()=>{
      root.hidden=true;
      if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus({preventScroll:true});
    };
    if(reduced)finish();else hideTimer=window.setTimeout(finish,280);
  };
  const trap=event=>{
    if(event.key==='Escape'){event.preventDefault();hide();return}
    if(event.key!=='Tab')return;
    const items=focusable();
    if(!items.length){event.preventDefault();panel.focus();return}
    const first=items[0],last=items[items.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  };
  aiOpenButtons.forEach(button=>button.addEventListener('click',()=>root.classList.contains('is-open')&&mode==='ai'?hide():show('ai')));
  liveOpenButtons.forEach(button=>button.addEventListener('click',()=>root.classList.contains('is-open')&&mode==='chat'?hide():show('chat')));
  closeButton.addEventListener('click',hide);
  document.addEventListener('pointerdown',event=>{if(root.classList.contains('is-open')&&!panel.contains(event.target)&&!event.target.closest?.('[data-oska-concierge-open-top],[data-oska-live-chat-open]'))hide()});
  root.addEventListener('keydown',trap);
  voiceButton.addEventListener('click',()=>{
    voiceOn=!voiceOn;
    voiceButton.setAttribute('aria-pressed',String(voiceOn));
    voiceButton.setAttribute('aria-label',voiceOn?(lang==='tr'?'Sesi kapat':'Mute voice'):(lang==='tr'?'Sesi aç':'Enable voice'));
    if(!voiceOn&&'speechSynthesis' in window)speechSynthesis.cancel();
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const message=input.value.trim();
    if(!message)return;
    input.value='';
    handleMessage(message);
  });
  if(!Recognition)mic.disabled=true;
  else mic.addEventListener('click',()=>{
    try{
      const recognition=new Recognition();
      recognition.lang=lang==='tr'?'tr-TR':'en-US';
      recognition.interimResults=false;
      recognition.continuous=false;
      status.textContent=lang==='tr'?'DİNLİYORUM':'LISTENING';
      recognition.onresult=event=>{
        const text=event.results?.[0]?.[0]?.transcript?.trim();
        if(text)handleMessage(text);
      };
      recognition.onerror=()=>{status.textContent=lang==='tr'?'SESLİ GİRİŞ KULLANILAMADI':'VOICE INPUT UNAVAILABLE'};
      recognition.onend=()=>{if(status.textContent===(lang==='tr'?'DİNLİYORUM':'LISTENING'))status.textContent=lang==='tr'?'GÜVENLİ OSKA BİLGİ KATMANI':'SAFE OSKA KNOWLEDGE'};
      recognition.start();
    }catch(error){status.textContent=lang==='tr'?'SESLİ GİRİŞ KULLANILAMADI':'VOICE INPUT UNAVAILABLE'}
  });
})();

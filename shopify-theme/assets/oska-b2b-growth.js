
(()=>{'use strict';
const d=document, qs=(s,e=d)=>e.querySelector(s), qsa=(s,e=d)=>[...e.querySelectorAll(s)];
const LS={short:'oskaRfqShortlistV1',attr:'oskaAttributionV1',last:'oskaLastContactSubmit'};
const parse=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch(e){return f}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const emit=(name,detail={})=>{const payload={event:name,...detail};window.dataLayer=window.dataLayer||[];window.dataLayer.push(payload);d.dispatchEvent(new CustomEvent('oska:'+name,{detail:payload}))};
window.oskaTrack=emit;
const params=new URLSearchParams(location.search);const attr=parse(LS.attr,{});
['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid'].forEach(k=>{if(params.get(k))attr[k]=params.get(k)});
if(!attr.first_landing)attr.first_landing=location.pathname+location.search;if(!attr.referrer&&d.referrer)attr.referrer=d.referrer;save(LS.attr,attr);
const hydrateAttr=()=>qsa('form').forEach(form=>{Object.entries(attr).forEach(([k,v])=>{const el=qs('[name="contact['+k+']"]',form);if(el)el.value=String(v||'')})});hydrateAttr();

const getShort=()=>parse(LS.short,[]), setShort=a=>{save(LS.short,a);renderShort();emit('shortlist_update',{count:a.length})};
const modelFromUrl=()=>({ref:params.get('ref')||params.get('product')||'',collection:params.get('collection')||'',category:params.get('category')||'',url:location.pathname+location.search});
function addCurrent(){const m=modelFromUrl();if(!m.ref)return;const list=getShort();if(!list.some(x=>x.ref===m.ref))list.push(m);setShort(list);emit('shortlist_add',{model_ref:m.ref,collection:m.collection,category:m.category})}
function removeRef(ref){const list=getShort().filter(x=>x.ref!==ref);setShort(list);emit('shortlist_remove',{model_ref:ref})}
function renderShort(){const list=getShort(),wrap=qs('[data-oska-shortlist-items]'),count=qs('[data-oska-shortlist-count]');if(count)count.textContent=String(list.length);if(!wrap)return;wrap.innerHTML='';if(!list.length){const p=d.createElement('p');p.className='oska-shortlist-empty';p.textContent=wrap.dataset.empty||'No models selected yet.';wrap.appendChild(p);return}list.forEach(item=>{const row=d.createElement('div');row.className='oska-shortlist-item';const info=d.createElement('div');const strong=d.createElement('strong');strong.textContent=item.ref;const small=d.createElement('small');small.textContent=[item.collection,item.category].filter(Boolean).join(' · ');info.append(strong,d.createElement('br'),small);const b=d.createElement('button');b.type='button';b.textContent=wrap.dataset.remove||'Remove';b.addEventListener('click',()=>removeRef(item.ref));row.append(info,b);wrap.appendChild(row)});qsa('[name="contact[selected_models]"]').forEach(x=>x.value=list.map(i=>i.ref).join(', '))}
renderShort();

d.addEventListener('click',e=>{
 const t=e.target.closest('[data-oska-shortlist-toggle]');if(t){const dr=qs('[data-oska-shortlist-drawer]');if(dr){const open=!dr.classList.contains('is-open');dr.classList.toggle('is-open',open);dr.setAttribute('aria-hidden',String(!open));t.setAttribute('aria-expanded',String(open))}}
 const c=e.target.closest('[data-oska-shortlist-close]');if(c){const dr=qs('[data-oska-shortlist-drawer]');dr?.classList.remove('is-open');dr?.setAttribute('aria-hidden','true');qs('[data-oska-shortlist-toggle]')?.setAttribute('aria-expanded','false')}
 const a=e.target.closest('[data-oska-add-rfq]');if(a){addCurrent()}
 const p=e.target.closest('[data-oska-print-spec]');if(p){buildPrintSpec();emit('spec_sheet_print',{model_ref:modelFromUrl().ref});window.print()}
 const ai=e.target.closest('[data-oska-concierge-open-top]');if(ai)emit('ai_open',{path:location.pathname});
 const live=e.target.closest('[data-oska-live-chat-top]');if(live)emit('live_chat_open',{path:location.pathname});
 const wa=e.target.closest('a[href*="wa.me"],a[href*="whatsapp"]');if(wa)emit('whatsapp_click',{path:location.pathname});
 const buyer=e.target.closest('[data-oska-buyer-type]');if(buyer)emit('buyer_type_click',{buyer_type:buyer.dataset.oskaBuyerType||''});
},true);

function buildPrintSpec(){let box=qs('.oska-print-spec');if(!box){box=d.createElement('section');box.className='oska-print-spec';d.body.appendChild(box)}const m=modelFromUrl();const name=qs('#oska-model-name')?.textContent?.trim()||m.ref||'OSKA Model';const tr=(d.documentElement.lang||'').toLowerCase().startsWith('tr');box.innerHTML='';const h=d.createElement('h1');h.textContent=name;box.appendChild(h);const p=d.createElement('p');p.textContent='OSKA · '+(tr?'B2B Teknik Föy':'B2B Spec Sheet');box.appendChild(p);const dl=d.createElement('dl');const rows=[[tr?'Model kodu':'Model code',m.ref||tr?'Talep üzerine':'On request'],[tr?'Koleksiyon':'Collection',m.collection||tr?'Talep üzerine':'On request'],[tr?'Malzeme':'Material',tr?'Proje bazında doğrulanır':'Confirmed per project'],[tr?'Yüzey / taş':'Finish / stones',tr?'Proje bazında doğrulanır':'Confirmed per project'],[tr?'Ölçü / ağırlık':'Dimensions / weight',tr?'Model bazında teklif sırasında doğrulanır':'Confirmed with the model quotation'],[tr?'Özelleştirme':'Customization',tr?'Talep üzerine':'On request']];rows.forEach(([k,v])=>{const dt=d.createElement('dt'),dd=d.createElement('dd');dt.textContent=k;dd.textContent=v;dl.append(dt,dd)});box.appendChild(dl)}
if(location.pathname.includes('/pages/model-detail')){const actions=qs('.oska-pdp__actions')||qs('#oska-rfq-link')?.parentElement;if(actions&&!qs('[data-oska-add-rfq]',actions)){const tools=d.createElement('div');tools.className='oska-model-tools';const add=d.createElement('button');add.type='button';add.dataset.oskaAddRfq='';add.textContent=(d.documentElement.lang||'').startsWith('tr')?'RFQ listesine ekle':'Add to RFQ';const print=d.createElement('button');print.type='button';print.dataset.oskaPrintSpec='';print.textContent=(d.documentElement.lang||'').startsWith('tr')?'Teknik föy':'Spec sheet';tools.append(add,print);actions.appendChild(tools)}emit('model_view',{model_ref:modelFromUrl().ref,collection:modelFromUrl().collection})}

qsa('[data-oska-rfq-wizard]').forEach(w=>{
 const steps=qsa('[data-oska-rfq-step]',w),dots=qsa('[data-oska-rfq-dot]',w);let ix=0;const show=n=>{ix=Math.max(0,Math.min(steps.length-1,n));steps.forEach((s,i)=>s.hidden=i!==ix);dots.forEach((x,i)=>x.classList.toggle('is-active',i<=ix));if(ix===0)emit('rfq_start',{intent:qs('[name="contact[intent]"]',w)?.value||'rfq'})};show(0);
 w.addEventListener('click',e=>{const next=e.target.closest('[data-oska-next]'),back=e.target.closest('[data-oska-back]');if(next){const current=steps[ix];const invalid=qsa('input,select,textarea',current).find(x=>x.required&&!x.checkValidity());if(invalid){invalid.reportValidity();return}show(ix+1)}if(back)show(ix-1)});
 const intent=params.get('intent');if(intent==='sample'){const i=qs('[name="contact[intent]"]',w);if(i)i.value='sample';emit('sample_request_start',{path:location.pathname})}
 const models=qs('[name="contact[selected_models]"]',w);if(models)models.value=getShort().map(i=>i.ref).join(', ');
 w.addEventListener('submit',e=>{const hp=qs('[name="contact[website]"]',w);if(hp&&hp.value){e.preventDefault();return}const now=Date.now(),last=Number(localStorage.getItem(LS.last)||0);if(now-last<8000){e.preventDefault();const msg=qs('[data-oska-form-status]',w);if(msg)msg.textContent=(d.documentElement.lang||'').startsWith('tr')?'Lütfen birkaç saniye sonra tekrar deneyin.':'Please wait a few seconds and try again.';return}localStorage.setItem(LS.last,String(now));const isSample=qs('[name="contact[intent]"]',w)?.value==='sample';emit(isSample?'sample_request_submit':'rfq_submit',{models:getShort().length,source:attr.utm_source||'direct'})})
});

qsa('[data-oska-matcher]').forEach(box=>{const form=qs('form',box),out=qs('[data-oska-matcher-result]',box);form?.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(form),segment=fd.get('segment'),style=fd.get('style'),material=fd.get('material');let path='/pages/collections';if(segment==='men')path=style==='ring'?'/pages/men-rings':style==='necklace'?'/pages/men-necklaces':style==='earring'?'/pages/men-earrings':'/pages/men-bracelets';if(segment==='women')path=style==='ring'?'/pages/women-rings':style==='necklace'?'/pages/women-necklaces':style==='earring'?'/pages/women-earrings':'/pages/women-bracelets';if(out){out.hidden=false;out.innerHTML='';const a=d.createElement('a');a.href=path+'?material='+encodeURIComponent(material||'');a.className='oska-button';a.textContent=(d.documentElement.lang||'').startsWith('tr')?'Önerilen modelleri gör':'View suggested models';out.appendChild(a)}emit('collection_matcher',{segment,style,material})})});
if(location.pathname.includes('materials'))emit('materials_view',{path:location.pathname});
})();

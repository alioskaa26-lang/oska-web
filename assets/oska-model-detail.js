(async () => {
  const root=document.getElementById('oska-model-detail');
  if(!root)return;
  const tr=document.documentElement.lang==='tr';
  const local=path=>(window.OSKA_ROOT||'/').replace(/\/$/,'')+path;
  const text=(id,value)=>document.getElementById(id).textContent=value;
  const link=(id,value)=>document.getElementById(id).href=local(value);
  try {
    const response=await fetch(root.dataset.catalogue);
    if(!response.ok)throw Error('Catalogue unavailable');
    const catalogue=await response.json();
    const params=new URLSearchParams(location.search);
    const model=window.OSKAModelContent.resolve(catalogue,params);
    if(!model)throw Error('Unknown model');
    const name=window.OSKAModelContent.pretty(model.ref);
    text('oska-collection-name',tr?model.collectionTR:model.collection);
    text('oska-model-name',name);
    text('oska-model-ref',model.ref);
    text('oska-model-lead',tr?'Malzeme, taş, ölçü ve yüzey seçenekleri bu referans üzerinden proje bazında değerlendirilir.':'Materials, stones, sizing and finish are reviewed per project against this reference.');
    text('oska-story-text',window.OSKAModelContent.story(model,tr));
    text('oska-editorial-title',tr?model.collectionTR:model.collection);
    text('oska-editorial-text',tr?`${name} için tasarım görüşmesini ${model.ref} referansı ile başlatın. Koleksiyonun diğer referanslarına kategori sayfasından ulaşabilirsiniz.`:`Begin the design discussion for ${name} with reference ${model.ref}. Explore the collection’s other references from its category page.`);
    const back='/pages/'+model.category+'#'+model.anchor;
    link('oska-back-category',back);link('oska-shop-collection',back);
    const query=new URLSearchParams({ref:model.ref,collection:model.collection,category:model.category});
    link('oska-rfq-link','/pages/contact-rfq?'+query);
    link('oska-final-rfq','/pages/contact-rfq?'+query);
    link('oska-whatsapp-link','/pages/contact?'+query);
    for(const id of ['main','detail','macro','lifestyle']){
      const img=document.getElementById('oska-img-'+id);
      img.addEventListener('error',()=>{
        img.closest('figure').hidden=true;
        root.querySelector('.oska-model-gallery-note').textContent=tr?'Bu modelin referans görseli yüklenemedi. Fotoğraf ve numune için ekibimize ulaşın.':'This model’s reference image could not load. Contact our team for photography and samples.';
      },{once:true});
      img.src=model.image;
      img.alt=name+(id==='main'?'':tr?' — aynı referanstan kırpım':' — crop of the same reference');
    }
    const editorial=document.getElementById('oska-editorial-img');editorial.addEventListener('error',()=>{editorial.parentElement.hidden=true},{once:true});editorial.src=model.image;editorial.alt=name;
    root.querySelector('[data-model-loading]').hidden=true;
    root.querySelectorAll('[data-model-content]').forEach(el=>el.hidden=false);
  } catch(error) {
    const state=root.querySelector('[data-model-loading]');
    state.textContent=tr?'Model referansı bulunamadı. Koleksiyonlardan bir model seçin veya ekibimizle iletişime geçin.':'Model reference unavailable. Choose a model from the collections or contact our team.';
    link('oska-back-category','/pages/collections');
  }
})();

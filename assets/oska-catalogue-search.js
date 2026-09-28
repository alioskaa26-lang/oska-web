(async()=>{
  const root=document.getElementById('oska-model-search');
  const query=new URLSearchParams(location.search).get('q')?.trim();
  if(!root||!query)return;
  const tr=document.documentElement.lang==='tr';
  const normalize=value=>value.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
  try{
    const response=await fetch(root.dataset.catalogue);if(!response.ok)throw Error();
    const data=await response.json();const words=normalize(query).split(/\s+/);
    const models=data.filter(m=>words.every(w=>normalize([m.ref,m.collection,m.collectionTR,m.categoryTR,m.categoryEN].join(' ')).includes(w)));
    const title=document.createElement('h2');title.style.gridColumn='1/-1';title.textContent=tr?'Model referansları':'Model references';root.append(title);
    if(!models.length){const empty=document.createElement('p');empty.textContent=tr?'Eşleşen model referansı yok.':'No matching model references.';root.append(empty);}
    for(const model of models){
      const link=document.createElement('a');link.className='oska-card';
      link.href=(window.OSKA_ROOT||'/').replace(/\/$/,'')+'/pages/model-detail?'+new URLSearchParams({ref:model.ref,collection:model.collection,category:model.category});
      const img=document.createElement('img');img.src=model.image;img.alt=model.ref;img.loading='lazy';
      const name=document.createElement('h3');name.textContent=model.collection+' · '+model.ref;
      link.append(img,name);root.append(link);
    }
  }catch(error){const status=document.createElement('p');status.textContent=tr?'Model araması şu anda yüklenemedi. Koleksiyonlar sayfasını kullanın.':'Model search could not load. Please use the collections page.';root.append(status);}
})();

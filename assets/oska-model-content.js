(function (root) {
  const pretty = value => String(value).replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\b(oska|fast|category|women|men|ring|rings|earring|earrings|necklace|necklaces|bracelet|bracelets|clean|v2|v3)\b/gi, '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const motifs = [
    [/panther|panthère/i, 'Panter motifi, bileği izleyen akış ile güçlü bir hayvan figürünü buluşturur.', 'The panther motif brings a strong animal figure into a line that follows the wrist.'],
    [/lion/i, 'Aslan arması, yüzüğün merkezini bir güç ve aidiyet işaretine dönüştürür.', 'The lion crest gives the ring a central emblem of strength and belonging.'],
    [/wolf/i, 'Kurt figürü, yön bulma ve bağımsızlık fikrini takının odağına taşır.', 'The wolf figure places independence and a sense of direction at the centre of the piece.'],
    [/skull/i, 'Kurukafa motifi, hatıra ve zaman temasını keskin bir figür diliyle ele alır.', 'The skull motif explores memory and time through a sharply defined figurative language.'],
    [/serpent/i, 'Yılan motifi, kıvrılan bir çizgiyi koruyucu bir simgeye dönüştürür.', 'The serpent motif turns a curling line into a symbol of protection.'],
    [/valkyrie/i, 'Valkyrie adı, mitolojik bir koruyucunun hareket ve kararlılık fikrini taşır.', 'The Valkyrie name draws on the movement and resolve of a mythic guardian.'],
    [/obsidian|nocturne/i, 'Karanlık ve ışık arasındaki karşıtlık bu tasarımın ifade yönünü belirler.', 'Contrast between darkness and light sets the expressive direction of this design.'],
    [/north.star|celeste|celestial/i, 'Gökyüzü ve yön bulma fikri, kişisel bir işarete dönüşen tasarımın çıkış noktasıdır.', 'The sky and the idea of navigation are the starting points for a design that becomes a personal sign.'],
    [/feather/i, 'Tüy motifi, ince bir çizgide hafiflik ve hareket düşüncesini toplar.', 'The feather motif gathers a sense of lightness and movement into a slender line.'],
    [/malachite/i, 'Malachite ailesi, taş odağını taşıyan bir kolye dili etrafında gelişir.', 'The Malachite family develops around a pendant language with a focus on the stone.'],
    [/legacy|heritage|rosette|medallion/i, 'Madalyon ve miras fikri, küçük bir yüzeyde kişisel anlam taşıma arzusuyla buluşur.', 'The idea of the medallion and of heritage meets the wish to carry personal meaning on a small surface.'],
    [/braided|tressé/i, 'Örgü ritmi, birbirini takip eden çizgilerle bilek çevresinde süreklilik kurar.', 'A braided rhythm uses successive lines to create continuity around the wrist.'],
    [/tennis|spinel|stone.line/i, 'Tekrarlanan odaklar, takı boyunca düzenli bir görsel ritim oluşturur.', 'Repeated focal points establish a measured visual rhythm along the piece.'],
    [/cuff|sculpté|contour/i, 'Kesintisiz kontur ve heykelsi hacim, formun temel tasarım sorusudur.', 'Continuous contour and sculptural volume are the central design questions of the form.'],
    [/link|architectural|plaque/i, 'Birbirini izleyen geometrik parçalar, bütünün ritmini ve hareketini tanımlar.', 'Successive geometric elements define the rhythm and movement of the whole.'],
    [/pave|pavé|halo/i, 'Merkezi çevreleyen ritim, ışığın form üzerindeki yolunu vurgular.', 'A rhythm around the centre emphasizes the path of light across the form.'],
    [/hoop/i, 'Halka formu, açık alan ile metal çizgisi arasındaki dengeyi öne çıkarır.', 'The hoop form highlights the balance between open space and the line of metal.'],
    [/stud/i, 'Kompakt odak, küçük bir ölçekte okunaklı bir karakter kurmayı amaçlar.', 'A compact focal point aims to establish a clear character on a small scale.'],
    [/cross/i, 'Kesişen eksenler, simgenin sade ve okunaklı yapısını belirler.', 'Intersecting axes define the clear, spare structure of the symbol.'],
    [/drop|charm/i, 'Asılı form, hareketle değişen bir siluet için tasarımın merkezine yerleşir.', 'A suspended form centres the design on a silhouette that changes with movement.'],
    [/aurelia/i, 'Aurelia, yumuşak geçişler ile belirgin bir merkez arasındaki dengeyi araştırır.', 'Aurelia explores the balance between gentle transitions and a defined centre.'],
    [/meridian/i, 'Meridian, yön ve eksen fikrini ölçülü bir kompozisyonda ele alır.', 'Meridian considers direction and axis within a measured composition.'],
    [/lumen|lumière/i, 'Lumen ailesinin çıkış noktası ışığın yüzeyde bıraktığı izdir.', 'The starting point of the Lumen family is the trace light leaves on a surface.'],
    [/seraph/i, 'Seraph, yükselen çizgi ve dengeli oran fikrini bir araya getirir.', 'Seraph brings together the idea of an ascending line and balanced proportions.'],
    [/élan/i, 'Élan, hareketin tek bir odakta toplandığı bir tasarım fikridir.', 'Élan is a design idea that concentrates movement in a single focal point.'],
    [/vela/i, 'Vela, bir yelkenin gerilim ve açıklık fikrinden adını alır.', 'Vela takes its name from the tension and openness suggested by a sail.']
  ];
  const categoryFocus = {
    rings: ['Yüzük oranı, el üzerindeki duruş ve kenar konforu numune aşamasında birlikte değerlendirilir.', 'Ring proportions, presence on the hand and edge comfort are considered together during sampling.'],
    bracelets: ['Bilek çevresindeki hareket, bağlantı ve kapanış kararları numune üzerinde değerlendirilir.', 'Movement around the wrist, articulation and closure decisions are evaluated on the sample.'],
    necklaces: ['Kolye uzunluğu, asılı formun dengesi ve zincir bağlantısı proje için birlikte ele alınır.', 'Necklace length, pendant balance and chain attachment are considered together for the project.'],
    earrings: ['Çiftin dengesi, kulaktaki duruşu ve bağlantı biçimi numune üzerinde değerlendirilir.', 'Pair balance, position on the ear and fastening are evaluated on the sample.']
  };
  function story(model, tr) {
    const name = pretty(model.ref), collection = tr ? model.collectionTR : model.collection;
    const category = tr ? model.categoryTR : model.categoryEN;
    const motif = motifs.find(([pattern]) => pattern.test(model.ref + ' ' + collection));
    const focus = categoryFocus[model.category.split('-').pop()][tr ? 0 : 1];
    const opening = tr ? `${collection} koleksiyonundaki ${name}, ${category.toLocaleLowerCase('tr')} seçkisinin ${model.ref} referansıdır.` : `${name} is reference ${model.ref} in ${collection}, part of the ${category.toLowerCase()} selection.`;
    return [opening, motif ? motif[tr ? 1 : 2] : focus, motif ? focus : (tr ? `${collection} için yüzey ve ölçü kararları bu referans görsel üzerinden geliştirilir.` : `Surface and sizing decisions for ${collection} are developed from this reference image.`)].join(' ');
  }
  function resolve(catalogue, params) {
    const ref=(params.get('ref')||'').toUpperCase();
    return catalogue.find(m=>m.ref===ref && m.category===params.get('category') && m.collection===params.get('collection')) || null;
  }
  const api={pretty,story,resolve};
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.OSKAModelContent=api;
})(typeof window==='undefined'?globalThis:window);

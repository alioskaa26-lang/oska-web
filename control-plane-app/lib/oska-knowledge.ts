export type KnowledgeItem = {
  id: string;
  title: string;
  keywords: string[];
  summary: string;
};

export const OSKA_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: "owner-execution-policy",
    title: "OSKA çalışma kuralı — sonuçla gel",
    keywords: ["sonuç","sorun","failover","kredi","kota","quarantine","standby","onay","rahatsız etme","çözüm","araştırma"],
    summary: "ÖNCE ÇÖZ. Sorunu kullanıcıya taşımadan önce güvenli/reversible düzeltmeleri uygula; provider/connector kredi-kota-402-429-auth-timeout-outage hatasında route'u QUARANTINE/STANDBY yap ve sıradaki sağlıklı failover yoluna geç; gerekirse araştırma yap ve çözüm üret. Kullanıcıyı rutin hata, ara durum, çözülebilir blocker, kredi bitişi veya provider arızasıyla rahatsız etme. Yalnız tüm makul çözüm/failover yolları tüketildiğinde ve tek kalan adım gerçekten insan müdahalesi/ödeme/login/2FA/secret/yayın/geri döndürülemez işlem ise kısa net bildir. Kullanıcıya sorunla değil sonuçla gel."
  },
  {
    id: "brand",
    title: "OSKA Silver",
    keywords: ["oska","marka","şirket","silver","kimiz","biz","pozisyon","müşteri"],
    summary: "OSKA Silver, İstanbul merkezli B2B takı üretim ve katalog markasıdır. Modern, unisex ve maskülen çizgi; özellikle 30+ alıcı kitlesi hedeflenir. Altın, 925 gümüş, pirinç/bronz, taşlı ve lab-grown üretim kabiliyeti vardır."
  },
  {
    id: "manufacturing",
    title: "Üretim ve ürünler",
    keywords: ["üretim","ürün","model","bileklik","kolye","yüzük","panther","panter","tennis","chainmail","millemeli","rolex","broş"],
    summary: "Ana ürün yönleri: hareketli millemeli/Rolex tipi bileklikler, tennis, chainmail, çift panter başı, isimli/raylı modeller ve maskülen motifler. Yeni ürünlerde metal yüzey temizliği, doğru taş yuvası ve premium render standardı korunur."
  },
  {
    id: "pricing",
    title: "Fiyatlama",
    keywords: ["fiyat","kaç dolar","pirinç","gümüş","925","maliyet"],
    summary: "Kayıtlı referans fiyatlar: pirinç ürün yaklaşık 50 USD, gümüş ürün yaklaşık 140 USD. Zuma Silver perakende hedef bandı yaklaşık 200 USD'dir. Gerçek teklif ürün ağırlığı, taş, işçilik ve sipariş miktarına göre ayrıca hesaplanmalıdır."
  },
  {
    id: "lead-engine",
    title: "Müşteri avı",
    keywords: ["müşteri","lead","alıcı","buyer","müşteri avı","potansiyel","925","pirinç","bronz","distribütör","wholesale","toptan"],
    summary: "Müşteri avında Türkiye önce gelir, ardından global pazarlar taranır. Güçlü e-ticaret, yüksek perakende fiyat, stok hareketi/replenishment, uluslararası gönderim ve dış tedarik sinyalleri önceliklidir. Kapalıçarşı firmaları ve kayıtlı hariç tutulan firmalar elenir."
  },
  {
    id: "website",
    title: "OSKA web sitesi",
    keywords: ["site","website","shopify","oska silver site","koleksiyon","hero","menü","mobil","seo","rfq"],
    summary: "OSKA sitesi Shopify üzerinde B2B premium katalog/vitrin olarak çalışır; checkout yerine RFQ, WhatsApp ve iletişim akışı kullanılır. TR ve EN aktiftir. Canlı Horizon temasına dokunulmaz; geliştirme OSKA Custom B2B Preview temasında özel önizleme olarak yürütülür."
  },
  {
    id: "website-ux",
    title: "Site deneyimi",
    keywords: ["david yurman","dy","sticky","mega menu","favori","ürün sayfası","panther koleksiyon","panter koleksiyon"],
    summary: "Site deneyimi premium referans mantığında ilerler: Women/Men mega menü, aşağı kaydırmada gizlenip yukarı çıkınca görünen header, ana koleksiyon → alt koleksiyon → model akışı, favori/shortlist → RFQ ve model sayfasında 4 ürün fotoğrafı + 1 manken görseli. Panther koleksiyonunda yalnız panter ürünleri bulunmalıdır."
  },
  {
    id: "zuma",
    title: "Zuma Silver",
    keywords: ["zuma","etsy","perakende","listing","seo","erkek"],
    summary: "Zuma Silver Etsy tarafında perakende markasıdır ve erkek ürünleri önceliklidir. Ürün görsel standardı 4 ana ürün fotoğrafı + 1 manken görselidir. Panther ürünleri isim, hikâye ve SEO anahtar kelimeleriyle yüklenir."
  },
  {
    id: "render",
    title: "CAD ve render",
    keywords: ["cad","render","jcad","stl","slc","taş","metal yüzey","blender","serdar"],
    summary: "CAD/render işlerinde JCAD/STL/SLC dosyaları kullanılabilir. Metal yüzeyler temiz ve düzgün görünmeli, taşlar yuvalarına doğru ölçü ve konumla oturmalı; gümüş/gold/black varyantlar premium ürün görseli kalitesinde hazırlanmalıdır."
  },
  {
    id: "automation",
    title: "OSKA CORE çalışma sistemi",
    keywords: ["ajan","agent","failover","watchdog","worker","7/24","otomasyon","sistem","core","dots"],
    summary: "OSKA CORE 7/24 bulut kontrol düzlemidir. Manager → uzman → verifier düzeni, tek-writer ilkesi, checkpoint/rollback/proof ve provider failover kullanılır. Gerçek müşteriye gönderim, yayın, ödeme veya benzeri dış etkili işlemler insan onayı olmadan yapılmaz."
  },
  {
    id: "failover",
    title: "Sağlayıcı yedekleme",
    keywords: ["provider","sağlayıcı","yedek","failover","hata","kredi","çalışmıyor"],
    summary: "Bir sağlayıcı hata verdiğinde iş diğer uygun sağlayıcıya aktarılır. Sağlayıcı sağlık kayıtları tutulur; başarısız araçların sürekli aynı işi bloke etmesine izin verilmez. Watchdog sıkışmış işleri geri kazanır."
  },
  {
    id: "creative",
    title: "Creative ve hero",
    keywords: ["hero","video","creative","film","atölye","hologram","jarves","jarvis","ai müşteri temsilcisi"],
    summary: "Hero film premium ve sinematik olmalıdır. Atölye videosu hero filmden ayrıdır. OSKA AI/JARVES tarafında küçük bir simgeden büyüyen, hareketli ve holografik hissi veren premium bir asistan deneyimi hedeflenir."
  },
  {
    id: "markets",
    title: "Pazar yönleri",
    keywords: ["uae","dubai","erkek broş","brooch","trend","pazar","global","amerika","avrupa","arap","rusya"],
    summary: "Pazar radarında Türkiye önceliklidir; ardından ABD, Avrupa, Arap ülkeleri ve Rusya izlenir. UAE için görsel olarak büyük fakat hafif 925/vermeil ürünler; erkek aksesuarlarında 25–35 mm pin + pendant çift kullanımlı broş yönü fırsat olarak izlenmektedir."
  }
];

export function normalizeQuestion(value: string) {
  return value.toLocaleLowerCase("tr-TR")
    .replace(/[?.!,;:()[\]{}"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findKnowledge(question: string, limit = 3) {
  const q = normalizeQuestion(question);
  const tokens = new Set(q.split(" ").filter((x) => x.length > 2));
  return OSKA_KNOWLEDGE
    .map((item) => {
      let score = 0;
      for (const keyword of item.keywords) {
        const k = keyword.toLocaleLowerCase("tr-TR");
        if (q.includes(k)) score += k.includes(" ") ? 5 : 3;
        for (const token of k.split(" ")) if (tokens.has(token)) score += 1;
      }
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

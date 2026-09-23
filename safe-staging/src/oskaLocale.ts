export type OskaLang = 'en' | 'tr';

export const OSKA_LOCALE = {
  en: {
    admin: {
      title: 'Visual CMS',
      serverDraft: 'Save server draft',
      publish: 'Publish approved draft',
      signIn: 'Admin sign in',
      signOut: 'Sign out',
      loadPublished: 'Load published version',
      persistenceReady: 'Central persistence connected',
      persistenceLocked: 'Central persistence is locked until an admin allowlist is configured.',
      draftSaved: 'Draft saved centrally.',
      published: 'Approved draft published.',
      failed: 'The change was not saved. Nothing was published.',
    },
    concierge: {
      title: 'OSKA Concierge',
      subtitle: 'Answers are grounded only in verified OSKA content.',
      placeholder: 'Ask about a product, collection or production path',
      send: 'Ask',
      thinking: 'Checking verified OSKA information…',
      fallback: 'That detail is not verified on the site. Please continue with an RFQ so the team can confirm it.',
      rfq: 'Continue with RFQ',
      whatsapp: 'Continue on WhatsApp',
      error: 'The concierge is temporarily unavailable. You can continue with RFQ.',
    },
    rfq: {
      stored: 'Your request was saved successfully for OSKA review.',
      failed: 'Your request could not be saved. Please try again; no success has been recorded.',
      validation: 'Please complete company, a valid email and project message.',
    },
  },
  tr: {
    admin: {
      title: 'Görsel CMS',
      serverDraft: 'Sunucu taslağını kaydet',
      publish: 'Onaylı taslağı yayınla',
      signIn: 'Yönetici girişi',
      signOut: 'Çıkış yap',
      loadPublished: 'Yayındaki sürümü yükle',
      persistenceReady: 'Merkezi kayıt sistemi bağlı',
      persistenceLocked: 'Yönetici izin listesi yapılandırılana kadar merkezi kayıt kilitlidir.',
      draftSaved: 'Taslak merkezi olarak kaydedildi.',
      published: 'Onaylı taslak yayınlandı.',
      failed: 'Değişiklik kaydedilmedi. Hiçbir şey yayınlanmadı.',
    },
    concierge: {
      title: 'OSKA Concierge',
      subtitle: 'Yanıtlar yalnız doğrulanmış OSKA içeriğine dayanır.',
      placeholder: 'Ürün, koleksiyon veya üretim yolu hakkında sor',
      send: 'Sor',
      thinking: 'Doğrulanmış OSKA bilgisi kontrol ediliyor…',
      fallback: 'Bu detay sitede doğrulanmış değil. Ekibin teyit etmesi için RFQ ile devam edin.',
      rfq: 'RFQ ile devam et',
      whatsapp: 'WhatsApp ile devam et',
      error: 'Concierge şu anda kullanılamıyor. RFQ ile devam edebilirsiniz.',
    },
    rfq: {
      stored: 'Talebiniz OSKA incelemesi için başarıyla kaydedildi.',
      failed: 'Talebiniz kaydedilemedi. Lütfen tekrar deneyin; başarı kaydı oluşturulmadı.',
      validation: 'Firma, geçerli e-posta ve proje mesajını tamamlayın.',
    },
  },
} as const;

export function oskaText(lang: OskaLang) {
  return OSKA_LOCALE[lang];
}

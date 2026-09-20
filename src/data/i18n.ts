import type { Lang } from "@/config/site";

/**
 * Every visible string lives here in EN and TR so the interface is never mixed
 * language. Wording is carried over from the live site; new B2B strings use
 * safe, non-committal phrasing ("on request", "confirmed per order").
 */
export const dictionary = {
  en: {
    /* --- chrome --- */
    skip: "Skip to content",
    announcement: "HANDCRAFTED IN ISTANBUL · WHOLESALE & BESPOKE",
    brandName: "OSKA JEWELRY",
    homeAria: "OSKA Jewelry home",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    languageLabel: "Language",
    wholesaleNav: "WHOLESALE INQUIRIES",
    catalogueNav: "REQUEST A CATALOGUE",
    contactNav: "CONTACT",
    collectionsNav: "COLLECTIONS",
    filmsNav: "FILMS",
    atelierNav: "WORLD OF OSKA",
    bespokeNav: "FOR BRANDS",
    aboutNav: "ABOUT",
    faqNav: "FAQ",
    instagramNav: "INSTAGRAM ↗",

    /* --- hero --- */
    heroH1: "OSKA Jewelry — wholesale and bespoke bracelet collections, handcrafted in Istanbul",
    heroPlay: "PLAY FILM",
    heroPause: "PAUSE FILM",
    heroFilmsAria: "OSKA campaign films",
    heroWhiteAlt: "OSKA campaign film on a white background",
    heroDarkAlt: "OSKA campaign film with a model on a dark background",

    /* --- collections --- */
    selection: "THE COLLECTIONS",
    collectionsTitle: "The collections",
    collectionsIntro:
      "Bracelet collections in 925 sterling silver, brass, gold plating and stone-set finishes — available for wholesale, private label and bespoke production.",
    discoverCollection: "DISCOVER THE COLLECTION",
    exploreCollections: "Explore our collections",
    all: "ALL COLLECTIONS",
    models: "designs",
    backHome: "BACK TO HOME",
    viewCollection: "VIEW COLLECTION",
    bracelet: "Bracelet",

    /* --- product detail --- */
    detailCode: "Model code",
    detailType: "Product",
    detailMaterial: "Material options",
    detailMaterialText:
      "925 sterling silver, brass, gold plated, stone setting — confirmed per order.",
    detailSize: "Size & measurements",
    detailSizeText: "Made to your measurements. Confirmed per order.",
    detailMoq: "Minimum order quantity",
    detailMoqText: "Flexible — MOQ on request.",
    detailLead: "Lead time",
    detailLeadText: "On request, confirmed per order.",
    detailOptions: "Production options",
    detailOptionsText: "Materials, finishes and sizing are discussed for your project.",
    inquiryButton: "INQUIRE ABOUT THIS DESIGN",
    inquiryIntro:
      "Send this design straight into a wholesale inquiry, or copy the message and send it on Instagram.",
    inquiryOpenForm: "REQUEST A QUOTE FOR THIS DESIGN",
    inquiryLabel: "Copy your message and send it to us on Instagram.",
    copy: "COPY MESSAGE",
    openInstagram: "OPEN INSTAGRAM ↗",
    copied: "Message copied. You can send it through Instagram.",
    copyFailed: "Select the text and use your device’s Copy command.",
    close: "Close",
    previousImage: "Previous image",
    nextImage: "Next image",
    gallery: "Product gallery",

    /* --- mid editorial --- */
    midEditorialEyebrow: "OSKA · PANTHER",
    midEditorialTitle: "Movement begins with the detail.",
    midEditorialText:
      "Every link is designed for a surface that catches the light and a movement that flows on the wrist. The strong character of the panther heads is completed by stone placement, balanced surfaces and handwork in our Istanbul atelier.",
    midEditorialText2:
      "OSKA collections are prepared with material, plating and sizing options that adapt to your brand’s line. From a design’s first idea to its final detail, we build its character together.",
    midEditorialLink: "LET’S DISCUSS THIS DESIGN",
    midFrame1Alt: "Front view of a gold-toned panther head bracelet",
    midFrame2Alt: "Articulated link detail of the panther bracelet",
    midFrame3Alt: "Stone-set surface and clasp detail of the bracelet",
    playFilm: "PLAY FILM",
    pauseFilm: "PAUSE FILM",

    /* --- Istanbul slideshow --- */
    slideshowEyebrow: "ISTANBUL · GRAND BAZAAR",
    slideshowTitle: "Where craftsmanship leaves its mark.",
    slideshowText:
      "The rhythm of the Grand Bazaar and the handwork of the OSKA atelier carry Istanbul’s character into every collection.",
    slideshowLink: "DISCOVER THE ATELIER",
    slideshowAria: "Istanbul and Grand Bazaar images",
    previous: "Previous",
    next: "Next",
    pause: "PAUSE",
    play: "PLAY",

    /* --- atelier --- */
    atelierEyebrow: "THE ISTANBUL ATELIER",
    atelierTitle: "The art of making.",
    atelierText:
      "At OSKA, design and production come together in our Istanbul atelier. From articulated links to the placement of each stone, craftsmanship gives every piece its character.",
    atelierText2:
      "Working with sterling silver, brass, gold and stone-set designs, we create jewelry collections for brands and retailers.",
    atelierCaption: "A MOMENT IN THE ATELIER · ISTANBUL",
    atelierVideoAria: "Film from the OSKA atelier in Istanbul",
    atelierGallery: "INSIDE THE ATELIER",
    atelierBrand: "OSKA",
    atelierCity: "ISTANBUL",

    /* --- films --- */
    filmEyebrow: "THE FILM LIBRARY",
    filmLibraryTitle: "A closer look.",
    productFilms: "PRODUCT FILMS",
    atelierFilms: "ATELIER FILMS",
    allFilms: "VIEW ALL FILMS",
    filmCategories: "Video categories",

    /* --- bespoke / capabilities --- */
    bespokeEyebrow: "FOR BRANDS & RETAILERS",
    bespokeTitle: "Your vision. Our craftsmanship.",
    bespokeIntro:
      "Choose from our collections or work with us to bring a design of your own to life.",
    service1Title: "Wholesale collections",
    service1Text: "Select designs from the OSKA edit to suit your store and your customers.",
    service2Title: "Made for your brand",
    service2Text: "Let’s shape the design, materials, finishes and proportions around your brand.",
    service3Title: "From idea to collection",
    service3Text:
      "Discuss your gold, silver, brass, diamond and lab-grown diamond jewelry projects with us.",
    trustEyebrow: "OSKA PRODUCTION CAPABILITIES",
    bespokeButton: "LET’S DISCUSS YOUR PROJECT",
    catalogButton: "REQUEST A CATALOGUE",
    capabilityEyebrow: "WHAT WE CAN DO FOR YOUR BRAND",
    capability1: "Handcrafted in Istanbul",
    capability1Note: "Design and production in our own atelier",
    capability2: "Flexible MOQ",
    capability2Note: "MOQ on request",
    capability3: "Custom CAD & 3D development",
    capability3Note: "Available on request",
    capability4: "Private label & bespoke production",
    capability4Note: "Available for brands and retailers",
    capability5: "Worldwide shipping",
    capability5Note: "Available — terms confirmed per order",
    capabilityDisclaimer:
      "Capabilities and availability. Commercial terms, quantities and lead times are confirmed per order.",

    /* --- about --- */
    aboutEyebrow: "ABOUT OSKA",
    aboutTitle: "A wholesale and bespoke jewelry atelier in Istanbul.",
    aboutText1:
      "OSKA designs and produces bracelet collections in its Istanbul atelier, where design and production sit side by side. From articulated links to the placement of each stone, craftsmanship gives every piece its character.",
    aboutText2:
      "We work in 925 sterling silver, brass, gold plating and stone-set designs, producing wholesale collections, private label ranges and bespoke pieces for brands and retailers.",
    aboutText3:
      "Materials, finishes, sizing, quantities and lead times are agreed per project. Tell us what you have in mind and we will confirm the details for your order.",
    aboutPoint1: "Istanbul atelier — design and production together",
    aboutPoint2: "925 sterling silver, brass, gold plating, stone setting",
    aboutPoint3: "Wholesale, private label and bespoke development",
    aboutLink: "SEE PRODUCTION CAPABILITIES",

    /* --- FAQ --- */
    faqEyebrow: "WHOLESALE FAQ",
    faqTitle: "Questions before you order.",
    faqIntro:
      "Where a detail depends on your project, we confirm it per order rather than publishing a fixed figure.",
    faq: [
      {
        q: "How does the wholesale process work?",
        a: "Send us a request with your designs of interest, materials and estimated quantity. We reply with availability, options and a quotation, then confirm production details before your order starts.",
      },
      {
        q: "What is the minimum order quantity?",
        a: "MOQ is flexible and confirmed on request — it depends on the design, material and finish. Tell us your estimated quantity in the inquiry form and we will confirm what is possible.",
      },
      {
        q: "Can you produce a bespoke design for my brand?",
        a: "Yes. We develop designs for brands and retailers, including private label ranges. Share references, sketches or a brief and we will discuss materials, finishes, proportions and CAD/3D development.",
      },
      {
        q: "Which materials do you work with?",
        a: "925 sterling silver, brass, gold plating and stone-set designs. Gold, diamond and lab-grown diamond projects can also be discussed.",
      },
      {
        q: "Can I order samples?",
        a: "Samples are available on request. Terms and timing are confirmed per order.",
      },
      {
        q: "How do I request the catalogue?",
        a: "Use the Request a Catalogue button with your business email and company name. We will follow up with the current collection material.",
      },
      {
        q: "Do you ship worldwide?",
        a: "Worldwide shipping is available. Carrier, cost and delivery terms are confirmed per order.",
      },
      {
        q: "What are your lead times?",
        a: "Lead time depends on the design, quantity and finish, so it is confirmed per order once your specification is agreed.",
      },
    ],

    /* --- contact / RFQ --- */
    contactEyebrow: "LET’S CREATE TOGETHER",
    contactTitle: "Let’s create your next collection.",
    contactText:
      "Get in touch with OSKA for wholesale orders, bespoke designs and manufacturing inquiries.",
    contactButton: "CONTACT US ON INSTAGRAM",
    contactChannels: "Contact options",
    contactWhatsapp: "MESSAGE US ON WHATSAPP",
    contactEmail: "EMAIL US",
    contactPhone: "CALL US",
    contactPending:
      "Direct email and WhatsApp will appear here as soon as the business number and address are configured. Until then, use the inquiry form below or Instagram.",
    rfqEyebrow: "WHOLESALE INQUIRY",
    rfqTitle: "Request a quotation.",
    rfqIntro:
      "Tell us about your project and we will come back with options, availability and a quotation.",
    fieldName: "Full name",
    fieldCompany: "Company",
    fieldEmail: "Business email",
    fieldCountry: "Country",
    fieldMaterial: "Material preference",
    fieldQuantity: "Estimated order quantity",
    fieldMessage: "Message / notes",
    fieldDesign: "Design of interest",
    optional: "optional",
    required: "required",
    selectPlaceholder: "Select an option",
    materialSilver: "925 Sterling Silver",
    materialBrass: "Brass",
    materialGold: "Gold Plated",
    materialStone: "Stone Setting",
    materialUndecided: "Not decided yet",
    submitRfq: "SEND INQUIRY",
    submitting: "SENDING…",
    rfqSuccess:
      "Thank you — your inquiry has been recorded. Our team will reply to your business email.",
    rfqPending:
      "Your inquiry has been recorded in this staging site, but automatic delivery is not connected yet. Please also reach us on Instagram so nothing is missed.",
    rfqError: "We couldn’t record your inquiry. Please check the form and try again.",
    quantityHint: "For example: 50 pieces, or a range per design.",
    messageHint:
      "Materials, finishes, sizes, delivery country, timing — anything that helps us quote.",

    /* --- catalogue modal --- */
    catalogueTitle: "Request the OSKA catalogue",
    catalogueIntro:
      "Leave your business email and company name and we will send the current collection material.",
    catalogueSubmit: "REQUEST CATALOGUE",
    catalogueSuccess:
      "Thank you — your catalogue request has been recorded. We will reply to your business email.",
    cataloguePending:
      "Your request has been recorded in this staging site. Catalogue delivery is not connected yet, so we will follow up manually.",
    catalogueError: "We couldn’t record your request. Please check your details and try again.",
    catalogueDownload: "DOWNLOAD THE CATALOGUE",

    /* --- validation --- */
    errRequired: "This field is required.",
    errEmail: "Enter a valid business email address.",
    errConsentless: "Please complete the form fields.",

    /* --- footer --- */
    footerText: "Designed in Istanbul.\nCrafted with care.",
    footerB2B: "WHOLESALE COLLECTIONS & BESPOKE",
    footerBusiness: "BUSINESS",
    footerExplore: "EXPLORE",
    footerContactTitle: "CONTACT",
    footerSocial: "SOCIAL",
    footerLinkedinPending: "LinkedIn — available once the company page is supplied",
    footerEmailPending: "Business email — to be configured",
    footerWhatsappPending: "WhatsApp — to be configured",
    copyright: "© 2026 OSKA Jewelry",
    backTop: "BACK TO TOP ↑",

    /* --- misc --- */
    onRequest: "On request",
    confirmedPerOrder: "Confirmed per order",
    noscript:
      "This site works without JavaScript for reading. For wholesale inquiries, contact us on Instagram at @oskasilver.",
    notFoundTitle: "Page not found",

    /* --- about page --- */
    aboutIntro:
      "OSKA is a jewelry manufacturing atelier in Istanbul, working with brands and retailers on wholesale collections, private label ranges and bespoke development.",
    aboutAtelierTitle: "The atelier",
    aboutAtelierText:
      "Design and production sit side by side in Istanbul, in the Grand Bazaar jewelry district. Models are developed, produced, set and finished within the same workflow, so specifications stay consistent from sample to production.",
    aboutMaterialsTitle: "Materials and techniques",
    aboutMaterialsText:
      "We work in 925 sterling silver, brass and bronze, with gold and gold plating, stone setting, CAD and 3D development, casting, plating and finishing, quality control and export packaging.",
    aboutPartnersTitle: "Working with brands",
    aboutPartnersText:
      "Projects run from brief to CAD, sample, approval, production, quality control and packaging. Commercial details such as quantities, timing and terms are confirmed per project rather than published as fixed figures.",

    /* --- contact details --- */
    contactCity: "Istanbul, Türkiye",
    contactEmailLabel: "Business email",
    contactWhatsappCta: "MESSAGE US ON WHATSAPP",

    /* --- films --- */
    filmsIntro: "Films from the atelier and the collections, shown without sound.",

    /* --- product / collection detail --- */
    galleryTitle: "Gallery",
    relatedTitle: "Related pieces",
    collectionRef: "Collection reference",
    perOrder: "Confirmed per order",
    specType: "Type",
    specFinish: "Finish",
    specMaterials: "Materials",
    specMaterialsValue: "925 sterling silver, brass, gold plating — confirmed per order",
    specSize: "Size",
    specMoq: "Minimum order quantity",
    specLeadTime: "Lead time",
    specRef: "Model reference",
    specDisclaimer:
      "Quantities, sizing and timing are confirmed per order once your specification is agreed.",

    /* --- wholesale / process --- */
    wholesaleEyebrow: "FOR BRANDS & RETAILERS",
    wholesaleTitle: "Wholesale and private label production.",
    wholesaleIntro:
      "Share your project and we will discuss designs, materials, finishes and the production route. Commercial terms are confirmed per order.",
    processTitle: "How a project runs",
    step1Title: "Brief and design",
    step1Text:
      "You share references, sketches or an existing model. We review materials, finishes and proportions together.",
    step2Title: "CAD and sample",
    step2Text:
      "The model is developed in CAD or adapted from the archive, then produced as a sample for your approval.",
    step3Title: "Production",
    step3Text: "After approval the run is produced, set and finished in the Istanbul atelier.",
    step4Title: "Quality control and packaging",
    step4Text:
      "Pieces are checked, finished and packed for export. Timing and logistics are confirmed per order.",

    /* --- SEO --- */
    seoHomeTitle: "OSKA — Jewelry Manufacturing Atelier in Istanbul",
    seoHomeDescription:
      "OSKA is an Istanbul jewelry manufacturing atelier for wholesale collections, private label and bespoke development in 925 sterling silver, brass and gold plating.",
    seoCollectionsTitle: "Collections — OSKA",
    seoCollectionsDescription:
      "Browse OSKA collections developed in the Istanbul atelier for wholesale and private label partners.",
    seoCollectionSuffix: "Collection — OSKA",
    seoCollectionDescription:
      "Models from this OSKA collection, available for wholesale and private label production. Details confirmed per order.",
    seoProductSuffix: "OSKA",
    seoAboutTitle: "About — OSKA Jewelry Manufacturing Atelier",
    seoAboutDescription:
      "Who we are: an Istanbul jewelry manufacturing atelier working with brands and retailers on wholesale, private label and bespoke production.",
    seoAtelierTitle: "The Atelier — OSKA",
    seoAtelierDescription:
      "Inside the OSKA atelier in Istanbul: design, production, stone setting and finishing under one workflow.",
    seoContactTitle: "Contact — OSKA",
    seoContactDescription:
      "Contact OSKA for wholesale, private label and bespoke jewelry manufacturing inquiries.",
    seoFaqTitle: "Wholesale FAQ — OSKA",
    seoFaqDescription:
      "Answers about the OSKA wholesale process, bespoke development, materials, samples and catalogue requests.",
    seoFilmsTitle: "Films — OSKA",
    seoFilmsDescription: "Films from the OSKA atelier and collections in Istanbul.",
    seoWholesaleTitle: "Wholesale & Private Label — OSKA",
    seoWholesaleDescription:
      "Start a wholesale, private label or bespoke jewelry project with the OSKA atelier in Istanbul.",
  },

  tr: {
    skip: "İçeriğe geç",
    announcement: "İSTANBUL'DAN EL İŞÇİLİĞİ · TOPTAN & ÖZEL ÜRETİM",
    brandName: "OSKA JEWELRY",
    homeAria: "OSKA Jewelry ana sayfa",
    menuOpen: "Menüyü aç",
    menuClose: "Menüyü kapat",
    languageLabel: "Dil",
    wholesaleNav: "TOPTAN TALEPLERİ",
    catalogueNav: "KATALOG TALEP ET",
    contactNav: "İLETİŞİM",
    collectionsNav: "KOLEKSİYONLAR",
    filmsNav: "VİDEOLAR",
    atelierNav: "OSKA DÜNYASI",
    bespokeNav: "MARKALAR İÇİN",
    aboutNav: "HAKKIMIZDA",
    faqNav: "SIKÇA SORULANLAR",
    instagramNav: "INSTAGRAM ↗",

    heroH1:
      "OSKA Jewelry — İstanbul'da el işçiliğiyle üretilen toptan ve özel üretim bileklik koleksiyonları",
    heroPlay: "VİDEOYU OYNAT",
    heroPause: "VİDEOYU DURDUR",
    heroFilmsAria: "OSKA kampanya videoları",
    heroWhiteAlt: "Beyaz zeminde OSKA kampanya videosu",
    heroDarkAlt: "Koyu zeminde manken ile OSKA kampanya videosu",

    selection: "KOLEKSİYONLAR",
    collectionsTitle: "Koleksiyonlar",
    collectionsIntro:
      "925 gümüş, pirinç, altın kaplama ve taşlı yüzeylerle üretilen bileklik koleksiyonları — toptan, private label ve özel üretim için.",
    discoverCollection: "KOLEKSİYONU KEŞFET",
    exploreCollections: "Koleksiyonlarımızı keşfedin",
    all: "TÜM KOLEKSİYONLAR",
    models: "model",
    backHome: "ANA SAYFAYA DÖN",
    viewCollection: "KOLEKSİYONU GÖR",
    bracelet: "Bileklik",

    detailCode: "Model kodu",
    detailType: "Ürün",
    detailMaterial: "Malzeme seçenekleri",
    detailMaterialText:
      "925 gümüş, pirinç, altın kaplama, taş işçiliği — siparişe göre teyit edilir.",
    detailSize: "Ölçü ve boyut",
    detailSizeText: "Ölçünüze göre üretilir. Siparişe göre teyit edilir.",
    detailMoq: "Minimum sipariş adedi",
    detailMoqText: "Esnek — talep üzerine belirlenir.",
    detailLead: "Üretim süresi",
    detailLeadText: "Talep üzerine, siparişe göre teyit edilir.",
    detailOptions: "Üretim seçenekleri",
    detailOptionsText: "Malzeme, kaplama ve ölçü talebinize göre değerlendirilir.",
    inquiryButton: "BU MODEL İÇİN TEKLİF İSTE",
    inquiryIntro:
      "Bu modeli doğrudan toptan talebine ekleyin veya mesajı kopyalayıp Instagram'dan iletin.",
    inquiryOpenForm: "BU MODEL İÇİN TEKLİF FORMU",
    inquiryLabel: "Mesajınızı kopyalayıp Instagram'dan bize iletebilirsiniz.",
    copy: "MESAJI KOPYALA",
    openInstagram: "INSTAGRAM'I AÇ ↗",
    copied: "Mesaj kopyalandı. Instagram üzerinden iletebilirsiniz.",
    copyFailed: "Metni seçip cihazınızın Kopyala komutunu kullanabilirsiniz.",
    close: "Kapat",
    previousImage: "Önceki görsel",
    nextImage: "Sonraki görsel",
    gallery: "Ürün galerisi",

    midEditorialEyebrow: "OSKA · PANTER",
    midEditorialTitle: "Hareket, detayla başlar.",
    midEditorialText:
      "Her halka, ışığı yakalayan bir yüzey ve bilekte akış sağlayan bir hareket için tasarlanır. Panter başlarının güçlü karakteri; taşların yerleşimi, yüzeylerin dengesi ve İstanbul atölyesindeki el işçiliğiyle tamamlanır.",
    midEditorialText2:
      "OSKA koleksiyonları, markanızın çizgisine uyarlanabilen malzeme, kaplama ve ölçü seçenekleriyle hazırlanır. Bir tasarımın ilk fikrinden son detayına kadar, karakterini birlikte kurarız.",
    midEditorialLink: "BU MODELİ KONUŞALIM",
    midFrame1Alt: "Altın panter başlı bilekliğin önden görünümü",
    midFrame2Alt: "Panter bilekliğin hareketli örgü detayları",
    midFrame3Alt: "Bilekliğin taşlı yüzeyi ve kilit detayı",
    playFilm: "VİDEOYU OYNAT",
    pauseFilm: "VİDEOYU DURDUR",

    slideshowEyebrow: "İSTANBUL · KAPALIÇARŞI",
    slideshowTitle: "İşçiliğin iz bıraktığı yer.",
    slideshowText:
      "Kapalıçarşı'nın ritmi ve OSKA atölyesinin el işçiliği, her koleksiyona İstanbul'un karakterini taşır.",
    slideshowLink: "ATÖLYEYİ KEŞFET",
    slideshowAria: "İstanbul ve Kapalıçarşı görselleri",
    previous: "Önceki",
    next: "Sonraki",
    pause: "DURDUR",
    play: "OYNAT",

    atelierEyebrow: "İSTANBUL ATÖLYESİ",
    atelierTitle: "Üretmenin sanatı.",
    atelierText:
      "OSKA, İstanbul'da tasarım ve üretimi aynı atölyede buluşturur. Hareketli örgü yapısından taşların yerleşimine, her parçanın karakterini işçilik belirler.",
    atelierText2:
      "925 gümüş, pirinç ve altından taşlı tasarımlara uzanan üretimimizle, markalar ve mağazalar için koleksiyonlar hazırlıyoruz.",
    atelierCaption: "ATÖLYEDEN BİR AN · İSTANBUL",
    atelierVideoAria: "İstanbul'daki OSKA atölyesinden video",
    atelierGallery: "ATÖLYEYİ YAKINDAN GÖR",
    atelierBrand: "OSKA",
    atelierCity: "İSTANBUL",

    filmEyebrow: "VİDEO ARŞİVİ",
    filmLibraryTitle: "Daha yakından.",
    productFilms: "ÜRÜN VİDEOLARI",
    atelierFilms: "ATÖLYE VİDEOLARI",
    allFilms: "TÜM VİDEOLARI GÖR",
    filmCategories: "Video kategorileri",

    bespokeEyebrow: "MARKALARA & MAĞAZALARA ÖZEL",
    bespokeTitle: "Sizin vizyonunuz. Bizim işçiliğimiz.",
    bespokeIntro:
      "Hazır koleksiyonlarımızdan seçim yapın veya markanıza özel bir tasarımı birlikte hayata geçirelim.",
    service1Title: "Toptan koleksiyon",
    service1Text: "Mağazanıza ve müşteri kitlenize uygun modelleri OSKA seçkisinden belirleyin.",
    service2Title: "Markanıza özel üretim",
    service2Text:
      "Tasarım, malzeme, kaplama ve ölçü detaylarını markanızın kimliğine göre planlayalım.",
    service3Title: "Fikirden koleksiyona",
    service3Text:
      "Altın, gümüş, pirinç, pırlanta ve laboratuvar üretimi pırlanta projelerinizi birlikte değerlendirelim.",
    trustEyebrow: "OSKA ÜRETİM İMKÂNLARI",
    bespokeButton: "PROJENİZİ KONUŞALIM",
    catalogButton: "KATALOG TALEP ET",
    capabilityEyebrow: "MARKANIZ İÇİN NELER YAPABİLİRİZ",
    capability1: "İstanbul'da el işçiliği",
    capability1Note: "Tasarım ve üretim kendi atölyemizde",
    capability2: "Esnek minimum sipariş",
    capability2Note: "Talep üzerine belirlenir",
    capability3: "Özel CAD & 3D geliştirme",
    capability3Note: "Talep üzerine mevcut",
    capability4: "Private label & özel üretim",
    capability4Note: "Markalar ve mağazalar için mevcut",
    capability5: "Dünya genelinde gönderim",
    capability5Note: "Mevcut — koşullar siparişe göre teyit edilir",
    capabilityDisclaimer:
      "Üretim imkânları ve mevcudiyet bilgisidir. Ticari koşullar, adetler ve süreler siparişe göre teyit edilir.",

    aboutEyebrow: "OSKA HAKKINDA",
    aboutTitle: "İstanbul'da toptan ve özel üretim yapan bir takı atölyesi.",
    aboutText1:
      "OSKA, tasarım ve üretimin bir arada olduğu İstanbul atölyesinde bileklik koleksiyonları tasarlar ve üretir. Hareketli örgü yapısından taşların yerleşimine kadar her parçanın karakterini işçilik belirler.",
    aboutText2:
      "925 gümüş, pirinç, altın kaplama ve taşlı tasarımlarla çalışıyor; markalar ve mağazalar için toptan koleksiyonlar, private label seriler ve özel üretim parçalar hazırlıyoruz.",
    aboutText3:
      "Malzeme, kaplama, ölçü, adet ve üretim süresi projeye göre belirlenir. Aklınızdakini paylaşın, siparişinize göre detayları teyit edelim.",
    aboutPoint1: "İstanbul atölyesi — tasarım ve üretim bir arada",
    aboutPoint2: "925 gümüş, pirinç, altın kaplama, taş işçiliği",
    aboutPoint3: "Toptan, private label ve özel üretim geliştirme",
    aboutLink: "ÜRETİM İMKÂNLARINI GÖR",

    faqEyebrow: "TOPTAN SIKÇA SORULANLAR",
    faqTitle: "Sipariş öncesi sorular.",
    faqIntro:
      "Projeye göre değişen detayları sabit bir değer olarak yayınlamak yerine siparişe göre teyit ediyoruz.",
    faq: [
      {
        q: "Toptan süreç nasıl işliyor?",
        a: "İlgilendiğiniz modeller, malzeme ve tahmini adetle birlikte talebinizi iletin. Mevcudiyet, seçenekler ve fiyat teklifiyle dönüş yapar, üretim detaylarını sipariş başlamadan önce teyit ederiz.",
      },
      {
        q: "Minimum sipariş adedi nedir?",
        a: "Minimum adet esnektir ve talep üzerine belirlenir; modele, malzemeye ve kaplamaya göre değişir. Formda tahmini adedinizi belirtin, mümkün olanı teyit edelim.",
      },
      {
        q: "Markama özel tasarım üretiyor musunuz?",
        a: "Evet. Markalar ve mağazalar için private label dâhil tasarım geliştiriyoruz. Referans, çizim veya brief paylaşın; malzeme, kaplama, oran ve CAD/3D geliştirmeyi birlikte değerlendirelim.",
      },
      {
        q: "Hangi malzemelerle çalışıyorsunuz?",
        a: "925 gümüş, pirinç, altın kaplama ve taşlı tasarımlar. Altın, pırlanta ve laboratuvar üretimi pırlanta projeleri de görüşülebilir.",
      },
      {
        q: "Numune sipariş edebilir miyim?",
        a: "Numune talep üzerine mümkündür. Koşullar ve süre siparişe göre teyit edilir.",
      },
      {
        q: "Kataloğu nasıl talep ederim?",
        a: "Katalog Talep Et butonundan kurumsal e-postanız ve firma adınızla talep oluşturun. Güncel koleksiyon materyaliyle dönüş yaparız.",
      },
      {
        q: "Dünya genelinde gönderim yapıyor musunuz?",
        a: "Dünya genelinde gönderim mevcuttur. Kargo, maliyet ve teslim koşulları siparişe göre teyit edilir.",
      },
      {
        q: "Üretim süreniz nedir?",
        a: "Üretim süresi modele, adete ve kaplamaya göre değişir; bu nedenle şartname netleştiğinde siparişe göre teyit edilir.",
      },
    ],

    contactEyebrow: "BİRLİKTE ÜRETELİM",
    contactTitle: "Bir koleksiyonla başlayalım.",
    contactText:
      "Toptan siparişler, özel tasarımlar ve üretim talepleriniz için OSKA ile iletişime geçin.",
    contactButton: "INSTAGRAM'DAN İLETİŞİME GEÇ",
    contactChannels: "İletişim seçenekleri",
    contactWhatsapp: "WHATSAPP'TAN YAZIN",
    contactEmail: "E-POSTA GÖNDERİN",
    contactPhone: "BİZİ ARAYIN",
    contactPending:
      "Kurumsal e-posta ve WhatsApp numarası tanımlandığı anda burada görünecek. O zamana kadar aşağıdaki formu veya Instagram'ı kullanabilirsiniz.",
    rfqEyebrow: "TOPTAN TALEBİ",
    rfqTitle: "Teklif isteyin.",
    rfqIntro: "Projenizi anlatın; seçenekler, mevcudiyet ve fiyat teklifiyle dönüş yapalım.",
    fieldName: "Ad soyad",
    fieldCompany: "Firma",
    fieldEmail: "Kurumsal e-posta",
    fieldCountry: "Ülke",
    fieldMaterial: "Malzeme tercihi",
    fieldQuantity: "Tahmini sipariş adedi",
    fieldMessage: "Mesaj / notlar",
    fieldDesign: "İlgilenilen model",
    optional: "isteğe bağlı",
    required: "zorunlu",
    selectPlaceholder: "Bir seçenek seçin",
    materialSilver: "925 Gümüş",
    materialBrass: "Pirinç",
    materialGold: "Altın Kaplama",
    materialStone: "Taş İşçiliği",
    materialUndecided: "Henüz belirlenmedi",
    submitRfq: "TALEBİ GÖNDER",
    submitting: "GÖNDERİLİYOR…",
    rfqSuccess: "Teşekkürler — talebiniz kaydedildi. Ekibimiz kurumsal e-postanıza dönüş yapacak.",
    rfqPending:
      "Talebiniz bu hazırlık sitesinde kaydedildi, ancak otomatik iletim henüz bağlı değil. Gözden kaçmaması için Instagram'dan da yazabilirsiniz.",
    rfqError: "Talebinizi kaydedemedik. Formu kontrol edip tekrar deneyin.",
    quantityHint: "Örnek: 50 adet veya model başına bir aralık.",
    messageHint:
      "Malzeme, kaplama, ölçü, teslim ülkesi, zamanlama — teklif için yardımcı olacak her detay.",

    catalogueTitle: "OSKA kataloğunu talep edin",
    catalogueIntro:
      "Kurumsal e-postanızı ve firma adınızı bırakın; güncel koleksiyon materyalini paylaşalım.",
    catalogueSubmit: "KATALOG TALEP ET",
    catalogueSuccess:
      "Teşekkürler — katalog talebiniz kaydedildi. Kurumsal e-postanıza dönüş yapacağız.",
    cataloguePending:
      "Talebiniz bu hazırlık sitesinde kaydedildi. Katalog gönderimi henüz bağlı olmadığı için dönüşü elle yapacağız.",
    catalogueError: "Talebinizi kaydedemedik. Bilgilerinizi kontrol edip tekrar deneyin.",
    catalogueDownload: "KATALOĞU İNDİR",

    errRequired: "Bu alan zorunludur.",
    errEmail: "Geçerli bir kurumsal e-posta adresi girin.",
    errConsentless: "Lütfen form alanlarını doldurun.",

    footerText: "İstanbul'da tasarlanır.\nÖzenle üretilir.",
    footerB2B: "TOPTAN KOLEKSİYON & ÖZEL ÜRETİM",
    footerBusiness: "KURUMSAL",
    footerExplore: "KEŞFET",
    footerContactTitle: "İLETİŞİM",
    footerSocial: "SOSYAL MEDYA",
    footerLinkedinPending: "LinkedIn — şirket sayfası iletildiğinde eklenecek",
    footerEmailPending: "Kurumsal e-posta — tanımlanacak",
    footerWhatsappPending: "WhatsApp — tanımlanacak",
    copyright: "© 2026 OSKA Jewelry",
    backTop: "BAŞA DÖN ↑",

    onRequest: "Talep üzerine",
    confirmedPerOrder: "Siparişe göre teyit edilir",
    noscript:
      "Bu site JavaScript olmadan da okunabilir. Toptan talepleriniz için Instagram'dan @oskasilver hesabına yazabilirsiniz.",
    notFoundTitle: "Sayfa bulunamadı",

    aboutIntro:
      "OSKA, markalar ve mağazalarla toptan koleksiyon, private label ve özel üretim geliştirme üzerine çalışan bir İstanbul mücevher üretim atölyesidir.",
    aboutAtelierTitle: "Atölye",
    aboutAtelierText:
      "Tasarım ve üretim İstanbul'da, Kapalıçarşı kuyumculuk bölgesinde yan yana yürür. Modeller aynı akış içinde geliştirilir, üretilir, taşı işlenir ve bitirilir; böylece şartname numuneden üretime kadar tutarlı kalır.",
    aboutMaterialsTitle: "Malzemeler ve teknikler",
    aboutMaterialsText:
      "925 gümüş, pirinç ve bronz; altın ve altın kaplama, taş işçiliği, CAD ve 3D geliştirme, döküm, kaplama ve bitirme, kalite kontrol ve ihracat paketleme ile çalışıyoruz.",
    aboutPartnersTitle: "Markalarla çalışmak",
    aboutPartnersText:
      "Projeler brief, CAD, numune, onay, üretim, kalite kontrol ve paketleme adımlarıyla yürür. Adet, süre ve ticari koşullar sabit değer olarak yayınlanmaz; projeye göre teyit edilir.",

    contactCity: "İstanbul, Türkiye",
    contactEmailLabel: "Kurumsal e-posta",
    contactWhatsappCta: "WHATSAPP'TAN YAZIN",

    filmsIntro: "Atölyeden ve koleksiyonlardan filmler, sessiz olarak oynatılır.",

    galleryTitle: "Galeri",
    relatedTitle: "Benzer modeller",
    collectionRef: "Koleksiyon kodu",
    perOrder: "Siparişe göre teyit edilir",
    specType: "Tür",
    specFinish: "Kaplama",
    specMaterials: "Malzemeler",
    specMaterialsValue: "925 gümüş, pirinç, altın kaplama — siparişe göre teyit edilir",
    specSize: "Ölçü",
    specMoq: "Minimum sipariş adedi",
    specLeadTime: "Üretim süresi",
    specRef: "Model kodu",
    specDisclaimer: "Adet, ölçü ve süre, şartname netleştiğinde siparişe göre teyit edilir.",

    wholesaleEyebrow: "MARKALAR VE MAĞAZALAR İÇİN",
    wholesaleTitle: "Toptan ve private label üretim.",
    wholesaleIntro:
      "Projenizi paylaşın; modelleri, malzemeleri, kaplamaları ve üretim yolunu birlikte değerlendirelim. Ticari koşullar siparişe göre teyit edilir.",
    processTitle: "Bir proje nasıl yürür",
    step1Title: "Brief ve tasarım",
    step1Text:
      "Referans, çizim veya mevcut bir modeli paylaşırsınız. Malzeme, kaplama ve oranları birlikte gözden geçiririz.",
    step2Title: "CAD ve numune",
    step2Text:
      "Model CAD'de geliştirilir veya arşivden uyarlanır, ardından onayınız için numune üretilir.",
    step3Title: "Üretim",
    step3Text: "Onaydan sonra üretim İstanbul atölyesinde yapılır, taşı işlenir ve bitirilir.",
    step4Title: "Kalite kontrol ve paketleme",
    step4Text:
      "Parçalar kontrol edilir, bitirilir ve ihracat için paketlenir. Süre ve lojistik siparişe göre teyit edilir.",

    seoHomeTitle: "OSKA — İstanbul Mücevher Üretim Atölyesi",
    seoHomeDescription:
      "OSKA; 925 gümüş, pirinç ve altın kaplama ile toptan koleksiyon, private label ve özel üretim yapan bir İstanbul mücevher üretim atölyesidir.",
    seoCollectionsTitle: "Koleksiyonlar — OSKA",
    seoCollectionsDescription:
      "Toptan ve private label iş ortakları için İstanbul atölyesinde geliştirilen OSKA koleksiyonlarını inceleyin.",
    seoCollectionSuffix: "Koleksiyonu — OSKA",
    seoCollectionDescription:
      "Bu OSKA koleksiyonundaki modeller toptan ve private label üretime uygundur. Detaylar siparişe göre teyit edilir.",
    seoProductSuffix: "OSKA",
    seoAboutTitle: "Hakkımızda — OSKA Mücevher Üretim Atölyesi",
    seoAboutDescription:
      "Markalar ve mağazalarla toptan, private label ve özel üretim yapan İstanbul merkezli mücevher üretim atölyesi.",
    seoAtelierTitle: "Atölye — OSKA",
    seoAtelierDescription:
      "İstanbul'daki OSKA atölyesinde tasarım, üretim, taş işçiliği ve bitirme aynı akış içinde yürür.",
    seoContactTitle: "İletişim — OSKA",
    seoContactDescription:
      "Toptan, private label ve özel üretim talepleri için OSKA ile iletişime geçin.",
    seoFaqTitle: "Toptan Sıkça Sorulanlar — OSKA",
    seoFaqDescription:
      "OSKA toptan süreci, özel tasarım geliştirme, malzemeler, numune ve katalog talebi hakkında yanıtlar.",
    seoFilmsTitle: "Filmler — OSKA",
    seoFilmsDescription: "İstanbul'daki OSKA atölyesinden ve koleksiyonlarından filmler.",
    seoWholesaleTitle: "Toptan & Private Label — OSKA",
    seoWholesaleDescription:
      "İstanbul'daki OSKA atölyesiyle toptan, private label veya özel üretim projenizi başlatın.",
  },
} as const;

export type Dict = (typeof dictionary)["en"];

export function t(lang: Lang): Dict {
  return (dictionary[lang] ?? dictionary.en) as Dict;
}

export type FaqItem = { q: string; a: string };

/** FAQ entries for the active language, typed for rendering and FAQPage schema. */
export function faqItems(lang: Lang): FaqItem[] {
  return t(lang).faq.map((item) => ({ q: item.q, a: item.a }));
}
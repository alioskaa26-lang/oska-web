# OSKA Control Plane v1.1 — Railway

Shopify storefront'tan tamamen ayrı çalışan kontrol düzlemidir.

## Runtime
- Railway API/dashboard service
- Railway continuous worker
- Railway 5-minute watchdog cron
- Railway private PostgreSQL

## Güvenilirlik kuralları
1. Postgres tek gerçek durum kaynağıdır.
2. Worker görevleri FOR UPDATE SKIP LOCKED ile atomik claim eder.
3. Aynı jobId idempotenttir.
4. Provider hatasında sıralı failover yapılır.
5. Her provider sonucu bağımsız verifier'dan geçer.
6. Geçici hata retry + exponential backoff alır.
7. Max deneme sonrası dead-letter olur.
8. 15 dakikadan eski running lock watchdog tarafından kurtarılır.
9. E-posta / WhatsApp outbound yalnız Human Approval=approved olduğunda çalışır.
10. Shopify publish, ödeme, DNS, 2FA ve geri döndürülemez işlemler otomatik yetki dışındadır.

## Job tipleri
- system_canary
- lead_discovery
- lead_verify
- contact_enrich
- outbound_email
- outbound_whatsapp

## Gerekli environment variables
- DATABASE_URL
- OSKA_PROVIDERS
- OSKA_AGENT_DISPATCH_URL
- OSKA_VERIFIER_URL
- OSKA_OUTBOUND_URL

Provider endpointleri bağlanmadan sistem altyapı canary'si çalışır; gerçek lead işleri ready sayılmaz.

# OSKA OWNER EXECUTION POLICY — RESULT FIRST

ÖNCE ÇÖZ. Sorunu kullanıcıya taşımadan önce güvenli/reversible düzeltmeleri uygula; provider/connector kredi-kota-402-429-auth-timeout-outage hatasında route'u QUARANTINE/STANDBY yap ve sıradaki sağlıklı failover yoluna geç; gerekirse araştırma yap ve çözüm üret. Kullanıcıyı rutin hata, ara durum, çözülebilir blocker, kredi bitişi veya provider arızasıyla rahatsız etme. Yalnız tüm makul çözüm/failover yolları tüketildiğinde ve tek kalan adım gerçekten insan müdahalesi/ödeme/login/2FA/secret/yayın/geri döndürülemez işlem ise kısa net bildir. Kullanıcıya sorunla değil sonuçla gel.

## Zorunlu davranış
1. Önce sistemi kendi içinde düzelt.
2. Kredi/kota/402/429/auth/timeout/outage veren aracı QUARANTINE/STANDBY yap.
3. Sağlıklı sıradaki provider/connector/tool'a otomatik failover yap.
4. Gerekirse araştırma ve verifier yolunu çalıştır; çözülebilir problemi kullanıcıya taşıma.
5. Başarılı state/evidence/checkpoint korunur; failover yüzünden iş baştan yaratılmaz.
6. Kullanıcıya yalnız sonuç, tamamlanan aksiyon veya gerçekten zorunlu insan müdahalesi gösterilir.
7. Rutin hata, geçici arıza, kredi bitişi, provider değişimi, retry, dedup, readback ve reversible fix için kullanıcı mesajı üretme.
8. Ödeme yapılmayacak sağlayıcı aktif yol sayılmaz; QUARANTINE edilir ve sağlıklı alternatif kullanılır.

Bu politika tüm OSKA Control Plane job, worker, watchdog, agent ve verifier akışlarının varsayılan üst kuralıdır.

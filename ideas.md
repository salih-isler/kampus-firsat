# Kampüs Fırsat Uygulaması — Tasarım Fikirleri

## Seçenek A: "Gece Pazarı" — Koyu, Canlı, Adrenalin Dolu
<response>
<text>
**Design Movement:** Neon-Noir / Tokyo Gece Pazarı Estetiği
**Core Principles:**
- Koyu arka plan üzerinde parlayan neon vurgular
- Aciliyet ve heyecan hissi yaratan yüksek kontrast
- Mobil-öncelikli, büyük dokunma hedefleri
- Minimal metin, maksimum görsel etki

**Color Philosophy:** Derin lacivert/siyah zemin (#0A0E1A), neon turuncu (#FF6B35) ve elektrik sarısı (#FFD700) vurgular. Fiyat düşüşlerinde yeşilden kırmızıya geçiş. Tehlike ve aciliyet hissi için kırmızı (#FF2D55).

**Layout Paradigm:** Tam ekran kart stack'i, her kart tam viewport genişliğinde. Alt navigasyon çubuğu sabit. Fiyat sayacı ekranın merkezinde dev boyutta.

**Signature Elements:**
- Neon parlama efektleri (box-shadow ile)
- Countdown çubuğu gradient animasyonu
- Fiyat değişiminde "flash" animasyonu

**Interaction Philosophy:** Her etkileşimde titreşim (haptic feedback simülasyonu), butonlar basıldığında scale animasyonu, fiyat düştükçe renk geçişi.

**Animation:** Fiyat sayacı her saniye "pulse" efektiyle güncellenir. Kart girişleri slide-up ile. Progress bar yavaş, kaygı verici şekilde azalır.

**Typography System:** "Space Grotesk" (başlıklar, fiyatlar) + "Inter" (gövde metni). Fiyatlar için monospace font.
</text>
<probability>0.08</probability>
</response>

## Seçenek B: "Kampüs Enerjisi" — Canlı, Sıcak, Genç
<response>
<text>
**Design Movement:** Modern Flat + Warm Gradient / Gen-Z Fintech
**Core Principles:**
- Sıcak turuncu-kırmızı gradient enerji
- Temiz beyaz kart yüzeyleri, güçlü tipografi
- Oyunlaştırma elementleri (badge, puan göstergesi)
- Frictionless UX, tek buton aksiyonlar

**Color Philosophy:** Beyaz/açık gri zemin, turuncu-kırmızı gradient (#FF6B35 → #FF2D55) ana aksiyon rengi. Yeşil (#00C853) başarı/indirim göstergesi. Altın sarısı (#FFB800) puan/jeton rengi.

**Layout Paradigm:** Mobil-öncelikli kart feed, üstte sabit header, altta tab bar. Kartlar tam genişlik, yuvarlak köşeler, belirgin gölgeler.

**Signature Elements:**
- Gradient aksiyon butonları
- Animasyonlu fiyat sayacı (kırmızı renk geçişiyle)
- Kalan süre progress bar (gradient, azalırken renk değişimi)

**Interaction Philosophy:** Buton basışlarında scale + shadow animasyonu. Fiyat güncellemelerinde subtle shake. Başarılı satın alımda konfeti.

**Animation:** Smooth slide-up geçişler, fiyat değişiminde flip animasyonu, progress bar linear azalma.

**Typography System:** "Plus Jakarta Sans" (tüm metin) — farklı ağırlıklar ile hiyerarşi. Fiyatlar için "JetBrains Mono".
</text>
<probability>0.07</probability>
</response>

## Seçenek C: "Dijital Pazar" — Koyu Mod, Glassmorphism
<response>
<text>
**Design Movement:** Dark Glassmorphism / Premium App
**Core Principles:**
- Koyu gradient arka plan, cam efektli kartlar
- Blur ve şeffaflık ile derinlik hissi
- Premium, modern görünüm
- Güçlü kontrast ile okunabilirlik

**Color Philosophy:** Koyu mor-lacivert gradient zemin (#1A1035 → #0D1B2A), cam kartlar (rgba beyaz %10-15), neon mor (#8B5CF6) ve cyan (#06B6D4) vurgular. Fiyatlar için parlak beyaz.

**Layout Paradigm:** Glassmorphism kart stack, blur arka planlar, floating action button.

**Signature Elements:**
- Backdrop-blur cam efekti kartlar
- Gradient border efektleri
- Neon glow animasyonları

**Interaction Philosophy:** Hover'da kart yükselme efekti, butonlarda ripple animasyonu.

**Animation:** Kartlar için stagger entrance, fiyat için counter animasyonu, blur geçişler.

**Typography System:** "Outfit" (başlıklar) + "DM Sans" (gövde). Monospace fiyatlar.
</text>
<probability>0.06</probability>
</response>

---

## SEÇİLEN YAKLAŞIM: Seçenek B — "Kampüs Enerjisi"

Sıcak turuncu-kırmızı gradient, temiz beyaz kartlar ve güçlü tipografi ile genç, enerjik bir his.
Fiyat sayacı ve aciliyet elementleri ön planda, frictionless UX.

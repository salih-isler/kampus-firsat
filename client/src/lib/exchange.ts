/**
 * Exchange Rate Management
 * CoinGecko ve finans API'lerinden anlık kur bilgisi al
 */

// CoinGecko API'den MONAD/USD kuru al
export async function getMonadUsdPrice(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=monad&vs_currencies=usd"
    );
    const data = await response.json();
    return data.monad?.usd || 0;
  } catch (err) {
    console.error("MONAD/USD kuru alınamadı:", err);
    return 0;
  }
}

// USD/TL kuru al (Open Exchange Rates veya alternatif)
// Not: Gerçek uygulamada API key gerekli, şimdilik sabit değer kullanıyoruz
export async function getUsdTlRate(): Promise<number> {
  try {
    // Alternatif: https://api.exchangerate-api.com/v4/latest/USD
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    const data = await response.json();
    return data.rates?.TRY || 32; // Fallback: 1 USD = 32 TL
  } catch (err) {
    console.error("USD/TL kuru alınamadı:", err);
    return 32; // Fallback değer
  }
}

// MONAD/TL kuru hesapla
export async function getMonadTlRate(): Promise<number> {
  try {
    const monadUsd = await getMonadUsdPrice();
    const usdTl = await getUsdTlRate();
    
    if (monadUsd === 0) {
      console.warn("MONAD/USD kuru alınamadı, fallback kullanılıyor");
      return 8; // Fallback: 1 MONAD = 8 TL
    }
    
    return monadUsd * usdTl;
  } catch (err) {
    console.error("MONAD/TL kuru hesaplanamadı:", err);
    return 8; // Fallback değer
  }
}

// TL → MONAD dönüşümü (dinamik kur ile)
export async function tlToMonadDynamic(tlAmount: number): Promise<number> {
  const rate = await getMonadTlRate();
  return tlAmount / rate;
}

// MONAD → TL dönüşümü (dinamik kur ile)
export async function monadToTlDynamic(monadAmount: number): Promise<number> {
  const rate = await getMonadTlRate();
  return monadAmount * rate;
}

// Kur bilgisini cache'le (5 dakika)
let cachedRate: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export async function getMonadTlRateCached(): Promise<number> {
  const now = Date.now();
  
  if (cachedRate !== null && now - cacheTimestamp < CACHE_DURATION) {
    return cachedRate;
  }
  
  const rate = await getMonadTlRate();
  cachedRate = rate;
  cacheTimestamp = now;
  
  return rate;
}

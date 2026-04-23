/**
 * ConsumerFeed — Tüketici Ana Sayfa / Keşif Feed
 * Design: Kampüs Enerjisi — warm orange-red gradients, clean white cards
 * - Header: kullanıcı adı + cüzdan bakiyesi
 * - Konum filtresi pill
 * - Canlı fırsat kartları (fotoğraf, kafe adı, fiyat sayacı, progress bar)
 */

import { useState, useEffect } from "react";
import { MapPin, ChevronDown, Coins, Star, Bell } from "lucide-react";
import { useLocation } from "wouter";
import { MOCK_DEALS, MOCK_WALLET, formatPrice, getPriceColor, formatTimeLeft, getTimeProgress, type Deal } from "@/lib/data";

export default function ConsumerFeed() {
  const [, navigate] = useLocation();
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [tick, setTick] = useState(0);

  // Simulate live price drops every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDeals((prev) =>
        prev.map((d) => ({
          ...d,
          currentPrice: Math.max(
            d.minPrice,
            d.currentPrice - (Math.random() * 1.5 + 0.3)
          ),
          viewerCount: Math.max(
            1,
            d.viewerCount + Math.floor(Math.random() * 3) - 1
          ),
        }))
      );
      setTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-shell flex flex-col min-h-dvh bg-[oklch(0.97_0.005_240)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border px-4 pt-3 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Hoş geldin 👋</p>
            <h1 className="text-lg font-bold text-foreground leading-tight">Selam, Salih</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Wallet badges */}
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="text-xs font-bold text-amber-700 font-price">
                {MOCK_WALLET.silverPoints.toLocaleString("tr")}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
              <Coins className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-bold text-orange-700 font-price">
                {MOCK_WALLET.goldTokens}
              </span>
            </div>
            <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
          </div>
        </div>

        {/* Location filter */}
        <button className="mt-2.5 flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5 text-xs font-medium text-foreground hover:bg-border transition-colors">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>Şu an: Sümer Kampüsü Çevresi (2 km)</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
        </button>
      </header>

      {/* Feed */}
      <main className="flex-1 px-4 py-4 space-y-4 pb-24">
        {/* Section title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Canlı Fırsatlar</h2>
            <p className="text-xs text-muted-foreground">Fiyatlar düşüyor — hızlı karar ver!</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
            <span className="text-xs font-semibold text-green-600">{deals.length} aktif</span>
          </div>
        </div>

        {deals.map((deal, i) => (
          <DealCard
            key={deal.id}
            deal={deal}
            animIndex={i}
            onTap={() => navigate(`/deal/${deal.id}`)}
          />
        ))}
      </main>

      {/* Bottom Tab Bar */}
      <BottomNav active="feed" />
    </div>
  );
}

function DealCard({
  deal,
  animIndex,
  onTap,
}: {
  deal: Deal;
  animIndex: number;
  onTap: () => void;
}) {
  const [prevPrice, setPrevPrice] = useState(deal.currentPrice);
  const [flashing, setFlashing] = useState(false);
  const progress = getTimeProgress(deal.expiresAt);
  const timeLeft = formatTimeLeft(deal.expiresAt);
  const priceColor = getPriceColor(deal.currentPrice, deal.originalPrice);
  const discountPct = Math.round(
    ((deal.originalPrice - deal.currentPrice) / deal.originalPrice) * 100
  );

  useEffect(() => {
    if (deal.currentPrice !== prevPrice) {
      setFlashing(true);
      setPrevPrice(deal.currentPrice);
      const t = setTimeout(() => setFlashing(false), 400);
      return () => clearTimeout(t);
    }
  }, [deal.currentPrice]);

  const progressColor =
    progress > 60
      ? "from-green-400 to-green-500"
      : progress > 30
      ? "from-yellow-400 to-orange-400"
      : "from-orange-500 to-red-500";

  return (
    <button
      onClick={onTap}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md active:scale-[0.98] transition-all duration-200 slide-up"
      style={{ animationDelay: `${animIndex * 80}ms` }}
    >
      <div className="flex gap-0">
        {/* Product image */}
        <div className="relative w-32 h-36 shrink-0">
          <img
            src={deal.productImage}
            alt={deal.productName}
            className="w-full h-full object-cover"
          />
          {/* Discount badge */}
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold rounded-lg px-1.5 py-0.5">
            %{discountPct}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-xs font-semibold text-muted-foreground truncate">
              {deal.cafeName} · {deal.cafeLocation}
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5 leading-tight">
              {deal.productName}
            </p>
          </div>

          {/* Price area */}
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold font-price ${priceColor} ${flashing ? "price-flash" : ""}`}
              >
                {formatPrice(deal.currentPrice)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(deal.originalPrice)}
            </p>
          </div>

          {/* Viewers + stock */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 pulse-dot" />
              <span className="text-xs text-muted-foreground">
                {deal.viewerCount} kişi bakıyor
              </span>
            </div>
            <span className="text-xs font-semibold text-foreground">
              {deal.stock} kaldı
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary w-full">
        <div
          className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between px-3 py-1.5">
        <span className="text-xs text-muted-foreground">Kalan süre</span>
        <span className={`text-xs font-bold font-price ${progress < 30 ? "text-red-500" : "text-foreground"}`}>
          {timeLeft}
        </span>
      </div>
    </button>
  );
}

export function BottomNav({ active }: { active: "feed" | "wallet" | "business" }) {
  const [, navigate] = useLocation();

  const items = [
    {
      key: "feed",
      label: "Keşfet",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      ),
      path: "/",
    },
    {
      key: "wallet",
      label: "Biletlerim",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M16 10h.01M2 10h20" />
        </svg>
      ),
      path: "/wallet",
    },
    {
      key: "business",
      label: "İşletme",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      path: "/business",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-border tab-bar z-40">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-xl transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * ConsumerFeed — Tüketici Ana Sayfa / Keşif Feed
 * Design: DropBite — koyu tema, turuncu aksentler, koyu kartlar
 * Web3: Monad Testnet + MetaMask entegrasyonu
 */

import { useState, useEffect } from "react";
import { MapPin, ChevronDown, Coins, Star, Bell, Wallet } from "lucide-react";
import { useLocation } from "wouter";
import { useDeals } from "@/contexts/DealsContext";
import { useWeb3 } from "@/contexts/Web3Context";
import { formatPrice, getPriceColor, formatTimeLeft, getTimeProgress, type Deal } from "@/lib/data";
import { toast } from "sonner";

export default function ConsumerFeed() {
  const [, navigate] = useLocation();
  const { deals } = useDeals();
  const { account, isConnected, balance, connectWallet, disconnectWallet, isLoading, monadTlRate } = useWeb3();
  const [tick, setTick] = useState(0);

  // Simulate live price drops every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-shell flex flex-col min-h-dvh bg-[oklch(0.12_0.01_260)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[oklch(0.18_0.02_260)]/90 backdrop-blur-md border-b border-[oklch(0.25_0.02_260)] px-4 pt-3 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[oklch(0.70_0.02_240)] font-medium">Merhaba 👋</p>
            <h1 className="text-lg font-bold text-white leading-tight">Salih</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Web3 Wallet Button */}
            {isConnected ? (
              <>
                <div className="flex items-center gap-1 bg-gradient-to-r from-[oklch(0.65_0.22_45)] to-[oklch(0.60_0.25_20)] border border-[oklch(0.65_0.22_45)] rounded-full px-2.5 py-1">
                  <Wallet className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-bold text-white font-price">
                    {parseFloat(balance).toFixed(2)} MON
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-xs font-semibold bg-[oklch(0.25_0.02_260)] hover:bg-[oklch(0.30_0.02_260)] text-white px-2 py-1 rounded-full transition-colors"
                >
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[oklch(0.65_0.22_45)] to-[oklch(0.60_0.25_20)] text-white font-bold text-xs px-3 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                <Wallet className="w-3.5 h-3.5" />
                {isLoading ? "Bağlanıyor..." : "Cüzdan Bağla"}
              </button>
            )}
            <button className="w-8 h-8 rounded-full bg-[oklch(0.25_0.02_260)] flex items-center justify-center relative hover:bg-[oklch(0.30_0.02_260)] transition-colors">
              <Bell className="w-4 h-4 text-[oklch(0.70_0.02_240)]" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
          </div>
        </div>

        {/* Location filter + Exchange Rate */}
        <div className="mt-2.5 flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-[oklch(0.25_0.02_260)] rounded-full px-3 py-1.5 text-xs font-medium text-white hover:bg-[oklch(0.30_0.02_260)] transition-colors">
            <MapPin className="w-3.5 h-3.5 text-[oklch(0.65_0.22_45)]" />
            <span>Kayseri'n Umu Participatlar Cafes</span>
            <ChevronDown className="w-3.5 h-3.5 text-[oklch(0.70_0.02_240)] ml-0.5" />
          </button>
          <div className="flex items-center gap-1.5 bg-[oklch(0.25_0.02_260)] rounded-full px-3 py-1.5 text-xs font-medium text-white">
            <Coins className="w-3.5 h-3.5 text-[oklch(0.65_0.22_45)]" />
            <span>1 MON = {monadTlRate.toFixed(2)} TL</span>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="flex-1 px-4 py-4 space-y-4 pb-24">
        {/* Section title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">CANLI DÜŞÜŞLER</h2>
            <p className="text-xs text-[oklch(0.70_0.02_240)]">Fiyatlar düşüyor — hızlı karar ver!</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
            <span className="text-xs font-semibold text-green-400">{deals.length} aktif</span>
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
      ? "from-green-500 to-green-400"
      : progress > 30
      ? "from-yellow-500 to-orange-400"
      : "from-red-500 to-orange-500";

  return (
    <button
      onClick={onTap}
      className="w-full text-left bg-[oklch(0.18_0.02_260)] rounded-2xl border border-[oklch(0.25_0.02_260)] overflow-hidden hover:border-[oklch(0.35_0.02_260)] active:scale-[0.98] transition-all duration-200 slide-up"
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
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {deal.stock === 0 ? (
              <div className="bg-red-600 text-white text-xs font-bold rounded-lg px-2 py-1 flex items-center gap-1">
                ⛔ TÜKENDI
              </div>
            ) : (
              <div className="bg-red-500 text-white text-xs font-bold rounded-lg px-1.5 py-0.5 flex items-center gap-1">
                👥 {deal.viewerCount} kişi İNCELİYOR
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-xs font-semibold text-[oklch(0.70_0.02_240)] truncate">
              {deal.cafeName} · {deal.cafeLocation}
            </p>
            <p className="text-sm font-bold text-white mt-0.5 leading-tight">
              {deal.productName}
            </p>
          </div>

          {/* Price area */}
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold font-price text-red-400 ${flashing ? "price-flash" : ""}`}
              >
                {formatPrice(deal.currentPrice)}
              </span>
            </div>
            <p className="text-xs text-[oklch(0.70_0.02_240)] line-through">
              {formatPrice(deal.originalPrice)}
            </p>
          </div>

          {/* Stock */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-[oklch(0.70_0.02_240)]">Kalan Süre: <span className="font-bold text-white">{timeLeft}</span></span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              deal.stock === 0
                ? "bg-red-600 text-white"
                : "text-white bg-[oklch(0.25_0.02_260)]"
            }`}>
              {deal.stock === 0 ? "Tükendi" : `${deal.stock} kaldı`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[oklch(0.22_0.02_260)] w-full">
        <div
          className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  );
}

export function BottomNav({ active }: { active: "feed" | "wallet" | "business" }) {
  const [, navigate] = useLocation();

  const items = [
    {
      key: "feed",
      label: "KEŞFET",
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
      label: "CÜZDAN",
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
      label: "PROFİL",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      path: "/wallet",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[oklch(0.18_0.02_260)] border-t border-[oklch(0.25_0.02_260)] tab-bar z-40">
      <div className="flex items-center justify-around py-3">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-xl transition-colors ${
                isActive ? "text-[oklch(0.65_0.22_45)]" : "text-[oklch(0.70_0.02_240)]"
              }`}
            >
              {item.icon}
              <span className={`text-[10px] font-bold ${isActive ? "text-[oklch(0.65_0.22_45)]" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

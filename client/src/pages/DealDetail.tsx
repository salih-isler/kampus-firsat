/**
 * DealDetail — Canlı Açık Artırma (Adrenalin Odası)
 * Design: Kampüs Enerjisi — devasa fiyat sayacı, FOMO tetikleyiciler, tek büyük aksiyon butonu
 * - Devasa fiyat sayacı (yeşil→sarı→kırmızı renk geçişi)
 * - Sosyal kanıt: "X kişi bu fırsatı inceliyor"
 * - Stok bilgisi
 * - "BU FİYATTAN KAP!" butonu
 */

import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Users, Package, Zap, CheckCircle } from "lucide-react";
import { MOCK_DEALS, formatPrice, formatTimeLeft, getTimeProgress, type Deal } from "@/lib/data";
import { toast } from "sonner";

export default function DealDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [deal, setDeal] = useState<Deal | null>(
    MOCK_DEALS.find((d) => d.id === params.id) || MOCK_DEALS[0]
  );
  const [flashing, setFlashing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [tick, setTick] = useState(0);

  // Live price drop simulation
  useEffect(() => {
    if (!deal || purchased) return;
    const interval = setInterval(() => {
      setDeal((prev) => {
        if (!prev) return prev;
        const newPrice = Math.max(prev.minPrice, prev.currentPrice - (Math.random() * 1.2 + 0.2));
        return {
          ...prev,
          currentPrice: newPrice,
          viewerCount: Math.max(1, prev.viewerCount + Math.floor(Math.random() * 3) - 1),
        };
      });
      setFlashing(true);
      setTick((t) => t + 1);
      setTimeout(() => setFlashing(false), 400);
    }, 2000);
    return () => clearInterval(interval);
  }, [purchased]);

  // Shake FOMO text periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePurchase = useCallback(() => {
    if (!deal) return;
    setPurchased(true);
    toast.success("Satın alındı! 🎉", {
      description: `${deal.productName} — ${formatPrice(deal.currentPrice)}`,
      duration: 3000,
    });
    setTimeout(() => navigate("/wallet"), 1800);
  }, [deal, navigate]);

  if (!deal) return null;

  const progress = getTimeProgress(deal.expiresAt);
  const timeLeft = formatTimeLeft(deal.expiresAt);
  const dropPct = (deal.originalPrice - deal.currentPrice) / deal.originalPrice;

  // Dynamic price color
  let priceColorClass = "text-green-500";
  let priceBgClass = "bg-green-50";
  let priceBorderClass = "border-green-200";
  if (dropPct >= 0.3 && dropPct < 0.55) {
    priceColorClass = "text-yellow-500";
    priceBgClass = "bg-yellow-50";
    priceBorderClass = "border-yellow-200";
  }
  if (dropPct >= 0.55) {
    priceColorClass = "text-red-500";
    priceBgClass = "bg-red-50";
    priceBorderClass = "border-red-200";
  }

  const progressColor =
    progress > 60
      ? "from-green-400 to-green-500"
      : progress > 30
      ? "from-yellow-400 to-orange-400"
      : "from-orange-500 to-red-500";

  const discountPct = Math.round(
    ((deal.originalPrice - deal.currentPrice) / deal.originalPrice) * 100
  );

  return (
    <div className="app-shell flex flex-col min-h-dvh bg-[oklch(0.97_0.005_240)]">
      {/* Hero image with overlay header */}
      <div className="relative h-64 shrink-0">
        <img
          src={deal.productImage}
          alt={deal.productName}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Discount badge */}
        <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold rounded-xl px-3 py-1.5 shadow-lg">
          %{discountPct} İNDİRİM
        </div>

        {/* Cafe info on image */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white/80 text-xs font-semibold mb-0.5">
            {deal.cafeName} · {deal.cafeLocation}
          </p>
          <h1 className="text-white text-xl font-bold leading-tight">{deal.productName}</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-4 pt-5 pb-32 gap-4">

        {/* Price counter — the star of the show */}
        <div className={`rounded-2xl border-2 ${priceBorderClass} ${priceBgClass} p-5 text-center`}>
          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
            Anlık Fiyat
          </p>
          <div
            className={`text-6xl font-bold font-price ${priceColorClass} leading-none transition-colors duration-500 ${flashing ? "price-flash" : ""}`}
          >
            {formatPrice(deal.currentPrice)}
          </div>
          <p className="text-sm text-muted-foreground line-through mt-2">
            Orijinal: {formatPrice(deal.originalPrice)}
          </p>
          <p className="text-xs font-semibold text-green-600 mt-1">
            {formatPrice(deal.originalPrice - deal.currentPrice)} tasarruf!
          </p>
        </div>

        {/* FOMO — Social proof */}
        <div
          className={`flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 ${shaking ? "shake" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-700">
              Şu an{" "}
              <span className="text-orange-600 font-price">{deal.viewerCount}</span>{" "}
              kişi bu fırsatı inceliyor.
            </p>
            <p className="text-xs text-orange-500">Hızlı karar ver!</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-orange-500 pulse-dot ml-auto shrink-0" />
        </div>

        {/* Timer */}
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Kalan Süre</span>
            <span
              className={`text-lg font-bold font-price ${progress < 30 ? "text-red-500" : progress < 60 ? "text-yellow-600" : "text-green-600"}`}
            >
              {timeLeft}
            </span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-1000`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-border p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Package className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kalan Paket</p>
              <p className="text-base font-bold text-foreground font-price">{deal.stock}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taban Fiyat</p>
              <p className="text-base font-bold text-foreground font-price">
                {formatPrice(deal.minPrice)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t border-border px-4 py-4 z-40">
        <p className="text-center text-xs text-muted-foreground mb-2 font-medium">
          Kalan Paket: <span className="font-bold text-foreground">{deal.stock}</span>
        </p>
        {purchased ? (
          <div className="flex items-center justify-center gap-2 bg-green-500 text-white rounded-2xl py-4 font-bold text-lg">
            <CheckCircle className="w-5 h-5" />
            Satın Alındı!
          </div>
        ) : (
          <button
            onClick={handlePurchase}
            className="btn-fire w-full py-4 text-lg font-extrabold tracking-wide flex items-center justify-center gap-2 active:scale-95"
          >
            <Zap className="w-5 h-5 fill-white" />
            BU FİYATTAN KAP!
          </button>
        )}
      </div>
    </div>
  );
}

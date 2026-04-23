/**
 * DealDetail — Canlı Açık Artırma (Adrenalin Odası)
 * Design: DropBite — koyu tema, turuncu buton, stok azaltma
 */

import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Users, Package, Zap, CheckCircle } from "lucide-react";
import { useDeals } from "@/contexts/DealsContext";
import { formatPrice, formatTimeLeft, getTimeProgress } from "@/lib/data";
import { toast } from "sonner";

export default function DealDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { getDealById, updateDealStock } = useDeals();
  const deal = getDealById(params.id);
  const [flashing, setFlashing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Live price drop simulation
  useEffect(() => {
    if (!deal || purchased) return;
    const interval = setInterval(() => {
      setFlashing(true);
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
    if (deal.stock <= 0) {
      toast.error("Stok tükendi!", { duration: 2000 });
      return;
    }
    // Stok azalt
    updateDealStock(deal.id, 1);
    setPurchased(true);
    toast.success("Satın alındı! 🎉", {
      description: `${deal.productName} — ${formatPrice(deal.currentPrice)}`,
      duration: 3000,
    });
    setTimeout(() => navigate("/wallet"), 1800);
  }, [deal, updateDealStock, navigate]);

  if (!deal) return null;

  const progress = getTimeProgress(deal.expiresAt);
  const timeLeft = formatTimeLeft(deal.expiresAt);
  const dropPct = (deal.originalPrice - deal.currentPrice) / deal.originalPrice;

  const progressColor =
    progress > 60
      ? "from-green-500 to-green-400"
      : progress > 30
      ? "from-yellow-500 to-orange-400"
      : "from-red-500 to-orange-500";

  const discountPct = Math.round(
    ((deal.originalPrice - deal.currentPrice) / deal.originalPrice) * 100
  );

  return (
    <div className="app-shell flex flex-col min-h-dvh bg-[oklch(0.12_0.01_260)]">
      {/* Hero image with overlay header */}
      <div className="relative h-64 shrink-0">
        <img
          src={deal.productImage}
          alt={deal.productName}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Viewer count badge */}
        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-1">
          👥 {deal.viewerCount} kişi İNCELİYOR
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

        {/* Price counter */}
        <div className="rounded-2xl border border-[oklch(0.25_0.02_260)] bg-[oklch(0.18_0.02_260)] p-5 text-center">
          <p className="text-xs font-semibold text-[oklch(0.70_0.02_240)] mb-1 uppercase tracking-wide">
            Anlık Fiyat
          </p>
          <div
            className={`text-6xl font-bold font-price text-red-400 leading-none transition-colors duration-500 ${flashing ? "price-flash" : ""}`}
          >
            {formatPrice(deal.currentPrice)}
          </div>
          <p className="text-sm text-[oklch(0.70_0.02_240)] line-through mt-2">
            Orijinal: {formatPrice(deal.originalPrice)}
          </p>
          <p className="text-xs font-semibold text-green-400 mt-1">
            {formatPrice(deal.originalPrice - deal.currentPrice)} tasarruf!
          </p>
        </div>

        {/* FOMO — Social proof */}
        <div
          className={`flex items-center gap-3 bg-[oklch(0.22_0.02_260)] border border-[oklch(0.30_0.02_260)] rounded-xl px-4 py-3 ${shaking ? "shake" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-[oklch(0.25_0.02_260)] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-[oklch(0.65_0.22_45)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              Şu an{" "}
              <span className="text-[oklch(0.65_0.22_45)] font-price">{deal.viewerCount}</span>{" "}
              kişi bu fırsatı inceliyor.
            </p>
            <p className="text-xs text-[oklch(0.70_0.02_240)]">Hızlı karar ver!</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-[oklch(0.65_0.22_45)] pulse-dot ml-auto shrink-0" />
        </div>

        {/* Timer */}
        <div className="bg-[oklch(0.18_0.02_260)] rounded-xl border border-[oklch(0.25_0.02_260)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">Kalan Süre</span>
            <span
              className={`text-lg font-bold font-price ${progress < 30 ? "text-red-400" : progress < 60 ? "text-yellow-400" : "text-green-400"}`}
            >
              {timeLeft}
            </span>
          </div>
          <div className="h-2.5 bg-[oklch(0.22_0.02_260)] rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-1000`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[oklch(0.18_0.02_260)] rounded-xl border border-[oklch(0.25_0.02_260)] p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[oklch(0.25_0.02_260)] flex items-center justify-center">
              <Package className="w-4 h-4 text-[oklch(0.70_0.02_240)]" />
            </div>
            <div>
              <p className="text-xs text-[oklch(0.70_0.02_240)]">Kalan Paket</p>
              <p className="text-base font-bold text-white font-price">{deal.stock}</p>
            </div>
          </div>
          <div className="bg-[oklch(0.18_0.02_260)] rounded-xl border border-[oklch(0.25_0.02_260)] p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[oklch(0.25_0.02_260)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[oklch(0.65_0.22_45)]" />
            </div>
            <div>
              <p className="text-xs text-[oklch(0.70_0.02_240)]">Taban Fiyat</p>
              <p className="text-base font-bold text-white font-price">
                {formatPrice(deal.minPrice)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[oklch(0.18_0.02_260)]/95 backdrop-blur-md border-t border-[oklch(0.25_0.02_260)] px-4 py-4 z-40">
        <p className="text-center text-xs text-[oklch(0.70_0.02_240)] mb-2 font-medium">
          Kalan Paket: <span className="font-bold text-white">{deal.stock}</span>
        </p>
        {purchased ? (
          <div className="flex items-center justify-center gap-2 bg-green-600 text-white rounded-2xl py-4 font-bold text-lg">
            <CheckCircle className="w-5 h-5" />
            Satın Alındı!
          </div>
        ) : deal.stock <= 0 ? (
          <div className="flex items-center justify-center gap-2 bg-red-600 text-white rounded-2xl py-4 font-bold text-lg">
            Stok Tükendi
          </div>
        ) : (
          <button
            onClick={handlePurchase}
            className="btn-fire w-full py-4 text-lg font-extrabold tracking-wide flex items-center justify-center gap-2 active:scale-95"
          >
            <Zap className="w-5 h-5 fill-current" />
            BU FİYATTAN KAP!
          </button>
        )}
      </div>
    </div>
  );
}

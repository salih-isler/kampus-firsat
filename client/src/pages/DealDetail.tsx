/**
 * DealDetail — Canlı Açık Artırma (Adrenalin Odası)
 * Design: DropBite — koyu tema, turuncu buton, stok azaltma
 * Web3: Monad Testnet + MetaMask satın alım
 */

import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Users, Package, Zap, CheckCircle, Loader2, X } from "lucide-react";
import { useDeals } from "@/contexts/DealsContext";
import { useWeb3 } from "@/contexts/Web3Context";
import { formatPrice, formatTimeLeft, getTimeProgress } from "@/lib/data";
import { toast } from "sonner";

export default function DealDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { getDealById, updateDealStock, addTicket } = useDeals();
  const { account, isConnected, sendTransaction, isLoading: web3Loading } = useWeb3();
  const deal = getDealById(params.id);
  const [flashing, setFlashing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handlePurchaseConfirm = useCallback(async () => {
    if (!deal) return;
    if (deal.stock <= 0) {
      toast.error("Stok tükendi!", { duration: 2000 });
      setShowConfirmModal(false);
      return;
    }

    setIsProcessing(true);

    try {
      // Stok azalt
      updateDealStock(deal.id, 1);

      // Bilet oluştur
      const deliveryCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const ticket = {
        id: `ticket-${Date.now()}`,
        dealId: deal.id,
        cafeName: deal.cafeName,
        cafeLocation: deal.cafeLocation,
        productName: deal.productName,
        quantity: 1,
        paidPrice: deal.currentPrice,
        purchasedAt: Date.now(),
        deliveryCode,
        qrData: `${deal.id}-${deliveryCode}-${Date.now()}`,
        used: false,
      };

      addTicket(ticket);

      setPurchased(true);
      setShowConfirmModal(false);

      toast.success("Satın alındı! 🎉", {
        description: `${deal.productName} — ${formatPrice(deal.currentPrice)}\nKod: ${deliveryCode}`,
        duration: 3000,
      });

      setTimeout(() => navigate("/wallet"), 2000);
    } catch (err: any) {
      toast.error(err.message || "İşlem sırasında hata oluştu", { duration: 2000 });
    } finally {
      setIsProcessing(false);
    }
  }, [deal, updateDealStock, navigate, addTicket]);

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
          <p className="text-xs text-white/80 font-medium">{deal.cafeName}</p>
          <h1 className="text-xl font-bold text-white leading-tight mt-0.5">
            {deal.productName}
          </h1>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-6 space-y-6 pb-32">
        {/* Price section */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span
              className={`text-5xl font-bold font-price text-red-400 ${
                flashing ? "price-flash" : ""
              }`}
            >
              {formatPrice(deal.currentPrice)}
            </span>
            <span className="text-lg text-[oklch(0.70_0.02_240)] line-through">
              {formatPrice(deal.originalPrice)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full">
              {discountPct}% İndirim
            </span>
            <span className="text-sm text-[oklch(0.70_0.02_240)]">
              Orijinal: {formatPrice(deal.originalPrice)}
            </span>
          </div>
        </div>

        {/* Taban Fiyatı */}
        <div className="bg-[oklch(0.18_0.02_260)] rounded-xl p-4 border border-[oklch(0.25_0.02_260)]">
          <p className="text-xs text-[oklch(0.70_0.02_240)] font-medium mb-2">Taban Fiyat (En Düşük)</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold font-price text-[oklch(0.65_0.22_45)]">
              {formatPrice(deal.minPrice)}
            </span>
            <span className="text-xs text-[oklch(0.70_0.02_240)] text-right">
              Fiyat bu seviyeye kadar düşebilir
            </span>
          </div>
        </div>

        {/* Time & Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[oklch(0.18_0.02_260)] rounded-xl p-3 border border-[oklch(0.25_0.02_260)]">
            <p className="text-xs text-[oklch(0.70_0.02_240)] font-medium">Kalan Süre</p>
            <p className="text-lg font-bold text-white mt-1">{timeLeft}</p>
          </div>
          <div className="bg-[oklch(0.18_0.02_260)] rounded-xl p-3 border border-[oklch(0.25_0.02_260)]">
            <p className="text-xs text-[oklch(0.70_0.02_240)] font-medium">Kalan Stok</p>
            <p className="text-lg font-bold text-white mt-1">
              {deal.stock === 0 ? "Tükendi" : `${deal.stock} / ${deal.totalStock}`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2 bg-[oklch(0.22_0.02_260)] rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-1000`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[oklch(0.70_0.02_240)]">
            Fırsat %{Math.round(progress)} tamamlandı
          </p>
        </div>

        {/* FOMO section */}
        <div
          className={`bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 rounded-xl p-4 text-center ${
            shaking ? "shake" : ""
          }`}
        >
          <p className="text-sm font-bold text-red-300">
            ⚡ {deal.viewerCount} kişi bu fiyatı izliyor!
          </p>
          <p className="text-xs text-red-200/80 mt-1">
            Fiyat her saniye düşüyor — hızlı karar ver!
          </p>
        </div>
      </main>

      {/* CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto px-4 py-4 bg-[oklch(0.18_0.02_260)] border-t border-[oklch(0.25_0.02_260)]">
        {purchased ? (
          <div className="flex items-center justify-center gap-2 bg-green-600/80 text-white rounded-2xl py-4 font-bold text-lg border border-green-500 animate-bounce">
            <CheckCircle className="w-5 h-5" />
            Satın Alındı!
          </div>
        ) : deal.stock <= 0 ? (
          <div className="flex items-center justify-center gap-2 bg-red-600/80 text-white rounded-2xl py-4 font-bold text-lg border border-red-500">
            ⛔ Stok Tükendi
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isProcessing}
            className="btn-fire w-full py-4 text-lg font-extrabold tracking-wide flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                İşlem Yapılıyor...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                BU FİYATTAN KAP!
              </>
            )}
          </button>
        )}
      </div>

      {/* Purchase Confirmation Modal */}
      {showConfirmModal && (
        <PurchaseConfirmModal
          deal={deal}
          onConfirm={handlePurchaseConfirm}
          onCancel={() => setShowConfirmModal(false)}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}

function PurchaseConfirmModal({
  deal,
  onConfirm,
  onCancel,
  isProcessing,
}: {
  deal: any;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-[480px] bg-[oklch(0.18_0.02_260)] rounded-t-3xl px-6 pt-6 pb-8 slide-up border-t border-[oklch(0.25_0.02_260)]">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[oklch(0.25_0.02_260)] flex items-center justify-center text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.30_0.02_260)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-[oklch(0.25_0.02_260)] mx-auto mb-6" />

        <h2 className="text-xl font-bold text-white mb-1">Satın Almayı Onayla</h2>
        <p className="text-xs text-[oklch(0.70_0.02_240)] mb-6">
          Bu fiyattan satın almak istediğinden emin misin?
        </p>

        {/* Order summary */}
        <div className="bg-[oklch(0.25_0.02_260)] rounded-xl p-4 mb-6 space-y-3">
          {/* Product */}
          <div>
            <p className="text-xs text-[oklch(0.70_0.02_240)] mb-1">Ürün</p>
            <p className="text-sm font-bold text-white">{deal.productName}</p>
            <p className="text-xs text-[oklch(0.70_0.02_240)]">
              {deal.cafeName} • {deal.cafeLocation}
            </p>
          </div>

          <div className="h-px bg-[oklch(0.30_0.02_260)]" />

          {/* Price breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[oklch(0.70_0.02_240)]">Orijinal Fiyat</span>
              <span className="text-sm font-mono text-[oklch(0.70_0.02_240)] line-through">
                {formatPrice(deal.originalPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[oklch(0.70_0.02_240)]">Şu Anki Fiyat</span>
              <span className="text-lg font-bold font-price text-red-400">
                {formatPrice(deal.currentPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[oklch(0.70_0.02_240)]">Tasarruf</span>
              <span className="text-sm font-bold text-green-400">
                {formatPrice(deal.originalPrice - deal.currentPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="btn-fire w-full py-4 text-lg font-extrabold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                İşlem Yapılıyor...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                Evet, Satın Al!
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full py-3 text-sm font-semibold text-[oklch(0.70_0.02_240)] bg-[oklch(0.25_0.02_260)] rounded-xl hover:bg-[oklch(0.30_0.02_260)] transition-colors disabled:opacity-50"
          >
            İptal Et
          </button>
        </div>
      </div>
    </div>
  );
}

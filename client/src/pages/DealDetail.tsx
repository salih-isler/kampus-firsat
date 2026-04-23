/**
 * DealDetail — Canlı Açık Artırma (Adrenalin Odası)
 * Design: DropBite — koyu tema, turuncu buton, stok azaltma
 * Web3: Monad Testnet + MetaMask satın alım + Smart Contract
 */

import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Users, Package, Zap, CheckCircle, Loader2, X } from "lucide-react";
import { useDeals } from "@/contexts/DealsContext";
import { useWeb3 } from "@/contexts/Web3Context";
import { formatPrice, formatTimeLeft, getTimeProgress } from "@/lib/data";
import { MONAD_CONFIG } from "@/lib/monad";
import { BrowserProvider, Contract, parseEther } from "ethers";
import { toast } from "sonner";

export default function DealDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { getDealById, updateDealStock, addTicket } = useDeals();
  const { account, isConnected, sendTransaction, isLoading: web3Loading, updateBalance, balance, monadTlRate } = useWeb3();
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

    const timer = setInterval(() => {
      setFlashing((prev) => !prev);
    }, 500);

    return () => clearInterval(timer);
  }, [deal, purchased]);

  // Satın alım işlemi
  const handlePurchaseConfirm = useCallback(async () => {
    if (!deal) return;
    if (deal.stock <= 0) {
      toast.error("Stok tükendi!", { duration: 2000 });
      setShowConfirmModal(false);
      return;
    }

    // TL → MONAD dönüşümü (dinamik kur ile)
    const requiredMonad = deal.currentPrice / monadTlRate;
    const userBalance = parseFloat(balance || "0");

    // Bakiye kontrolü
    if (userBalance < requiredMonad) {
      toast.error(
        `Yetersiz bakiye! Gerekli: ${requiredMonad.toFixed(4)} MONAD (${deal.currentPrice.toFixed(2)} TL)\nMevcut: ${userBalance.toFixed(4)} MONAD (${(userBalance * monadTlRate).toFixed(2)} TL)`,
        { duration: 3000 }
      );
      setShowConfirmModal(false);
      return;
    }

    setIsProcessing(true);

    try {
      // MetaMask bağlı mı kontrol et
      if (!isConnected || !account) {
        toast.error("Lütfen önce cüzdan bağlayın", { duration: 2000 });
        setShowConfirmModal(false);
        return;
      }

      // Smart Contract deploy edilmiş mi kontrol et
      if (MONAD_CONFIG.contractAddress === "0x0000000000000000000000000000000000000000") {
        // Mock satın alım (contract deploy edilene kadar)
        toast.info("Smart Contract henüz deploy edilmedi. Mock işlem yapılıyor...", { duration: 2000 });
        
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

        // Bakiye güncelle
        const newBalance = userBalance - requiredMonad;
        localStorage.setItem(
          "web3-connection",
          JSON.stringify({
            account,
            balance: newBalance.toString(),
            timestamp: Date.now(),
          })
        );
        await updateBalance();

        setPurchased(true);
        setShowConfirmModal(false);

        toast.success("Satın alındı! 🎉", {
          description: `${deal.productName} — ${formatPrice(deal.currentPrice)}\n${requiredMonad.toFixed(4)} MONAD (1 MON = ${monadTlRate.toFixed(2)} TL)\nKod: ${deliveryCode}`,
          duration: 3000,
        });

        setTimeout(() => navigate("/wallet"), 2000);
      } else {
        // Gerçek Smart Contract işlemi
        toast.loading("İşlem blockchain'e gönderiliyor...", { duration: 3000 });
        
        const ethereum = (window as any).ethereum;
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();

        // Smart Contract ABI (basit)
        const contractABI = [
          "function purchaseDeal(uint256 _dealId, string memory _deliveryCode) external payable returns (uint256)"
        ];

        const contract = new Contract(MONAD_CONFIG.contractAddress, contractABI, signer);
        const deliveryCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Wei cinsinde tutar
        const amountInWei = parseEther(requiredMonad.toString());

        // Smart Contract'ı çağır
        const tx = await contract.purchaseDeal(
          parseInt(deal.id),
          deliveryCode,
          { value: amountInWei }
        );

        setTxHash(tx.hash);
        toast.loading(`İşlem onaylanıyor... ${tx.hash.slice(0, 10)}...`, { duration: 5000 });

        // İşlem onayını bekle
        const receipt = await tx.wait();

        if (receipt) {
          // Stok azalt
          updateDealStock(deal.id, 1);

          // Bilet oluştur
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
          await updateBalance();

          setPurchased(true);
          setShowConfirmModal(false);

          toast.success("Satın alındı! 🎉", {
            description: `${deal.productName} — ${formatPrice(deal.currentPrice)}\nTx: ${tx.hash.slice(0, 10)}...\nKod: ${deliveryCode}`,
            duration: 3000,
          });

          setTimeout(() => navigate("/wallet"), 2000);
        }
      }
    } catch (err: any) {
      console.error("Satın alım hatası:", err);
      toast.error(
        err.message?.includes("insufficient funds")
          ? "Yetersiz bakiye"
          : err.message || "İşlem sırasında hata oluştu",
        { duration: 2000 }
      );
    } finally {
      setIsProcessing(false);
    }
  }, [deal, updateDealStock, navigate, addTicket, updateBalance, account, balance, monadTlRate, isConnected]);



  if (!deal) return null;

  const timeProgress = getTimeProgress(deal.expiresAt);
  const isExpired = timeProgress >= 100;
  const watchers = Math.floor(Math.random() * 50) + 5;

  return (
    <div className="min-h-screen bg-[oklch(0.15_0.02_260)] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[oklch(0.18_0.02_260)] border-b border-[oklch(0.25_0.02_260)] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-[oklch(0.25_0.02_260)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-sm">{deal.productName}</h1>
          <p className="text-xs text-[oklch(0.70_0.02_240)]">{deal.cafeName}</p>
        </div>
        {txHash && (
          <a
            href={`${MONAD_CONFIG.blockExplorerUrl}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[oklch(0.65_0.22_45)] hover:underline"
          >
            Tx
          </a>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32">
        {/* Product Image */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-[oklch(0.25_0.02_260)]">
          <img
            src={deal.productImage}
            alt={deal.productName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Stock Badge */}
          {deal.stock <= 0 ? (
            <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold">
              ⛔ TÜKENDI
            </div>
          ) : (
            <div className="absolute top-3 right-3 bg-[oklch(0.65_0.22_45)] text-black px-3 py-1.5 rounded-full text-xs font-bold">
              🔥 {deal.stock} kişi İNCELİYOR
            </div>
          )}

          {/* Watchers */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full text-xs">
            <Users className="w-3.5 h-3.5 text-[oklch(0.65_0.22_45)]" />
            <span>{watchers} izliyor</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-3">
          <div className={`transition-all ${flashing ? "scale-105" : "scale-100"}`}>
            <div className="text-5xl font-black text-[oklch(0.65_0.22_45)]">
              {formatPrice(deal.currentPrice)}
            </div>
            <div className="text-sm text-[oklch(0.70_0.02_240)] line-through">
              {formatPrice(deal.startPrice)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 bg-[oklch(0.25_0.02_260)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[oklch(0.65_0.22_45)] to-red-600 transition-all duration-300"
                style={{ width: `${Math.min(timeProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[oklch(0.70_0.02_240)]">
              <span>Kalan Süre: {formatTimeLeft(deal.expiresAt)}</span>
              <span>{Math.round(timeProgress)}%</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[oklch(0.25_0.02_260)] rounded-lg p-3 space-y-1">
            <div className="text-xs text-[oklch(0.70_0.02_240)]">Taban Fiyat (En Düşük)</div>
            <div className="font-bold text-[oklch(0.65_0.22_45)]">{formatPrice(deal.minPrice)}</div>
          </div>
          <div className="bg-[oklch(0.25_0.02_260)] rounded-lg p-3 space-y-1">
            <div className="text-xs text-[oklch(0.70_0.02_240)]">Kalan Stok</div>
            <div className="font-bold text-white">{deal.stock} adet</div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-[oklch(0.25_0.02_260)] rounded-lg p-4 space-y-2">
          <h3 className="font-bold text-sm">Ürün Detayları</h3>
          <p className="text-xs text-[oklch(0.70_0.02_240)] leading-relaxed">
            {deal.cafeLocation} — {deal.cafeName}
          </p>
        </div>
      </main>

      {/* CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[oklch(0.15_0.02_260)] to-transparent px-4 py-4 space-y-3">
        {deal.stock > 0 && !isExpired ? (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isProcessing || web3Loading}
            className="w-full bg-gradient-to-r from-[oklch(0.65_0.22_45)] to-orange-500 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-[oklch(0.65_0.22_45)]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                İşlem yapılıyor...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                BU FİYATTAN KAP!
              </>
            )}
          </button>
        ) : (
          <button disabled className="w-full bg-gray-600 text-white font-bold py-4 rounded-xl cursor-not-allowed">
            {isExpired ? "⏰ Fırsat Süresi Bitti" : "⛔ Tükendi"}
          </button>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end z-50">
          <div className="w-full bg-[oklch(0.18_0.02_260)] rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Satın Alım Onayı</h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-2 hover:bg-[oklch(0.25_0.02_260)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-[oklch(0.25_0.02_260)] rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[oklch(0.70_0.02_240)]">Ürün</span>
                <span className="font-bold">{deal.productName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[oklch(0.70_0.02_240)]">Fiyat</span>
                <span className="font-bold text-[oklch(0.65_0.22_45)]">{formatPrice(deal.currentPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[oklch(0.70_0.02_240)]">MONAD</span>
                <span className="font-bold">{(deal.currentPrice / monadTlRate).toFixed(4)} MON</span>
              </div>
              <div className="h-px bg-[oklch(0.35_0.02_260)]" />
              <div className="flex justify-between text-sm">
                <span className="text-[oklch(0.70_0.02_240)]">Mevcut Bakiye</span>
                <span className="font-bold">{parseFloat(balance || "0").toFixed(4)} MON</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-[oklch(0.25_0.02_260)] text-white font-bold py-3 rounded-lg hover:bg-[oklch(0.30_0.02_260)] transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handlePurchaseConfirm}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-[oklch(0.65_0.22_45)] to-orange-500 text-black font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Onaylanıyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Evet, Satın Al
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

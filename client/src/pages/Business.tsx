/**
 * Business — İşletme Yönetim Arayüzü
 * Design: DropBite — koyu tema, turuncu aksentler
 * Stok yönetimi + QR tarayıcı entegre
 */

import { useState, useCallback } from "react";
import { Flame, Radio, ScanLine, Plus, Minus, TrendingDown, Package, DollarSign, CheckCircle, Camera, AlertCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useDeals } from "@/contexts/DealsContext";
import { useTicketOperations } from "@/contexts/DealsContext";
import { toast } from "sonner";
import { formatPrice } from "@/lib/data";

type BusinessTab = "create" | "radar" | "scanner";

interface ActiveDeal {
  id: string;
  productName: string;
  currentPrice: number;
  minPrice: number;
  sold: number;
  remaining: number;
  totalEarned: number;
}

const MOCK_ACTIVE: ActiveDeal[] = [
  {
    id: "d1",
    productName: "Taze Kruvasan & Kahve",
    currentPrice: 38.5,
    minPrice: 20,
    sold: 3,
    remaining: 5,
    totalEarned: 135,
  },
  {
    id: "d2",
    productName: "Filtre Kahve & Kurabiye",
    currentPrice: 28,
    minPrice: 15,
    sold: 5,
    remaining: 5,
    totalEarned: 160,
  },
];

const PRODUCT_PRESETS = [
  { label: "☕ Kahve", value: "kahve" },
  { label: "🥪 Sandviç", value: "sandvic" },
  { label: "🍰 Tatlı", value: "tatli" },
  { label: "🥐 Kruvasan", value: "kruvasan" },
];

export default function Business() {
  const [activeTab, setActiveTab] = useState<BusinessTab>("create");

  return (
    <div className="app-shell flex flex-col min-h-dvh bg-[oklch(0.12_0.01_260)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[oklch(0.18_0.02_260)]/90 backdrop-blur-md border-b border-[oklch(0.25_0.02_260)] px-4 pt-3 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-white">İşletme Paneli</h1>
            <p className="text-xs text-[oklch(0.70_0.02_240)]">MOCHE KAFE · Gültepe</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_45)] to-[oklch(0.60_0.25_20)] flex items-center justify-center text-[oklch(0.12_0.01_260)] font-bold text-sm">
            MK
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 -mx-4 px-4 overflow-x-auto">
          {[
            { key: "create" as const, label: "Fırsat Yarat", icon: <Flame className="w-3.5 h-3.5" /> },
            { key: "radar" as const, label: "Radar", icon: <Radio className="w-3.5 h-3.5" /> },
            { key: "scanner" as const, label: "Kasa", icon: <ScanLine className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "text-[oklch(0.65_0.22_45)] border-[oklch(0.65_0.22_45)] bg-[oklch(0.22_0.02_260)]"
                  : "text-[oklch(0.70_0.02_240)] border-transparent hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-5 pb-8">
        {activeTab === "create" && <CreateDeal />}
        {activeTab === "radar" && <RadarView />}
        {activeTab === "scanner" && <ScannerView />}
      </main>
    </div>
  );
}

function CreateDeal() {
  const { deals } = useDeals();
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [stock, setStock] = useState(10);
  const [priceRange, setPriceRange] = useState([50, 80]);
  const [launched, setLaunched] = useState(false);

  const handleLaunch = useCallback(() => {
    if (!selectedProduct && !customName) {
      toast.error("Ürün seç veya adı gir", { duration: 2000 });
      return;
    }
    setLaunched(true);
    toast.success("Fırsat ateşlendi! 🔥", {
      description: `${customName || selectedProduct} — ${stock} adet, ${formatPrice(priceRange[1])} TL'den başlıyor`,
      duration: 3000,
    });
    setTimeout(() => setLaunched(false), 3000);
  }, [selectedProduct, customName, stock, priceRange]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-white">Yeni Fırsat Yarat</h2>
        <p className="text-xs text-[oklch(0.70_0.02_240)]">Ürün ekle, fiyat belirle, ateşle</p>
      </div>

      {/* Product selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white">Ürün Seç</label>
        <div className="grid grid-cols-2 gap-2">
          {PRODUCT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                setSelectedProduct(preset.value);
                setCustomName("");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                selectedProduct === preset.value
                  ? "bg-[oklch(0.65_0.22_45)] text-[oklch(0.12_0.01_260)]"
                  : "bg-[oklch(0.25_0.02_260)] text-white hover:bg-[oklch(0.30_0.02_260)]"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom product name */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white">Özel Ürün Adı</label>
        <input
          type="text"
          value={customName}
          onChange={(e) => {
            setCustomName(e.target.value);
            if (e.target.value) setSelectedProduct("");
          }}
          placeholder="Örn: Espresso Macchiato"
          className="w-full bg-[oklch(0.25_0.02_260)] border border-[oklch(0.30_0.02_260)] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[oklch(0.70_0.02_240)] focus:outline-none focus:border-[oklch(0.65_0.22_45)]"
        />
      </div>

      {/* Stock */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white">Stok Adedi</label>
          <span className="text-sm font-bold text-[oklch(0.65_0.22_45)]">{stock} adet</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStock(Math.max(1, stock - 1))}
            className="w-9 h-9 rounded-lg bg-[oklch(0.25_0.02_260)] flex items-center justify-center text-white hover:bg-[oklch(0.30_0.02_260)]"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 bg-[oklch(0.25_0.02_260)] border border-[oklch(0.30_0.02_260)] rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-[oklch(0.65_0.22_45)]"
          />
          <button
            onClick={() => setStock(stock + 1)}
            className="w-9 h-9 rounded-lg bg-[oklch(0.25_0.02_260)] flex items-center justify-center text-white hover:bg-[oklch(0.30_0.02_260)]"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price range slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white">Fiyat Aralığı</label>
          <span className="text-sm font-bold text-[oklch(0.65_0.22_45)]">
            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={10}
          max={200}
          step={5}
          className="w-full"
        />
      </div>

      {/* Launch button */}
      <button
        onClick={handleLaunch}
        disabled={launched}
        className="btn-fire w-full py-4 text-lg font-extrabold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {launched ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Ateşlendi!
          </>
        ) : (
          <>
            <Flame className="w-5 h-5 fill-current" />
            Fırsatı Ateşle
          </>
        )}
      </button>

      {launched && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 text-center slide-up">
          <p className="text-sm font-semibold text-green-400">
            🔔 Tüm öğrencilere bildirim gönderildi!
          </p>
          <p className="text-xs text-green-400/70 mt-0.5">Sayaç başladı, fırsatı takip et →</p>
        </div>
      )}
    </div>
  );
}

function RadarView() {
  const [deals] = useState<ActiveDeal[]>(MOCK_ACTIVE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Aktif Fırsatlar</h2>
          <p className="text-xs text-[oklch(0.70_0.02_240)]">Canlı satış takibi</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
          <span className="text-xs font-semibold text-green-400">{deals.length} aktif</span>
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-br from-[oklch(0.65_0.22_45)] to-[oklch(0.60_0.25_20)] rounded-2xl p-4 text-[oklch(0.12_0.01_260)]">
        <p className="text-xs font-semibold text-[oklch(0.12_0.01_260)]/80 mb-2">Bugünkü Özet</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xl font-bold font-price">
              {deals.reduce((a, d) => a + d.sold, 0)}
            </p>
            <p className="text-xs text-[oklch(0.12_0.01_260)]/70">Satılan</p>
          </div>
          <div className="text-center border-x border-[oklch(0.12_0.01_260)]/20">
            <p className="text-xl font-bold font-price">
              {deals.reduce((a, d) => a + d.remaining, 0)}
            </p>
            <p className="text-xs text-[oklch(0.12_0.01_260)]/70">Kalan</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-price">
              {deals.reduce((a, d) => a + d.totalEarned, 0)} ₺
            </p>
            <p className="text-xs text-[oklch(0.12_0.01_260)]/70">Kazanılan</p>
          </div>
        </div>
      </div>

      {deals.map((deal) => (
        <ActiveDealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}

function ActiveDealCard({ deal }: { deal: ActiveDeal }) {
  const soldPct = (deal.sold / (deal.sold + deal.remaining)) * 100;

  return (
    <div className="bg-[oklch(0.18_0.02_260)] rounded-2xl border border-[oklch(0.25_0.02_260)] p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-white">{deal.productName}</p>
          <p className="text-xs text-[oklch(0.70_0.02_240)] mt-0.5">
            Anlık:{" "}
            <span className="font-bold text-[oklch(0.65_0.22_45)] font-price">
              {formatPrice(deal.currentPrice)}
            </span>
          </p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/20 border border-green-500/30 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
          Canlı
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-[oklch(0.25_0.02_260)] rounded-xl p-2.5 text-center">
          <Package className="w-4 h-4 text-[oklch(0.70_0.02_240)] mx-auto mb-1" />
          <p className="text-base font-bold font-price text-white">{deal.sold}</p>
          <p className="text-xs text-[oklch(0.70_0.02_240)]">Satıldı</p>
        </div>
        <div className="bg-[oklch(0.25_0.02_260)] rounded-xl p-2.5 text-center">
          <TrendingDown className="w-4 h-4 text-[oklch(0.70_0.02_240)] mx-auto mb-1" />
          <p className="text-base font-bold font-price text-white">{deal.remaining}</p>
          <p className="text-xs text-[oklch(0.70_0.02_240)]">Kalan</p>
        </div>
        <div className="bg-[oklch(0.25_0.02_260)] rounded-xl p-2.5 text-center">
          <DollarSign className="w-4 h-4 text-[oklch(0.70_0.02_240)] mx-auto mb-1" />
          <p className="text-base font-bold font-price text-white">{deal.totalEarned}₺</p>
          <p className="text-xs text-[oklch(0.70_0.02_240)]">Kazanç</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 bg-[oklch(0.25_0.02_260)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[oklch(0.65_0.22_45)] to-[oklch(0.60_0.25_20)] rounded-full transition-all duration-500"
            style={{ width: `${soldPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ScannerView() {
  const { markTicketAsUsed, getTicketByCode } = useTicketOperations();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [scannedTicket, setScannedTicket] = useState<any>(null);
  const [error, setError] = useState("");

  const handleScan = () => {
    if (!codeInput.trim()) {
      setError("Lütfen bir kod gir");
      return;
    }

    setScanning(true);
    setError("");

    // Kodu temizle (# işaretini kaldır)
    const cleanCode = codeInput.replace("#", "").toUpperCase();

    setTimeout(() => {
      const ticket = getTicketByCode(cleanCode);

      if (!ticket) {
        setScanning(false);
        setError(`Kod bulunamadı: ${cleanCode}`);
        setCodeInput("");
        return;
      }

      if (ticket.used) {
        setScanning(false);
        setError("Bu bilet zaten kullanıldı!");
        setCodeInput("");
        return;
      }

      // Bileti kullanıldı olarak işaretle
      markTicketAsUsed(ticket.id);
      setScannedTicket(ticket);
      setScanned(true);
      setCodeInput("");

      toast.success("QR Kod Okundu! ✅", {
        description: `${ticket.quantity}x ${ticket.productName} — #${ticket.deliveryCode} teslim edildi`,
        duration: 4000,
      });

      // 3 saniye sonra sıfırla
      setTimeout(() => {
        setScanned(false);
        setScannedTicket(null);
      }, 3000);

      setScanning(false);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-white">Kasa / QR Okuyucu</h2>
        <p className="text-xs text-[oklch(0.70_0.02_240)]">Öğrencinin QR kodunu veya teslimat kodunu oku</p>
      </div>

      {/* Code input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white">Teslimat Kodu Gir</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value);
              setError("");
            }}
            onKeyPress={(e) => e.key === "Enter" && handleScan()}
            placeholder="Örn: 8492 veya #8492"
            className="flex-1 bg-[oklch(0.25_0.02_260)] border border-[oklch(0.30_0.02_260)] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[oklch(0.70_0.02_240)] focus:outline-none focus:border-[oklch(0.65_0.22_45)]"
          />
          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-4 py-2.5 bg-[oklch(0.65_0.22_45)] text-[oklch(0.12_0.01_260)] rounded-xl font-semibold text-sm hover:bg-[oklch(0.60_0.25_20)] disabled:opacity-50 transition-colors"
          >
            {scanning ? "..." : "Oku"}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Scanner area */}
      <div className="bg-[oklch(0.18_0.02_260)] rounded-2xl border border-[oklch(0.25_0.02_260)] overflow-hidden">
        <div className="relative bg-gray-900 aspect-square flex items-center justify-center">
          {/* Camera viewfinder simulation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {scanning ? (
              <div className="relative w-48 h-48">
                {/* Scanning animation */}
                <div className="absolute inset-0 border-2 border-green-400 rounded-xl" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-400 animate-bounce" style={{ animationDuration: "1s" }} />
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-green-400 rounded-tl" />
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-green-400 rounded-tr" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-green-400 rounded-bl" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-green-400 rounded-br" />
                <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-green-400 text-xs font-semibold whitespace-nowrap">
                  Taranıyor...
                </p>
              </div>
            ) : scanned && scannedTicket ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-green-400 font-bold text-sm">Başarılı!</p>
                  <p className="text-xs text-green-400/70 mt-1">{scannedTicket.productName}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 border-2 border-white/30 rounded-xl" />
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white/60 rounded-tl" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white/60 rounded-tr" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white/60 rounded-bl" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white/60 rounded-br" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-white/40" />
                  </div>
                </div>
                <p className="text-white/50 text-xs">Kod gir veya tara</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          {scanned && scannedTicket ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3">
              <p className="text-sm font-bold text-green-400">✅ Ürün teslim edildi</p>
              <p className="text-xs text-green-400/70 mt-0.5">
                {scannedTicket.quantity}x {scannedTicket.productName} — Teslimat Kodu: #{scannedTicket.deliveryCode}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[oklch(0.25_0.02_260)] rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-white">Nasıl kullanılır?</p>
        {[
          "Öğrenci teslimat kodunu göstersin",
          "Kodu input alanına gir (örn: 8492)",
          "Enter tuşuna bas veya Oku butonuna tıkla",
          "Sistem otomatik doğrular ve bilet kullanıldı olur",
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[oklch(0.65_0.22_45)] text-[oklch(0.12_0.01_260)] text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <p className="text-xs text-[oklch(0.70_0.02_240)]">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

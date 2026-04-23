/**
 * Business — İşletme Yönetim Arayüzü
 * Design: DropBite — koyu tema, turuncu aksentler
 * Stok yönetimi entegre
 */

import { useState, useCallback } from "react";
import { Flame, Radio, ScanLine, Plus, Minus, TrendingDown, Package, DollarSign, CheckCircle, Camera } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useDeals } from "@/contexts/DealsContext";
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
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [customProduct, setCustomProduct] = useState("");
  const [stock, setStock] = useState(5);
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 60]);
  const [launched, setLaunched] = useState(false);

  const productName = selectedProduct === "custom"
    ? customProduct
    : PRODUCT_PRESETS.find((p) => p.value === selectedProduct)?.label.split(" ").slice(1).join(" ") || "";

  const handleLaunch = useCallback(() => {
    if (!selectedProduct && !customProduct) {
      toast.error("Lütfen bir ürün seç!");
      return;
    }
    if (stock < 1) {
      toast.error("En az 1 adet stok gir!");
      return;
    }
    setLaunched(true);
    toast.success("Fırsat ateşlendi! 🔥", {
      description: `${productName} — ${stock} adet, ${priceRange[0]}–${priceRange[1]} TL aralığında`,
      duration: 4000,
    });
    setTimeout(() => setLaunched(false), 3000);
  }, [selectedProduct, customProduct, stock, priceRange, productName]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-white mb-1">Hızlı Fırsat Yarat</h2>
        <p className="text-xs text-[oklch(0.70_0.02_240)]">3 adımda fırsatını ateşle</p>
      </div>

      {/* Step 1: Ürün seçimi */}
      <div className="bg-[oklch(0.18_0.02_260)] rounded-2xl border border-[oklch(0.25_0.02_260)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-[oklch(0.65_0.22_45)] text-[oklch(0.12_0.01_260)] text-xs font-bold flex items-center justify-center">1</span>
          <p className="text-sm font-bold text-white">Ürün Seç</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setSelectedProduct(p.value)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                selectedProduct === p.value
                  ? "bg-[oklch(0.65_0.22_45)] text-[oklch(0.12_0.01_260)] border-[oklch(0.65_0.22_45)] shadow-sm"
                  : "bg-[oklch(0.25_0.02_260)] text-white border-[oklch(0.30_0.02_260)] hover:border-[oklch(0.65_0.22_45)]/50"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setSelectedProduct("custom")}
            className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1 ${
              selectedProduct === "custom"
                ? "bg-[oklch(0.65_0.22_45)] text-[oklch(0.12_0.01_260)] border-[oklch(0.65_0.22_45)]"
                : "bg-[oklch(0.25_0.02_260)] text-white border-[oklch(0.30_0.02_260)] hover:border-[oklch(0.65_0.22_45)]/50"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni Ekle
          </button>
        </div>
        {selectedProduct === "custom" && (
          <input
            type="text"
            placeholder="Ürün adını yaz..."
            value={customProduct}
            onChange={(e) => setCustomProduct(e.target.value)}
            className="mt-3 w-full bg-[oklch(0.25_0.02_260)] border border-[oklch(0.30_0.02_260)] rounded-xl px-3 py-2.5 text-sm font-medium text-white placeholder:text-[oklch(0.70_0.02_240)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.22_45)]/30"
          />
        )}
      </div>

      {/* Step 2: Stok miktarı */}
      <div className="bg-[oklch(0.18_0.02_260)] rounded-2xl border border-[oklch(0.25_0.02_260)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-[oklch(0.65_0.22_45)] text-[oklch(0.12_0.01_260)] text-xs font-bold flex items-center justify-center">2</span>
          <p className="text-sm font-bold text-white">Stok Miktarı</p>
        </div>
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={() => setStock((s) => Math.max(1, s - 1))}
            className="w-11 h-11 rounded-full bg-[oklch(0.25_0.02_260)] border border-[oklch(0.30_0.02_260)] flex items-center justify-center hover:bg-[oklch(0.30_0.02_260)] active:scale-95 transition-all"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          <div className="text-center">
            <span className="text-4xl font-bold font-price text-white">{stock}</span>
            <p className="text-xs text-[oklch(0.70_0.02_240)] mt-0.5">adet</p>
          </div>
          <button
            onClick={() => setStock((s) => Math.min(50, s + 1))}
            className="w-11 h-11 rounded-full bg-[oklch(0.65_0.22_45)] text-[oklch(0.12_0.01_260)] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step 3: Fiyat aralığı */}
      <div className="bg-[oklch(0.18_0.02_260)] rounded-2xl border border-[oklch(0.25_0.02_260)] p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-[oklch(0.65_0.22_45)] text-[oklch(0.12_0.01_260)] text-xs font-bold flex items-center justify-center">3</span>
          <p className="text-sm font-bold text-white">Fiyat Aralığı</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-xs text-[oklch(0.70_0.02_240)] mb-1">Taban Fiyat</p>
            <p className="text-xl font-bold font-price text-green-400">
              {priceRange[0]} TL
            </p>
          </div>
          <TrendingDown className="w-5 h-5 text-[oklch(0.70_0.02_240)]" />
          <div className="text-center">
            <p className="text-xs text-[oklch(0.70_0.02_240)] mb-1">Başlangıç Fiyatı</p>
            <p className="text-xl font-bold font-price text-[oklch(0.65_0.22_45)]">
              {priceRange[1]} TL
            </p>
          </div>
        </div>

        <Slider
          min={5}
          max={200}
          step={5}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[oklch(0.70_0.02_240)]">5 TL</span>
          <span className="text-xs text-[oklch(0.70_0.02_240)]">200 TL</span>
        </div>
      </div>

      {/* Launch button */}
      <button
        onClick={handleLaunch}
        disabled={launched}
        className={`btn-fire w-full py-4 text-lg font-extrabold tracking-wide flex items-center justify-center gap-2 ${launched ? "opacity-75" : ""}`}
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
          <TrendingDown className="w-4 h-4 text-[oklch(0.65_0.22_45)] mx-auto mb-1" />
          <p className="text-base font-bold font-price text-white">{deal.remaining}</p>
          <p className="text-xs text-[oklch(0.70_0.02_240)]">Kaldı</p>
        </div>
        <div className="bg-[oklch(0.65_0.22_45)]/20 rounded-xl p-2.5 text-center border border-[oklch(0.65_0.22_45)]/30">
          <DollarSign className="w-4 h-4 text-[oklch(0.65_0.22_45)] mx-auto mb-1" />
          <p className="text-base font-bold font-price text-[oklch(0.65_0.22_45)]">{deal.totalEarned}₺</p>
          <p className="text-xs text-[oklch(0.70_0.02_240)]">Kazanılan</p>
        </div>
      </div>

      {/* Sold progress */}
      <div>
        <div className="flex justify-between text-xs text-[oklch(0.70_0.02_240)] mb-1">
          <span>Satış ilerlemesi</span>
          <span className="font-semibold text-white">%{Math.round(soldPct)}</span>
        </div>
        <div className="h-2 bg-[oklch(0.25_0.02_260)] rounded-full overflow-hidden">
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
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      toast.success("QR Kod Okundu! ✅", {
        description: "1x Filtre Kahve & Kurabiye — #8492 teslim edildi",
        duration: 4000,
      });
    }, 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-white">Kasa / QR Okuyucu</h2>
        <p className="text-xs text-[oklch(0.70_0.02_240)]">Öğrencinin QR kodunu okut</p>
      </div>

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
            ) : scanned ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-white" />
                </div>
                <p className="text-green-400 font-bold text-sm">Başarılı!</p>
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
                <p className="text-white/50 text-xs">Kamera bekleniyor</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          {scanned ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-3">
              <p className="text-sm font-bold text-green-400">✅ Ürün teslim edildi</p>
              <p className="text-xs text-green-400/70 mt-0.5">
                1x Filtre Kahve & Kurabiye — Teslimat Kodu: #8492
              </p>
            </div>
          ) : null}

          <button
            onClick={scanned ? () => setScanned(false) : handleScan}
            disabled={scanning}
            className={`btn-fire w-full py-3.5 text-base font-bold flex items-center justify-center gap-2 ${scanning ? "opacity-75" : ""}`}
          >
            <ScanLine className="w-5 h-5" />
            {scanning ? "Taranıyor..." : scanned ? "Yeni Tara" : "QR Kodu Tara"}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[oklch(0.25_0.02_260)] rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-white">Nasıl kullanılır?</p>
        {[
          "Öğrenci telefonunu göstersin",
          "Butona bas, kamera açılsın",
          "QR kodu çerçeveye getir",
          "Sistem otomatik okur ve düşer",
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

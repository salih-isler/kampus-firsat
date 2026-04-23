// Kampüs Fırsat — Shared types & mock data
// Design: Kampüs Enerjisi — warm orange-red gradients, clean white cards

export interface Deal {
  id: string;
  cafeName: string;
  cafeLocation: string;
  productName: string;
  productImage: string;
  currentPrice: number;
  originalPrice: number;
  startPrice: number;
  minPrice: number;
  stock: number;
  totalStock: number;
  viewerCount: number;
  expiresAt: number; // timestamp ms
  category: "kahve" | "sandviç" | "tatlı" | "diğer";
}

export interface Ticket {
  id: string;
  dealId: string;
  cafeName: string;
  cafeLocation: string;
  productName: string;
  quantity: number;
  paidPrice: number;
  purchasedAt: number;
  deliveryCode: string;
  qrData: string;
  used: boolean;
}

export interface WalletBalance {
  silverPoints: number;
  goldTokens: number;
}

// Mock deals
export const MOCK_DEALS: Deal[] = [
  {
    id: "d1",
    cafeName: "Moche Kafe",
    cafeLocation: "Gültepe",
    productName: "Tereyağlı Kruvasan",
    productImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663590750472/LS3zwwQhbouofZjpxxzoGE/croissant-XuWWnAjJ6qHbVm9f5GhVrG.webp",
    currentPrice: 42.5,
    originalPrice: 80.0,
    startPrice: 75.0,
    minPrice: 20.0,
    stock: 3,
    totalStock: 8,
    viewerCount: 14,
    expiresAt: Date.now() + 8 * 60 * 1000,
    category: "diğer",
  },
  {
    id: "d2",
    cafeName: "Brew Lab",
    cafeLocation: "Sümer Kampüsü",
    productName: "Filtre Kahve & Kurabiye",
    productImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663590750472/LS3zwwQhbouofZjpxxzoGE/filter-coffee-oKmt3PCcKAkcwCQjV5BtVA.webp",
    currentPrice: 28.0,
    originalPrice: 55.0,
    startPrice: 50.0,
    minPrice: 15.0,
    stock: 5,
    totalStock: 10,
    viewerCount: 9,
    expiresAt: Date.now() + 14 * 60 * 1000,
    category: "kahve",
  },
  {
    id: "d3",
    cafeName: "Köşe Bistro",
    cafeLocation: "Merkez",
    productName: "Gurme Sandviç",
    productImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663590750472/LS3zwwQhbouofZjpxxzoGE/sandwich-WH3meYmowdWSpaycKPYUsb.webp",
    currentPrice: 65.0,
    originalPrice: 120.0,
    startPrice: 110.0,
    minPrice: 40.0,
    stock: 2,
    totalStock: 6,
    viewerCount: 22,
    expiresAt: Date.now() + 5 * 60 * 1000,
    category: "sandviç",
  },
  {
    id: "d4",
    cafeName: "Sweet Corner",
    cafeLocation: "Kuzey Kapı",
    productName: "Çikolatalı Brownie",
    productImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663590750472/LS3zwwQhbouofZjpxxzoGE/dessert-i5iaQYJCVmjryuWWePj9r9.webp",
    currentPrice: 35.0,
    originalPrice: 65.0,
    startPrice: 60.0,
    minPrice: 18.0,
    stock: 4,
    totalStock: 7,
    viewerCount: 7,
    expiresAt: Date.now() + 20 * 60 * 1000,
    category: "tatlı",
  },
];

export const MOCK_WALLET: WalletBalance = {
  silverPoints: 1240,
  goldTokens: 3,
};

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "t1",
    dealId: "d2",
    cafeName: "Brew Lab",
    cafeLocation: "Sümer Kampüsü",
    productName: "Filtre Kahve & Kurabiye",
    quantity: 1,
    paidPrice: 28.0,
    purchasedAt: Date.now() - 30 * 60 * 1000,
    deliveryCode: "#8492",
    qrData: "KAMPUS-FIRSAT-T1-8492-BREWLAB",
    used: false,
  },
];

// Utility: get price color based on drop percentage
export function getPriceColor(current: number, original: number): string {
  const dropPct = (original - current) / original;
  if (dropPct < 0.3) return "text-green-500";
  if (dropPct < 0.55) return "text-yellow-500";
  return "text-red-500";
}

// Utility: format TL price
export function formatPrice(price: number): string {
  return price.toFixed(2).replace(".", ",") + " TL";
}

// Utility: format remaining time
export function formatTimeLeft(expiresAt: number): string {
  const diff = Math.max(0, expiresAt - Date.now());
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Utility: get progress percentage
export function getTimeProgress(expiresAt: number, totalDuration = 20 * 60 * 1000): number {
  const remaining = Math.max(0, expiresAt - Date.now());
  return (remaining / totalDuration) * 100;
}

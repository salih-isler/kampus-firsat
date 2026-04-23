/**
 * DealsContext — Global stok yönetimi
 * Tüm sayfalar arasında deal ve stok durumunu paylaş
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { MOCK_DEALS, type Deal } from "@/lib/data";

interface DealsContextType {
  deals: Deal[];
  updateDealStock: (dealId: string, quantity: number) => void;
  getDealById: (dealId: string) => Deal | undefined;
}

const DealsContext = createContext<DealsContextType | undefined>(undefined);

export function DealsProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);

  const updateDealStock = useCallback((dealId: string, quantity: number) => {
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === dealId
          ? { ...deal, stock: Math.max(0, deal.stock - quantity) }
          : deal
      )
    );
  }, []);

  const getDealById = useCallback(
    (dealId: string) => deals.find((d) => d.id === dealId),
    [deals]
  );

  return (
    <DealsContext.Provider value={{ deals, updateDealStock, getDealById }}>
      {children}
    </DealsContext.Provider>
  );
}

export function useDeals() {
  const context = useContext(DealsContext);
  if (!context) {
    throw new Error("useDeals must be used within DealsProvider");
  }
  return context;
}

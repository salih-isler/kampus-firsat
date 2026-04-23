/**
 * DealsContext — Global stok yönetimi + Canlı fiyat düşüşü
 * Tüm sayfalar arasında deal, stok ve fiyat durumunu paylaş
 * Her saniye: fiyat -1 TL, kalan süre güncelle
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MOCK_DEALS, MOCK_TICKETS, type Deal, type Ticket } from "@/lib/data";

interface DealsContextType {
  deals: Deal[];
  tickets: Ticket[];
  updateDealStock: (dealId: string, quantity: number) => void;
  getDealById: (dealId: string) => Deal | undefined;
  addTicket: (ticket: Ticket) => void;
}

const DealsContext = createContext<DealsContextType | undefined>(undefined);

export function DealsProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);

  // Her saniye: fiyat -1 TL, kalan süre güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      setDeals((prev) =>
        prev.map((deal) => {
          const now = Date.now();
          const timeRemaining = Math.max(0, deal.expiresAt - now);

          // Eğer süre bittiyse fiyatı taban fiyata sabitle
          if (timeRemaining <= 0) {
            return {
              ...deal,
              currentPrice: deal.minPrice,
              expiresAt: now, // Süresi bitti
            };
          }

          // Fiyatı 1 TL azalt, taban fiyatın altına gitmesin
          const newPrice = Math.max(deal.minPrice, deal.currentPrice - 1);

          return {
            ...deal,
            currentPrice: newPrice,
          };
        })
      );
    }, 1000); // Her 1 saniyede bir

    return () => clearInterval(interval);
  }, []);

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

  const addTicket = useCallback((ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  }, []);

  return (
    <DealsContext.Provider value={{ deals, tickets, updateDealStock, getDealById, addTicket }}>
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

export function useTickets() {
  const context = useContext(DealsContext);
  if (!context) {
    throw new Error("useTickets must be used within DealsProvider");
  }
  return context.tickets;
}

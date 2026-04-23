/**
 * DealsContext — Global stok yönetimi + Canlı fiyat düşüşü
 * Tüm sayfalar arasında deal, stok ve fiyat durumunu paylaş
 * Her saniye: fiyat oransal düşüş (başlangıç fiyatına göre), kalan süre güncelle
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MOCK_DEALS, MOCK_TICKETS, type Deal, type Ticket } from "@/lib/data";

interface DealsContextType {
  deals: Deal[];
  tickets: Ticket[];
  updateDealStock: (dealId: string, quantity: number) => void;
  getDealById: (dealId: string) => Deal | undefined;
  addTicket: (ticket: Ticket) => void;
  markTicketAsUsed: (ticketId: string) => void;
  getTicketByCode: (code: string) => Ticket | undefined;
}

const DealsContext = createContext<DealsContextType | undefined>(undefined);

export function DealsProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);

  // Her saniye: fiyat oransal düşüş, kalan süre güncelle
  // Düşüş oranı: (başlangıç fiyatı - taban fiyatı) / toplam süre (saniye)
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

          // Oransal fiyat düşüşü hesapla
          // Düşüş miktarı = (başlangıç fiyatı - taban fiyatı) / (toplam süre saniye cinsinden) * 1 saniye
          const totalDurationMs = deal.expiresAt - (deal.expiresAt - (deal.expiresAt - now) - (deal.expiresAt - now));
          const initialDuration = (deal.expiresAt - Date.now() + timeRemaining) || 1; // Başlangıçtaki süre
          const priceRange = deal.startPrice - deal.minPrice; // Düşebilecek maksimum fiyat
          const totalDurationSeconds = initialDuration / 1000; // Toplam süre saniye cinsinden
          
          // Saniye başına düşüş miktarı
          const priceDropPerSecond = totalDurationSeconds > 0 ? priceRange / totalDurationSeconds : 0;
          
          // Yeni fiyat
          const newPrice = Math.max(deal.minPrice, deal.currentPrice - priceDropPerSecond);

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

  const markTicketAsUsed = useCallback((ticketId: string) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, used: true } : ticket
      )
    );
  }, []);

  const getTicketByCode = useCallback(
    (code: string) => tickets.find((t) => t.deliveryCode === code),
    [tickets]
  );

  return (
    <DealsContext.Provider value={{ deals, tickets, updateDealStock, getDealById, addTicket, markTicketAsUsed, getTicketByCode }}>
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

export function useTicketOperations() {
  const context = useContext(DealsContext);
  if (!context) {
    throw new Error("useTicketOperations must be used within DealsProvider");
  }
  return {
    markTicketAsUsed: context.markTicketAsUsed,
    getTicketByCode: context.getTicketByCode,
  };
}

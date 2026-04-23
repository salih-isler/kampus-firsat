/**
 * Wallet — Cüzdanım ve QR Biletler
 * Design: Kampüs Enerjisi — büyük QR kod, sipariş özeti, yol tarifi butonu
 * - Cüzdan bakiyesi (Gümüş Puan + Altın Jeton)
 * - QR bilet kartları (büyük QR kod, sipariş özeti, teslimat kodu)
 * - "Kafeye Yol Tarifi Al" butonu
 */

import { useState } from "react";
import { MapPin, Star, Coins, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { MOCK_TICKETS, MOCK_WALLET, formatPrice, type Ticket } from "@/lib/data";
import { BottomNav } from "./ConsumerFeed";
import { toast } from "sonner";

// Simple SVG QR code placeholder (visual representation)
function QRCodeDisplay({ data }: { data: string }) {
  // Generate a deterministic pattern from data string
  const hash = data.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cells = 21;
  const grid: boolean[][] = [];

  for (let r = 0; r < cells; r++) {
    grid[r] = [];
    for (let c = 0; c < cells; c++) {
      // Finder patterns (corners)
      const inFinder =
        (r < 7 && c < 7) ||
        (r < 7 && c >= cells - 7) ||
        (r >= cells - 7 && c < 7);
      if (inFinder) {
        const fr = r % 7;
        const fc = c % 7;
        const cr = r >= cells - 7 ? r - (cells - 7) : r;
        const cc = c >= cells - 7 ? c - (cells - 7) : c;
        grid[r][c] =
          cr === 0 || cr === 6 || cc === 0 || cc === 6 || (cr >= 2 && cr <= 4 && cc >= 2 && cc <= 4);
      } else {
        grid[r][c] = ((hash * (r + 1) * (c + 3)) % 17) > 8;
      }
    }
  }

  const size = 220;
  const cellSize = size / cells;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-xl">
      <rect width={size} height={size} fill="white" />
      {grid.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#1a1a2e"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function Wallet() {
  const [tickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  return (
    <div className="app-shell flex flex-col min-h-dvh bg-[oklch(0.97_0.005_240)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border px-4 pt-3 pb-3">
        <h1 className="text-lg font-bold text-foreground">Cüzdanım</h1>
        <p className="text-xs text-muted-foreground">Biletlerin ve bakiyen</p>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        {/* Balance card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-sm font-semibold text-white/80 mb-3">Bakiyem</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-200 fill-yellow-200" />
              </div>
              <div>
                <p className="text-2xl font-bold font-price">
                  {MOCK_WALLET.silverPoints.toLocaleString("tr")}
                </p>
                <p className="text-xs text-white/70">Gümüş Puan</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/30" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-yellow-200" />
              </div>
              <div>
                <p className="text-2xl font-bold font-price">{MOCK_WALLET.goldTokens}</p>
                <p className="text-xs text-white/70">Altın Jeton</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets section */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">Biletlerim</h2>

          {tickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-foreground">Henüz bilet yok</p>
              <p className="text-xs text-muted-foreground mt-1">
                Bir fırsat kap, biletini burada gör!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onTap={() => setSelectedTicket(ticket)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* QR Modal */}
      {selectedTicket && (
        <QRModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}

      <BottomNav active="wallet" />
    </div>
  );
}

function TicketCard({ ticket, onTap }: { ticket: Ticket; onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      className="w-full text-left bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md active:scale-[0.98] transition-all duration-200"
    >
      <div className="flex items-center gap-3 p-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            ticket.used ? "bg-secondary" : "bg-green-50"
          }`}
        >
          {ticket.used ? (
            <CheckCircle className="w-5 h-5 text-muted-foreground" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <path d="M14 14h.01M14 17h.01M17 14h.01M17 17h.01M20 14h.01M20 17h.01M20 20h.01M17 20h.01M14 20h.01" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{ticket.productName}</p>
          <p className="text-xs text-muted-foreground">
            {ticket.cafeName} · {ticket.cafeLocation}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-primary font-price">
              {formatPrice(ticket.paidPrice)}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-mono text-muted-foreground">{ticket.deliveryCode}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              ticket.used
                ? "bg-secondary text-muted-foreground"
                : "bg-green-100 text-green-700"
            }`}
          >
            {ticket.used ? "Kullanıldı" : "Aktif"}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      {!ticket.used && (
        <div className="bg-green-50 border-t border-green-100 px-4 py-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs text-green-700 font-medium">QR kodu göster → tıkla</span>
        </div>
      )}
    </button>
  );
}

function QRModal({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[480px] bg-white rounded-t-3xl px-6 pt-6 pb-10 slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />

        <h2 className="text-lg font-bold text-foreground text-center mb-1">
          QR Biletim
        </h2>
        <p className="text-xs text-muted-foreground text-center mb-6">
          Kafeye gidince bu kodu göster
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-5">
          <div className="p-4 bg-white rounded-2xl shadow-lg border border-border">
            <QRCodeDisplay data={ticket.qrData} />
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-secondary rounded-xl p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">
            Sipariş Özeti
          </p>
          <p className="text-sm font-bold text-foreground">
            {ticket.quantity}x {ticket.productName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {ticket.cafeName} · {ticket.cafeLocation}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Teslimat Kodu</span>
            <span className="text-sm font-bold font-price text-foreground">
              {ticket.deliveryCode}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">Ödenen</span>
            <span className="text-sm font-bold font-price text-primary">
              {formatPrice(ticket.paidPrice)}
            </span>
          </div>
        </div>

        {/* Directions button */}
        <button
          onClick={() => {
            toast.info("Harita uygulaması açılıyor...", { duration: 2000 });
          }}
          className="w-full flex items-center justify-center gap-2 bg-secondary border border-border rounded-xl py-3.5 text-sm font-semibold text-foreground hover:bg-border transition-colors"
        >
          <MapPin className="w-4 h-4 text-primary" />
          Kafeye Yol Tarifi Al
        </button>
      </div>
    </div>
  );
}

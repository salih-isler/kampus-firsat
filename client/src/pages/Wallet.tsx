/**
 * Wallet — Cüzdanım ve QR Biletler
 * Design: DropBite — koyu tema
 * Web3: Monad Testnet transaction tracking
 */

import { useState } from "react";
import { MapPin, Star, Coins, CheckCircle, Clock, ChevronRight, ExternalLink } from "lucide-react";
import { MOCK_WALLET, formatPrice, type Ticket } from "@/lib/data";
import { useWeb3 } from "@/contexts/Web3Context";
import { useTickets } from "@/contexts/DealsContext";
import { BottomNav } from "./ConsumerFeed";
import { toast } from "sonner";
import { MONAD_CONFIG } from "@/lib/monad";

function QRCodeDisplay({ data }: { data: string }) {
  const hash = data.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cells = 21;
  const grid: boolean[][] = [];

  for (let r = 0; r < cells; r++) {
    grid[r] = [];
    for (let c = 0; c < cells; c++) {
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
  const tickets = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { account, isConnected, balance } = useWeb3();

  return (
    <div className="app-shell flex flex-col min-h-dvh bg-[oklch(0.12_0.01_260)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[oklch(0.18_0.02_260)]/90 backdrop-blur-md border-b border-[oklch(0.25_0.02_260)] px-4 pt-3 pb-3">
        <h1 className="text-lg font-bold text-white">Cüzdanım</h1>
        <p className="text-xs text-[oklch(0.70_0.02_240)]">Biletlerin ve bakiyen</p>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        {/* Web3 Balance Card */}
        {isConnected && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg border border-blue-500/30">
            <p className="text-sm font-semibold text-blue-100 mb-3">Monad Testnet Bakiyesi</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold font-price">
                  {balance && balance !== "0" ? parseFloat(balance).toFixed(4) : "0.00"}
                </p>
                <p className="text-xs text-blue-100 mt-1">MONAD</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-100 mb-1">Cüzdan</p>
                <p className="text-sm font-mono text-white">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Balance card */}
        <div className="bg-gradient-to-br from-[oklch(0.65_0.22_45)] to-[oklch(0.60_0.25_20)] rounded-2xl p-5 text-[oklch(0.12_0.01_260)] shadow-lg">
          <p className="text-sm font-semibold text-[oklch(0.12_0.01_260)]/80 mb-3">Bakiyem</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[oklch(0.12_0.01_260)]/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-[oklch(0.72_0.18_70)] fill-[oklch(0.72_0.18_70)]" />
              </div>
              <div>
                <p className="text-2xl font-bold font-price">
                  {MOCK_WALLET.silverPoints.toLocaleString("tr")}
                </p>
                <p className="text-xs text-[oklch(0.12_0.01_260)]/70">Gümüş Puan</p>
              </div>
            </div>
            <div className="w-px h-10 bg-[oklch(0.12_0.01_260)]/30" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[oklch(0.12_0.01_260)]/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-[oklch(0.72_0.18_70)]" />
              </div>
              <div>
                <p className="text-2xl font-bold font-price">{MOCK_WALLET.goldTokens}</p>
                <p className="text-xs text-[oklch(0.12_0.01_260)]/70">Altın Jeton</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets section */}
        <div>
          <h2 className="text-base font-bold text-white mb-3">Biletlerim</h2>

          {!tickets || tickets.length === 0 ? (
            <div className="bg-[oklch(0.18_0.02_260)] rounded-2xl border border-[oklch(0.25_0.02_260)] p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[oklch(0.25_0.02_260)] flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-[oklch(0.70_0.02_240)]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Henüz bilet yok</p>
              <p className="text-xs text-[oklch(0.70_0.02_240)] mt-1">
                Bir fırsat kap, biletini burada gör!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets && tickets.map((ticket) => (
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
      className="w-full text-left bg-[oklch(0.18_0.02_260)] rounded-2xl border border-[oklch(0.25_0.02_260)] overflow-hidden hover:border-[oklch(0.35_0.02_260)] active:scale-[0.98] transition-all duration-200"
    >
      <div className="flex items-center gap-3 p-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            ticket.used ? "bg-[oklch(0.25_0.02_260)]" : "bg-green-500/20"
          }`}
        >
          {ticket.used ? (
            <CheckCircle className="w-5 h-5 text-[oklch(0.70_0.02_240)]" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <path d="M14 14h.01M14 17h.01M17 14h.01M17 17h.01M20 14h.01M20 17h.01M20 20h.01M17 20h.01M14 20h.01" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{ticket.productName}</p>
          <p className="text-xs text-[oklch(0.70_0.02_240)]">
            {ticket.cafeName} · {ticket.cafeLocation}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-[oklch(0.65_0.22_45)] font-price">
              {formatPrice(ticket.paidPrice)}
            </span>
            <span className="text-xs text-[oklch(0.70_0.02_240)]">·</span>
            <span className="text-xs font-mono text-[oklch(0.70_0.02_240)]">{ticket.deliveryCode}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              ticket.used
                ? "bg-[oklch(0.25_0.02_260)] text-[oklch(0.70_0.02_240)]"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {ticket.used ? "Kullanıldı" : "Aktif"}
          </span>
          <ChevronRight className="w-4 h-4 text-[oklch(0.70_0.02_240)]" />
        </div>
      </div>
      {!ticket.used && (
        <div className="bg-green-500/10 border-t border-green-500/20 px-4 py-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs text-green-400 font-medium">QR kodu göster → tıkla</span>
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
        className="relative w-full max-w-[480px] bg-[oklch(0.18_0.02_260)] rounded-t-3xl px-6 pt-6 pb-10 slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-[oklch(0.25_0.02_260)] mx-auto mb-6" />

        <h2 className="text-lg font-bold text-white text-center mb-1">
          QR Biletim
        </h2>
        <p className="text-xs text-[oklch(0.70_0.02_240)] text-center mb-6">
          Kafeye gidince bu kodu göster
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-5">
          <div className="p-4 bg-white rounded-2xl shadow-lg border border-[oklch(0.25_0.02_260)]">
            <QRCodeDisplay data={ticket.qrData} />
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-[oklch(0.25_0.02_260)] rounded-xl p-4 mb-4">
          <p className="text-xs text-[oklch(0.70_0.02_240)] mb-2 font-semibold uppercase tracking-wide">
            Sipariş Özeti
          </p>
          <p className="text-sm font-bold text-white">
            {ticket.quantity}x {ticket.productName}
          </p>
          <p className="text-xs text-[oklch(0.70_0.02_240)] mt-0.5">
            {ticket.cafeName} · {ticket.cafeLocation}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[oklch(0.30_0.02_260)]">
            <span className="text-xs text-[oklch(0.70_0.02_240)]">Teslimat Kodu</span>
            <span className="text-sm font-bold font-price text-white">
              {ticket.deliveryCode}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-[oklch(0.70_0.02_240)]">Ödenen</span>
            <span className="text-sm font-bold font-price text-[oklch(0.65_0.22_45)]">
              {formatPrice(ticket.paidPrice)}
            </span>
          </div>
        </div>

        {/* Directions button */}
        <button
          onClick={() => {
            toast.info("Harita uygulaması açılıyor...", { duration: 2000 });
          }}
          className="w-full flex items-center justify-center gap-2 bg-[oklch(0.25_0.02_260)] border border-[oklch(0.30_0.02_260)] rounded-xl py-3.5 text-sm font-semibold text-white hover:bg-[oklch(0.30_0.02_260)] transition-colors"
        >
          <MapPin className="w-4 h-4 text-[oklch(0.65_0.22_45)]" />
          Kafeye Yol Tarifi Al
        </button>
      </div>
    </div>
  );
}

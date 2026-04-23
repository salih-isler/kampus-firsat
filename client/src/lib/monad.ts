/**
 * Monad Testnet Configuration
 * Web3 entegrasyonu için Monad blockchain ayarları
 */

export const MONAD_CONFIG = {
  // Monad Testnet
  chainId: 10143,
  chainName: "Monad Testnet",
  rpcUrl: "https://testnet-rpc.monad.xyz",
  blockExplorerUrl: "https://testnet-explorer.monad.xyz",
  
  // Token
  tokenSymbol: "MONAD",
  tokenDecimals: 18,
  
  // Örnek token adresi (testnet)
  tokenAddress: "0x0000000000000000000000000000000000000000", // Placeholder
  
  // Smart Contract adresi (deploy ettikten sonra güncellenecek)
  contractAddress: "0x0000000000000000000000000000000000000000", // Placeholder
};

export const MONAD_CHAIN_CONFIG = {
  chainId: `0x${MONAD_CONFIG.chainId.toString(16)}`,
  chainName: MONAD_CONFIG.chainName,
  nativeCurrency: {
    name: "Monad",
    symbol: MONAD_CONFIG.tokenSymbol,
    decimals: MONAD_CONFIG.tokenDecimals,
  },
  rpcUrls: [MONAD_CONFIG.rpcUrl],
  blockExplorerUrls: [MONAD_CONFIG.blockExplorerUrl],
};

// Satın alım için minimum MONAD miktarı (wei cinsinden)
export const MIN_PURCHASE_AMOUNT = "1000000000000000000"; // 1 MONAD

// Transaction gas limit
export const GAS_LIMIT = "200000";

// MONAD/TL Exchange Rate
// 1 MONAD = 8 TL
export const MONAD_TL_RATE = 8;

// TL fiyatını MONAD'a çevir
export function tlToMonad(tlAmount: number): number {
  return tlAmount / MONAD_TL_RATE;
}

// MONAD'ı TL'ye çevir
export function monadToTl(monadAmount: number): number {
  return monadAmount * MONAD_TL_RATE;
}

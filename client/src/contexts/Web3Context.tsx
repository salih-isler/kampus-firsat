/**
 * Web3Context — MetaMask ve Monad Testnet entegrasyonu
 * Cüzdan bağlantısı, bakiye ve işlem yönetimi
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { MONAD_CONFIG, MONAD_CHAIN_CONFIG } from "@/lib/monad";

interface Web3ContextType {
  // Wallet
  account: string | null;
  isConnected: boolean;
  balance: string;
  
  // Functions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToMonad: () => Promise<void>;
  
  // Transaction
  sendTransaction: (to: string, amount: string) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MetaMask provider'ı al
  const getProvider = useCallback(() => {
    if (typeof window === "undefined") return null;
    return (window as any).ethereum;
  }, []);

  // Cüzdan bağla
  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const ethereum = getProvider();
      if (!ethereum) {
        throw new Error("MetaMask yüklü değil");
      }

      // Monad Testnet'e geç
      await switchToMonad();

      // Hesapları iste
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);

        // Bakiye al
        const provider = new BrowserProvider(ethereum);
        const balance = await provider.getBalance(accounts[0]);
        setBalance(formatEther(balance));
      }
    } catch (err: any) {
      setError(err.message || "Bağlantı başarısız");
      console.error("Wallet bağlantı hatası:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getProvider]);

  // Cüzdan bağlantısını kes
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setBalance("0");
  }, []);

  // Monad Testnet'e geç
  const switchToMonad = useCallback(async () => {
    try {
      const ethereum = getProvider();
      if (!ethereum) throw new Error("MetaMask yüklü değil");

      try {
        // Zaten Monad'a bağlı mı kontrol et
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: MONAD_CHAIN_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        // Chain yoksa ekle
        if (switchError.code === 4902) {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [MONAD_CHAIN_CONFIG],
          });
        } else {
          throw switchError;
        }
      }
    } catch (err: any) {
      setError(err.message || "Chain değiştirme başarısız");
      throw err;
    }
  }, [getProvider]);

  // İşlem gönder (MONAD transfer)
  const sendTransaction = useCallback(
    async (to: string, amount: string): Promise<string | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const ethereum = getProvider();
        if (!ethereum || !account) {
          throw new Error("Cüzdan bağlı değil");
        }

        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();

        // İşlem gönder
        const tx = await signer.sendTransaction({
          to,
          value: parseEther(amount),
          gasLimit: 200000,
        });

        // İşlem hash'i döndür
        return tx.hash;
      } catch (err: any) {
        setError(err.message || "İşlem başarısız");
        console.error("Transaction hatası:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [account, getProvider]
  );

  // Bakiye güncellemesi
  useEffect(() => {
    if (!account || !isConnected) return;

    const updateBalance = async () => {
      try {
        const ethereum = getProvider();
        if (!ethereum) return;

        const provider = new BrowserProvider(ethereum);
        const balance = await provider.getBalance(account);
        setBalance(formatEther(balance));
      } catch (err) {
        console.error("Bakiye güncelleme hatası:", err);
      }
    };

    updateBalance();
    const interval = setInterval(updateBalance, 10000); // Her 10 saniyede güncelle

    return () => clearInterval(interval);
  }, [account, isConnected, getProvider]);

  // Hesap değişikliğini dinle
  useEffect(() => {
    const ethereum = getProvider();
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [getProvider, disconnectWallet]);

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected,
        balance,
        connectWallet,
        disconnectWallet,
        switchToMonad,
        sendTransaction,
        isLoading,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }
  return context;
}

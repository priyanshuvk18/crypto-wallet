import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Wallet {
  id: string;
  name: string;
  address: string;
  network: string;
  mnemonic?: string; // In a real app, this would be heavily encrypted or not stored here
  privateKey?: string;
}

interface WalletState {
  wallets: Wallet[];
  activeWalletId: string | null;
  addWallet: (wallet: Wallet) => void;
  setActiveWallet: (id: string) => void;
  removeWallet: (id: string) => void;
  getActiveWallet: () => Wallet | undefined;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: [],
      activeWalletId: null,
      addWallet: (wallet) => 
        set((state) => ({ 
          wallets: [...state.wallets, wallet],
          activeWalletId: state.activeWalletId || wallet.id // Set as active if it's the first
        })),
      setActiveWallet: (id) => set({ activeWalletId: id }),
      removeWallet: (id) => 
        set((state) => ({
          wallets: state.wallets.filter((w) => w.id !== id),
          activeWalletId: state.activeWalletId === id 
            ? (state.wallets.length > 1 ? state.wallets.filter(w => w.id !== id)[0].id : null)
            : state.activeWalletId
        })),
      getActiveWallet: () => {
        const { wallets, activeWalletId } = get();
        return wallets.find((w) => w.id === activeWalletId);
      }
    }),
    {
      name: 'crypto-wallet-storage',
    }
  )
);

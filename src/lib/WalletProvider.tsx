import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, type ReactNode } from "react";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

// Use mainnet-beta for production, devnet for testing
const NETWORK = (import.meta.env.VITE_SOLANA_NETWORK as string) || "mainnet-beta";
const RPC_URL = (import.meta.env.VITE_SOLANA_RPC as string) || clusterApiUrl(NETWORK as any);

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

import { useState } from "react";

import "./App.css";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import TokenLaunchPad from "./components/TokenLaunchPad";
function App() {
  const [count, setCount] = useState(0);

  return (
    <ConnectionProvider endpoint={"https://api.devnet.solana.com/"}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <WalletMultiButton />
          <TokenLaunchPad />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;

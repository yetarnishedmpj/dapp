"use client";
import { useEffect, useState } from "react";
import { useWeb3 } from "../context/Web3Context";

export default function ConnectButton() {
  const { account, balance, connectWallet, loading } = useWeb3();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="connect-btn" disabled>
        Loading...
      </button>
    );
  }

  if (account) {
    console.log("Rendering Connected UI for:", account);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0 ETH'}
        </span>
        <button className="connect-btn" style={{ opacity: 0.8, cursor: 'default' }}>
          {account.slice(0, 6)}...{account.slice(-4)}
        </button>
      </div>
    );
  }

  return (
    <button 
      className="connect-btn" 
      onClick={connectWallet}
      disabled={loading}
    >
      {loading ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

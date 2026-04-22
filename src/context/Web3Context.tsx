"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { marketplaceAddress } from '../config';
import MarketplaceABI from '../artifacts/contracts/Marketplace.sol/Marketplace.json';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    ethereum: any;
  }
}

interface Web3ContextType {
  account: string | null;
  balance: string | null;
  marketplaceContract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  balance: null,
  marketplaceContract: null,
  connectWallet: async () => {},
  loading: false,
  error: null,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [marketplaceContract, setMarketplaceContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError("MetaMask not detected!");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Request network switch to Hardhat Localhost (31337)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7A69' }], // 31337 in hex
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7A69',
              chainName: 'Hardhat Localhost',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['http://127.0.0.1:8545'],
            }],
          });
        }
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setAccount(address);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const ethBalance = await provider.getBalance(address);
      setBalance(ethers.formatEther(ethBalance));

      const contract = new ethers.Contract(marketplaceAddress, MarketplaceABI.abi, signer);
      setMarketplaceContract(contract);
    } catch (err: any) {
      console.error("Connection error:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccounts = (accounts: string[]) => {
        console.log("Accounts changed:", accounts);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          connectWallet();
        } else {
          setAccount(null);
          setBalance(null);
          setMarketplaceContract(null);
        }
      };

      const handleChain = () => {
        console.log("Chain changed, reloading...");
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccounts);
      window.ethereum.on('chainChanged', handleChain);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccounts);
        window.ethereum.removeListener('chainChanged', handleChain);
      };
    }
  }, []);

  useEffect(() => {
    if (marketplaceContract && account) {
      const handleNewBid = (itemId: any, bidder: string, amount: any) => {
        if (bidder.toLowerCase() !== account.toLowerCase()) {
          toast(`New bid on Item #${itemId}: ${ethers.formatEther(amount)} ETH`, { icon: '🔥' });
        }
      };

      const handleItemSold = (itemId: any, seller: string, buyer: string, price: any) => {
        if (seller.toLowerCase() === account.toLowerCase()) {
          toast.success(`SOLD! Item #${itemId} for ${ethers.formatEther(price)} ETH`);
        } else if (buyer.toLowerCase() === account.toLowerCase()) {
          toast.success(`PURCHASED! Item #${itemId} for ${ethers.formatEther(price)} ETH`);
        }
      };

      marketplaceContract.on('NewBid', handleNewBid);
      marketplaceContract.on('ItemSold', handleItemSold);

      return () => {
        marketplaceContract.off('NewBid', handleNewBid);
        marketplaceContract.off('ItemSold', handleItemSold);
      };
    }
  }, [marketplaceContract, account]);

  return (
    <Web3Context.Provider value={{ account, balance, marketplaceContract, connectWallet, loading, error }}>
      {children}
    </Web3Context.Provider>
  );
};

"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import Link from "next/link";

const CATEGORIES = ["All", "Art", "Gaming", "Music", "Photography", "Collectibles"];

export default function Home() {
  const { marketplaceContract, account } = useWeb3();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [bidInputs, setBidInputs] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (marketplaceContract) {
      loadMarketplaceItems();
    } else {
      setLoading(false);
    }
  }, [marketplaceContract]);

  async function loadMarketplaceItems() {
    try {
      console.log("Loading marketplace items...");
      const data = await marketplaceContract!.fetchMarketItems();
      console.log("Items received:", data);
      const items = data.map((i: any) => {
        try {
          const metadata = JSON.parse(i.metadataURI);
          return {
            itemId: i.itemId.toString(),
            seller: i.seller,
            creator: i.creator,
            owner: i.owner,
            price: ethers.formatEther(i.price),
            royalty: i.royaltyPercentage.toString(),
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            category: i.category,
            isAuction: i.isAuction,
            auctionEndTime: Number(i.auctionEndTime),
            highestBid: ethers.formatEther(i.highestBid),
            highestBidder: i.highestBidder,
          };
        } catch (e) {
          console.error("Failed to parse metadata", i);
          return null;
        }
      }).filter((item: any) => item !== null);
      setItems(items);
    } catch (err: any) {
      console.error("Error fetching items:", err);
      if (err.code === "BAD_DATA") {
        toast.error("Network Mismatch: Please reset your MetaMask account and refresh.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function buyItem(item: any) {
    if (!account) return alert("Please connect wallet first!");
    try {
      const price = ethers.parseEther(item.price);
      const transaction = await marketplaceContract!.buyItem(item.itemId, {
        value: price
      });
      await transaction.wait();
      loadMarketplaceItems();
      alert("Item purchased successfully!");
    } catch (err: any) {
      console.error("Purchase failed:", err);
      alert(err.reason || "Purchase failed");
    }
  }

  async function placeBid(item: any) {
    if (!account) return alert("Please connect wallet first!");
    const bidValue = bidInputs[item.itemId];
    if (!bidValue) return alert("Please enter a bid amount");

    try {
      const amount = ethers.parseEther(bidValue);
      const transaction = await marketplaceContract!.placeBid(item.itemId, {
        value: amount
      });
      await transaction.wait();
      loadMarketplaceItems();
      alert("Bid placed successfully!");
    } catch (err: any) {
      console.error("Bidding failed:", err);
      alert(err.reason || "Bid failed. Must be higher than current bid.");
    }
  }

  async function endAuction(item: any) {
    try {
      const transaction = await marketplaceContract!.endAuction(item.itemId);
      await transaction.wait();
      loadMarketplaceItems();
      alert("Auction finalized!");
    } catch (err: any) {
      console.error("Finalizing failed:", err);
      alert(err.reason || "Finalizing failed. Ensure auction has ended.");
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="empty-state">Loading D-Market V2...</div>;

  return (
    <div>
      <h1 className="page-title">Explore D-Market</h1>

      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="Search items..." 
          className="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {CATEGORIES.map(cat => (
            <div 
              key={cat}
              className={`category-tag ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">No items found matching your criteria.</div>
      ) : (
        <div className="grid">
          {filteredItems.map((item, idx) => {
            const isAuctionEnded = item.isAuction && Date.now() / 1000 > item.auctionEndTime;
            
            return (
              <Link key={idx} href={`/item/${item.itemId}`} className="item-card glass" style={{ position: 'relative', cursor: 'pointer' }}>
                {item.isAuction && <span className="auction-badge">AUCTION</span>}
                <div className="item-image-placeholder">
                  {item.image.startsWith('http') ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
                  ) : (
                    item.image
                  )}
                </div>
                <div className="item-details">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="item-name">{item.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }}>{item.category}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.description}</p>
                  
                  <div style={{ marginTop: '0.5rem' }}>
                    {item.isAuction ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9rem' }}>Current Bid:</span>
                          <span className="item-price">{item.highestBid} ETH</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          Ends: {new Date(item.auctionEndTime * 1000).toLocaleString()}
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem' }}>Price:</span>
                        <span className="item-price">{item.price} ETH</span>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Royalty: {item.royalty}% | Creator: {item.creator.slice(0,6)}...
                  </div>
                </div>

                {item.isAuction ? (
                  isAuctionEnded ? (
                    <button className="action-btn" onClick={(e) => { e.preventDefault(); endAuction(item); }} style={{ background: '#10b981' }}>
                      Claim / End Auction
                    </button>
                  ) : (
                    <div className="bid-input-group" onClick={e => e.preventDefault()}>
                      <input 
                        type="number" 
                        step="0.001" 
                        placeholder="Bid ETH"
                        className="bid-input"
                        onChange={e => setBidInputs({ ...bidInputs, [item.itemId]: e.target.value })}
                      />
                      <button className="action-btn" onClick={(e) => { e.preventDefault(); placeBid(item); }} style={{ marginTop: 0 }}>
                        Bid
                      </button>
                    </div>
                  )
                ) : (
                  <button className="action-btn" onClick={(e) => { e.preventDefault(); buyItem(item); }}>
                    Buy Now
                  </button>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

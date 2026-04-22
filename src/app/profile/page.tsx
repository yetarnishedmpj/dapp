"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { ethers } from "ethers";

export default function Profile() {
  const { marketplaceContract, account } = useWeb3();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resellPrice, setResellPrice] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (marketplaceContract && account) {
      loadMyItems();
    } else if (!account) {
      setLoading(false);
    }
  }, [marketplaceContract, account]);

  async function resell(itemId: string) {
    if (!resellPrice[itemId]) return alert("Enter price");
    try {
      const p = ethers.parseEther(resellPrice[itemId]);
      const tx = await marketplaceContract!.resellItem(itemId, p, false, 0);
      await tx.wait();
      loadMyItems();
    } catch (err: any) {
      alert(err.reason || "Failed");
    }
  }

  async function loadMyItems() {
    try {
      const data = await marketplaceContract!.fetchMyItems();
      const items = data.map((i: any) => {
        const metadata = JSON.parse(i.metadataURI);
        return {
          itemId: i.itemId.toString(),
          seller: i.seller,
          owner: i.owner,
          price: ethers.formatEther(i.isAuction ? i.highestBid : i.price),
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          category: i.category,
          sold: i.sold
        };
      });
      setItems(items);
    } catch (err) {
      console.error("Error fetching my items:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!account) return <div className="empty-state">Please connect your wallet to view your items.</div>;
  if (loading) return <div className="empty-state">Loading your collection...</div>;

  return (
    <div>
      <h1 className="page-title">My Collection</h1>
      {items.length === 0 ? (
        <div className="empty-state">You don't own or sell any items yet.</div>
      ) : (
        <div className="grid">
          {items.map((item, idx) => (
            <div key={idx} className="item-card glass">
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
                <span className="item-price">{item.price} ETH</span>
                <div style={{ marginTop: '0.5rem' }}>
                  {item.owner === account ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>Owned</span>
                      <div className="bid-input-group">
                        <input 
                          placeholder="Price" 
                          className="bid-input" 
                          style={{ fontSize: '0.8rem' }}
                          onChange={e => setResellPrice({...resellPrice, [item.itemId]: e.target.value})}
                        />
                        <button className="action-btn" onClick={() => resell(item.itemId)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginTop: 0 }}>List</button>
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Listed for Sale</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

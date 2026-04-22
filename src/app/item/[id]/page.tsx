"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "../../../context/Web3Context";
import { ethers } from "ethers";
import { useParams } from "next/navigation";

export default function ItemDetails() {
  const { id } = useParams();
  const { marketplaceContract, account } = useWeb3();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidValue, setBidValue] = useState("");

  useEffect(() => {
    if (marketplaceContract && id) {
      loadItem();
    }
  }, [marketplaceContract, id]);

  async function loadItem() {
    try {
      const i = await marketplaceContract!.fetchItemById(id);
      const metadata = JSON.parse(i.metadataURI);
      setItem({
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
        sold: i.sold
      });
    } catch (err) {
      console.error("Error fetching item:", err);
    } finally {
      setLoading(false);
    }
  }

  async function buyItem() {
    if (!account) return alert("Please connect wallet!");
    try {
      const price = ethers.parseEther(item.price);
      const tx = await marketplaceContract!.buyItem(item.itemId, { value: price });
      await tx.wait();
      loadItem();
      alert("Success!");
    } catch (err: any) {
      alert(err.reason || "Failed");
    }
  }

  async function placeBid() {
    if (!account) return alert("Please connect wallet!");
    if (!bidValue) return alert("Enter bid");
    try {
      const amount = ethers.parseEther(bidValue);
      const tx = await marketplaceContract!.placeBid(item.itemId, { value: amount });
      await tx.wait();
      loadItem();
      alert("Bid placed!");
    } catch (err: any) {
      alert(err.reason || "Failed");
    }
  }

  if (loading) return <div className="empty-state">Loading item details...</div>;
  if (!item) return <div className="empty-state">Item not found.</div>;

  const isAuctionEnded = item.isAuction && Date.now() / 1000 > item.auctionEndTime;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2rem' }}>
      <div className="glass" style={{ padding: '1rem', borderRadius: '24px' }}>
        {item.image.startsWith('http') ? (
          <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: '16px', display: 'block' }} />
        ) : (
          <div className="item-image-placeholder" style={{ fontSize: '10rem' }}>{item.image}</div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>
            {item.category}
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '0.5rem 0' }}>{item.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>{item.description}</p>
        </div>

        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{item.isAuction ? "Current Bid" : "Price"}</span>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
              {item.isAuction ? item.highestBid : item.price} ETH
            </span>
          </div>

          {item.isAuction && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Ends in:</span>
              <span>{new Date(item.auctionEndTime * 1000).toLocaleString()}</span>
            </div>
          )}

          {!item.sold ? (
            item.isAuction ? (
              isAuctionEnded ? (
                <button className="submit-btn" style={{ background: '#10b981' }} onClick={() => alert("Finalizing logic...")}>Finalize Auction</button>
              ) : (
                <div className="bid-input-group">
                  <input 
                    type="number" 
                    className="search-input" 
                    placeholder="Enter bid in ETH" 
                    value={bidValue}
                    onChange={e => setBidValue(e.target.value)}
                  />
                  <button className="submit-btn" onClick={placeBid} style={{ margin: 0 }}>Place Bid</button>
                </div>
              )
            ) : (
              <button className="submit-btn" onClick={buyItem}>Buy Now</button>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold', color: '#10b981' }}>SOLD</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Creator</span>
            <span style={{ fontWeight: '500' }}>{item.creator}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Seller</span>
            <span style={{ fontWeight: '500' }}>{item.seller}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Royalty Fee</span>
            <span style={{ fontWeight: '500' }}>{item.royalty}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

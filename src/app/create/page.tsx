"use client";

import { useState } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../../utils/pinata";

export default function CreateListing() {
  const { marketplaceContract, account } = useWeb3();
  const [formInput, updateFormInput] = useState({ 
    price: '', 
    name: '', 
    description: '', 
    category: 'Art',
    isAuction: false,
    duration: '3600', // 1 hour default
    royalty: '5'
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function listNFTForSale() {
    const { name, description, price, category, isAuction, duration, royalty } = formInput;
    console.log("Listing item triggered with:", { name, description, price, category, isAuction, duration, royalty });
    
    if (!name || !description || !price) {
      alert("Please fill in all required fields (Name, Description, Price).");
      return;
    }
    
    if (!marketplaceContract) {
      alert("Marketplace contract not initialized. Please connect your wallet again.");
      return;
    }
    
    setLoading(true);
    try {
      // Step 1: C++ Metadata Preprocessing
      console.log("Validating and hashing metadata via C++ Addon...");
      const cppRes = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      const cppData = await cppRes.json();
      
      if (!cppData.success) {
        throw new Error(cppData.error || "C++ Validation Failed");
      }
      console.log("C++ Validation Success! Hash:", cppData.hash);

      let imageURI = "";
      if (file) {
        console.log("Uploading file to IPFS...");
        imageURI = await uploadFileToIPFS(file);
        console.log("File uploaded to IPFS:", imageURI);
      } else {
        alert("Please upload an image file.");
        setLoading(false);
        return;
      }

      console.log("Uploading metadata to IPFS...");
      const metadata = await uploadJSONToIPFS({ 
        name, 
        description, 
        image: imageURI,
        category 
      });
      console.log("Metadata uploaded to IPFS:", metadata);

      const priceInWei = ethers.parseEther(price);
      const royaltyNum = parseInt(royalty);
      const durationNum = parseInt(duration);
      
      console.log("Submitting transaction to blockchain...");
      const transaction = await marketplaceContract.listItem(
        metadata, 
        priceInWei,
        royaltyNum,
        category,
        isAuction,
        durationNum,
        { gasLimit: 1000000 } // Manual gas limit for local testing
      );
      console.log("Transaction submitted, waiting for confirmation...");
      await transaction.wait();
      console.log("Transaction confirmed!");
      
      router.push('/');
    } catch (error: any) {
      console.error("Error listing item:", error);
      alert(error.message || "Failed to list item. Check browser console for details.");
    } finally {
      setLoading(false);
    }
  }

  if (!account) return <div className="empty-state">Please connect your wallet to create a listing.</div>;

  return (
    <div className="form-container glass">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Create Advanced Listing</h2>
      
      <div className="form-group">
        <label>Upload Image (Real IPFS)</label>
        <input 
          type="file"
          onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
          style={{ border: 'none' }}
        />
      </div>

      <div className="form-group">
        <label>Item Name</label>
        <input 
          placeholder="Asset Name"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea 
          placeholder="Asset Description"
          rows={3}
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Price (ETH) {formInput.isAuction ? "(Start)" : ""}</label>
          <input 
            placeholder="0.01"
            type="number"
            step="0.001"
            onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Royalty (%)</label>
          <input 
            placeholder="5"
            type="number"
            max="20"
            onChange={e => updateFormInput({ ...formInput, royalty: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Category</label>
        <select 
          style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.5)', color: 'white' }}
          onChange={e => updateFormInput({ ...formInput, category: e.target.value })}
        >
          <option value="Art">🎨 Art</option>
          <option value="Gaming">🕹️ Gaming</option>
          <option value="Music">🎵 Music</option>
          <option value="Photography">📸 Photography</option>
          <option value="Collectibles">💎 Collectibles</option>
        </select>
      </div>

      <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox"
          style={{ width: 'auto' }}
          checked={formInput.isAuction}
          onChange={e => updateFormInput({ ...formInput, isAuction: e.target.checked })}
        />
        <label>Enable Auction</label>
      </div>

      {formInput.isAuction && (
        <div className="form-group">
          <label>Auction Duration (seconds)</label>
          <input 
            type="number"
            value={formInput.duration}
            onChange={e => updateFormInput({ ...formInput, duration: e.target.value })}
          />
        </div>
      )}

      <button onClick={listNFTForSale} className="submit-btn" disabled={loading}>
        {loading ? "Listing..." : "Create Listing"}
      </button>
    </div>
  );
}

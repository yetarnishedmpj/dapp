# D-Market V2: Hybrid C++/TypeScript DApp

A high-performance NFT Marketplace built with **Next.js**, **Hardhat**, and **C++**. This project demonstrates advanced systems integration by offloading critical business logic and backend services to C++.

## 🚀 C++ Integration Highlights

- **C++ Node.js Addon (N-API):** The core metadata validation and SHA-256 hashing engine is written in C++ for maximum performance and security.
- **High-Performance C++ Backend:** A dedicated microservice built with the **httplib** C++ framework to handle marketplace analytics and indexing.
- **Hybrid Architecture:** Demonstrates how to bridge modern Web3 frontends (TypeScript/React) with performant systems programming (C++).

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Smart Contracts:** Solidity, Hardhat, Ethers.js
- **Systems:** C++ (N-API, httplib), Node-Gyp, MSVC/GCC
- **Storage:** IPFS (via Pinata)

## 🏗️ Building C++ Components

### 1. C++ Node Addon
The addon is automatically built during `npm install` (via binding.gyp), but you can rebuild it manually:
```bash
npx node-gyp rebuild
```

### 2. C++ Backend Server
Navigate to the `backend` folder and run the build script:
```bash
cd backend
./build.bat  # Windows
# OR manual build
g++ -o server.exe main.cpp -lws2_32
```

## 📝 Features
- **Real IPFS Uploads:** Securely pin images and metadata via Pinata.
- **C++ Preprocessing:** Metadata is validated and hashed by a C++ engine before hitting the blockchain.
- **Advanced Auctions:** Real-time bidding logic powered by smart contracts.
- **Royalty Support:** Automatic royalty payments to creators.

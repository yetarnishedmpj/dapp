# CLAUDE.md - Hybrid C++/TypeScript Project Guide

This guide defines the build, test, and coding standards for the **D-Market Hybrid DApp**.

## 🛠 Build & Development Commands
- **Frontend (Next.js):** `npm run dev` (Port 3000)
- **Smart Contracts (Hardhat):** `npx hardhat node` | `npx hardhat run scripts/deploy.js --network localhost`
- **C++ Node Addon (N-API):** `npx node-gyp rebuild` (Requires MSVC/GCC)
- **C++ Backend (httplib):** `cd backend && ./build.bat` (Windows) | `g++ -o server.exe main.cpp -lws2_32` (Manual)

## 🏗 Project Architecture
- **Frontend/Web3:** `src/app/` (React 19 + Ethers.js)
- **Systems Layer:** `cpp-src/` (C++ N-API Addon for metadata validation & hashing)
- **Backend Service:** `backend/` (Standalone C++ httplib microservice for analytics)
- **Smart Contracts:** `contracts/` (Solidity 0.8.20)

## 🎨 Coding Standards
### TypeScript (Frontend & API)
- Use **Next.js 15+ App Router** conventions.
- Prefer **Tailwind-like Vanilla CSS** (Glassmorphism theme).
- Standard Web3 error handling for MetaMask/Ethers.

### C++ (Systems & Backend)
- **Addon:** Utilize `node-addon-api` (N-API) for safe Node.js integration.
- **Backend:** Maintain header-only library approach (`httplib.h`) for portability.
- **Safety:** Always include rigorous input validation (length, type) in C++ before processing.
- **Performance:** Offload SHA-256 and heavy data validation from JS to C++.

## 🔗 Integration Flow
1. Frontend captures user input (`CreateListing`).
2. Data is sent to `/api/metadata` (Next.js).
3. API route calls the **C++ Addon** via `src/utils/metadata_cpp.js`.
4. C++ validates/hashes metadata and returns results to JS.
5. If valid, JS proceeds with IPFS upload and Blockchain transaction.

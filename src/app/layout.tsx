import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Web3Provider } from "../context/Web3Context";
import ConnectButton from "../components/ConnectButton";
import ThemeToggle from "../components/ThemeToggle";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "D-Market",
  description: "Decentralized Marketplace on Blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <Toaster position="top-right" />
          <header className="header glass">
            <Link href="/" className="page-title" style={{ margin: 0, fontSize: '1.5rem' }}>
              D-Market
            </Link>
            <nav className="nav-links">
              <Link href="/">Explore</Link>
              <Link href="/create">Create</Link>
              <Link href="/profile">My Items</Link>
            </nav>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <ThemeToggle />
              <ConnectButton />
            </div>
          </header>
          <main className="main-content">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}

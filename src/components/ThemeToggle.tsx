"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <button 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="glass"
      style={{ 
        border: 'none', 
        padding: '0.5rem 1rem', 
        borderRadius: '20px', 
        cursor: 'pointer',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}

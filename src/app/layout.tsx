import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginGate from "@/components/LoginGate";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "PrimeJar – Discover Events, Vendors & Services",
  description: "India's premier event discovery platform. Find photographers, DJs, decorators, caterers & 10,000+ verified professionals for your next event.",
  keywords: "event professionals, event discovery, wedding photographer, event DJ, catering, event marketplace India",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* 
      ✅ FIX: Remove hardcoded className="dark" from html.
      The ThemeProvider will add/remove the "dark" class dynamically via JS.
      suppressHydrationWarning prevents React from complaining about
      the className mismatch between server and client.
    */
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to apply theme BEFORE first paint — eliminates flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('primejar-theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    // Default to light mode
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <LoginGate />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

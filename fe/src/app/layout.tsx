import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatWidget } from "@/components/chat-widget";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart-drawer";

const outfit = Outfit({
  variable: "--font-outfit", // Use it as primary sans
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eco Hub | Smart Circular Economy",
  description: "Platform Ekonomi Sirkular Pintar & Berkelanjutan (ITechno Cup 2026)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans antialiased min-h-[100dvh] flex flex-col relative`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            {children}
            <ChatWidget />
            <CartDrawer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import { CartProvider } from "@/context/CartContext";
import ConvexClientProvider from "./ConvexClientProvider"; // Import your new provider
import "./globals.css";

export const metadata = {
  title: "Disney Shop UI",
  description: "A premium floating character shop experience",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased overflow-x-hidden">
        {/* We use ConvexClientProvider here instead of ClerkProvider 
          because it already contains ClerkProvider inside it! 
        */}
        <ConvexClientProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
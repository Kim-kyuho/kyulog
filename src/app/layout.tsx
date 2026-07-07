// app/layout.tsx

import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react"


export const metadata = {
  title: "Kyuho's Portfolio Blog",
  description: "Developer portfolio and tech blog",
  icons:{
    icon: "/favicon.png?v=2",
    apple: "/apple-touch-icon.png?v=2",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
            <header className="fixed top-0 left-0 w-full z-50">
              <Header />
            </header>
            <main className="px-4 pb-4 pt-20 sm:px-8 sm:pb-8 sm:pt-28 overflow-x-hidden">{children}</main>
            <Footer />
          </div>
          <Analytics /> {/* Vercel Analytics */}
        </Providers>
      </body>
    </html>
  );
}

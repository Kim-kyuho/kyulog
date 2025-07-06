// app/layout.tsx

import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next"


export const metadata = {
  title: "Kyuho's Portfolio Blog",
  description: "Developer portfolio and tech blog",
  icons:{
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-background text-foreground font-extrabold antialiased`}>
        <Providers>
          <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
            <header className="fixed top-0 left-0 w-full z-50">
              <Header />
            </header>
            <main className="pt-20 p-4 sm:p-8 overflow-x-hidden">{children}</main>
            <Footer />
          </div>
          <Analytics /> {/* Vercel Analytics */}
        </Providers>
      </body>
    </html>
  );
}
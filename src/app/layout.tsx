import Footer from "@/components/layout/footer";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CINEVA — Film Populer, Trailer & Pencarian Film",
  description:
    "Eksplorasi film populer terkini, tonton trailer resmi dalam resolusi tinggi, dan cari ribuan film dengan desain minimalis modern.",
  keywords: ["film populer", "trailer film", "nonton trailer", "tmdb", "bioskop", "cinema", "movie explorer"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={cn("h-full antialiased", inter.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}


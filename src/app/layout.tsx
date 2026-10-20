import NavigationProgress from "@/components/layout/navigation-progress";
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
  title: "CINEVA — Popular Movies, Trailers & Celebrities",
  description:
    "Explore the latest popular movies, watch official HD trailers, and discover thousands of titles and celebrities with modern cinematic aesthetic.",
  keywords: ["popular movies", "movie trailers", "watch trailers", "tmdb", "cinema", "movie explorer", "imdb clone", "celebrities"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
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
            <NavigationProgress />
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}


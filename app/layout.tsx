import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Rail } from "@/components/shell/Rail";
import { TopBar } from "@/components/shell/TopBar";
import { Footer } from "@/components/shell/Footer";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "WONK"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Ticket 3d — metadataBase resolves every relative URL-based metadata field
// (the OG/twitter images below) to an absolute URL; required or Next.js
// build-errors on any relative image path. Site's own domain, not a
// placeholder — this is what it's actually deployed at.
const SITE_URL = "https://tylermartins.com";
const DEFAULT_DESCRIPTION = "Match data, turned into tools.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Plain string, not a title.template — that would suffix every child
  // route's <title> with "· tylermartins.com" site-wide, a visible change
  // beyond what this ticket asked for (OG/social metadata, not tab titles).
  title: "Tyler Martins",
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: "Tyler Martins",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: "tylermartins.com",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tyler Martins",
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full">
        <ThemeProvider>
          <Rail />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import Providers from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-DEMO0000000";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Addis Eats — Ethiopian food delivery",
    template: "%s | Addis Eats",
  },
  description:
    "Order authentic Ethiopian cooking delivered across Addis Ababa — berbere, niter kibbeh and injera made fresh every morning.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="lazyOnload"
        />
        <Script
          id="ga-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
          }}
        />
        <Providers>
          <Header />
          <main className="shell">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

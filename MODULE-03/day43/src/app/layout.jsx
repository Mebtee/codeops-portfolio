import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Addis Eats",
  description: "Ethiopian food delivery — server and client component demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap"
      />
      <body>
        <Providers>
          <Header />
          <main className="shell">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

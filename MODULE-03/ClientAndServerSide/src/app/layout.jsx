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

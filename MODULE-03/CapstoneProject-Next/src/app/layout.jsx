import "./globals.css";
import Providers from "./providers";
import Header from "@/Component/Header/Header";
import Footer from "@/Component/Footer/Footer";
import "@/Component/Header/Header.css";
import "@/Component/Header/CartForm/CartForm.css";
import "@/Component/Header/Navigation/Nav.css";
import "@/Component/Footer/Footer.css";
import "@/Component/Footer/FooterLower/FooterLower.css";
import "@/Component/Footer/FooterUpper/FooterUpper.css";
import "@/Component/Footer/FooterUpper/FooterBrand/FooterBrand.css";
import "@/Component/Footer/FooterUpper/FooterColumn/FooterColumn.css";
import "@/Component/FullMenu/FullMenu.css";
import "@/Component/RoyalDish/RoyalDish.css";
import "@/Component/CurrentOrderCart/CurrentOrderCart.css";
import "@/Component/CheckoutDelivery/CheckoutDelivery.css";
import "@/Component/Login/Login.css";
import "@/Component/Signup/Signup.css";
import "@/Component/NotFound404/NotFound404.css";
import "@/Component/TodaySpecial/TodaySpecial.css";

export const metadata = {
  title: "Mesob House — Ethiopian Dining",
  description:
    "Capstone migrated to Next.js: browse the menu, customise a dish, and check out.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="main-layout">
            <Header />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

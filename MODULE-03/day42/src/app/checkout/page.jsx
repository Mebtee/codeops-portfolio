import CheckoutForm from "./CheckoutForm";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout — Addis Eats",
};

export default async function CheckoutPage() {
  const session = await getSession();

  return (
    <section data-has-session={session ? "yes" : "no"}>
      <h1 className="page-title">Checkout</h1>
      <p className="page-sub">Confirm delivery details and place your order.</p>
      <CheckoutForm />
    </section>
  );
}

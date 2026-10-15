import { cookies } from "next/headers";
import CheckoutForm from "./CheckoutForm";
import { SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout — Addis Eats",
};

export default async function CheckoutPage() {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value ?? null;

  return (
    <section data-has-session={sessionId ? "yes" : "no"}>
      <h1 className="page-title">Checkout</h1>
      <p className="page-sub">Confirm delivery details and place your order.</p>
      <CheckoutForm />
    </section>
  );
}

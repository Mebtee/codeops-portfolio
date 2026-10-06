import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout — Addis Eats",
};

export default async function CheckoutPage() {
  const store = await cookies();
  const sessionId = store.get("addis_eats_session")?.value ?? null;

  return <section data-has-session={sessionId ? "yes" : "no"} />;
}

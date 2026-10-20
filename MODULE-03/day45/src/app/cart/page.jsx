import CartList from "@/components/CartList";

export const metadata = {
  title: "Cart",
  description: "Review the dishes you picked before checking out.",
};

export default function CartPage() {
  return (
    <section>
      <CartList />
    </section>
  );
}

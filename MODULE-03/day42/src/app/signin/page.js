import Link from "next/link";
import { redirect } from "next/navigation";
import SignInForm from "./SignInForm";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in — Addis Eats",
};

const DEMO_ACCOUNTS = [
  { email: "marta@addiseats.et", password: "AddisMarta1!", role: "customer" },
  { email: "dawit@addiseats.et", password: "AddisDawit1!", role: "customer" },
  { email: "kitchen@addiseats.et", password: "KitchenStaff1!", role: "staff" },
];

export default async function SignInPage({ searchParams }) {
  const { next } = await searchParams;
  const session = await getSession();
  if (session) {
    redirect(next ?? "/");
  }

  return (
    <section>
      <h1 className="page-title">Sign in</h1>
      <p className="page-sub">
        One account tracks your orders and unlocks checkout.
      </p>

      <div className="signin-grid">
        <SignInForm next={next} />

        <aside className="demo-accounts">
          <h2>Demo accounts</h2>
          <p>
            Local seed data from <code>data/users.json</code> — the same list is
            in <code>AUTH.md</code>. Delete this panel for a real deployment.
          </p>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Password</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ACCOUNTS.map((account) => (
                <tr key={account.email}>
                  <td>{account.email}</td>
                  <td>
                    <code>{account.password}</code>
                  </td>
                  <td>{account.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Not signed in? Browse the <Link href="/menu">menu</Link> — only
            checkout and orders need an account.
          </p>
        </aside>
      </div>
    </section>
  );
}

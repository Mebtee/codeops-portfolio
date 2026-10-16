"use client";

import Link from "next/link";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { signOut } from "@/actions";

export default function AccountMenu() {
  const { data } = useSWR("/api/session", fetcher);
  const user = data?.data ?? null;

  if (!user) {
    return (
      <Link href="/signin" className="account-link">
        Sign in
      </Link>
    );
  }

  return (
    <span className="account-menu">
      <span className="account-name" title={user.email}>
        {user.name}
      </span>
      <form action={signOut}>
        <button type="submit">Sign out</button>
      </form>
    </span>
  );
}

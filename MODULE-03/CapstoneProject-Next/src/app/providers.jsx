"use client";

import { useEffect } from "react";
import { useCartStore } from "@/Store/useCartStore";
import { useAuthStore } from "@/Store/useAuthStore";

export default function Providers({ children }) {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  return children;
}

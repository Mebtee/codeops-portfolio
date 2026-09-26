import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { findDish } from '../api';

export const COUPON_CODE = 'GURSHA2025';
export const COUPON_DISCOUNT = 200;
export const FREE_DELIVERY_MIN = 1200;
const PACKAGING_FEE = 60;
const DELIVERY_FEE = 80;
const VAT_RATE = 0.15;

const lineKey = (id, option) => `${id}|${option || ''}`;

const makeLine = (dish, qty, opts = {}) => {
  const optionPrice = opts.optionPrice || 0;
  const unitPrice = dish.price + optionPrice;
  return {
    id: dish.id,
    name: dish.name,
    option: opts.option || null,
    optionPrice,
    unitPrice,
    qty,
    lineTotal: unitPrice * qty,
  };
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      orderNote: '',

      addItem: (id, qty = 1, opts = {}) => {
        const dish = typeof id === 'object' ? id : findDish(id);
        if (!dish) return;
        const itemId = dish.id;
        const key = lineKey(itemId, opts.option);
        const items = get().items;
        const existing = items.find((item) => lineKey(item.id, item.option) === key);

        if (existing) {
          const nextQty = existing.qty + qty;
          set({
            items: items.map((item) =>
              lineKey(item.id, item.option) === key
                ? { ...item, qty: nextQty, lineTotal: item.unitPrice * nextQty }
                : item
            ),
          });
          return;
        }

        set({ items: [...items, makeLine(dish, qty, opts)] });
      },

      addToCart: (dish) => get().addItem(dish),

      updateQty: (id, option, qty) => {
        const key = lineKey(id, option);
        set({
          items:
            qty <= 0
              ? get().items.filter((item) => lineKey(item.id, item.option) !== key)
              : get().items.map((item) =>
                  lineKey(item.id, item.option) === key
                    ? { ...item, qty, lineTotal: item.unitPrice * qty }
                    : item
                ),
        });
      },

      removeItem: (id, option) => {
        const key = lineKey(id, option);
        set({ items: get().items.filter((item) => lineKey(item.id, item.option) !== key) });
      },

      removeFromCart: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      clearCart: () => set({ items: [], coupon: null, orderNote: '' }),

      applyCoupon: (code) => {
        if ((code || '').trim().toUpperCase() === COUPON_CODE) {
          set({ coupon: COUPON_CODE });
          return { ok: true };
        }
        set({ coupon: null });
        return { ok: false };
      },

      setOrderNote: (orderNote) => set({ orderNote }),
    }),
    { name: 'mesob-cart' }
  )
);

export const selectCart = (state) => {
  const { items, coupon, orderNote } = state;
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const packaging = count === 0 ? 0 : PACKAGING_FEE;
  const freeDelivery = subtotal >= FREE_DELIVERY_MIN;
  const delivery = count === 0 ? 0 : freeDelivery ? 0 : DELIVERY_FEE;
  const vat = Math.round((subtotal + packaging + delivery) * VAT_RATE);
  const discount = coupon ? COUPON_DISCOUNT : 0;
  const grand = Math.max(0, subtotal + packaging + delivery + vat - discount);

  return {
    items,
    coupon,
    orderNote,
    count,
    subtotal,
    packaging,
    delivery,
    freeDelivery,
    vat,
    discount,
    grand,
  };
};

export const useCart = () => { const state = useCartStore(); return { ...state, ...selectCart(state) }; };

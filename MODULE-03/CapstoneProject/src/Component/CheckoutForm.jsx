import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '../store/useCartStore';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  address: z.string().min(5, 'Delivery address is required'),
  phone: z.string().regex(/^[0-9]{10,12}$/, 'Enter a valid phone number'),
  note: z.string().optional(),
});

export const CheckoutForm = () => {
  const { clearCart, cart } = useCartStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data) => {
    // Simulate API submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('Order placed successfully!');
    clearCart();
    reset();
  };

  if (cart.length === 0) {
    return <p>Your cart is empty. Add some dishes to proceed!</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="checkout-form">
      <h2>Checkout</h2>

      <div className="form-group">
        <label>Full Name</label>
        <input {...register('fullName')} />
        {errors.fullName && (
          <span className="error">{errors.fullName.message}</span>
        )}
      </div>

      <div className="form-group">
        <label>Delivery Address</label>
        <input {...register('address')} />
        {errors.address && (
          <span className="error">{errors.address.message}</span>
        )}
      </div>

      <div className="form-group">
        <label>Phone Number</label>
        <input {...register('phone')} />
        {errors.phone && <span className="error">{errors.phone.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Placing Order...' : 'Place Order'}
      </button>
    </form>
  );
};

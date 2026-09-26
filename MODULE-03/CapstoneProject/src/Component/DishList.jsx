import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';

export const DishList = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        // Replace with your API endpoint or local mock data source
        const response = await fetch('https://api.example.com/dishes');
        if (!response.ok) {
          throw new Error(
            'Failed to fetch menu items. Please try again later.'
          );
        }
        const data = await response.json();
        setDishes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  if (loading) {
    return <div className="loading-state">Loading delicious dishes...</div>;
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  if (dishes.length === 0) {
    return (
      <div className="empty-state">
        No dishes available at the moment. Check back soon!
      </div>
    );
  }

  return (
    <div className="dish-grid">
      {dishes.map((dish) => (
        <div key={dish.id} className="dish-card">
          <h3>{dish.name}</h3>
          <p>{dish.description}</p>
          <span>{dish.price} ETB</span>
          <button onClick={() => addToCart(dish)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
};

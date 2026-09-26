import { useEffect, useState } from 'react';
import { DISHES } from './data/dishes';

// raw category string (in menu.json) -> UI category key
const CAT_MAP = {
  stews: 'wat',
  wat: 'wat',
  traditional: 'wat',
  tibs: 'tibs',
  grills: 'tibs',
  raw: 'tibs',
  cured: 'tibs',
  kitfo: 'tibs',
  fasting: 'fasting',
  tsom: 'fasting',
  vegan: 'fasting',
  breakfast: 'bites',
  bites: 'bites',
  drinks: 'drinks',
  beverages: 'drinks',
  extras: 'extras',
  injera: 'extras',
};

// menu.json item -> the shape every component already expects SAAME OBJECT
const normalize = (raw) => ({
  id: raw.slug || raw.id,
  name: raw.nameEn || raw.name || raw.slug || 'Unnamed dish',
  price: Number(raw.priceETB ?? raw.price ?? 0),
  cat:
    Object.entries(CAT_MAP).find(([key]) =>
      String(raw.category || '')
        .toLowerCase()
        .includes(key)
    )?.[1] || 'wat',
  tag: raw.tag || '',
  tagline: raw.tagline || '',
  spice: raw.spiceLevel || raw.spice || '1/5',
  desc: raw.description || raw.desc || '',
  servings: raw.servings || '',
  isFasting: Boolean(raw.isFasting),
  amName:raw.nameAm || 'no amharic name'
});

let cache = null; // samples { dishes, specials, fromApi }

async function loadMenuData() {
  if (cache) return cache;
  try {
    const [menuRes, specRes] = await Promise.all([
      fetch('/menu.json').then((r) => {
        if (!r.ok) throw new Error('menu.json missing');
        return r.json();
      }),
      fetch('/specials.json').then((r) => {
        if (!r.ok) throw new Error('specials.json missing');
        return r.json();
      }),
    ]);
    const dishes = (menuRes.data || menuRes.menu || menuRes.dishes || []).map(
      normalize
    );
    const specials = (specRes.data || specRes.specials || [])
      .map((special) =>
        typeof special === 'string' ? special : special.slug || special.id
      )
      .map((id) => dishes.find((d) => d.id === id))
      .filter(Boolean);
    cache = { dishes, specials, fromApi: true };
  } catch {
    // IF ERROR OR IN DEEV SAY  JSON not found OR API FIALED -> offline fallback
    const fallbackIds = [
      'doro-wat',
      'siga-derek-tibs',
      'shiro-tegamino',
      'kitfo',
    ];
    cache = {
      dishes: DISHES,
      specials: fallbackIds
        .map((id) => DISHES.find((d) => d.id === id))
        .filter(Boolean),
      fromApi: false,
    };
  }
  return cache;
}

export function useMenuData() {
  const [data, setData] = useState(
    cache || { dishes: DISHES, specials: [], fromApi: false, loading: true }
  );
  useEffect(() => {
    let alive = true;
    loadMenuData().then((d) => alive && setData({ ...d, loading: false }));
    return () => {
      alive = false;
    };
  }, []);
  return data;
}


export function findDish(id) {
  const src = cache?.dishes || DISHES;
  return (
    src.find((d) => d.id === id) || DISHES.find((d) => d.id === id) || null
  );
}

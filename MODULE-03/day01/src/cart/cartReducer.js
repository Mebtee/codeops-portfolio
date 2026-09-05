export function cartReducer(state, action) {
  switch (action.type) {
    case "add": {
      const existing = state.find((item) => item.id === action.payload.id);

      if (existing) {
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...state, { ...action.payload, quantity: 1 }];
    }

    case "remove": {
      const existing = state.find((item) => item.id === action.payload.id);

      if (!existing) {
        return state;
      }

      if (existing.quantity > 1) {
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }

      return state.filter((item) => item.id !== action.payload.id);
    }

    case "clear":
      return [];

    default:
      return state;
  }
}

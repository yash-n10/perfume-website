/**
 * MOHERA Session-based Guest Cart Manager
 * Keeps cart data in browser session storage when user is not logged in.
 */

const SESSION_CART_KEY = 'mohera_session_cart';

export function getGuestCart() {
  try {
    const raw = sessionStorage.getItem(SESSION_CART_KEY);
    if (!raw) return { items: [], total: 0, count: 0 };
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      total: Number(parsed.total) || 0,
      count: Number(parsed.count) || 0,
    };
  } catch {
    return { items: [], total: 0, count: 0 };
  }
}

function calculateCartTotals(items) {
  let total = 0;
  let count = 0;
  const normalizedItems = items.map((item, idx) => {
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const price = parseFloat(item.price) || 0;
    const subtotal = Math.round(price * qty * 100) / 100;
    total += subtotal;
    count += qty;
    return {
      ...item,
      id: item.id || `guest_${item.product_id || idx}_${Date.now()}`,
      quantity: qty,
      price,
      subtotal,
    };
  });

  return {
    items: normalizedItems,
    total: Math.round(total * 100) / 100,
    count,
  };
}

export function saveGuestCart(items) {
  const cart = calculateCartTotals(items);
  try {
    sessionStorage.setItem(SESSION_CART_KEY, JSON.stringify(cart));
    // Dispatch custom event for cross-component sync
    window.dispatchEvent(new CustomEvent('mohera-guest-cart-change', { detail: cart }));
  } catch (e) {
    console.error('Failed to save session cart:', e);
  }
  return cart;
}

export function addToGuestCart(product, quantity = 1) {
  const current = getGuestCart();
  const existingIdx = current.items.findIndex(
    (item) => String(item.product_id) === String(product.id || product.product_id) ||
              item.product_name.toLowerCase() === (product.name || product.product_name).toLowerCase()
  );

  let updatedItems = [...current.items];
  if (existingIdx >= 0) {
    updatedItems[existingIdx] = {
      ...updatedItems[existingIdx],
      quantity: updatedItems[existingIdx].quantity + quantity,
    };
  } else {
    updatedItems.push({
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      product_id: product.id || product.product_id || 1,
      product_name: product.name || product.product_name,
      price: product.price,
      image: product.image || '/products/belle_poster.jpeg',
      quantity,
    });
  }

  return saveGuestCart(updatedItems);
}

export function updateGuestCartQuantity(itemId, quantity) {
  const current = getGuestCart();
  if (quantity <= 0) {
    return removeFromGuestCart(itemId);
  }

  const updatedItems = current.items.map((item) => {
    if (String(item.id) === String(itemId)) {
      return { ...item, quantity };
    }
    return item;
  });

  return saveGuestCart(updatedItems);
}

export function removeFromGuestCart(itemId) {
  const current = getGuestCart();
  const updatedItems = current.items.filter((item) => String(item.id) !== String(itemId));
  return saveGuestCart(updatedItems);
}

export function clearGuestCart() {
  try {
    sessionStorage.removeItem(SESSION_CART_KEY);
    window.dispatchEvent(new CustomEvent('mohera-guest-cart-change', { detail: { items: [], total: 0, count: 0 } }));
  } catch {
    // ignore
  }
  return { items: [], total: 0, count: 0 };
}

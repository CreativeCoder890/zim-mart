export type StoredCartItem = {
	productId: string;
	name: string;
	priceUsd: number;
	quantity: number;
	imageUrl?: string;
	supplierId?: string;
};

const STORAGE_KEY = 'zim_mart_cart_v1';

export function getCart(): StoredCartItem[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as StoredCartItem[]) : [];
	} catch {
		return [];
	}
}

export function setCart(items: StoredCartItem[]) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToCart(item: StoredCartItem) {
	const cart = getCart();
	const idx = cart.findIndex((c) => c.productId === item.productId);
	if (idx >= 0) {
		cart[idx].quantity += item.quantity;
	} else {
		cart.push(item);
	}
	setCart(cart);
}

export function removeFromCart(productId: string) {
	const cart = getCart().filter((c) => c.productId !== productId);
	setCart(cart);
}

export function clearCart() {
	setCart([]);
}


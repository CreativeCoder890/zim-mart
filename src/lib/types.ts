export type Supplier = {
	id: string;
	name: string;
	phone?: string | null;
	whatsapp?: string | null;
	city?: string | null;
	address?: string | null;
	kyc_status: 'pending' | 'approved' | 'rejected';
	created_at?: string;
};

export type Category = {
	id: string;
	name: string;
	slug: string;
};

export type Product = {
	id: string;
	supplier_id: string;
	name: string;
	slug: string;
	description?: string | null;
	price_usd: number;
	sku?: string | null;
	stock: number;
	category_id?: string | null;
	images: string[] | { url: string }[];
	active: boolean;
	created_at?: string;
	supplier?: Supplier;
	category?: Category;
};

export type CartItem = {
	productId: string;
	name: string;
	priceUsd: number;
	quantity: number;
	imageUrl?: string;
	supplierId?: string;
};

export type OrderPayload = {
	buyer_name: string;
	buyer_phone: string;
	city: string;
	address: string;
	payment_method: 'COD' | 'EcoCash' | 'ZIPIT';
	items: Array<{ product_id: string; quantity: number }>;
};

export type OrderResponse = {
	order_id: string;
	order_number: number;
	total_usd: number;
	payment_method: string;
	status: string;
};


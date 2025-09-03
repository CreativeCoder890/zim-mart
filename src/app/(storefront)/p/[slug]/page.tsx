'use client';

import { useEffect, useState } from 'react';
import { addToCart } from '@/lib/cart';
import { getPublicSupabaseEnv } from '@/lib/env';

async function fetchProduct(slug: string) {
	const { url, anon } = getPublicSupabaseEnv();
	const res = await fetch(`${url}/rest/v1/products?select=*&slug=eq.${slug}`, {
		headers: {
			apikey: anon,
			authorization: `Bearer ${anon}`,
		},
		cache: 'no-store',
	});
	const data = await res.json();
	return data?.[0];
}

export default function ProductPage({ params }: { params: { slug: string } }) {
	const { slug } = params;
	const [product, setProduct] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [qty, setQty] = useState<number>(1);

	useEffect(() => {
		fetchProduct(slug).then(setProduct).catch((e) => setError(e.message));
	}, [slug]);

	if (error) return <div className="p-4 text-sm">{error}</div>;
	if (!product) return <div className="p-4">Loading...</div>;
	const img = Array.isArray(product.images) && product.images[0]?.url ? product.images[0].url : undefined;

	return (
		<div className="max-w-3xl mx-auto p-4">
			<h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
			{img && <img src={img} alt={product.name} className="w-full max-w-md rounded mb-4" />}
			<p className="mb-2">${Number(product.price_usd).toFixed(2)} USD</p>
			<p className="mb-4 text-sm text-gray-600">{product.description}</p>
			<div className="flex items-center gap-2 mb-4">
				<input type="number" className="border p-2 w-20" min={1} value={qty} onChange={(e) => setQty(parseInt(e.target.value || '1', 10))} />
				<button onClick={() => addToCart({ productId: product.id, name: product.name, priceUsd: Number(product.price_usd), quantity: qty, imageUrl: img, supplierId: product.supplier_id })} className="bg-black text-white px-4 py-2 rounded">Add to cart</button>
			</div>
			<a href="/checkout" className="text-blue-600 underline">Go to checkout</a>
		</div>
	);
}


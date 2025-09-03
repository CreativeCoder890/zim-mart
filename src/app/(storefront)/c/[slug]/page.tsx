'use client';

import { useEffect, useState } from 'react';
import { getPublicSupabaseEnv } from '@/lib/env';

async function fetchCategoryProducts(slug: string) {
	const { url, anon } = getPublicSupabaseEnv();
	// first get category id
	const catRes = await fetch(`${url}/rest/v1/categories?select=*&slug=eq.${slug}`, {
		headers: { apikey: anon, authorization: `Bearer ${anon}` },
	});
	const catData = await catRes.json();
	const cat = catData?.[0];
	if (!cat) return [];
	const res = await fetch(`${url}/rest/v1/products?select=*&category_id=eq.${cat.id}`, {
		headers: { apikey: anon, authorization: `Bearer ${anon}` },
		cache: 'no-store',
	});
	return await res.json();
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
	const { slug } = params;
	const [products, setProducts] = useState<{ id: string; name: string; price_usd: number; slug: string }[]>([]);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		fetchCategoryProducts(slug).then(setProducts).catch((e) => setError(e.message));
	}, [slug]);

	if (error) return <div className="p-4 text-sm">{error}</div>;
	return (
		<div className="max-w-5xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			{products.map((p) => (
				<a key={p.id} href={`/p/${p.slug}`} className="border rounded p-3 block">
					<div className="font-medium mb-1">{p.name}</div>
					<div className="text-sm">${Number(p.price_usd).toFixed(2)}</div>
				</a>
			))}
		</div>
	);
}


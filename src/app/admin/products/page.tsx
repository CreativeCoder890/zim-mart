'use client';

import { useEffect, useState } from 'react';

export default function AdminProducts() {
	const [products, setProducts] = useState<any[]>([]);
	useEffect(() => {
		(async () => {
			const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
			const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
			const res = await fetch(`${url}/rest/v1/products?select=id,name,slug,price_usd,stock&order=created_at.desc`, {
				headers: { apikey: anon, authorization: `Bearer ${anon}` },
			});
			const data = await res.json();
			setProducts(data);
		})();
	}, []);
	return (
		<div className="max-w-4xl mx-auto p-4">
			<h1 className="text-xl font-semibold mb-4">Products</h1>
			<table className="w-full text-sm">
				<thead>
					<tr className="text-left border-b">
						<th className="py-2">Name</th>
						<th>Price</th>
						<th>Stock</th>
					</tr>
				</thead>
				<tbody>
					{products.map((p) => (
						<tr key={p.id} className="border-b">
							<td className="py-2">{p.name}</td>
							<td>${Number(p.price_usd).toFixed(2)}</td>
							<td>{p.stock}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}


'use client';

import { useEffect, useState } from 'react';

export default function AdminOrders() {
	const [orders, setOrders] = useState<{ id: string; order_number: number; buyer_name: string; total_usd: number; status: string }[]>([]);
	useEffect(() => {
		(async () => {
			const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
			const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
			const res = await fetch(`${url}/rest/v1/orders?select=id,order_number,buyer_name,total_usd,status,created_at&order=created_at.desc`, {
				headers: { apikey: anon, authorization: `Bearer ${anon}` },
			});
			const data = await res.json();
			setOrders(data);
		})();
	}, []);
	return (
		<div className="max-w-4xl mx-auto p-4">
			<h1 className="text-xl font-semibold mb-4">Orders</h1>
			<table className="w-full text-sm">
				<thead>
					<tr className="text-left border-b">
						<th className="py-2">Order #</th>
						<th>Buyer</th>
						<th>Total</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{orders.map((o) => (
						<tr key={o.id} className="border-b">
							<td className="py-2">{o.order_number}</td>
							<td>{o.buyer_name}</td>
							<td>${Number(o.total_usd).toFixed(2)}</td>
							<td>{o.status}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}


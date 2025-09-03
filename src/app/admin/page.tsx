'use client';

export default function AdminHome() {
	async function seed() {
		const res = await fetch('/api/admin/seed', { method: 'POST' });
		const data = await res.json();
		if (res.ok) alert('Seeded ' + data.products + ' products'); else alert(data.error || 'Seed failed');
	}
	return (
		<div className="max-w-lg mx-auto p-4">
			<h1 className="text-xl font-semibold mb-4">Admin</h1>
			<div className="space-y-2">
				<button onClick={seed} className="bg-black text-white px-4 py-2 rounded">Seed demo catalog</button>
				<div>
					<a className="underline" href="/admin/products">Products</a>
				</div>
				<div>
					<a className="underline" href="/admin/orders">Orders</a>
				</div>
			</div>
		</div>
	);
}


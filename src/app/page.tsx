import Link from "next/link";
import { getPublicSupabaseEnv } from "@/lib/env";

async function fetchFeatured() {
	const { url, anon } = getPublicSupabaseEnv();
	const res = await fetch(`${url}/rest/v1/products?select=id,name,slug,price_usd&limit=12`, {
		headers: { apikey: anon, authorization: `Bearer ${anon}` },
		cache: 'no-store',
	});
	return await res.json();
}

export default async function Home() {
	try {
		const featured = await fetchFeatured();
		return (
			<div className="max-w-6xl mx-auto p-4">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-2xl font-semibold">Zim Mart</h1>
					<Link className="underline" href="/checkout">Cart/Checkout</Link>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{featured.map((p: { id: string; name: string; price_usd: number; slug: string }) => (
						<Link key={p.id} href={`/p/${p.slug}`} className="border rounded p-3 block">
							<div className="font-medium mb-1">{p.name}</div>
							<div className="text-sm">${Number(p.price_usd).toFixed(2)}</div>
						</Link>
					))}
				</div>
			</div>
		);
	} catch (e: unknown) {
		return (
			<div className="max-w-xl mx-auto p-6">
				<h1 className="text-xl font-semibold mb-2">Setup required</h1>
				<p className="text-sm">{e instanceof Error ? e.message : 'Unknown error'}. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart dev server.</p>
			</div>
		);
	}
}
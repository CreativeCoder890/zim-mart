import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

function isAuthed(req: NextRequest) {
	return req.cookies.get('admin_auth')?.value === '1';
}

export async function POST(req: NextRequest) {
	if (!isAuthed(req)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const supabase = createSupabaseServer();

	// categories
	const categories = [
		{ name: 'Phones & Tablets', slug: 'phones' },
		{ name: 'Home Appliances', slug: 'appliances' },
		{ name: 'Auto Spares', slug: 'auto-spares' },
	];
	for (const c of categories) {
		await supabase.from('categories').upsert(c, { onConflict: 'slug' });
	}
	// supplier
	const { data: supplier } = await supabase
		.from('suppliers')
		.upsert({ name: 'Demo Importer Bulawayo', city: 'Bulawayo', kyc_status: 'approved' })
		.select()
		.single();

	const makeProduct = (idx: number) => ({
		supplier_id: supplier.id,
		name: `Demo Product ${idx}`,
		slug: `demo-product-${idx}`,
		description: 'Affordable quality import.',
		price_usd: 5 + (idx % 10) * 3,
		stock: 20 + (idx % 5) * 5,
		category_id: null,
		images: [],
		active: true,
	});

	// Get category ids
	const { data: cats } = await supabase.from('categories').select('id, slug');
	const catMap = new Map(cats?.map((c) => [c.slug, c.id]));

	const products = Array.from({ length: 20 }).map((_, i) => {
		const p = makeProduct(i + 1);
		return { ...p, category_id: catMap.get(categories[i % categories.length].slug)! };
	});

	for (const p of products) {
		await supabase.from('products').upsert(p, { onConflict: 'slug' });
	}

	return NextResponse.json({ ok: true, categories: categories.length, products: products.length });
}


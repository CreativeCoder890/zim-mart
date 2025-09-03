import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

function normalizeZimPhoneToE164(input: string): string | null {
	let digits = input.replace(/\D/g, '');
	if (digits.startsWith('0')) digits = digits.slice(1);
	if (digits.startsWith('263')) return digits;
	if (digits.length >= 9) return `263${digits}`;
	return null;
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const {
			buyer_name,
			buyer_phone,
			city,
			address,
			payment_method,
			items,
		} = body as {
			buyer_name: string;
			buyer_phone: string;
			city: string;
			address: string;
			payment_method: 'COD' | 'EcoCash' | 'ZIPIT';
			items: Array<{ product_id: string; quantity: number }>;
		};

		if (!buyer_name || !buyer_phone || !city || !address || !payment_method || !items?.length) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const supabase = createSupabaseServer();

		// Fetch product prices and supplier ids
		const productIds = items.map((i) => i.product_id);
		const { data: products, error: prodErr } = await supabase
			.from('products')
			.select('id, name, price_usd, supplier_id')
			.in('id', productIds);
		if (prodErr) throw prodErr;
		if (!products || products.length !== productIds.length) {
			return NextResponse.json({ error: 'Some products not found' }, { status: 400 });
		}

		let subtotal = 0;
		for (const item of items) {
			const prod = products.find((p) => p.id === item.product_id)!;
			subtotal += Number(prod.price_usd) * item.quantity;
		}
		const delivery_fee = 3; // flat fee MVP
		const total = subtotal + delivery_fee;

		const { data: order, error: orderErr } = await supabase
			.from('orders')
			.insert({
				buyer_name,
				buyer_phone,
				city,
				address,
				payment_method,
				currency: 'USD',
				subtotal_usd: subtotal,
				delivery_fee_usd: delivery_fee,
				total_usd: total,
				status: 'created',
			})
			.select()
			.single();
		if (orderErr) throw orderErr;

		const orderItems = items.map((i) => {
			const prod = products.find((p) => p.id === i.product_id)!;
			return {
				order_id: order.id,
				product_id: i.product_id,
				supplier_id: prod.supplier_id,
				quantity: i.quantity,
				unit_price_usd: prod.price_usd,
				status: 'created',
			};
		});
		const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
		if (itemsErr) throw itemsErr;

		// WhatsApp notifications (best-effort)
		try {
			const toBuyer = normalizeZimPhoneToE164(buyer_phone);
			const adminPhone = process.env.ADMIN_WHATSAPP_TO?.trim();
			const msg = `Zim Mart: Order ${order.order_number}\nName: ${buyer_name}\nTotal: $${total.toFixed(2)} USD\nPayment: ${payment_method}\nWe will contact you to confirm.`;
			if (toBuyer) await sendWhatsAppMessage({ toE164: toBuyer, message: msg });
			if (adminPhone) await sendWhatsAppMessage({ toE164: adminPhone, message: `New order ${order.order_number} - $${total.toFixed(2)} USD` });
		} catch (e: unknown) {
			console.warn('WhatsApp send skipped/failed', e instanceof Error ? e.message : String(e));
		}

		return NextResponse.json({
			order_id: order.id,
			order_number: order.order_number,
			total_usd: total,
			payment_method,
			status: order.status,
		});
	} catch (err: unknown) {
		return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
	}
}


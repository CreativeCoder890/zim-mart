'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getCart, clearCart } from '@/lib/cart';

export default function CheckoutPage() {
	const [cart, setCart] = useState(getCart());
	const [buyerName, setBuyerName] = useState('');
	const [buyerPhone, setBuyerPhone] = useState('');
	const [city, setCity] = useState('Bulawayo');
	const [address, setAddress] = useState('');
	const [paymentMethod, setPaymentMethod] = useState<'COD' | 'EcoCash' | 'ZIPIT'>('COD');
	const [placing, setPlacing] = useState(false);
	const [result, setResult] = useState<{ order_number: number; total_usd: number } | null>(null);
	const subtotal = useMemo(() => cart.reduce((s, i) => s + i.priceUsd * i.quantity, 0), [cart]);
	const deliveryFee = 3;
	const total = subtotal + deliveryFee;

	useEffect(() => {
		setCart(getCart());
	}, []);

	async function placeOrder() {
		setPlacing(true);
		try {
			const items = cart.map((c) => ({ product_id: c.productId, quantity: c.quantity }));
			const res = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					buyer_name: buyerName,
					buyer_phone: buyerPhone,
					city,
					address,
					payment_method: paymentMethod,
					items,
				}),
			});
			const data = await res.json() as { order_number: number; total_usd: number } | { error: string };
			if (!res.ok) throw new Error((data as { error: string }).error || 'Failed');
			setResult(data as { order_number: number; total_usd: number });
			clearCart();
		} catch (e: unknown) {
			alert(e instanceof Error ? e.message : 'Unknown error');
		} finally {
			setPlacing(false);
		}
	}

	if (result) {
		return (
			<div className="max-w-xl mx-auto p-4">
				<h1 className="text-2xl font-semibold mb-4">Order placed</h1>
				<p>Order number: {result.order_number}</p>
				<p>Total: ${result.total_usd.toFixed(2)} USD</p>
				{paymentMethod === 'COD' && (
					<div className="mt-4 p-3 border rounded">
						<h2 className="font-medium">Cash on Delivery</h2>
						<p>Have exact cash ready on delivery. We will call to confirm.</p>
					</div>
				)}
				{paymentMethod === 'EcoCash' && (
					<div className="mt-4 p-3 border rounded">
						<h2 className="font-medium">EcoCash Instructions</h2>
						<p>Dial *151#, send ${total.toFixed(2)} to 07xxxxxxx. Reply on WhatsApp with proof.</p>
					</div>
				)}
				{paymentMethod === 'ZIPIT' && (
					<div className="mt-4 p-3 border rounded">
						<h2 className="font-medium">ZIPIT Instructions</h2>
						<p>ZIPIT ${total.toFixed(2)} to Account 123456789, Steward Bank. Use order number as reference.</p>
					</div>
				)}
				<Link className="text-blue-600 underline mt-6 inline-block" href="/">Continue shopping</Link>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-semibold mb-4">Checkout</h1>
			<div className="space-y-2 mb-4">
				<input className="border p-2 w-full" placeholder="Full name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
				<input className="border p-2 w-full" placeholder="Phone (WhatsApp)" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
				<input className="border p-2 w-full" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
				<input className="border p-2 w-full" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
			</div>
			<div className="mb-4">
				<label className="mr-4">
					<input type="radio" name="pm" checked={paymentMethod==='COD'} onChange={() => setPaymentMethod('COD')} /> COD
				</label>
				<label className="mr-4">
					<input type="radio" name="pm" checked={paymentMethod==='EcoCash'} onChange={() => setPaymentMethod('EcoCash')} /> EcoCash
				</label>
				<label>
					<input type="radio" name="pm" checked={paymentMethod==='ZIPIT'} onChange={() => setPaymentMethod('ZIPIT')} /> ZIPIT
				</label>
			</div>
			<div className="border rounded p-3 mb-4">
				{cart.map((c) => (
					<div key={c.productId} className="flex justify-between py-1">
						<span>{c.name} × {c.quantity}</span>
						<span>${(c.priceUsd * c.quantity).toFixed(2)}</span>
					</div>
				))}
				<div className="flex justify-between pt-2 border-t mt-2"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
				<div className="flex justify-between"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
				<div className="flex justify-between font-semibold"><span>Total</span><span>${total.toFixed(2)}</span></div>
			</div>
			<button disabled={placing || cart.length===0} onClick={placeOrder} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">{placing ? 'Placing...' : 'Place order'}</button>
		</div>
	);
}


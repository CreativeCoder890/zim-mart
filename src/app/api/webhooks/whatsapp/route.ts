import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const mode = url.searchParams.get('hub.mode');
	const token = url.searchParams.get('hub.verify_token');
	const challenge = url.searchParams.get('hub.challenge');
	if (mode === 'subscribe' && token && challenge) {
		const expected = process.env.WHATSAPP_VERIFY_TOKEN;
		if (token === expected) return new NextResponse(challenge, { status: 200 });
		return new NextResponse('Forbidden', { status: 403 });
	}
	return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
	const body = await req.json().catch(() => null);
	console.log('WhatsApp webhook', JSON.stringify(body));
	return NextResponse.json({ received: true });
}

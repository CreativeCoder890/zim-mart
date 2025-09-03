import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	const { password } = await req.json();
	const secret = process.env.ADMIN_SECRET || process.env.NEXT_PUBLIC_ADMIN_SECRET;
	if (!secret) {
		return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
	}
	if (password !== secret) {
		return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
	}
	const res = NextResponse.json({ ok: true });
	res.cookies.set('admin_auth', '1', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
	return res;
}


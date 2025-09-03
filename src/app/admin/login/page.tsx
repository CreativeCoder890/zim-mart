'use client';

import { useState } from 'react';

export default function AdminLogin() {
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	async function submit() {
		setLoading(true);
		const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
		if (res.ok) {
			window.location.href = '/admin';
		} else {
			const data = await res.json();
			alert(data.error || 'Login failed');
		}
		setLoading(false);
	}
	return (
		<div className="max-w-sm mx-auto p-4">
			<h1 className="text-xl font-semibold mb-4">Admin Login</h1>
			<input className="border p-2 w-full mb-2" type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} />
			<button onClick={submit} disabled={loading} className="bg-black text-white px-4 py-2 rounded w-full">{loading ? 'Signing in...' : 'Sign in'}</button>
		</div>
	);
}


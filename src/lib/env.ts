
export function getPublicSupabaseEnv() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !anon) {
		if (typeof window !== 'undefined') {
			console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
		}
		throw new Error('Supabase environment variables are not set.');
	}
	return { url, anon } as { url: string; anon: string };
}




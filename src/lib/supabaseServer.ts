import { createClient } from '@supabase/supabase-js';

export const createSupabaseServer = () => {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
	if (!url || !serviceKey) {
		throw new Error('Supabase URL or service role key is missing');
	}
	return createClient(url, serviceKey, {
		auth: { persistSession: false },
	});
};


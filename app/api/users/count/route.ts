import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function GET() {
	try {
		const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ count }, { status: 200 });
	} catch {
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
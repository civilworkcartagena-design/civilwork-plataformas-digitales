import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { config, supabase } = getSupabaseClient();
    const { count, error } = await supabase
      .from(config.defaultTable)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          ok: false,
          table: config.defaultTable
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count,
      keySource: config.keySource,
      ok: true,
      table: config.defaultTable
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown Supabase error',
        ok: false
      },
      { status: 500 }
    );
  }
}

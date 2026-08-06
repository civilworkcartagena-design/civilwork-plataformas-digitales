import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { config, supabase } = getSupabaseClient();
    const { count, error } = await supabase
      .from(config.defaultTable)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({
        code: error.code,
        error: error.message,
        hint: 'Revise que SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_DEFAULT_TABLE existan en Hostinger, y que la tabla exista en Supabase.',
        ok: false,
        table: config.defaultTable
      });
    }

    return NextResponse.json({
      count,
      keySource: config.keySource,
      ok: true,
      table: config.defaultTable
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown Supabase error',
      hint: 'Revise las variables de entorno de Supabase en Hostinger y haga redeploy completo.',
      ok: false
    });
  }
}

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseConfig = {
  defaultTable: string;
  keySource: 'anon' | 'public-anon' | 'service-role';
  key: string;
  url: string;
};

let client: SupabaseClient | null = null;

function readSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable.');
  }

  if (!serviceRoleKey && !anonKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.'
    );
  }

  return {
    defaultTable: process.env.SUPABASE_DEFAULT_TABLE || 'gibbor_mantenimientos',
    key: serviceRoleKey || anonKey || '',
    keySource: serviceRoleKey
      ? 'service-role'
      : process.env.SUPABASE_ANON_KEY
        ? 'anon'
        : 'public-anon',
    url
  };
}

export function getSupabaseClient() {
  const config = readSupabaseConfig();

  if (!client) {
    client = createClient(config.url, config.key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return {
    config: {
      defaultTable: config.defaultTable,
      keySource: config.keySource
    },
    supabase: client
  };
}

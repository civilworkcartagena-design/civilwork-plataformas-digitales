import 'server-only';
import type { Attribution, DiagnosticAnswers, DiagnosticResult, Lead } from '@/types/venture';

interface LeadPayload {
  answers: DiagnosticAnswers;
  result: DiagnosticResult;
  attribution: Attribution;
}
interface LeadRow {
  id: string;
  created_at: string;
  company: string;
  contact_name: string;
  position: string | null;
  email: string;
  phone: string | null;
  industry: string | null;
  company_size: string | null;
  answers: DiagnosticAnswers;
  digital_score: number;
  recommended_plan: string;
  estimated_investment_min: number;
  estimated_investment_max: number;
  status: Lead['status'];
  attribution: Attribution;
}

function config() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase no está configurado');
  return { url: url.replace(/\/$/, ''), key };
}
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init?.headers
    },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
  return (await response.json()) as T;
}
function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    createdAt: row.created_at,
    company: row.company,
    contactName: row.contact_name,
    position: row.position ?? undefined,
    email: row.email,
    phone: row.phone ?? '',
    industry: row.industry ?? '',
    companySize: row.company_size ?? '',
    answers: row.answers ?? {},
    digitalScore: row.digital_score,
    recommendedPlan: row.recommended_plan,
    estimatedInvestmentMin: row.estimated_investment_min,
    estimatedInvestmentMax: row.estimated_investment_max,
    status: row.status,
    attribution: row.attribution ?? {}
  };
}

export async function createLead(payload: LeadPayload): Promise<Lead> {
  const contact = (payload.answers.contact ?? {}) as Record<string, string>;
  const rows = await request<LeadRow[]>('leads', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      company: String(payload.answers.companyName ?? 'Empresa'),
      contact_name: contact.name ?? '',
      position: contact.position || null,
      email: contact.email ?? '',
      phone: contact.phone || null,
      industry: String(payload.answers.industry ?? ''),
      company_size: String(payload.answers.companySize ?? ''),
      answers: payload.answers,
      digital_score: payload.result.score,
      recommended_plan: payload.result.plan,
      estimated_investment_min: payload.result.investmentMin,
      estimated_investment_max: payload.result.investmentMax,
      status: 'Nuevo',
      attribution: payload.attribution
    })
  });
  return mapLead(rows[0]);
}
export async function listLeads(): Promise<Lead[]> {
  return (await request<LeadRow[]>('leads?select=*&order=created_at.desc')).map(mapLead);
}
export async function findLead(id: string): Promise<Lead | null> {
  const rows = await request<LeadRow[]>(`leads?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0] ? mapLead(rows[0]) : null;
}

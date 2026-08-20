import type { Attribution, DiagnosticAnswers, DiagnosticResult, Lead } from '@/types/venture';

export const STORAGE_KEYS = {
  session: 'venture-diagnostic-session-v1',
  leads: 'venture-leads-v1'
} as const;
export interface SavedSession {
  answers: DiagnosticAnswers;
  currentQuestionId: string;
  updatedAt: string;
  attribution: Attribution;
}

export function readSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    return raw ? (JSON.parse(raw) as SavedSession) : null;
  } catch {
    return null;
  }
}
export function saveSession(session: SavedSession): void {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.session);
}
export function getLeads(): Lead[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.leads) ?? '[]') as Lead[];
  } catch {
    return [];
  }
}
export async function saveLead(
  answers: DiagnosticAnswers,
  result: DiagnosticResult,
  attribution: Attribution
): Promise<Lead> {
  const response = await fetch('/api/venture/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, result, attribution })
  });
  if (!response.ok) throw new Error('No fue posible guardar el diagnóstico');
  return response.json() as Promise<Lead>;
}

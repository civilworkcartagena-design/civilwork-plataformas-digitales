import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { findLead } from '@/lib/venture-repository';
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await context.params;
  const lead = await findLead(id);
  return lead
    ? NextResponse.json(lead)
    : NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
}

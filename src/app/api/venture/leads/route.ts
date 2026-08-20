import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createLead, listLeads } from '@/lib/venture-repository';

const answerSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.number(),
  z.boolean(),
  z.record(z.string(), z.string())
]);

const payloadSchema = z.object({
  answers: z.record(z.string(), answerSchema),
  result: z.object({
    score: z.number().min(0).max(100),
    categoryScores: z.record(z.string(), z.number()),
    priorities: z.array(z.object({ title: z.string(), detail: z.string() })),
    modules: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        features: z.array(z.string())
      })
    ),
    complexity: z.enum(['small', 'medium', 'high', 'enterprise']),
    plan: z.enum(['ESENCIAL', 'GROWTH', 'SCALE']),
    timelineWeeks: z.number(),
    quoteItems: z.array(
      z.object({ id: z.string(), label: z.string(), setup: z.number(), monthly: z.number() })
    ),
    setupTotal: z.number(),
    monthlyTotal: z.number(),
    investmentMin: z.number(),
    investmentMax: z.number()
  }),
  attribution: z.record(z.string(), z.string().optional()).default({})
});
export async function POST(request: Request) {
  try {
    const parsed = payloadSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    return NextResponse.json(await createLead(parsed.data), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'No fue posible guardar el diagnóstico' }, { status: 500 });
  }
}
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return NextResponse.json(await listLeads());
}

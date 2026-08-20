import { complexityMultipliers, pricing } from '@/config/pricing';
import type {
  Complexity,
  DiagnosticAnswers,
  DiagnosticResult,
  QuoteItem,
  RecommendedModule
} from '@/types/venture';

const list = (answers: DiagnosticAnswers, key: string): string[] =>
  Array.isArray(answers[key]) ? (answers[key] as string[]) : [];
const is = (answers: DiagnosticAnswers, key: string, value: string): boolean =>
  answers[key] === value;
const has = (answers: DiagnosticAnswers, key: string, value: string): boolean =>
  list(answers, key).includes(value);

const modules: Record<string, RecommendedModule> = {
  crm: {
    id: 'crm',
    title: 'CRM comercial',
    description: 'Una fuente confiable para la relación con cada prospecto y cliente.',
    features: [
      'Pipeline personalizado',
      'Fichas de clientes',
      'Gestión de oportunidades',
      'Actividades y roles'
    ]
  },
  leads: {
    id: 'leads',
    title: 'Captura y gestión de leads',
    description: 'Cada oportunidad ingresa, se clasifica y llega al responsable correcto.',
    features: ['Formularios y fuentes', 'Asignación', 'Tracking', 'Alertas de respuesta']
  },
  automation: {
    id: 'automation',
    title: 'Motor de automatización',
    description: 'Seguimientos consistentes sin depender de tareas repetitivas.',
    features: ['Asignación', 'Notificaciones', 'Secuencias', 'Recordatorios']
  },
  whatsapp: {
    id: 'whatsapp',
    title: 'WhatsApp conectado',
    description: 'Conversaciones centralizadas y vinculadas al contexto comercial.',
    features: ['Bandeja compartida', 'Distribución', 'Plantillas', 'Métricas']
  },
  service: {
    id: 'service',
    title: 'Atención omnicanal',
    description: 'Solicitudes trazables, con responsables y niveles de servicio.',
    features: ['Tickets', 'Canales', 'Escalamiento', 'Base de conocimiento']
  },
  dashboard: {
    id: 'dashboard',
    title: 'Dashboard gerencial',
    description: 'Decisiones con datos comerciales y operativos en tiempo real.',
    features: ['Leads', 'Conversión', 'Ventas', 'Actividad comercial']
  },
  website: {
    id: 'website',
    title: 'Ecosistema web',
    description: 'Activos digitales diseñados para captar, convertir y servir.',
    features: ['Arquitectura UX', 'CMS', 'Conversión', 'Analítica']
  },
  integrations: {
    id: 'integrations',
    title: 'Capa de integraciones',
    description: 'Las herramientas existentes operan como un solo ecosistema.',
    features: ['Mapeo de datos', 'APIs', 'Sincronización', 'Monitoreo']
  },
  ai: {
    id: 'ai',
    title: 'Inteligencia artificial aplicada',
    description: 'Agentes y asistentes con objetivos operativos concretos.',
    features: ['Base de conocimiento', 'Calificación', 'Asistencia', 'Escalamiento humano']
  },
  custom: {
    id: 'custom',
    title: 'Plataforma empresarial',
    description: 'Software ajustado a procesos que requieren lógica propia.',
    features: ['Diseño funcional', 'Roles', 'Flujos', 'Despliegue']
  }
};

function getComplexity(a: DiagnosticAnswers): Complexity {
  let points = 0;
  if (['31–75', '76–150'].includes(String(a.companySize))) points += 2;
  if (a.companySize === '150+') points += 4;
  if (['301–1.000', 'Más de 1.000'].includes(String(a.monthlyLeads))) points += 3;
  points += Math.min(4, Math.floor(list(a, 'tools').length / 4));
  points += Math.min(4, Math.floor(list(a, 'automationNeeds').length / 3));
  if (list(a, 'aiUses').length > 2) points += 2;
  if (
    list(a, 'buildNeeds').some((x) =>
      ['Aplicación', 'Plataforma interna', 'Sistema a medida'].includes(x)
    )
  )
    points += 3;
  return points >= 12 ? 'enterprise' : points >= 8 ? 'high' : points >= 4 ? 'medium' : 'small';
}

function getScores(a: DiagnosticAnswers): Record<string, number> {
  const sales = is(a, 'salesProcess', 'Tenemos un sistema comercial estructurado')
    ? 88
    : is(a, 'salesProcess', 'Tenemos CRM, pero poco automatizado')
      ? 67
      : is(a, 'salesProcess', 'Existe un proceso, pero es manual')
        ? 48
        : 28;
  const leads = is(a, 'leadProcess', 'Se asigna automáticamente')
    ? 90
    : is(a, 'leadProcess', 'Se registra en un CRM')
      ? 72
      : is(a, 'leadProcess', 'Se registra en Excel')
        ? 42
        : is(a, 'leadProcess', 'No tenemos un proceso definido')
          ? 18
          : 35;
  const automation =
    Math.min(92, is(a, 'leadProcess', 'Se asigna automáticamente') ? 78 : 24) -
    Math.min(18, list(a, 'automationNeeds').length * 2);
  const service = is(a, 'centralizeConversations', 'Sí')
    ? 38
    : list(a, 'serviceChannels').length <= 2
      ? 66
      : 46;
  const data = has(a, 'digitalAssets', 'Dashboard')
    ? 82
    : has(a, 'analytics', 'Todas') || list(a, 'analytics').length > 5
      ? 34
      : 48;
  const integrations = Math.max(20, 72 - list(a, 'tools').length * 5);
  const ai = list(a, 'aiUses').length > 0 ? (list(a, 'aiAgentTasks').length > 0 ? 42 : 28) : 18;
  return {
    'Estrategia comercial': sales,
    'Gestión de leads': leads,
    Automatización: Math.max(12, automation),
    Atención: service,
    Datos: data,
    Integraciones: integrations,
    IA: ai
  };
}

export function createRecommendation(answers: DiagnosticAnswers): DiagnosticResult {
  const complexity = getComplexity(answers);
  const multiplier = complexityMultipliers[complexity];
  const selected = new Set<string>(['crm', 'leads', 'automation']);
  if (is(answers, 'whatsappImportant', 'Sí')) selected.add('whatsapp');
  if (is(answers, 'centralizeConversations', 'Sí')) selected.add('service');
  if (list(answers, 'analytics').length) selected.add('dashboard');
  if (list(answers, 'buildNeeds').length)
    selected.add(
      list(answers, 'buildNeeds').some((x) =>
        [
          'Aplicación',
          'Plataforma interna',
          'Sistema a medida',
          'Portal de clientes',
          'Portal comercial',
          'Portal de proveedores'
        ].includes(x)
      )
        ? 'custom'
        : 'website'
    );
  if (list(answers, 'tools').length > 2) selected.add('integrations');
  if (
    list(answers, 'aiUses').length ||
    ['Sí', 'Tal vez'].includes(String(answers.aiServiceInterest))
  )
    selected.add('ai');
  const map: Record<string, { label: string; setup: number; monthly?: number }> = {
    crm: {
      label: 'CRM y pipeline',
      ...(complexity === 'small' ? pricing.crm.basic : pricing.crm.advanced)
    },
    leads: { label: 'Gestión de leads', ...pricing.leadManagement },
    automation: { label: 'Automatización comercial', ...pricing.salesAutomation },
    whatsapp: { label: 'WhatsApp y mensajería', ...pricing.whatsapp },
    service: { label: 'Atención al cliente', ...pricing.customerService },
    dashboard: { label: 'Dashboard ejecutivo', ...pricing.dashboards },
    website: { label: 'Infraestructura web', ...pricing.website },
    custom: { label: 'Portal / plataforma empresarial', ...pricing.customSoftware },
    integrations: {
      label: 'Integraciones',
      setup: pricing.integrations.setup * Math.max(1, Math.ceil(list(answers, 'tools').length / 3))
    },
    ai: { label: 'Agente y capacidades de IA', ...pricing.ai }
  };
  const quoteItems: QuoteItem[] = [...selected].map((id) => ({
    id,
    label: map[id].label,
    setup: Math.round((map[id].setup * multiplier) / 50_000) * 50_000,
    monthly: Math.round(((map[id].monthly ?? 0) * multiplier) / 10_000) * 10_000
  }));
  if (selected.has('custom') || complexity !== 'small')
    quoteItems.push({
      id: 'training',
      label: 'Implementación y capacitación',
      setup: Math.round((pricing.training.setup * multiplier) / 50_000) * 50_000,
      monthly: 0
    });
  const categoryScores = getScores(answers);
  const score = Math.round(
    Object.values(categoryScores).reduce((sum, n) => sum + n, 0) /
      Object.keys(categoryScores).length
  );
  const priorities = [
    ...(categoryScores['Gestión de leads'] < 60
      ? [
          {
            title: 'Centralizar los leads',
            detail: 'Construir una fuente única desde la captura hasta el cierre.'
          }
        ]
      : []),
    ...(categoryScores.Automatización < 60
      ? [
          {
            title: 'Automatizar el seguimiento',
            detail: 'Reducir tareas repetitivas y tiempos de respuesta.'
          }
        ]
      : []),
    ...(selected.has('whatsapp')
      ? [
          {
            title: 'Conectar WhatsApp y CRM',
            detail: 'Conservar contexto, responsables y trazabilidad.'
          }
        ]
      : []),
    ...(selected.has('dashboard')
      ? [
          {
            title: 'Activar control gerencial',
            detail: 'Convertir la operación en indicadores accionables.'
          }
        ]
      : []),
    ...(selected.has('integrations')
      ? [
          {
            title: 'Integrar el ecosistema actual',
            detail: 'Eliminar silos sin desechar herramientas útiles.'
          }
        ]
      : [])
  ].slice(0, 5);
  const setupTotal = quoteItems.reduce((sum, item) => sum + item.setup, 0);
  const monthlyTotal = quoteItems.reduce((sum, item) => sum + item.monthly, 0);
  const requestedPlan = String(answers.transformationLevel);
  const plan =
    requestedPlan === 'SCALE' || complexity === 'enterprise'
      ? 'SCALE'
      : requestedPlan === 'ESENCIAL' && complexity === 'small'
        ? 'ESENCIAL'
        : 'GROWTH';
  return {
    score,
    categoryScores,
    priorities,
    modules: [...selected].map((id) => modules[id]),
    complexity,
    plan,
    timelineWeeks:
      complexity === 'small' ? 4 : complexity === 'medium' ? 6 : complexity === 'high' ? 9 : 12,
    quoteItems,
    setupTotal,
    monthlyTotal,
    investmentMin: Math.round((setupTotal * 0.92) / 100_000) * 100_000,
    investmentMax: Math.round((setupTotal * 1.14) / 100_000) * 100_000
  };
}

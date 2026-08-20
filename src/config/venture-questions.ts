import type { DiagnosticQuestion } from '@/types/venture';

const opts = (labels: string[]) => labels.map((label) => ({ value: label, label }));

export const questions: DiagnosticQuestion[] = [
  {
    id: 'companyName',
    section: 'Identidad',
    type: 'text',
    title: '¿Cómo se llama tu empresa?',
    placeholder: 'Nombre de la empresa',
    required: true
  },
  {
    id: 'industry',
    section: 'Identidad',
    type: 'single',
    title: '¿En qué sector opera?',
    options: opts([
      'Construcción / Ingeniería',
      'Inmobiliario',
      'Comercio',
      'Servicios profesionales',
      'Manufactura',
      'Hotelería / Turismo',
      'Restaurantes',
      'Salud',
      'Educación',
      'Tecnología',
      'Logística',
      'Otro'
    ]),
    required: true
  },
  {
    id: 'companySize',
    section: 'Identidad',
    type: 'single',
    title: '¿Cuántas personas hacen parte de la operación?',
    options: opts(['1–5', '6–15', '16–30', '31–75', '76–150', '150+']),
    required: true
  },
  {
    id: 'contact',
    section: 'Identidad',
    type: 'contact',
    title: '¿Quién está realizando este diagnóstico?',
    description: 'Usaremos estos datos para personalizar la propuesta.',
    required: true
  },
  {
    id: 'leadSources',
    section: 'Diagnóstico comercial',
    type: 'multi',
    title: '¿Cómo llegan actualmente los nuevos clientes?',
    options: opts([
      'Referidos',
      'WhatsApp',
      'Instagram',
      'Facebook',
      'Página web',
      'Google',
      'Publicidad digital',
      'Vendedores',
      'Licitaciones',
      'Bases de datos',
      'Alianzas',
      'Otro'
    ]),
    required: true
  },
  {
    id: 'monthlyLeads',
    section: 'Diagnóstico comercial',
    type: 'single',
    title: '¿Cuántos leads aproximadamente recibe tu empresa cada mes?',
    options: opts([
      'Menos de 20',
      '20–50',
      '51–100',
      '101–300',
      '301–1.000',
      'Más de 1.000',
      'No lo medimos'
    ]),
    required: true
  },
  {
    id: 'leadProcess',
    section: 'Diagnóstico comercial',
    type: 'single',
    title: '¿Qué ocurre después de que llega un lead?',
    options: opts([
      'Un vendedor lo contacta manualmente',
      'Se registra en Excel',
      'Se registra en un CRM',
      'Se asigna automáticamente',
      'Se responde desde WhatsApp',
      'No tenemos un proceso definido'
    ]),
    required: true
  },
  {
    id: 'usesCRM',
    section: 'CRM y leads',
    type: 'single',
    title: '¿Actualmente utilizan un CRM?',
    options: opts(['Sí', 'No', 'Estamos evaluándolo']),
    required: true
  },
  {
    id: 'currentCRM',
    section: 'CRM y leads',
    type: 'text',
    title: '¿Cuál CRM utilizan?',
    placeholder: 'Ej. HubSpot, Zoho, Salesforce…',
    required: true,
    visibleWhen: { questionId: 'usesCRM', includes: 'Sí' }
  },
  {
    id: 'crmSatisfaction',
    section: 'CRM y leads',
    type: 'single',
    title: '¿Qué tan satisfechos están con él?',
    description: '1 significa que limita la operación; 5, que cumple plenamente.',
    options: opts(['1', '2', '3', '4', '5']),
    required: true,
    visibleWhen: { questionId: 'usesCRM', includes: 'Sí' }
  },
  {
    id: 'controlNeeds',
    section: 'CRM y leads',
    type: 'multi',
    title: '¿Qué necesitan controlar en un solo lugar?',
    options: opts([
      'Prospectos',
      'Clientes',
      'Vendedores',
      'Oportunidades',
      'Cotizaciones',
      'Contratos',
      'Seguimientos',
      'Actividades',
      'Tareas',
      'Pagos',
      'Postventa',
      'Indicadores'
    ]),
    required: true
  },
  {
    id: 'salesProcess',
    section: 'Ventas',
    type: 'single',
    title: '¿Cómo funciona actualmente su proceso comercial?',
    options: opts([
      'No existe un proceso formal',
      'Cada vendedor trabaja de forma independiente',
      'Existe un proceso, pero es manual',
      'Tenemos CRM, pero poco automatizado',
      'Tenemos un sistema comercial estructurado'
    ]),
    required: true
  },
  {
    id: 'salesPriority',
    section: 'Ventas',
    type: 'multi',
    title: '¿Qué parte de la operación comercial necesita evolucionar primero?',
    options: opts([
      'Generación de leads',
      'Conversión',
      'Velocidad de respuesta',
      'Seguimiento',
      'Cotizaciones',
      'Cierre comercial',
      'Productividad del vendedor',
      'Reactivación de clientes',
      'Postventa'
    ]),
    required: true
  },
  {
    id: 'serviceChannels',
    section: 'Atención',
    type: 'multi',
    title: '¿Por dónde reciben la mayoría de solicitudes?',
    options: opts([
      'WhatsApp',
      'Teléfono',
      'Email',
      'Instagram',
      'Facebook',
      'Página web',
      'Presencial',
      'Diferentes canales'
    ]),
    required: true
  },
  {
    id: 'centralizeConversations',
    section: 'Atención',
    type: 'single',
    title: '¿Necesitan centralizar conversaciones en una sola plataforma?',
    options: opts(['Sí', 'No']),
    required: true
  },
  {
    id: 'aiServiceInterest',
    section: 'Atención',
    type: 'single',
    title: '¿Les interesaría implementar atención automática con IA?',
    options: opts(['Sí', 'Tal vez', 'No']),
    required: true
  },
  {
    id: 'aiAgentTasks',
    section: 'Atención',
    type: 'multi',
    title: '¿Qué debería poder hacer el agente?',
    options: opts([
      'Responder preguntas frecuentes',
      'Identificar clientes',
      'Capturar leads',
      'Consultar servicios',
      'Calificar prospectos',
      'Agendar reuniones',
      'Crear tickets',
      'Consultar estados',
      'Escalar conversaciones a humanos',
      'Realizar seguimiento'
    ]),
    required: true,
    visibleWhen: { questionId: 'aiServiceInterest', includes: 'Sí|Tal vez' }
  },
  {
    id: 'whatsappImportant',
    section: 'WhatsApp',
    type: 'single',
    title: '¿WhatsApp es un canal importante para su operación?',
    options: opts(['Sí', 'No']),
    required: true
  },
  {
    id: 'whatsappNeeds',
    section: 'WhatsApp',
    type: 'multi',
    title: '¿Qué necesita evolucionar en WhatsApp?',
    options: opts([
      'WhatsApp API',
      'Bot automático',
      'CRM conectado',
      'Seguimientos',
      'Campañas',
      'Plantillas',
      'Métricas',
      'Múltiples asesores',
      'Múltiples líneas'
    ]),
    required: true,
    visibleWhen: { questionId: 'whatsappImportant', includes: 'Sí' }
  },
  {
    id: 'automationNeeds',
    section: 'Automatización',
    type: 'multi',
    title: '¿Qué procesos te gustaría dejar de hacer manualmente?',
    options: [
      {
        value: 'Lead Management',
        label: 'Lead Management',
        description: 'Asignación y seguimiento automático.'
      },
      { value: 'Cotizaciones', label: 'Cotizaciones', description: 'Generación y envío.' },
      { value: 'WhatsApp', label: 'WhatsApp', description: 'Mensajes y secuencias.' },
      { value: 'Email', label: 'Email', description: 'Seguimiento automático.' },
      { value: 'Documentos', label: 'Documentos', description: 'Generación y organización.' },
      { value: 'Agenda', label: 'Agenda', description: 'Reservas y recordatorios.' },
      { value: 'Cobranza', label: 'Cobranza', description: 'Alertas y seguimiento.' },
      {
        value: 'Servicio al cliente',
        label: 'Servicio al cliente',
        description: 'Tickets y escalamiento.'
      },
      { value: 'Reportes', label: 'Reportes', description: 'Indicadores automáticos.' },
      { value: 'IA', label: 'IA', description: 'Clasificación, análisis y asistentes.' }
    ],
    required: true
  },
  {
    id: 'digitalAssets',
    section: 'Infraestructura web',
    type: 'multi',
    title: '¿Qué activos digitales tiene actualmente la empresa?',
    options: opts([
      'Página web',
      'Landing pages',
      'Ecommerce',
      'Portal de clientes',
      'Intranet',
      'Aplicación',
      'CRM',
      'Dashboard',
      'Ninguno'
    ]),
    required: true
  },
  {
    id: 'buildNeeds',
    section: 'Infraestructura web',
    type: 'multi',
    title: '¿Qué quieren desarrollar?',
    options: opts([
      'Página web',
      'Landing pages',
      'Ecommerce',
      'Portal de clientes',
      'Intranet',
      'Aplicación',
      'Cotizador',
      'Portal comercial',
      'Portal de proveedores',
      'Dashboard gerencial',
      'Plataforma interna',
      'Sistema a medida'
    ]),
    required: true
  },
  {
    id: 'tools',
    section: 'Integraciones',
    type: 'multi',
    title: '¿Qué herramientas utiliza actualmente la empresa?',
    options: opts([
      'Google Workspace',
      'Microsoft 365',
      'Gmail',
      'Outlook',
      'WhatsApp',
      'HubSpot',
      'Salesforce',
      'Zoho',
      'Monday',
      'Notion',
      'Google Sheets',
      'Excel',
      'SAP',
      'Siigo',
      'Alegra',
      'Shopify',
      'WooCommerce',
      'Meta Ads',
      'Google Ads',
      'Otro'
    ]),
    required: true
  },
  {
    id: 'analytics',
    section: 'Analítica',
    type: 'multi',
    title: '¿Qué información debería poder ver la dirección en tiempo real?',
    options: opts([
      'Nuevos leads',
      'Ventas',
      'Pipeline',
      'Conversión',
      'Actividad comercial',
      'Productividad',
      'Servicio al cliente',
      'Ingresos',
      'Proyectos',
      'Cobranza',
      'Campañas',
      'ROI',
      'Todas'
    ]),
    required: true
  },
  {
    id: 'aiUses',
    section: 'Inteligencia artificial',
    type: 'multi',
    title: '¿Dónde podría trabajar la IA dentro de tu empresa?',
    options: opts([
      'Agente comercial',
      'Agente de atención',
      'Calificación de leads',
      'Generación de propuestas',
      'Lectura de documentos',
      'Análisis de información',
      'Reportes gerenciales',
      'Seguimientos automáticos',
      'Base de conocimiento',
      'Automatización interna'
    ])
  },
  {
    id: 'transformationLevel',
    section: 'Estrategia',
    type: 'transformation',
    title: 'Definamos el nivel de infraestructura que necesita tu operación.',
    options: [
      {
        value: 'ESENCIAL',
        label: 'ESENCIAL',
        description: 'Ordenar lo fundamental. CRM, procesos principales y automatizaciones básicas.'
      },
      {
        value: 'GROWTH',
        label: 'GROWTH',
        description:
          'Construir una operación comercial conectada. CRM, canales, automatización y dashboards.',
        badge: 'RECOMENDADO'
      },
      {
        value: 'SCALE',
        label: 'SCALE',
        description:
          'Infraestructura empresarial completa con integraciones, IA y sistemas a medida.'
      }
    ],
    required: true
  },
  {
    id: 'urgency',
    section: 'Planeación',
    type: 'single',
    title: '¿Cuándo quieren comenzar?',
    options: opts([
      'Inmediatamente',
      'Próximos 30 días',
      '1–3 meses',
      '3–6 meses',
      'Solo estamos evaluando'
    ]),
    required: true
  },
  {
    id: 'budget',
    section: 'Planeación',
    type: 'single',
    title: '¿En qué rango de inversión se sienten cómodos para esta transformación?',
    description: 'No limita la recomendación; nos ayuda a estructurar fases realistas.',
    options: opts([
      'Menos de $5.000.000 COP',
      '$5.000.000 – $10.000.000',
      '$10.000.000 – $20.000.000',
      '$20.000.000 – $40.000.000',
      '$40.000.000 – $80.000.000',
      'Más de $80.000.000',
      'Prefiero recibir una recomendación'
    ]),
    required: true
  }
];

export function getVisibleQuestions(answers: Record<string, unknown>): DiagnosticQuestion[] {
  return questions.filter((question) => {
    if (!question.visibleWhen) return true;
    const answer = answers[question.visibleWhen.questionId];
    return question.visibleWhen.includes
      .split('|')
      .some((value) => (Array.isArray(answer) ? answer.includes(value) : answer === value));
  });
}

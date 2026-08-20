export type AnswerValue = string | string[] | number | boolean | Record<string, string>;
export type DiagnosticAnswers = Record<string, AnswerValue>;

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}
export interface VisibilityRule {
  questionId: string;
  includes: string;
}
export type QuestionType = 'text' | 'single' | 'multi' | 'contact' | 'number' | 'transformation';
export interface DiagnosticQuestion {
  id: string;
  section: string;
  type: QuestionType;
  title: string;
  description?: string;
  options?: ChoiceOption[];
  required?: boolean;
  visibleWhen?: VisibilityRule;
  placeholder?: string;
}

export type Complexity = 'small' | 'medium' | 'high' | 'enterprise';
export interface QuoteItem {
  id: string;
  label: string;
  setup: number;
  monthly: number;
}
export interface RecommendedModule {
  id: string;
  title: string;
  description: string;
  features: string[];
}
export interface Priority {
  title: string;
  detail: string;
}
export interface DiagnosticResult {
  score: number;
  categoryScores: Record<string, number>;
  priorities: Priority[];
  modules: RecommendedModule[];
  complexity: Complexity;
  plan: 'ESENCIAL' | 'GROWTH' | 'SCALE';
  timelineWeeks: number;
  quoteItems: QuoteItem[];
  setupTotal: number;
  monthlyTotal: number;
  investmentMin: number;
  investmentMax: number;
}

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  ref?: string;
  sales_rep?: string;
}
export interface Lead {
  id: string;
  createdAt: string;
  company: string;
  contactName: string;
  position?: string;
  email: string;
  phone: string;
  industry: string;
  companySize: string;
  answers: DiagnosticAnswers;
  digitalScore: number;
  recommendedPlan: string;
  estimatedInvestmentMin: number;
  estimatedInvestmentMax: number;
  status:
    | 'Nuevo'
    | 'Contactado'
    | 'Diagnóstico'
    | 'Propuesta'
    | 'Negociación'
    | 'Ganado'
    | 'Perdido';
  attribution: Attribution;
}

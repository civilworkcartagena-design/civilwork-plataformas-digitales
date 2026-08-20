export interface PriceConfig {
  setup: number;
  monthly?: number;
}

// DEFAULT DEMO PRICING — replace these values after commercial validation.
export const pricing = {
  crm: {
    basic: { setup: 2_500_000, monthly: 280_000 },
    advanced: { setup: 4_500_000, monthly: 480_000 }
  },
  website: { setup: 3_500_000, monthly: 180_000 },
  leadManagement: { setup: 1_600_000 },
  salesAutomation: { setup: 2_000_000, monthly: 180_000 },
  whatsapp: { setup: 1_800_000, monthly: 350_000 },
  customerService: { setup: 2_200_000, monthly: 220_000 },
  dashboards: { setup: 2_500_000, monthly: 120_000 },
  ai: { setup: 3_500_000, monthly: 650_000 },
  integrations: { setup: 900_000 },
  customSoftware: { setup: 6_500_000, monthly: 400_000 },
  documentAutomation: { setup: 2_000_000, monthly: 120_000 },
  training: { setup: 1_200_000 },
  support: { setup: 0, monthly: 450_000 }
} satisfies Record<string, PriceConfig | Record<string, PriceConfig>>;

export const complexityMultipliers = {
  small: 1,
  medium: 1.15,
  high: 1.3,
  enterprise: 1.5
} as const;

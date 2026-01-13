
export interface PenaltyRates {
  saturday: number;
  sunday: number;
  publicHoliday: number;
  overtime: number;
  nightShift: number;
}

export interface Allowance {
  name: string;
  amount: number;
}

export interface Award {
  code: string;
  name: string;
  industry: string;
  classifications: Classification[];
  penaltyRates?: PenaltyRates; // Specific rules for this award
  allowances?: Allowance[]; // List of extracted allowances
}

export interface Classification {
  id: string;
  title: string;
  baseRate: number;
  casualLoading: number; // e.g., 0.25
  description?: string;
}

export interface Shift {
  id: string;
  day: string; // "Monday", "Tuesday", etc.
  hours: number;
  isCasual: boolean;
  penaltyType: 'None' | 'Saturday' | 'Sunday' | 'PublicHoliday' | 'Overtime' | 'NightShift';
  allowances: number; // Fixed dollar amount for MVP
}

export interface PayBreakdown {
  basePay: number;
  penaltyPay: number;
  casualLoadingPay: number;
  allowances: number;
  totalGross: number;
  superannuation: number; // 11.5%
}

export interface AIAnalysisResult {
  matches: {
    awardCode: string;
    awardName: string;
    confidence: number;
    reasoning: string;
    suggestedClassification: string;
  }[];
}

export interface AwardDocument {
  title: string;
  url?: string; // Optional: May not be known until searched
  awardCode?: string; // Optional for search results
  description?: string; // Optional for search results
  industry?: string; // Optional for search results
  source?: 'static' | 'search';
}

export type ViewState = 'dashboard' | 'matcher' | 'calculator' | 'library' | 'assistant';

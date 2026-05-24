import { MachineProfile } from "./data/knowledgeBase";

export interface HUDStep {
  stepNumber: number;
  title: string;
  instruction: string;
  safetyNote: string;
  targetMetric: string;
  estimateMinutes: number;
}

export interface DiagnosticResult {
  identifiedPart: string;
  isDamageDetected: boolean;
  stateSummary: string;
  safetyWarnings: string[];
  requiredPPE: string[];
  suggestedTools: string[];
  steps: HUDStep[];
  overallResolutionPlan: string;
}

export interface DiagnosticsState {
  loading: boolean;
  activeProfileId: string;
  query: string;
  image: string | null;
  result: DiagnosticResult | null;
  apiUsed: boolean;
  fallbackTriggered: boolean;
  error: string | null;
}

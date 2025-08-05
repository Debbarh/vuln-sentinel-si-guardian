// Types pour le NIST Cybersecurity Framework (CSF) 2.0

export type NISTTier = 'partial' | 'risk_informed' | 'repeatable' | 'adaptive';

export type NISTFunction = 'GOVERN' | 'IDENTIFY' | 'PROTECT' | 'DETECT' | 'RESPOND' | 'RECOVER';

export interface NISTSubCategory {
  id: string;
  code: string; // Ex: GV.OC-01
  title: string;
  description: string;
  categoryId: string;
  functionId: NISTFunction;
  order: number;
  maturityLevel: number; // 0-4 (0=Non implémenté, 1=Partial, 2=Risk Informed, 3=Repeatable, 4=Adaptive)
  evidence: string[];
  gaps: string[];
  actionPlan: string[];
  responsible: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'needs_review';
}

export interface NISTCategory {
  id: string;
  code: string; // Ex: GV.OC
  name: string;
  description: string;
  functionId: NISTFunction;
  order: number;
  overallMaturity: number;
  totalSubCategories: number;
  implementedSubCategories: number;
  subCategories: NISTSubCategory[];
}

export interface NISTFunctionData {
  id: NISTFunction;
  name: string;
  description: string;
  color: string;
  order: number;
  overallMaturity: number;
  totalCategories: number;
  implementedCategories: number;
  categories: NISTCategory[];
}

export interface NISTProfile {
  id: string;
  name: string;
  type: 'current' | 'target' | 'community';
  description: string;
  sector?: string; // Pour les profils communautaires
  organizationId?: string;
  functions: {
    functionId: NISTFunction;
    targetTier: NISTTier;
    selectedSubCategories: string[]; // IDs des sous-catégories sélectionnées
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface NISTAssessment {
  id: string;
  name: string;
  description?: string;
  profileId: string;
  currentTier: NISTTier;
  targetTier: NISTTier;
  scope: string;
  evaluators: string[];
  dueDate?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface NISTResponse {
  id: string;
  assessmentId: string;
  subCategoryId: string;
  currentImplementation: number; // 0-4
  targetImplementation: number; // 0-4
  evidence: string;
  gaps: string[];
  actionItems: string[];
  comment?: string;
  evaluator: string;
  answeredAt: string;
}

export interface NISTResult {
  id: string;
  assessmentId: string;
  functionId: NISTFunction;
  categoryId: string;
  subCategoryId: string;
  currentScore: number;
  targetScore: number;
  gapScore: number;
  tier: NISTTier;
  calculatedAt: string;
}

// Données par défaut pour les niveaux NIST
export const NIST_TIERS = {
  partial: {
    label: 'Partiel',
    description: 'Pratiques informelles et réactives, processus ad hoc',
    level: 1,
    color: '#ef4444'
  },
  risk_informed: {
    label: 'Informé par les Risques',
    description: 'Politiques approuvées, décisions basées sur les risques',
    level: 2,
    color: '#f97316'
  },
  repeatable: {
    label: 'Répétable',
    description: 'Pratiques formalisées, processus cohérents',
    level: 3,
    color: '#3b82f6'
  },
  adaptive: {
    label: 'Adaptatif',
    description: 'Pratiques continues, intégrées et adaptatives',
    level: 4,
    color: '#10b981'
  }
};

// Mapping des scores vers les tiers
export const getScoreToTier = (score: number): NISTTier => {
  if (score < 1) return 'partial';
  if (score < 2) return 'risk_informed';
  if (score < 3) return 'repeatable';
  return 'adaptive';
};

export const getTierToScore = (tier: NISTTier): number => {
  const mapping = {
    partial: 1,
    risk_informed: 2,
    repeatable: 3,
    adaptive: 4
  };
  return mapping[tier];
};
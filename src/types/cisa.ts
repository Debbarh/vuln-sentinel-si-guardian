// Types pour le CISA Zero Trust Maturity Model (ZTMM) 2.0

export type CISAMaturityLevel = 'traditional' | 'initial' | 'advanced' | 'optimal';

export type CISAPillarId = 'IDENTITY' | 'DEVICES' | 'NETWORKS' | 'APPLICATIONS' | 'DATA';

export type CISACapabilityId = 'VISIBILITY' | 'AUTOMATION' | 'GOVERNANCE';

export interface CISASubComponent {
  id: string;
  pillarId?: CISAPillarId;
  capabilityId?: CISACapabilityId;
  maturityLevel: CISAMaturityLevel;
  title: string;
  description: string;
  elements: string[]; // Éléments clés du niveau de maturité
  currentImplementation: number; // 0-4 (0=Non implémenté, 1=Traditional, 2=Initial, 3=Advanced, 4=Optimal)
  targetImplementation: number; // 0-4
  evidence: string[];
  gaps: string[];
  actionPlan: string[];
  responsible: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'needs_review';
}

export interface CISAZTMMPillar {
  id: CISAPillarId;
  name: string;
  description: string;
  color: string;
  order: number;
  overallMaturity: number;
  totalSubComponents: number;
  implementedSubComponents: number;
  subComponents: CISASubComponent[];
}

export interface CISACapability {
  id: CISACapabilityId;
  name: string;
  description: string;
  color: string;
  order: number;
  overallMaturity: number;
  totalSubComponents: number;
  implementedSubComponents: number;
  subComponents: CISASubComponent[];
}

export interface CISAProfile {
  id: string;
  name: string;
  type: 'current' | 'target' | 'baseline';
  description: string;
  organizationId?: string;
  pillars: {
    pillarId: CISAPillarId;
    targetMaturity: CISAMaturityLevel;
    selectedSubComponents: string[]; // IDs des sous-composants sélectionnés
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];
  capabilities: {
    capabilityId: CISACapabilityId;
    targetMaturity: CISAMaturityLevel;
    selectedSubComponents: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CISAAssessment {
  id: string;
  name: string;
  description?: string;
  profileId: string;
  currentMaturity: CISAMaturityLevel;
  targetMaturity: CISAMaturityLevel;
  scope: string;
  evaluators: string[];
  dueDate?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CISAResponse {
  id: string;
  assessmentId: string;
  subComponentId: string;
  currentImplementation: number; // 0-4
  targetImplementation: number; // 0-4
  evidence: string;
  gaps: string[];
  actionItems: string[];
  comment?: string;
  evaluator: string;
  answeredAt: string;
}

export interface CISAResult {
  id: string;
  assessmentId: string;
  pillarId?: CISAPillarId;
  capabilityId?: CISACapabilityId;
  subComponentId: string;
  currentScore: number;
  targetScore: number;
  gapScore: number;
  maturityLevel: CISAMaturityLevel;
  calculatedAt: string;
}

// Données par défaut pour les niveaux CISA ZTMM
export const CISA_MATURITY_LEVELS = {
  traditional: {
    label: 'Traditionnel',
    description: 'Approche de sécurité basée sur le périmètre avec contrôles statiques',
    level: 1,
    color: '#ef4444'
  },
  initial: {
    label: 'Initial',
    description: 'Première étape vers Zero Trust avec implémentations basiques',
    level: 2,
    color: '#f97316'
  },
  advanced: {
    label: 'Avancé',
    description: 'Implémentation mature avec automatisation et contextualisation',
    level: 3,
    color: '#3b82f6'
  },
  optimal: {
    label: 'Optimal',
    description: 'Zero Trust complet avec orchestration intelligente et adaptatif',
    level: 4,
    color: '#10b981'
  }
};

// Mapping des scores vers les niveaux de maturité
export const getScoreToMaturityLevel = (score: number): CISAMaturityLevel => {
  if (score < 1.5) return 'traditional';
  if (score < 2.5) return 'initial';
  if (score < 3.5) return 'advanced';
  return 'optimal';
};

export const getMaturityLevelToScore = (level: CISAMaturityLevel): number => {
  const mapping = {
    traditional: 1,
    initial: 2,
    advanced: 3,
    optimal: 4
  };
  return mapping[level];
};
// Types pour les référentiels de sécurité (ISO27001, NIST, CISA)

export interface ReferenceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  type: 'ISO27001' | 'NIST' | 'CISA';
  createdAt: string;
  updatedAt: string;
}

export interface Criterion {
  id: string;
  frameworkId: string;
  code: string;
  name: string;
  description: string;
  parentId?: string; // Pour la hiérarchie
  level: number; // 1 = critère principal, 2 = sous-critère, etc.
  order: number;
}

export interface Question {
  id: string;
  criterionId: string;
  text: string;
  description?: string;
  type: 'radio' | 'checkbox' | 'text' | 'scale';
  options?: QuestionOption[];
  required: boolean;
  order: number;
}

export interface QuestionOption {
  id: string;
  value: string;
  label: string;
  maturityLevel?: number; // 0-4 pour les échelles de maturité
  order: number;
}

export interface Assessment {
  id: string;
  name: string;
  description?: string;
  frameworkIds: string[];
  scope: string;
  evaluators: string[];
  dueDate?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  questionId: string;
  value: string | string[];
  comment?: string;
  evaluator: string;
  answeredAt: string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  frameworkId: string;
  criterionId: string;
  score: number;
  maturityLevel: number;
  maxScore: number;
  calculatedAt: string;
}

export interface ActionPlan {
  id: string;
  assessmentId: string;
  criterionId: string;
  title: string;
  description: string;
  responsible: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

// Données par défaut pour les référentiels
export const DEFAULT_FRAMEWORKS: ReferenceFramework[] = [
  {
    id: 'iso27001',
    name: 'ISO 27001:2022',
    version: '2022',
    description: 'Norme internationale pour les systèmes de management de la sécurité de l\'information',
    type: 'ISO27001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nist-csf-2',
    name: 'NIST Cybersecurity Framework 2.0',
    version: '2.0',
    description: 'Cadre de cybersécurité du National Institute of Standards and Technology - Version 2.0',
    type: 'NIST',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cisa-ztmm',
    name: 'CISA Zero Trust Maturity Model',
    version: '2.0',
    description: 'Modèle de maturité Zero Trust de la Cybersecurity and Infrastructure Security Agency',
    type: 'CISA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
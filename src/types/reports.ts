export interface ReportTemplate {
  id: string;
  name: string;
  frameworkType: 'ISO27001' | 'NIST' | 'CISA';
  description: string;
  sections: ReportSection[];
  defaultFrequency?: ReportFrequency;
  estimatedPages: number;
  lastGenerated?: string;
  isActive: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'executive_summary' | 'maturity_analysis' | 'compliance_status' | 'gaps_analysis' | 
        'action_plans' | 'risk_assessment' | 'recommendations' | 'appendices' | 'charts' | 'tables';
  content: any;
  includeCharts: boolean;
  includeTables: boolean;
  pageBreak: boolean;
}

export interface AutomatedReport {
  id: string;
  templateId: string;
  name: string;
  frequency: ReportFrequency;
  isActive: boolean;
  lastExecution?: string;
  nextExecution: string;
  recipients: string[];
  createdAt: string;
  createdBy: string;
  executionHistory: ReportExecution[];
}

export interface ReportExecution {
  id: string;
  executedAt: string;
  status: 'success' | 'failed' | 'pending';
  fileUrl?: string;
  fileSize?: number;
  errorMessage?: string;
  generationTime: number; // en secondes
}

export interface ReportFrequency {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  interval?: number; // pour custom
  dayOfWeek?: number; // 0-6 pour weekly
  dayOfMonth?: number; // 1-31 pour monthly
  monthOfYear?: number; // 1-12 pour yearly
  time: string; // HH:mm
}

export interface ReportData {
  frameworkType: 'ISO27001' | 'NIST' | 'CISA';
  generatedAt: string;
  generatedBy: string;
  period: {
    from: string;
    to: string;
  };
  
  // Données communes
  overallMaturity: number;
  totalControls: number;
  implementedControls: number;
  compliancePercentage: number;
  
  // Données spécifiques par framework
  iso27001Data?: ISO27001ReportData;
  nistData?: NISTReportData;
  cisaData?: CISAReportData;
  
  // Analytics
  maturityEvolution: MaturityEvolution[];
  topGaps: Gap[];
  actionPlansProgress: ActionPlanProgress[];
  evidenceStatistics: EvidenceStatistics;
}

export interface ISO27001ReportData {
  categories: {
    id: string;
    name: string;
    controlsCount: number;
    implementedCount: number;
    maturityLevel: number;
    compliancePercentage: number;
    criticalGaps: number;
  }[];
  controlsAnalysis: {
    notImplemented: number;
    partiallyImplemented: number;
    implemented: number;
    fullyImplemented: number;
  };
  certificationReadiness: {
    ready: number;
    needsWork: number;
    notReady: number;
  };
}

export interface NISTReportData {
  functions: {
    id: string;
    name: string;
    categoriesCount: number;
    implementedCategories: number;
    maturityLevel: number;
    compliancePercentage: number;
  }[];
  profileAnalysis: {
    current: string;
    target: string;
    gapPercentage: number;
  };
  cyberResilienceScore: number;
}

export interface CISAReportData {
  pillars: {
    id: string;
    name: string;
    maturityLevel: 'traditional' | 'initial' | 'advanced' | 'optimal';
    implementationPercentage: number;
    criticalGaps: number;
  }[];
  zeroTrustMaturity: {
    traditional: number;
    initial: number;
    advanced: number;
    optimal: number;
  };
  readinessScore: number;
}

export interface MaturityEvolution {
  date: string;
  overallMaturity: number;
  frameworkSpecificMaturity: number;
}

export interface Gap {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  impact: string;
  effort: string;
}

export interface ActionPlanProgress {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EvidenceStatistics {
  totalEvidences: number;
  approvedEvidences: number;
  pendingEvidences: number;
  rejectedEvidences: number;
  averageValidationTime: number; // en jours
}

// Templates par défaut
export const DEFAULT_REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'iso27001-standard',
    name: 'Rapport ISO 27001 Standard',
    frameworkType: 'ISO27001',
    description: 'Rapport complet de conformité ISO 27001 avec analyse détaillée des contrôles',
    sections: [
      { id: 'exec-summary', title: 'Résumé Exécutif', type: 'executive_summary', content: {}, includeCharts: true, includeTables: false, pageBreak: true },
      { id: 'maturity', title: 'Analyse de Maturité', type: 'maturity_analysis', content: {}, includeCharts: true, includeTables: true, pageBreak: true },
      { id: 'compliance', title: 'État de Conformité', type: 'compliance_status', content: {}, includeCharts: true, includeTables: true, pageBreak: true },
      { id: 'gaps', title: 'Analyse des Écarts', type: 'gaps_analysis', content: {}, includeCharts: false, includeTables: true, pageBreak: true },
      { id: 'actions', title: 'Plans d\'Action', type: 'action_plans', content: {}, includeCharts: true, includeTables: true, pageBreak: true },
      { id: 'recommendations', title: 'Recommandations', type: 'recommendations', content: {}, includeCharts: false, includeTables: false, pageBreak: true }
    ],
    defaultFrequency: { type: 'monthly', dayOfMonth: 1, time: '09:00' },
    estimatedPages: 25,
    isActive: true
  },
  {
    id: 'nist-standard',
    name: 'Rapport NIST CSF 2.0 Standard',
    frameworkType: 'NIST',
    description: 'Rapport complet NIST Cybersecurity Framework 2.0 avec analyse des fonctions',
    sections: [
      { id: 'exec-summary', title: 'Résumé Exécutif', type: 'executive_summary', content: {}, includeCharts: true, includeTables: false, pageBreak: true },
      { id: 'framework-analysis', title: 'Analyse du Framework', type: 'maturity_analysis', content: {}, includeCharts: true, includeTables: true, pageBreak: true },
      { id: 'profile-analysis', title: 'Analyse des Profils', type: 'compliance_status', content: {}, includeCharts: true, includeTables: true, pageBreak: true },
      { id: 'cyber-resilience', title: 'Résilience Cyber', type: 'risk_assessment', content: {}, includeCharts: true, includeTables: true, pageBreak: true },
      { id: 'gaps', title: 'Analyse des Écarts', type: 'gaps_analysis', content: {}, includeCharts: false, includeTables: true, pageBreak: true },
      { id: 'roadmap', title: 'Feuille de Route', type: 'action_plans', content: {}, includeCharts: true, includeTables: true, pageBreak: true }
    ],
    defaultFrequency: { type: 'quarterly', dayOfMonth: 1, time: '10:00' },
    estimatedPages: 30,
    isActive: true
  },
  {
    id: 'cisa-standard',
    name: 'Rapport CISA Zero Trust Standard',
    frameworkType: 'CISA',
    description: 'Rapport complet CISA Zero Trust Maturity Model avec analyse des piliers',
    sections: [
      { id: 'exec-summary', title: 'Résumé Exécutif', type: 'executive_summary', content: {}, includeCharts: true, includeTables: false, pageBreak: true },
      { id: 'zt-maturity', title: 'Maturité Zero Trust', type: 'maturity_analysis', content: {}, includeCharts: true, includeTables: true, pageBreak: true },
      { id: 'pillars-analysis', title: 'Analyse des Piliers', type: 'compliance_status', content: {}, includeCharts: true, includeTables: true, pageBreak: true },
      { id: 'readiness', title: 'Niveau de Préparation', type: 'risk_assessment', content: {}, includeCharts: true, includeTables: true, pageBreak: true },
      { id: 'implementation', title: 'Stratégie d\'Implémentation', type: 'action_plans', content: {}, includeCharts: true, includeTables: true, pageBreak: true },
      { id: 'roadmap', title: 'Roadmap Zero Trust', type: 'recommendations', content: {}, includeCharts: true, includeTables: true, pageBreak: true }
    ],
    defaultFrequency: { type: 'monthly', dayOfMonth: 15, time: '14:00' },
    estimatedPages: 35,
    isActive: true
  }
];
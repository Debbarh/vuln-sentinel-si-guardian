export interface EvidenceAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface RSIValidation {
  id: string;
  validatedBy: string;
  validatedAt: string;
  status: 'approved' | 'rejected' | 'requires_modification';
  overallScore: number; // Score sur 10
  criteria: {
    completeness: number; // Complétude (1-10)
    relevance: number; // Pertinence (1-10)
    quality: number; // Qualité (1-10)
    implementation: number; // Mise en œuvre (1-10)
  };
  remarks: string;
  recommendations: string[];
  nextActions: string[];
  validationAttachments?: EvidenceAttachment[]; // Documents joints par le RSSI
}

export interface EvidenceVersion {
  id: string;
  evidenceId: string;
  version: number;
  title: string;
  description: string;
  attachments: EvidenceAttachment[];
  submittedBy: string;
  submittedAt: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected' | 'requires_modification';
  rssiValidation?: RSIValidation;
  evidenceType: 'document' | 'screenshot' | 'certificate' | 'procedure' | 'other';
  maturityContribution: number;
  changeLog: string; // Description des modifications apportées dans cette version
  previousVersionId?: string;
  isLatest: boolean;
}

export interface Evidence {
  id: string;
  actionPlanId: string;
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  department: string;
  evidenceType: 'document' | 'screenshot' | 'certificate' | 'procedure' | 'other';
  currentVersion: number;
  totalVersions: number;
  latestStatus: 'pending' | 'approved' | 'rejected' | 'requires_modification';
  versions: EvidenceVersion[];
  maturityContribution: number;
}

export interface EvidenceSubmission {
  title: string;
  description: string;
  department: string;
  evidenceType: 'document' | 'screenshot' | 'certificate' | 'procedure' | 'other';
  maturityContribution: number;
  changeLog?: string;
  attachments: File[];
}
export interface EvidenceVersion {
  id: string;
  evidenceId: string;
  version: number;
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  submittedBy: string;
  submittedAt: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  validatedBy?: string;
  validatedAt?: string;
  rssiRemarks?: string;
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
  latestStatus: 'pending' | 'approved' | 'rejected';
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
  fileUrl?: string;
  fileName?: string;
}
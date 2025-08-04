
export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  responsible: string;
  estimatedDuration: number; // in hours
  dependencies?: string[]; // task IDs that must be completed first
  required: boolean;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  comments?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  tasks: WorkflowTask[];
  approvalRequired: boolean;
  approver?: string;
  notifyUsers: string[]; // users to notify when step starts
  rssiFollowUp: string[]; // RSSI users who need to follow this step
  status: "pending" | "in_progress" | "completed" | "blocked";
  startedAt?: string;
  completedAt?: string;
  // Nouveaux champs pour la hiérarchie
  title?: string; // Alias pour name pour compatibilité
  responsibles?: string[]; // Pour la compatibilité avec les procédures manuelles
  estimatedDuration?: number;
  completed?: boolean; // Alias pour status === "completed"
  notes?: string;
  attachments?: Array<{ name: string; type: string }>;
  order?: number;
  parentId?: string; // Pour la hiérarchie
  subSteps?: WorkflowStep[]; // Sous-étapes
  isSubStep?: boolean; // Indique si c'est une sous-étape
  level?: number; // Niveau dans la hiérarchie (0 = racine, 1 = sous-étape, etc.)
}

export interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  responsibles: string[];
  estimatedDuration: number;
  completed: boolean;
  notes: string;
  attachments: Array<{ name: string; type: string }>;
  order: number;
  level: number;
  parentId?: string;
  subSteps?: ProcedureStep[];
  isSubStep?: boolean;
  // Champs optionnels pour compatibilité avec WorkflowStep
  name?: string;
  tasks?: WorkflowTask[];
  approvalRequired?: boolean;
  approver?: string;
  notifyUsers?: string[];
  rssiFollowUp?: string[];
  status?: "pending" | "in_progress" | "completed" | "blocked";
  startedAt?: string;
  completedAt?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  assetType: string;
  severityLevel: "critique" | "élevé" | "moyen" | "faible";
  steps: WorkflowStep[];
  defaultResponsibles: {
    security: string;
    infrastructure: string;
    database: string;
    network: string;
  };
  notificationRules: {
    onStart: string[];
    onStepComplete: string[];
    onCompletion: string[];
    rssiFollowUp: string[];
  };
  sla: {
    maxDuration: number; // in hours
    criticalThreshold: number; // in hours
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  alertId: number;
  currentStepId: string;
  status: "running" | "completed" | "paused" | "cancelled";
  startedAt: string;
  completedAt?: string;
  assignedTo: string;
  progress: number; // percentage
  notifications: WorkflowNotification[];
}

export interface WorkflowNotification {
  id: string;
  type: "step_started" | "task_completed" | "approval_required" | "sla_warning" | "completed";
  recipientId: string;
  recipientType: "user" | "rssi" | "responsible";
  message: string;
  sentAt: string;
  read: boolean;
}

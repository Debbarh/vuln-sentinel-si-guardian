import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, User, FileText, Paperclip, Clock, CheckCircle, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { WorkflowStep } from "@/types/workflow";
import StepHierarchy from "./StepHierarchy";

interface ProcedureStep extends WorkflowStep {
  // Utilise la même interface que WorkflowStep pour la compatibilité
}

interface ManualProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: number;
  alertTitle: string;
  onProcedureComplete: (steps: ProcedureStep[]) => void;
}

const ManualProcedureModal = ({
  isOpen,
  onClose,
  alertId,
  alertTitle,
  onProcedureComplete
}: ManualProcedureModalProps) => {
  const [procedureSteps, setProcedureSteps] = useState<ProcedureStep[]>([
    {
      id: "step-1",
      title: "Évaluation initiale",
      name: "Évaluation initiale",
      description: "Analyser la vulnérabilité et son impact sur les systèmes",
      responsibles: ["Équipe Sécurité"],
      estimatedDuration: 2,
      completed: false,
      notes: "",
      attachments: [],
      order: 1,
      level: 0,
      tasks: [],
      approvalRequired: false,
      notifyUsers: [],
      rssiFollowUp: [],
      status: "pending",
      subSteps: [
        {
          id: "step-1-1",
          title: "Vérifier l'authenticité de la vulnérabilité",
          name: "Vérifier l'authenticité",
          description: "Confirmer que la vulnérabilité est réelle et affecte nos systèmes",
          responsibles: ["Analyste Sécurité"],
          estimatedDuration: 1,
          completed: false,
          notes: "",
          attachments: [],
          order: 1,
          parentId: "step-1",
          level: 1,
          isSubStep: true,
          tasks: [],
          approvalRequired: false,
          notifyUsers: [],
          rssiFollowUp: [],
          status: "pending"
        },
        {
          id: "step-1-2", 
          title: "Évaluer l'impact sur les systèmes",
          name: "Évaluer l'impact",
          description: "Analyser quels systèmes sont affectés et l'ampleur de l'impact",
          responsibles: ["Équipe Infrastructure"],
          estimatedDuration: 1,
          completed: false,
          notes: "",
          attachments: [],
          order: 2,
          parentId: "step-1",
          level: 1,
          isSubStep: true,
          tasks: [],
          approvalRequired: false,
          notifyUsers: [],
          rssiFollowUp: [],
          status: "pending"
        }
      ]
    },
    {
      id: "step-2",
      title: "Classification et priorisation", 
      name: "Classification et priorisation",
      description: "Définir le niveau de priorité et les ressources nécessaires",
      responsibles: ["Chef de projet sécurité"],
      estimatedDuration: 1,
      completed: false,
      notes: "",
      attachments: [],
      order: 2,
      level: 0,
      tasks: [],
      approvalRequired: false,
      notifyUsers: [],
      rssiFollowUp: [],
      status: "pending"
    },
    {
      id: "step-3",
      title: "Plan d'action",
      name: "Plan d'action",
      description: "Élaborer la stratégie de remédiation détaillée",
      responsibles: ["Équipe Infrastructure"],
      estimatedDuration: 3,
      completed: false,
      notes: "",
      attachments: [],
      order: 3,
      level: 0,
      tasks: [],
      approvalRequired: false,
      notifyUsers: [],
      rssiFollowUp: [],
      status: "pending",
      subSteps: [
        {
          id: "step-3-1",
          title: "Identifier les correctifs disponibles",
          name: "Identifier les correctifs",
          description: "Rechercher et valider les correctifs ou mises à jour disponibles",
          responsibles: ["Équipe Infrastructure"],
          estimatedDuration: 1,
          completed: false,
          notes: "",
          attachments: [],
          order: 1,
          parentId: "step-3",
          level: 1,
          isSubStep: true,
          tasks: [],
          approvalRequired: false,
          notifyUsers: [],
          rssiFollowUp: [],
          status: "pending",
          subSteps: [
            {
              id: "step-3-1-1",
              title: "Recherche dans les bases CVE",
              name: "Recherche CVE",
              description: "Consulter les bases de données de vulnérabilités",
              responsibles: ["Analyste Sécurité"],
              estimatedDuration: 0.5,
              completed: false,
              notes: "",
              attachments: [],
              order: 1,
              parentId: "step-3-1",
              level: 2,
              isSubStep: true,
              tasks: [],
              approvalRequired: false,
              notifyUsers: [],
              rssiFollowUp: [],
              status: "pending"
            }
          ]
        },
        {
          id: "step-3-2",
          title: "Préparer un plan de rollback",
          name: "Plan de rollback",
          description: "Définir une procédure de retour en arrière en cas de problème",
          responsibles: ["Équipe Infrastructure"],
          estimatedDuration: 1,
          completed: false,
          notes: "",
          attachments: [],
          order: 2,
          parentId: "step-3",
          level: 1,
          isSubStep: true,
          tasks: [],
          approvalRequired: false,
          notifyUsers: [],
          rssiFollowUp: [],
          status: "pending"
        }
      ]
    },
    {
      id: "step-4", 
      title: "Implémentation",
      name: "Implémentation",
      description: "Appliquer les mesures correctives sur les systèmes",
      responsibles: ["Équipe Infrastructure"],
      estimatedDuration: 4,
      completed: false,
      notes: "",
      attachments: [],
      order: 4,
      level: 0,
      tasks: [],
      approvalRequired: false,
      notifyUsers: [],
      rssiFollowUp: [],
      status: "pending"
    },
    {
      id: "step-5",
      title: "Validation et clôture",
      name: "Validation et clôture",
      description: "Vérifier l'efficacité et finaliser le traitement", 
      responsibles: ["Équipe Sécurité"],
      estimatedDuration: 2,
      completed: false,
      notes: "",
      attachments: [],
      order: 5,
      level: 0,
      tasks: [],
      approvalRequired: false,
      notifyUsers: [],
      rssiFollowUp: [],
      status: "pending"
    }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Fonction pour aplatir la hiérarchie pour le calcul d'index
  const getAllSteps = (steps: ProcedureStep[]): ProcedureStep[] => {
    const allSteps: ProcedureStep[] = [];
    steps.forEach(step => {
      allSteps.push(step);
      if (step.subSteps) {
        allSteps.push(...step.subSteps);
      }
    });
    return allSteps;
  };

  const updateStep = (stepId: string, updates: Partial<ProcedureStep>) => {
    setProcedureSteps(prevSteps => 
      updateStepInHierarchy(prevSteps, stepId, updates)
    );
  };

  const updateStepInHierarchy = (steps: ProcedureStep[], stepId: string, updates: Partial<ProcedureStep>): ProcedureStep[] => {
    return steps.map(step => {
      if (step.id === stepId) {
        return { ...step, ...updates };
      }
      if (step.subSteps) {
        return {
          ...step,
          subSteps: updateStepInHierarchy(step.subSteps, stepId, updates)
        };
      }
      return step;
    });
  };

  const completeStep = (stepId: string) => {
    const allSteps = getAllSteps(procedureSteps);
    const stepIndex = allSteps.findIndex(step => step.id === stepId);
    const step = allSteps[stepIndex];
    
    // Vérifier si toutes les sous-étapes sont complétées avant de compléter l'étape parent
    if (step && step.subSteps && step.subSteps.length > 0) {
      const allSubStepsCompleted = step.subSteps.every(subStep => subStep.completed);
      if (!allSubStepsCompleted) {
        toast({
          title: "Étape incomplète",
          description: "Toutes les sous-étapes doivent être terminées avant de clôturer cette étape",
          variant: "destructive"
        });
        return;
      }
    }

    updateStep(stepId, { completed: true });
    
    // Avancer à l'étape suivante seulement pour les étapes principales
    if (step && !step.isSubStep && stepIndex === currentStepIndex && stepIndex < allSteps.length - 1) {
      setCurrentStepIndex(stepIndex + 1);
    }
    
    toast({
      title: "Étape complétée",
      description: `L'étape "${step?.title}" a été marquée comme terminée`,
    });

    // Vérifier si l'étape parent peut être complétée automatiquement
    if (step?.isSubStep && step.parentId) {
      checkParentCompletion(step.parentId);
    }
  };

  const checkParentCompletion = (parentId: string) => {
    const findStepInHierarchy = (steps: ProcedureStep[], id: string): ProcedureStep | null => {
      for (const step of steps) {
        if (step.id === id) return step;
        if (step.subSteps) {
          const found = findStepInHierarchy(step.subSteps, id);
          if (found) return found;
        }
      }
      return null;
    };

    const parentStep = findStepInHierarchy(procedureSteps, parentId);
    if (parentStep && parentStep.subSteps) {
      const allSubStepsCompleted = parentStep.subSteps.every(subStep => subStep.completed);
      if (allSubStepsCompleted && !parentStep.completed) {
        setTimeout(() => {
          toast({
            title: "Étape parent complétable",
            description: `Toutes les sous-étapes de "${parentStep.title}" sont terminées. Vous pouvez maintenant la clôturer.`,
          });
        }, 500);
      }
    }
  };

  const addSubStep = (parentId: string) => {
    const newSubStep: ProcedureStep = {
      id: `${parentId}-sub-${Date.now()}`,
      title: "Nouvelle sous-étape",
      name: "Nouvelle sous-étape",
      description: "Description de la sous-étape",
      responsibles: ["Équipe à définir"],
      estimatedDuration: 1,
      completed: false,
      notes: "",
      attachments: [],
      order: 1,
      parentId,
      level: 1,
      isSubStep: true,
      tasks: [],
      approvalRequired: false,
      notifyUsers: [],
      rssiFollowUp: [],
      status: "pending"
    };

    setProcedureSteps(prevSteps => 
      addSubStepToHierarchy(prevSteps, parentId, newSubStep)
    );
  };

  const addSubStepToHierarchy = (steps: ProcedureStep[], parentId: string, newSubStep: ProcedureStep): ProcedureStep[] => {
    return steps.map(step => {
      if (step.id === parentId) {
        const subSteps = step.subSteps || [];
        const parentLevel = step.level || 0;
        return {
          ...step,
          subSteps: [...subSteps, { ...newSubStep, order: subSteps.length + 1, level: parentLevel + 1 }]
        };
      }
      if (step.subSteps) {
        return {
          ...step,
          subSteps: addSubStepToHierarchy(step.subSteps, parentId, newSubStep)
        };
      }
      return step;
    });
  };

  const removeStep = (stepId: string) => {
    setProcedureSteps(prevSteps => 
      removeStepFromHierarchy(prevSteps, stepId)
    );
  };

  const removeStepFromHierarchy = (steps: ProcedureStep[], stepId: string): ProcedureStep[] => {
    return steps.reduce((acc: ProcedureStep[], step) => {
      if (step.id === stepId) {
        return acc; // Ne pas inclure cette étape
      }
      if (step.subSteps) {
        return [...acc, {
          ...step,
          subSteps: removeStepFromHierarchy(step.subSteps, stepId)
        }];
      }
      return [...acc, step];
    }, []);
  };


  const handleFileUpload = (stepId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du type de fichier
    const allowedTypes = {
      'application/pdf': 'PDF',
      'image/jpeg': 'Image',
      'image/jpg': 'Image',
      'image/png': 'Image',
      'image/gif': 'Image',
      'image/webp': 'Image',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/vnd.ms-powerpoint': 'PowerPoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint'
    };

    const fileType = allowedTypes[file.type as keyof typeof allowedTypes];
    if (!fileType) {
      toast({
        title: "Type de fichier non autorisé",
        description: "Seuls les fichiers PDF, Image, Word et PowerPoint sont acceptés",
        variant: "destructive"
      });
      return;
    }

    const step = procedureSteps.find(s => s.id === stepId);
    if (step) {
      updateStep(stepId, { 
        attachments: [...step.attachments, { name: file.name, type: fileType }] 
      });
      toast({
        title: "Fichier ajouté",
        description: `Le fichier "${file.name}" a été ajouté avec succès`,
      });
    }

    // Reset input pour permettre d'ajouter le même fichier à nouveau
    event.target.value = '';
  };

  const removeAttachment = (stepId: string, attachmentName: string) => {
    const step = procedureSteps.find(s => s.id === stepId);
    if (step) {
      updateStep(stepId, { 
        attachments: step.attachments.filter(att => att.name !== attachmentName) 
      });
    }
  };

  const addResponsible = (stepId: string, responsible: string) => {
    const step = procedureSteps.find(s => s.id === stepId);
    if (step && !step.responsibles.includes(responsible)) {
      updateStep(stepId, { 
        responsibles: [...step.responsibles, responsible] 
      });
    }
  };

  const removeResponsible = (stepId: string, responsible: string) => {
    const step = procedureSteps.find(s => s.id === stepId);
    if (step) {
      updateStep(stepId, { 
        responsibles: step.responsibles.filter(resp => resp !== responsible) 
      });
    }
  };

  const finalizeProcedure = () => {
    const allSteps = getAllSteps(procedureSteps);
    if (!allSteps.every(step => step.completed)) {
      toast({
        title: "Procédure incomplète",
        description: "Veuillez terminer toutes les étapes et sous-étapes avant de finaliser",
        variant: "destructive"
      });
      return;
    }

    onProcedureComplete(procedureSteps);
    toast({
      title: "Procédure terminée",
      description: "La procédure manuelle a été exécutée avec succès",
    });
    onClose();
  };

  const handleClose = () => {
    setProcedureSteps(prev => prev.map(step => resetStepHierarchy(step)));
    setCurrentStepIndex(0);
    onClose();
  };

  const resetStepHierarchy = (step: ProcedureStep): ProcedureStep => {
    const resetStep = { 
      ...step, 
      completed: false, 
      notes: "", 
      attachments: [] 
    };
    if (step.subSteps) {
      resetStep.subSteps = step.subSteps.map(resetStepHierarchy);
    }
    return resetStep;
  };

  const getStepStatus = (step: ProcedureStep, index: number) => {
    if (step.completed) return "Terminé";
    if (index === currentStepIndex) return "En cours";
    if (index < currentStepIndex) return "En retard";
    return "En attente";
  };

  const getStepStatusColor = (step: ProcedureStep, index: number) => {
    if (step.completed) return "border-green-500 bg-green-50";
    if (index === currentStepIndex) return "border-blue-500 bg-blue-50";
    if (index < currentStepIndex) return "border-yellow-500 bg-yellow-50";
    return "border-gray-200";
  };

  const completedSteps = getAllSteps(procedureSteps).filter(step => step.completed).length;
  const totalSteps = getAllSteps(procedureSteps).length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Procédure Manuelle - Alerte #{alertId}</DialogTitle>
          <DialogDescription>
            Exécution de la procédure manuelle pour: {alertTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Indicateur de progression */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Progression de la procédure</span>
                <Badge variant="outline">
                  {completedSteps} / {totalSteps} étapes terminées
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {progressPercentage.toFixed(0)}% terminé
              </p>
            </CardContent>
          </Card>

          {/* Hiérarchie des étapes */}
          <StepHierarchy
            steps={procedureSteps}
            onUpdateStep={updateStep}
            onCompleteStep={completeStep}
            onAddSubStep={addSubStep}
            onRemoveStep={removeStep}
            onFileUpload={handleFileUpload}
            onRemoveAttachment={removeAttachment}
            onAddResponsible={addResponsible}
            onRemoveResponsible={removeResponsible}
            currentStepIndex={currentStepIndex}
          />

          {/* Actions finales */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {completedSteps === totalSteps ? (
                    <span className="text-green-600 font-medium">
                      ✓ Toutes les étapes sont terminées. Vous pouvez finaliser la procédure.
                    </span>
                  ) : (
                    <span>
                      Étapes restantes: {totalSteps - completedSteps}
                    </span>
                  )}
                </div>
                
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleClose}>
                    Fermer
                  </Button>
                  
                  {completedSteps === totalSteps && (
                    <Button onClick={finalizeProcedure}>
                      <Save className="h-4 w-4 mr-2" />
                      Finaliser la procédure
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualProcedureModal;
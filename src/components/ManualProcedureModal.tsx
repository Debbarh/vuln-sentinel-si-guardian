import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, User, FileText, Paperclip, Clock, CheckCircle, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  responsible: string;
  estimatedDuration: number;
  completed: boolean;
  notes: string;
  attachments: string[];
  order: number;
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
      description: "Analyser la vulnérabilité et son impact sur les systèmes",
      responsible: "Équipe Sécurité",
      estimatedDuration: 2,
      completed: false,
      notes: "",
      attachments: [],
      order: 1
    },
    {
      id: "step-2",
      title: "Classification et priorisation",
      description: "Définir le niveau de priorité et les ressources nécessaires",
      responsible: "Chef de projet sécurité",
      estimatedDuration: 1,
      completed: false,
      notes: "",
      attachments: [],
      order: 2
    },
    {
      id: "step-3",
      title: "Plan d'action",
      description: "Élaborer la stratégie de remédiation détaillée",
      responsible: "Équipe Infrastructure",
      estimatedDuration: 3,
      completed: false,
      notes: "",
      attachments: [],
      order: 3
    },
    {
      id: "step-4",
      title: "Implémentation",
      description: "Appliquer les mesures correctives sur les systèmes",
      responsible: "Équipe Infrastructure",
      estimatedDuration: 4,
      completed: false,
      notes: "",
      attachments: [],
      order: 4
    },
    {
      id: "step-5",
      title: "Validation et clôture",
      description: "Vérifier l'efficacité et finaliser le traitement",
      responsible: "Équipe Sécurité",
      estimatedDuration: 2,
      completed: false,
      notes: "",
      attachments: [],
      order: 5
    }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const updateStep = (stepId: string, updates: Partial<ProcedureStep>) => {
    setProcedureSteps(procedureSteps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const completeStep = (stepId: string) => {
    const stepIndex = procedureSteps.findIndex(step => step.id === stepId);
    updateStep(stepId, { completed: true });
    
    if (stepIndex === currentStepIndex && stepIndex < procedureSteps.length - 1) {
      setCurrentStepIndex(stepIndex + 1);
    }
    
    toast({
      title: "Étape complétée",
      description: `L'étape "${procedureSteps[stepIndex].title}" a été marquée comme terminée`,
    });
  };

  const addAttachment = (stepId: string, fileName: string) => {
    const step = procedureSteps.find(s => s.id === stepId);
    if (step) {
      updateStep(stepId, { 
        attachments: [...step.attachments, fileName] 
      });
    }
  };

  const removeAttachment = (stepId: string, fileName: string) => {
    const step = procedureSteps.find(s => s.id === stepId);
    if (step) {
      updateStep(stepId, { 
        attachments: step.attachments.filter(name => name !== fileName) 
      });
    }
  };

  const finalizeProcedure = () => {
    if (!procedureSteps.every(step => step.completed)) {
      toast({
        title: "Procédure incomplète",
        description: "Veuillez terminer toutes les étapes avant de finaliser",
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
    setProcedureSteps(prev => prev.map(step => ({ ...step, completed: false, notes: "", attachments: [] })));
    setCurrentStepIndex(0);
    onClose();
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

  const completedSteps = procedureSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / procedureSteps.length) * 100;

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
                  {completedSteps} / {procedureSteps.length} étapes terminées
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

          {/* Liste des étapes */}
          <div className="space-y-4">
            {procedureSteps.map((step, index) => (
              <Card key={step.id} className={getStepStatusColor(step, index)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {step.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : index === currentStepIndex ? (
                        <Clock className="h-6 w-6 text-blue-500" />
                      ) : (
                        <div className="h-6 w-6 border-2 border-gray-300 rounded-full" />
                      )}
                      <div>
                        <h4 className="font-semibold text-lg">{step.title}</h4>
                        <Badge variant="outline" className="mt-1">
                          {getStepStatus(step, index)}
                        </Badge>
                      </div>
                    </div>
                    {!step.completed && index <= currentStepIndex && (
                      <Button
                        onClick={() => completeStep(step.id)}
                        size="sm"
                        className="ml-4"
                      >
                        Marquer comme terminé
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{step.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Responsable</label>
                      <Select
                        value={step.responsible}
                        onValueChange={(value) => updateStep(step.id, { responsible: value })}
                        disabled={step.completed}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Équipe Sécurité">Équipe Sécurité</SelectItem>
                          <SelectItem value="Chef de projet sécurité">Chef de projet sécurité</SelectItem>
                          <SelectItem value="Équipe Infrastructure">Équipe Infrastructure</SelectItem>
                          <SelectItem value="Admin Base de données">Admin Base de données</SelectItem>
                          <SelectItem value="Équipe Réseau">Équipe Réseau</SelectItem>
                          <SelectItem value="RSSI">RSSI</SelectItem>
                          <SelectItem value="Équipe DevOps">Équipe DevOps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Durée estimée (heures)</label>
                      <Input
                        type="number"
                        value={step.estimatedDuration}
                        onChange={(e) => updateStep(step.id, { estimatedDuration: parseInt(e.target.value) || 1 })}
                        disabled={step.completed}
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Section disponible seulement pour les étapes en cours ou terminées */}
                  {(index <= currentStepIndex || step.completed) && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Notes d'exécution</label>
                        <Textarea
                          value={step.notes}
                          onChange={(e) => updateStep(step.id, { notes: e.target.value })}
                          placeholder="Documenter les actions entreprises, les résultats obtenus..."
                          rows={3}
                          disabled={step.completed}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Pièces jointes</label>
                        <div className="space-y-2">
                          {step.attachments.map((attachment, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded">
                              <span className="text-sm flex items-center">
                                <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                                {attachment}
                              </span>
                              {!step.completed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(step.id, attachment)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          {!step.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const fileName = prompt("Nom du fichier ou document:");
                                if (fileName && fileName.trim()) {
                                  addAttachment(step.id, fileName.trim());
                                }
                              }}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter une pièce jointe
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions finales */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {completedSteps === procedureSteps.length ? (
                    <span className="text-green-600 font-medium">
                      ✓ Toutes les étapes sont terminées. Vous pouvez finaliser la procédure.
                    </span>
                  ) : (
                    <span>
                      Étapes restantes: {procedureSteps.length - completedSteps}
                    </span>
                  )}
                </div>
                
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleClose}>
                    Fermer
                  </Button>
                  
                  {completedSteps === procedureSteps.length && (
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
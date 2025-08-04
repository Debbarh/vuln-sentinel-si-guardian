import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, User, FileText, Paperclip, ChevronUp, ChevronDown, Save, Clock, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  responsible: string;
  estimatedDuration: number;
  required: boolean;
  completed: boolean;
  notes: string;
  attachments: Array<{ name: string; type: string }>; // Changé pour inclure le type
  order: number;
}

interface CustomWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: number;
  alertTitle: string;
  onWorkflowSave: (steps: WorkflowStep[]) => void;
}

const CustomWorkflowModal = ({
  isOpen,
  onClose,
  alertId,
  alertTitle,
  onWorkflowSave
}: CustomWorkflowModalProps) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [activeTab, setActiveTab] = useState("design");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  // Chargement des étapes par défaut de la procédure manuelle
  useEffect(() => {
    if (isOpen && workflowSteps.length === 0) {
      const defaultSteps: WorkflowStep[] = [
        {
          id: "step-1",
          title: "Évaluation initiale",
          description: "Analyser la vulnérabilité et son impact",
          responsible: "Équipe Sécurité",
          estimatedDuration: 2,
          required: true,
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
          required: true,
          completed: false,
          notes: "",
          attachments: [],
          order: 2
        },
        {
          id: "step-3",
          title: "Plan d'action",
          description: "Élaborer la stratégie de remédiation",
          responsible: "Équipe Infrastructure",
          estimatedDuration: 3,
          required: true,
          completed: false,
          notes: "",
          attachments: [],
          order: 3
        },
        {
          id: "step-4",
          title: "Implémentation",
          description: "Appliquer les mesures correctives",
          responsible: "Équipe Infrastructure",
          estimatedDuration: 4,
          required: true,
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
          required: true,
          completed: false,
          notes: "",
          attachments: [],
          order: 5
        }
      ];
      setWorkflowSteps(defaultSteps);
    }
  }, [isOpen, workflowSteps.length]);

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      title: "Nouvelle étape",
      description: "",
      responsible: "Équipe Sécurité",
      estimatedDuration: 1,
      required: false,
      completed: false,
      notes: "",
      attachments: [],
      order: workflowSteps.length + 1
    };
    setWorkflowSteps([...workflowSteps, newStep]);
    setEditingStepId(newStep.id);
  };

  const removeStep = (stepId: string) => {
    setWorkflowSteps(workflowSteps.filter(step => step.id !== stepId));
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflowSteps(workflowSteps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = workflowSteps.findIndex(step => step.id === stepId);
    if (
      (direction === 'up' && stepIndex === 0) ||
      (direction === 'down' && stepIndex === workflowSteps.length - 1)
    ) {
      return;
    }

    const newSteps = [...workflowSteps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    
    [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
    
    // Mettre à jour les ordres
    newSteps.forEach((step, index) => {
      step.order = index + 1;
    });
    
    setWorkflowSteps(newSteps);
  };

  const completeStep = (stepId: string) => {
    updateStep(stepId, { completed: true });
    toast({
      title: "Étape complétée",
      description: "L'étape a été marquée comme terminée",
    });
  };

  const addAttachment = (stepId: string, fileName: string, fileType: string) => {
    const step = workflowSteps.find(s => s.id === stepId);
    if (step) {
      updateStep(stepId, { 
        attachments: [...step.attachments, { name: fileName, type: fileType }] 
      });
    }
  };

  const removeAttachment = (stepId: string, attachmentName: string) => {
    const step = workflowSteps.find(s => s.id === stepId);
    if (step) {
      updateStep(stepId, { 
        attachments: step.attachments.filter(att => att.name !== attachmentName) 
      });
    }
  };

  const handleFileUpload = (stepId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = {
      'pdf': 'PDF',
      'doc': 'Word',
      'docx': 'Word', 
      'ppt': 'PowerPoint',
      'pptx': 'PowerPoint',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'gif': 'Image',
      'bmp': 'Image'
    };

    const fileType = fileExtension ? allowedTypes[fileExtension as keyof typeof allowedTypes] : null;
    
    if (!fileType) {
      toast({
        title: "Type de fichier non autorisé",
        description: "Seuls les fichiers PDF, Word, PowerPoint et Images sont acceptés",
        variant: "destructive"
      });
      return;
    }

    addAttachment(stepId, file.name, fileType);
    toast({
      title: "Fichier ajouté",
      description: `${file.name} a été ajouté avec succès`,
    });

    // Reset input
    event.target.value = '';
  };

  const saveWorkflow = () => {
    onWorkflowSave(workflowSteps);
    toast({
      title: "Workflow sauvegardé",
      description: "Le workflow personnalisé a été sauvegardé avec succès",
    });
    onClose();
  };

  const handleClose = () => {
    setWorkflowSteps([]);
    setActiveTab("design");
    setCurrentStepIndex(0);
    setEditingStepId(null);
    onClose();
  };

  const getStepStatus = (step: WorkflowStep) => {
    if (step.completed) return "Terminé";
    if (currentStepIndex === workflowSteps.findIndex(s => s.id === step.id)) return "En cours";
    return "En attente";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workflow Personnalisé - Alerte #{alertId}</DialogTitle>
          <DialogDescription>
            Personnalisez et exécutez le workflow pour traiter: {alertTitle}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="design">Conception du workflow</TabsTrigger>
            <TabsTrigger value="execution">Exécution</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Étapes du workflow</h3>
              <Button onClick={addStep} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une étape
              </Button>
            </div>

            <div className="space-y-4">
              {workflowSteps.map((step, index) => (
                <Card key={step.id} className={`${editingStepId === step.id ? 'border-blue-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Étape {step.order}</Badge>
                        {editingStepId === step.id ? (
                          <Input
                            value={step.title}
                            onChange={(e) => updateStep(step.id, { title: e.target.value })}
                            className="font-semibold"
                            onBlur={() => setEditingStepId(null)}
                            autoFocus
                          />
                        ) : (
                          <h4 
                            className="font-semibold cursor-pointer hover:text-blue-600"
                            onClick={() => setEditingStepId(step.id)}
                          >
                            {step.title}
                          </h4>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(step.id, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(step.id, 'down')}
                          disabled={index === workflowSteps.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={step.required}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'étape</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cette étape ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeStep(step.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        value={step.description}
                        onChange={(e) => updateStep(step.id, { description: e.target.value })}
                        placeholder="Décrivez cette étape..."
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Responsable</label>
                        <Select
                          value={step.responsible}
                          onValueChange={(value) => updateStep(step.id, { responsible: value })}
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
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes</label>
                      <Textarea
                        value={step.notes}
                        onChange={(e) => updateStep(step.id, { notes: e.target.value })}
                        placeholder="Ajoutez des notes pour cette étape..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Pièces jointes</label>
                      <div className="space-y-2">
                        {step.attachments.map((attachment, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm flex items-center">
                              <Paperclip className="h-4 w-4 mr-2" />
                              <span>{attachment.name}</span>
                              <Badge variant="outline" className="ml-2">{attachment.type}</Badge>
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(step.id, attachment.name)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        <div>
                          <input
                            type="file"
                            id={`file-${step.id}`}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp"
                            onChange={(e) => handleFileUpload(step.id, e)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`file-${step.id}`)?.click()}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un fichier
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={saveWorkflow}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder le workflow
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="execution" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Exécution du workflow</h3>
              <Badge variant="outline">
                {workflowSteps.filter(s => s.completed).length} / {workflowSteps.length} étapes terminées
              </Badge>
            </div>

            <div className="space-y-4">
              {workflowSteps.map((step, index) => (
                <Card key={step.id} className={`${
                  step.completed ? 'border-green-500 bg-green-50' : 
                  index === currentStepIndex ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : index === currentStepIndex ? (
                          <Clock className="h-5 w-5 text-blue-500" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                        )}
                        <div>
                          <h4 className="font-semibold">{step.title}</h4>
                          <Badge variant="outline" className="mt-1">
                            {getStepStatus(step)}
                          </Badge>
                        </div>
                      </div>
                      {!step.completed && index <= currentStepIndex && (
                        <Button
                          onClick={() => {
                            completeStep(step.id);
                            if (index === currentStepIndex && index < workflowSteps.length - 1) {
                              setCurrentStepIndex(index + 1);
                            }
                          }}
                          size="sm"
                        >
                          Marquer comme terminé
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div><strong>Responsable:</strong> {step.responsible}</div>
                      <div><strong>Durée estimée:</strong> {step.estimatedDuration}h</div>
                    </div>
                    
                    {(index <= currentStepIndex || step.completed) && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Notes d'exécution</label>
                          <Textarea
                            value={step.notes}
                            onChange={(e) => updateStep(step.id, { notes: e.target.value })}
                            placeholder="Ajoutez vos notes sur l'exécution de cette étape..."
                            rows={2}
                          />
                        </div>
                        
                        {step.attachments.length > 0 && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">Pièces jointes</label>
                             <div className="space-y-1">
                               {step.attachments.map((attachment, idx) => (
                                 <div key={idx} className="flex items-center text-sm">
                                   <Paperclip className="h-4 w-4 mr-2" />
                                   <span>{attachment.name}</span>
                                   <Badge variant="outline" className="ml-2">{attachment.type}</Badge>
                                 </div>
                               ))}
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Fermer
              </Button>
              {workflowSteps.every(step => step.completed) && (
                <Button onClick={() => {
                  toast({
                    title: "Workflow terminé",
                    description: "Le workflow a été exécuté avec succès",
                  });
                  handleClose();
                }}>
                  Finaliser le traitement
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CustomWorkflowModal;
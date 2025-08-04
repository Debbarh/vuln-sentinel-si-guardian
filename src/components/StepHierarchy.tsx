import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  User, 
  FileText, 
  Paperclip, 
  Clock, 
  CheckCircle, 
  ChevronDown, 
  ChevronRight,
  Indent,
  Edit2
} from "lucide-react";
import { WorkflowStep, ProcedureStep } from "@/types/workflow";

interface StepHierarchyProps {
  steps: (WorkflowStep | ProcedureStep)[];
  onUpdateStep: (stepId: string, updates: Partial<WorkflowStep | ProcedureStep>) => void;
  onCompleteStep: (stepId: string) => void;
  onAddSubStep: (parentId: string) => void;
  onRemoveStep: (stepId: string) => void;
  onFileUpload: (stepId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (stepId: string, attachmentName: string) => void;
  onAddResponsible: (stepId: string, responsible: string) => void;
  onRemoveResponsible: (stepId: string, responsible: string) => void;
  currentStepIndex: number;
  isReadonly?: boolean;
}

const StepHierarchy: React.FC<StepHierarchyProps> = ({
  steps,
  onUpdateStep,
  onCompleteStep,
  onAddSubStep,
  onRemoveStep,
  onFileUpload,
  onRemoveAttachment,
  onAddResponsible,
  onRemoveResponsible,
  currentStepIndex,
  isReadonly = false
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const toggleExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const startEditing = (step: WorkflowStep | ProcedureStep) => {
    setEditingStepId(step.id);
    setEditingTitle((step as ProcedureStep).title || (step as WorkflowStep).name || "");
  };

  const saveTitle = (stepId: string) => {
    if (editingTitle.trim()) {
      onUpdateStep(stepId, { title: editingTitle.trim(), name: editingTitle.trim() });
    }
    setEditingStepId(null);
    setEditingTitle("");
  };

  const cancelEditing = () => {
    setEditingStepId(null);
    setEditingTitle("");
  };

  const getStepStatus = (step: WorkflowStep | ProcedureStep, index: number) => {
    if (step.completed) return "Terminé";
    if (index === currentStepIndex) return "En cours";
    if (index < currentStepIndex) return "En retard";
    return "En attente";
  };

  const getStepStatusColor = (step: WorkflowStep | ProcedureStep, index: number) => {
    if (step.completed) return "border-green-500 bg-green-50";
    if (index === currentStepIndex) return "border-blue-500 bg-blue-50";
    if (index < currentStepIndex) return "border-yellow-500 bg-yellow-50";
    return "border-gray-200";
  };

  const canCompleteStep = (step: WorkflowStep | ProcedureStep): boolean => {
    // Une étape ne peut être complétée que si toutes ses sous-étapes sont complétées
    if (step.subSteps && step.subSteps.length > 0) {
      return step.subSteps.every(subStep => subStep.completed);
    }
    return true;
  };

  const getStepProgress = (step: WorkflowStep | ProcedureStep): { completed: number; total: number } => {
    if (!step.subSteps || step.subSteps.length === 0) {
      return { completed: step.completed ? 1 : 0, total: 1 };
    }
    
    const completed = step.subSteps.filter(subStep => subStep.completed).length;
    return { completed, total: step.subSteps.length };
  };

  const renderStepCard = (step: WorkflowStep | ProcedureStep, index: number, level: number = 0) => {
    const hasSubSteps = step.subSteps && step.subSteps.length > 0;
    const isExpanded = expandedSteps.has(step.id);
    const progress = getStepProgress(step);
    const isEditing = editingStepId === step.id;
    
    // Indentation en fonction du niveau de hiérarchie
    const getIndentStyle = (level: number) => {
      return level > 0 ? { paddingLeft: `${level * 24}px` } : {};
    };

    return (
      <div key={step.id} className="mb-4" style={getIndentStyle(level)}>
        <Card className={getStepStatusColor(step, index)}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {hasSubSteps && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(step.id)}
                    className="p-0 h-6 w-6"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {level > 0 && <Indent className="h-4 w-4 text-gray-400" />}
                {step.completed ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : index === currentStepIndex ? (
                  <Clock className="h-6 w-6 text-blue-500" />
                ) : (
                  <div className="h-6 w-6 border-2 border-gray-300 rounded-full" />
                )}
                <div>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') saveTitle(step.id);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                        className="text-lg font-semibold"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => saveTitle(step.id)}>✓</Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>✕</Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-lg">{(step as ProcedureStep).title || (step as WorkflowStep).name}</h4>
                      {!isReadonly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(step)}
                          className="p-1 h-6 w-6"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">
                      {getStepStatus(step, index)}
                    </Badge>
                    {hasSubSteps && (
                      <Badge variant="secondary">
                        {progress.completed}/{progress.total} sous-étapes
                      </Badge>
                    )}
                    {level > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Niveau {level}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {!isReadonly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddSubStep(step.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Sous-étape
                  </Button>
                )}
                {!step.completed && canCompleteStep(step) && (
                  <Button
                    onClick={() => onCompleteStep(step.id)}
                    size="sm"
                    disabled={!canCompleteStep(step)}
                  >
                    Marquer comme terminé
                  </Button>
                )}
                {!isReadonly && level > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveStep(step.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-600">{step.description}</p>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Responsables</label>
                <div className="space-y-2">
                  {(step as ProcedureStep).responsibles?.map((responsible, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {responsible}
                      </span>
                      {!step.completed && !isReadonly && (step as ProcedureStep).responsibles && (step as ProcedureStep).responsibles!.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveResponsible(step.id, responsible)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {!step.completed && !isReadonly && (
                    <Select onValueChange={(value) => onAddResponsible(step.id, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ajouter un responsable" />
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
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Durée estimée (heures)</label>
                <Input
                  type="number"
                  value={(step as ProcedureStep).estimatedDuration || 1}
                  onChange={(e) => onUpdateStep(step.id, { estimatedDuration: parseInt(e.target.value) || 1 })}
                  disabled={step.completed || isReadonly}
                  min="1"
                />
              </div>
            </div>

            {/* Notes et pièces jointes pour étapes en cours */}
            {(index <= currentStepIndex || step.completed) && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">Notes d'exécution</label>
                  <Textarea
                    value={(step as ProcedureStep).notes || ""}
                    onChange={(e) => onUpdateStep(step.id, { notes: e.target.value })}
                    placeholder="Documenter les actions entreprises, les résultats obtenus..."
                    rows={3}
                    disabled={step.completed || isReadonly}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Pièces jointes</label>
                  <div className="space-y-2">
                    {(step as ProcedureStep).attachments?.map((attachment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded">
                        <span className="text-sm flex items-center">
                          <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{attachment.name}</span>
                          <Badge variant="outline" className="ml-2">{attachment.type}</Badge>
                        </span>
                        {!step.completed && !isReadonly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveAttachment(step.id, attachment.name)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {!step.completed && !isReadonly && (
                      <div>
                        <input
                          type="file"
                          id={`file-input-${step.id}`}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.ppt,.pptx"
                          onChange={(e) => onFileUpload(step.id, e)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`file-input-${step.id}`)?.click()}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une pièce jointe
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Affichage récursif des sous-étapes */}
        {hasSubSteps && isExpanded && (
          <div className="mt-2 space-y-2">
            {step.subSteps!.map((subStep, subIndex) => 
              renderStepCard(subStep, subIndex, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Filtrer pour n'afficher que les étapes racines
  const rootSteps = steps.filter(step => !(step as ProcedureStep).parentId);

  return (
    <div className="space-y-4">
      {rootSteps.map((step, index) => renderStepCard(step, index))}
    </div>
  );
};

export default StepHierarchy;
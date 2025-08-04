import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Assessment } from '@/types/frameworks';
import { DEFAULT_FRAMEWORKS } from '@/types/frameworks';
import { getEvaluators, getUserDisplayName } from '@/types/users';
import { toast } from 'sonner';

interface AssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  assessment?: Assessment | null;
  onSubmit: (assessment: Partial<Assessment>) => void;
}

export function AssessmentForm({ isOpen, onClose, assessment, onSubmit }: AssessmentFormProps) {
  const [formData, setFormData] = useState({
    name: assessment?.name || '',
    description: assessment?.description || '',
    frameworkIds: assessment?.frameworkIds || [],
    scope: assessment?.scope || '',
    evaluators: assessment?.evaluators || [],
    dueDate: assessment?.dueDate ? new Date(assessment.dueDate) : undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableFrameworks = DEFAULT_FRAMEWORKS;
  const availableEvaluators = getEvaluators();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'évaluation est obligatoire';
    }

    if (formData.frameworkIds.length === 0) {
      newErrors.frameworks = 'Au moins un référentiel doit être sélectionné';
    }

    if (!formData.scope.trim()) {
      newErrors.scope = 'Le périmètre doit être défini';
    }

    if (formData.evaluators.length === 0) {
      newErrors.evaluators = 'Au moins un évaluateur doit être assigné';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const assessmentData: Partial<Assessment> = {
        ...formData,
        dueDate: formData.dueDate?.toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!assessment) {
        assessmentData.id = `assessment-${Date.now()}`;
        assessmentData.status = 'draft';
        assessmentData.createdAt = new Date().toISOString();
        assessmentData.createdBy = 'current-user'; // TODO: Get from auth context
      }

      onSubmit(assessmentData);
      
      toast.success(
        assessment ? 'Évaluation modifiée avec succès' : 'Évaluation créée avec succès'
      );
      
      onClose();
    } catch (error) {
      toast.error('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: assessment?.name || '',
      description: assessment?.description || '',
      frameworkIds: assessment?.frameworkIds || [],
      scope: assessment?.scope || '',
      evaluators: assessment?.evaluators || [],
      dueDate: assessment?.dueDate ? new Date(assessment.dueDate) : undefined,
    });
    setErrors({});
    onClose();
  };

  const handleFrameworkToggle = (frameworkId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      frameworkIds: checked 
        ? [...prev.frameworkIds, frameworkId]
        : prev.frameworkIds.filter(id => id !== frameworkId)
    }));
  };

  const handleEvaluatorToggle = (evaluatorId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      evaluators: checked 
        ? [...prev.evaluators, evaluatorId]
        : prev.evaluators.filter(id => id !== evaluatorId)
    }));
  };

  // Réinitialiser le formulaire quand l'évaluation change
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: assessment?.name || '',
        description: assessment?.description || '',
        frameworkIds: assessment?.frameworkIds || [],
        scope: assessment?.scope || '',
        evaluators: assessment?.evaluators || [],
        dueDate: assessment?.dueDate ? new Date(assessment.dueDate) : undefined,
      });
      setErrors({});
    }
  }, [assessment, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assessment ? 'Modifier l\'Évaluation' : 'Créer une Nouvelle Évaluation'}
          </DialogTitle>
          <DialogDescription>
            {assessment 
              ? 'Modifiez les paramètres de l\'évaluation de maturité'
              : 'Configurez une nouvelle évaluation de maturité sécurité'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'Évaluation *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Évaluation Q1 2024"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">Périmètre *</Label>
              <Select
                value={formData.scope}
                onValueChange={(value) => setFormData({ ...formData, scope: value })}
              >
                <SelectTrigger className={errors.scope ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner le périmètre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Organisation complète">Organisation complète</SelectItem>
                  <SelectItem value="Département IT">Département IT</SelectItem>
                  <SelectItem value="Département Finance">Département Finance</SelectItem>
                  <SelectItem value="Département RH">Département RH</SelectItem>
                  <SelectItem value="Filiale Europe">Filiale Europe</SelectItem>
                  <SelectItem value="Application critique">Application critique</SelectItem>
                  <SelectItem value="Infrastructure cloud">Infrastructure cloud</SelectItem>
                </SelectContent>
              </Select>
              {errors.scope && (
                <p className="text-sm text-red-500">{errors.scope}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de l'évaluation et de ses objectifs..."
              rows={3}
            />
          </div>

          {/* Date d'échéance */}
          <div className="space-y-2">
            <Label>Date d'Échéance</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? (
                    format(formData.dueDate, "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Sélection des référentiels */}
          <div className="space-y-4">
            <Label>Référentiels à Évaluer *</Label>
            {errors.frameworks && (
              <p className="text-sm text-red-500">{errors.frameworks}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableFrameworks.map((framework) => (
                <div key={framework.id} className="flex items-center space-x-2 p-3 border rounded">
                  <Checkbox
                    id={`framework-${framework.id}`}
                    checked={formData.frameworkIds.includes(framework.id)}
                    onCheckedChange={(checked) => 
                      handleFrameworkToggle(framework.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`framework-${framework.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {framework.name}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Version {framework.version}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sélection des évaluateurs */}
          <div className="space-y-4">
            <Label>Évaluateurs Assignés *</Label>
            {errors.evaluators && (
              <p className="text-sm text-red-500">{errors.evaluators}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableEvaluators.map((evaluator) => (
                <div key={evaluator.id} className="flex items-center space-x-2 p-3 border rounded">
                  <Checkbox
                    id={`evaluator-${evaluator.id}`}
                    checked={formData.evaluators.includes(evaluator.id)}
                    onCheckedChange={(checked) => 
                      handleEvaluatorToggle(evaluator.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`evaluator-${evaluator.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {getUserDisplayName(evaluator)}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {evaluator.department} - {evaluator.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Créer l\'Évaluation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ActionPlan } from '@/types/frameworks';
import { getEvaluators, getUserDisplayName } from '@/types/users';
import { toast } from 'sonner';

interface ActionPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  actionPlan?: ActionPlan | null;
  onSubmit: (actionPlan: Partial<ActionPlan>) => void;
}

// Critères exemple pour la sélection
const SAMPLE_CRITERIA = [
  { id: 'A.5.1', name: 'A.5.1 - Politiques pour la sécurité de l\'information' },
  { id: 'A.6.1', name: 'A.6.1 - Organisation interne' },
  { id: 'A.8.1', name: 'A.8.1 - Inventaire des actifs' },
  { id: 'A.9.1', name: 'A.9.1 - Exigences d\'accès' },
  { id: 'A.10.1', name: 'A.10.1 - Politique cryptographique' },
  { id: 'A.11.1', name: 'A.11.1 - Périmètre de sécurité physique' },
];

export function ActionPlanForm({ isOpen, onClose, actionPlan, onSubmit }: ActionPlanFormProps) {
  const [formData, setFormData] = useState({
    title: actionPlan?.title || '',
    description: actionPlan?.description || '',
    criterionId: actionPlan?.criterionId || '',
    responsible: actionPlan?.responsible || '',
    dueDate: actionPlan?.dueDate ? new Date(actionPlan.dueDate) : undefined,
    priority: actionPlan?.priority || 'medium' as const,
    comments: actionPlan?.comments || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableEvaluators = getEvaluators();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre de l\'action est obligatoire';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }

    if (!formData.criterionId) {
      newErrors.criterionId = 'Le critère cible doit être sélectionné';
    }

    if (!formData.responsible) {
      newErrors.responsible = 'Un responsable doit être assigné';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Une date d\'échéance est requise';
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
      const actionPlanData: Partial<ActionPlan> = {
        ...formData,
        dueDate: formData.dueDate?.toISOString().split('T')[0],
      };

      onSubmit(actionPlanData);
      
      toast.success(
        actionPlan ? 'Plan d\'action modifié avec succès' : 'Plan d\'action créé avec succès'
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
      title: actionPlan?.title || '',
      description: actionPlan?.description || '',
      criterionId: actionPlan?.criterionId || '',
      responsible: actionPlan?.responsible || '',
      dueDate: actionPlan?.dueDate ? new Date(actionPlan.dueDate) : undefined,
      priority: actionPlan?.priority || 'medium',
      comments: actionPlan?.comments || '',
    });
    setErrors({});
    onClose();
  };

  // Réinitialiser le formulaire quand l'action change
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: actionPlan?.title || '',
        description: actionPlan?.description || '',
        criterionId: actionPlan?.criterionId || '',
        responsible: actionPlan?.responsible || '',
        dueDate: actionPlan?.dueDate ? new Date(actionPlan.dueDate) : undefined,
        priority: actionPlan?.priority || 'medium',
        comments: actionPlan?.comments || '',
      });
      setErrors({});
    }
  }, [actionPlan, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {actionPlan ? 'Modifier le Plan d\'Action' : 'Créer un Plan d\'Action'}
          </DialogTitle>
          <DialogDescription>
            {actionPlan 
              ? 'Modifiez les détails du plan d\'action'
              : 'Créez un nouveau plan d\'action pour améliorer la sécurité'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de l'Action *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Mise en place d'un inventaire automatisé"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez l'action à réaliser en détail..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="criterionId">Critère Cible *</Label>
              <Select
                value={formData.criterionId}
                onValueChange={(value) => setFormData({ ...formData, criterionId: value })}
              >
                <SelectTrigger className={errors.criterionId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner le critère" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_CRITERIA.map((criterion) => (
                    <SelectItem key={criterion.id} value={criterion.id}>
                      {criterion.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.criterionId && (
                <p className="text-sm text-red-500">{errors.criterionId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible">Responsable *</Label>
              <Select
                value={formData.responsible}
                onValueChange={(value) => setFormData({ ...formData, responsible: value })}
              >
                <SelectTrigger className={errors.responsible ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Assigner un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {availableEvaluators.map((evaluator) => (
                    <SelectItem key={evaluator.id} value={evaluator.id}>
                      {getUserDisplayName(evaluator)} - {evaluator.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.responsible && (
                <p className="text-sm text-red-500">{errors.responsible}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date d'Échéance *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground",
                      errors.dueDate && "border-red-500"
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
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Commentaires / Notes</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Ajoutez des notes sur le contexte, les contraintes, les ressources nécessaires..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? 'Enregistrement...' 
                : actionPlan 
                  ? 'Modifier l\'Action' 
                  : 'Créer l\'Action'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
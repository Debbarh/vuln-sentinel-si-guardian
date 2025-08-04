import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Criterion } from '@/types/frameworks';
import { toast } from 'sonner';

interface CriterionFormProps {
  isOpen: boolean;
  onClose: () => void;
  criterion?: Criterion | null;
  parentId?: string | null;
  onSubmit: (criterion: Partial<Criterion>) => void;
}

export function CriterionForm({ isOpen, onClose, criterion, parentId, onSubmit }: CriterionFormProps) {
  const [formData, setFormData] = useState({
    code: criterion?.code || '',
    name: criterion?.name || '',
    description: criterion?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Le code est obligatoire';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
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
      onSubmit(formData);
      
      toast.success(
        criterion ? 'Critère modifié avec succès' : 'Critère créé avec succès'
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
      code: criterion?.code || '',
      name: criterion?.name || '',
      description: criterion?.description || '',
    });
    setErrors({});
    onClose();
  };

  // Réinitialiser le formulaire quand le critère change
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        code: criterion?.code || '',
        name: criterion?.name || '',
        description: criterion?.description || '',
      });
      setErrors({});
    }
  }, [criterion, isOpen]);

  const isSubCriterion = !!parentId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {criterion ? 'Modifier le ' : 'Créer un '}
            {isSubCriterion ? 'Sous-critère' : 'Critère'}
          </DialogTitle>
          <DialogDescription>
            {criterion 
              ? `Modifiez les informations du ${isSubCriterion ? 'sous-critère' : 'critère'}`
              : `Créez un nouveau ${isSubCriterion ? 'sous-critère' : 'critère'} d'évaluation`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Code du {isSubCriterion ? 'sous-critère' : 'critère'} *
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder={isSubCriterion ? "Ex: A.5.1.1" : "Ex: A.5"}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Nom du {isSubCriterion ? 'sous-critère' : 'critère'} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom descriptif"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description détaillée de l'objectif et du contenu..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
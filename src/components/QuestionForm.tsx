import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Question, QuestionOption } from '@/types/frameworks';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  question?: Question | null;
  criterionId: string;
  onSubmit: (question: Partial<Question>) => void;
}

export function QuestionForm({ isOpen, onClose, question, criterionId, onSubmit }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    text: question?.text || '',
    description: question?.description || '',
    type: question?.type || 'radio' as const,
    required: question?.required ?? true,
    options: question?.options || [
      { id: 'opt1', value: '0', label: 'Non implémenté', maturityLevel: 0, order: 1 },
      { id: 'opt2', value: '1', label: 'Partiellement implémenté', maturityLevel: 1, order: 2 },
      { id: 'opt3', value: '2', label: 'Largement implémenté', maturityLevel: 2, order: 3 },
      { id: 'opt4', value: '3', label: 'Complètement implémenté', maturityLevel: 3, order: 4 },
    ] as QuestionOption[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.text.trim()) {
      newErrors.text = 'Le texte de la question est obligatoire';
    }

    if ((formData.type === 'radio' || formData.type === 'checkbox') && formData.options.length === 0) {
      newErrors.options = 'Au moins une option est requise pour ce type de question';
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
        question ? 'Question modifiée avec succès' : 'Question créée avec succès'
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
      text: question?.text || '',
      description: question?.description || '',
      type: question?.type || 'radio',
      required: question?.required ?? true,
      options: question?.options || [],
    });
    setErrors({});
    onClose();
  };

  const addOption = () => {
    const newOption: QuestionOption = {
      id: `opt-${Date.now()}`,
      value: formData.options.length.toString(),
      label: '',
      maturityLevel: formData.options.length,
      order: formData.options.length + 1,
    };
    setFormData({
      ...formData,
      options: [...formData.options, newOption],
    });
  };

  const updateOption = (index: number, field: keyof QuestionOption, value: string | number) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  // Réinitialiser le formulaire quand la question change
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        text: question?.text || '',
        description: question?.description || '',
        type: question?.type || 'radio',
        required: question?.required ?? true,
        options: question?.options || [
          { id: 'opt1', value: '0', label: 'Non implémenté', maturityLevel: 0, order: 1 },
          { id: 'opt2', value: '1', label: 'Partiellement implémenté', maturityLevel: 1, order: 2 },
          { id: 'opt3', value: '2', label: 'Largement implémenté', maturityLevel: 2, order: 3 },
          { id: 'opt4', value: '3', label: 'Complètement implémenté', maturityLevel: 3, order: 4 },
        ],
      });
      setErrors({});
    }
  }, [question, isOpen]);

  const needsOptions = formData.type === 'radio' || formData.type === 'checkbox';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? 'Modifier la Question' : 'Créer une Nouvelle Question'}
          </DialogTitle>
          <DialogDescription>
            {question 
              ? 'Modifiez les informations de la question d\'évaluation'
              : 'Créez une nouvelle question d\'évaluation pour ce critère'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text">Texte de la question *</Label>
            <Textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Formulez votre question d'évaluation..."
              rows={3}
              className={errors.text ? 'border-red-500' : ''}
            />
            {errors.text && (
              <p className="text-sm text-red-500">{errors.text}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description ou instructions supplémentaires..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de réponse *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'radio' | 'checkbox' | 'text' | 'scale') => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="radio">Choix unique (Radio)</SelectItem>
                  <SelectItem value="checkbox">Choix multiple (Checkbox)</SelectItem>
                  <SelectItem value="scale">Échelle de notation</SelectItem>
                  <SelectItem value="text">Texte libre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <span>Question obligatoire</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.required}
                  onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.required ? 'Obligatoire' : 'Optionnel'}
                </span>
              </div>
            </div>
          </div>

          {/* Options de réponse */}
          {needsOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options de réponse *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter Option
                </Button>
              </div>

              {errors.options && (
                <p className="text-sm text-red-500">{errors.options}</p>
              )}

              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={option.id} className="border rounded p-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                      <div className="md:col-span-1">
                        <Label className="text-xs">Valeur</Label>
                        <Input
                          value={option.value}
                          onChange={(e) => updateOption(index, 'value', e.target.value)}
                          placeholder="0"
                          className="text-center"
                        />
                      </div>
                      <div className="md:col-span-6">
                        <Label className="text-xs">Libellé</Label>
                        <Input
                          value={option.label}
                          onChange={(e) => updateOption(index, 'label', e.target.value)}
                          placeholder="Libellé de l'option"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">Niveau</Label>
                        <Input
                          type="number"
                          min="0"
                          max="4"
                          value={option.maturityLevel || 0}
                          onChange={(e) => updateOption(index, 'maturityLevel', parseInt(e.target.value))}
                          className="text-center"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">Ordre</Label>
                        <Input
                          type="number"
                          min="1"
                          value={option.order}
                          onChange={(e) => updateOption(index, 'order', parseInt(e.target.value))}
                          className="text-center"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
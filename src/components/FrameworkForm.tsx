import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReferenceFramework } from '@/types/frameworks';
import { toast } from 'sonner';

interface FrameworkFormProps {
  isOpen: boolean;
  onClose: () => void;
  framework?: ReferenceFramework;
  onSubmit: (framework: Partial<ReferenceFramework>) => void;
}

export function FrameworkForm({ isOpen, onClose, framework, onSubmit }: FrameworkFormProps) {
  const [formData, setFormData] = useState({
    name: framework?.name || '',
    version: framework?.version || '',
    description: framework?.description || '',
    type: framework?.type || 'ISO27001' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du référentiel est obligatoire';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'La version est obligatoire';
    }

    if (!formData.type) {
      newErrors.type = 'Le type de référentiel est obligatoire';
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
      const frameworkData: Partial<ReferenceFramework> = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      if (!framework) {
        frameworkData.id = `${formData.type.toLowerCase()}-${Date.now()}`;
        frameworkData.createdAt = new Date().toISOString();
      }

      onSubmit(frameworkData);
      
      toast.success(
        framework ? 'Référentiel modifié avec succès' : 'Référentiel créé avec succès'
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
      name: framework?.name || '',
      version: framework?.version || '',
      description: framework?.description || '',
      type: framework?.type || 'ISO27001',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {framework ? 'Modifier le Référentiel' : 'Créer un Nouveau Référentiel'}
          </DialogTitle>
          <DialogDescription>
            {framework 
              ? 'Modifiez les informations du référentiel de sécurité'
              : 'Créez un nouveau référentiel de sécurité avec ses critères d\'évaluation'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du Référentiel *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: ISO 27001:2022"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="Ex: 2022"
                className={errors.version ? 'border-red-500' : ''}
              />
              {errors.version && (
                <p className="text-sm text-red-500">{errors.version}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type de Référentiel *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'ISO27001' | 'NIST' | 'CISA') => 
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ISO27001">ISO 27001</SelectItem>
                <SelectItem value="NIST">NIST Cybersecurity Framework</SelectItem>
                <SelectItem value="CISA">CISA Zero Trust Maturity Model</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description détaillée du référentiel..."
              rows={4}
            />
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
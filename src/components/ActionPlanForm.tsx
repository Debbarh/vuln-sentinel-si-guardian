import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarIcon, 
  User, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  X
} from 'lucide-react';
import { ISO27001_CONTROLS } from '@/data/iso27001Controls';
import { NIST_CSF_FUNCTIONS } from '@/data/nistControls';
import { CISA_ZTMM_PILLARS } from '@/data/cisaControls';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ActionPlanData {
  id: string;
  title: string;
  description: string;
  frameworkType: 'ISO27001' | 'NIST' | 'CISA';
  frameworkRef: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate: string;
  estimatedEffort: string;
  category: string;
  tags: string[];
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
}

interface ActionPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: Partial<ActionPlanData>) => void;
  plan?: ActionPlanData | null;
  frameworkType: 'ISO27001' | 'NIST' | 'CISA';
}

// Équipes et responsables disponibles
const AVAILABLE_ASSIGNEES = [
  'RSSI',
  'DSI',
  'Administrateur Système',
  'Responsable Sécurité',
  'Chef de Projet',
  'Responsable Conformité',
  'DPO',
  'Responsable RH',
  'Direction Générale'
];

export function ActionPlanForm({ isOpen, onClose, onSubmit, plan, frameworkType }: ActionPlanFormProps) {
  const [formData, setFormData] = useState({
    title: plan?.title || '',
    description: plan?.description || '',
    frameworkRef: plan?.frameworkRef || '',
    priority: plan?.priority || 'medium' as const,
    status: plan?.status || 'not_started' as const,
    assignee: plan?.assignee || '',
    dueDate: plan?.dueDate ? new Date(plan.dueDate) : undefined as Date | undefined,
    estimatedEffort: plan?.estimatedEffort || '',
    category: plan?.category || '',
    businessImpact: plan?.businessImpact || 'medium' as const,
    tags: plan?.tags || [] as string[],
    dependencies: plan?.dependencies || [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Récupérer les contrôles/sous-catégories disponibles selon le référentiel
  const getAvailableReferences = () => {
    if (frameworkType === 'ISO27001') {
      return ISO27001_CONTROLS.flatMap(category => 
        category.controls.map(control => ({
          value: control.code,
          label: `${control.code} - ${control.title}`,
          category: category.name
        }))
      );
    } else if (frameworkType === 'NIST') {
      return NIST_CSF_FUNCTIONS.flatMap(func => 
        func.categories.flatMap(category =>
          category.subCategories.map(subCategory => ({
            value: subCategory.code,
            label: `${subCategory.code} - ${subCategory.title}`,
            category: `${func.name} - ${category.name}`
          }))
        )
      );
    } else {
      return CISA_ZTMM_PILLARS.flatMap(pillar => 
        pillar.subComponents.map(subComponent => ({
          value: subComponent.id,
          label: `${subComponent.id} - ${subComponent.title}`,
          category: pillar.name
        }))
      );
    }
  };

  const availableReferences = getAvailableReferences();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }
    if (!formData.frameworkRef) {
      newErrors.frameworkRef = 'La référence du contrôle est obligatoire';
    }
    if (!formData.assignee) {
      newErrors.assignee = 'L\'assignation est obligatoire';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'La date d\'échéance est obligatoire';
    }
    if (!formData.estimatedEffort.trim()) {
      newErrors.estimatedEffort = 'L\'estimation d\'effort est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const selectedRef = availableReferences.find(ref => ref.value === formData.frameworkRef);
    
    const planData: Partial<ActionPlanData> = {
      ...formData,
      id: plan?.id || `${frameworkType.toLowerCase()}-${Date.now()}`,
      frameworkType,
      category: selectedRef?.category || formData.category,
      dueDate: formData.dueDate!.toISOString().split('T')[0],
      tags: [...formData.tags, frameworkType.toLowerCase()]
    };

    onSubmit(planData);
    toast.success(plan ? 'Plan d\'action mis à jour' : 'Nouveau plan d\'action créé');
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      frameworkRef: '',
      priority: 'medium',
      status: 'not_started',
      assignee: '',
      dueDate: undefined,
      estimatedEffort: '',
      category: '',
      businessImpact: 'medium',
      tags: [],
      dependencies: []
    });
    setErrors({});
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'blocked': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {plan ? 'Modifier le Plan d\'Action' : 'Nouveau Plan d\'Action'}
            <Badge variant="outline">{frameworkType}</Badge>
          </DialogTitle>
          <DialogDescription>
            Créer un plan d'action pour améliorer la conformité {
              frameworkType === 'ISO27001' ? 'ISO 27001:2022' : 
              frameworkType === 'NIST' ? 'NIST CSF 2.0' : 'CISA Zero Trust'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonne gauche */}
          <div className="space-y-4">
            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre du Plan d'Action *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Mise en place d'une authentification forte"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez les objectifs et étapes de ce plan d'action..."
                rows={4}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Référence du contrôle */}
            <div className="space-y-2">
              <Label>Contrôle/Sous-catégorie *</Label>
              <Select value={formData.frameworkRef} onValueChange={(value) => setFormData(prev => ({ ...prev, frameworkRef: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={`Sélectionner un contrôle ${frameworkType}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableReferences.map((ref) => (
                    <SelectItem key={ref.value} value={ref.value}>
                      <div>
                        <div className="font-medium">{ref.label}</div>
                        <div className="text-xs text-muted-foreground">{ref.category}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.frameworkRef && <p className="text-sm text-red-500">{errors.frameworkRef}</p>}
            </div>

            {/* Priorité et Impact Business */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className={`flex items-center gap-2 ${getPriorityColor('low')}`}>
                        <div className="w-2 h-2 rounded-full bg-current"></div>
                        Faible
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className={`flex items-center gap-2 ${getPriorityColor('medium')}`}>
                        <div className="w-2 h-2 rounded-full bg-current"></div>
                        Moyenne
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className={`flex items-center gap-2 ${getPriorityColor('high')}`}>
                        <div className="w-2 h-2 rounded-full bg-current"></div>
                        Élevée
                      </div>
                    </SelectItem>
                    <SelectItem value="critical">
                      <div className={`flex items-center gap-2 ${getPriorityColor('critical')}`}>
                        <div className="w-2 h-2 rounded-full bg-current"></div>
                        Critique
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Impact Business</Label>
                <Select value={formData.businessImpact} onValueChange={(value: any) => setFormData(prev => ({ ...prev, businessImpact: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-4">
            {/* Statut */}
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">
                    <div className={`flex items-center gap-2 ${getStatusColor('not_started')}`}>
                      <Clock className="w-4 h-4" />
                      Non démarré
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className={`flex items-center gap-2 ${getStatusColor('in_progress')}`}>
                      <Target className="w-4 h-4" />
                      En cours
                    </div>
                  </SelectItem>
                  <SelectItem value="blocked">
                    <div className={`flex items-center gap-2 ${getStatusColor('blocked')}`}>
                      <AlertTriangle className="w-4 h-4" />
                      Bloqué
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className={`flex items-center gap-2 ${getStatusColor('completed')}`}>
                      <CheckCircle2 className="w-4 h-4" />
                      Complété
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assigné */}
            <div className="space-y-2">
              <Label>Assigné à *</Label>
              <Select value={formData.assignee} onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ASSIGNEES.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {assignee}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignee && <p className="text-sm text-red-500">{errors.assignee}</p>}
            </div>

            {/* Date d'échéance */}
            <div className="space-y-2">
              <Label>Date d'échéance *</Label>
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
                    {formData.dueDate ? format(formData.dueDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
            </div>

            {/* Effort estimé */}
            <div className="space-y-2">
              <Label htmlFor="effort">Effort estimé *</Label>
              <Input
                id="effort"
                value={formData.estimatedEffort}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedEffort: e.target.value }))}
                placeholder="Ex: 2 semaines, 1 mois, 40 jours/homme"
              />
              {errors.estimatedEffort && <p className="text-sm text-red-500">{errors.estimatedEffort}</p>}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Ajouter un tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            {plan ? 'Mettre à jour' : 'Créer le Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
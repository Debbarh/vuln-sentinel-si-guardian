import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Calendar, Clock } from 'lucide-react';
import { ReportTemplate, AutomatedReport, ReportFrequency } from '@/types/reports';
import { toast } from 'sonner';

interface ReportSchedulerProps {
  template: ReportTemplate;
  onSchedule: (reportData: Omit<AutomatedReport, 'id' | 'createdAt' | 'executionHistory'>) => void;
  onCancel: () => void;
}

export function ReportScheduler({ template, onSchedule, onCancel }: ReportSchedulerProps) {
  const [formData, setFormData] = useState({
    name: `${template.name} - Automatique`,
    frequency: template.defaultFrequency || { type: 'monthly' as const, dayOfMonth: 1, time: '09:00' },
    isActive: true,
    recipients: [''],
    createdBy: 'Utilisateur Actuel'
  });

  const addRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? value : r)
    }));
  };

  const removeRecipient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateFrequency = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        [field]: value
      }
    }));
  };

  const calculateNextExecution = (): string => {
    const now = new Date();
    const [hours, minutes] = formData.frequency.time.split(':').map(Number);
    
    switch (formData.frequency.type) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(hours, minutes, 0, 0);
        return tomorrow.toISOString();
        
      case 'weekly':
        const nextWeek = new Date(now);
        const daysUntilNext = (formData.frequency.dayOfWeek || 1) - now.getDay();
        nextWeek.setDate(now.getDate() + (daysUntilNext <= 0 ? daysUntilNext + 7 : daysUntilNext));
        nextWeek.setHours(hours, minutes, 0, 0);
        return nextWeek.toISOString();
        
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(formData.frequency.dayOfMonth || 1);
        nextMonth.setHours(hours, minutes, 0, 0);
        return nextMonth.toISOString();
        
      case 'quarterly':
        const nextQuarter = new Date(now);
        nextQuarter.setMonth(nextQuarter.getMonth() + 3);
        nextQuarter.setDate(formData.frequency.dayOfMonth || 1);
        nextQuarter.setHours(hours, minutes, 0, 0);
        return nextQuarter.toISOString();
        
      case 'yearly':
        const nextYear = new Date(now);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        nextYear.setMonth((formData.frequency.monthOfYear || 1) - 1);
        nextYear.setDate(formData.frequency.dayOfMonth || 1);
        nextYear.setHours(hours, minutes, 0, 0);
        return nextYear.toISOString();
        
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Demain par défaut
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Veuillez saisir un nom pour le rapport automatique');
      return;
    }

    const validRecipients = formData.recipients.filter(r => r.trim() !== '');
    if (validRecipients.length === 0) {
      toast.error('Veuillez ajouter au moins un destinataire');
      return;
    }

    const reportData: Omit<AutomatedReport, 'id' | 'createdAt' | 'executionHistory'> = {
      templateId: template.id,
      name: formData.name,
      frequency: formData.frequency,
      isActive: formData.isActive,
      nextExecution: calculateNextExecution(),
      recipients: validRecipients,
      createdBy: formData.createdBy
    };

    onSchedule(reportData);
  };

  const getFrequencyPreview = () => {
    const nextExecution = new Date(calculateNextExecution());
    return `Prochaine exécution: ${nextExecution.toLocaleDateString('fr-FR')} à ${nextExecution.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Informations du template */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h4 className="font-medium">{template.name}</h4>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
            <Badge variant="outline">{template.frameworkType}</Badge>
            <Badge variant="outline">{template.estimatedPages} pages</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Configuration du rapport automatique */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="report-name">Nom du rapport automatique *</Label>
          <Input
            id="report-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Rapport ISO 27001 Mensuel"
          />
        </div>

        {/* Configuration de la fréquence */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fréquence d'exécution
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency-type">Type de fréquence</Label>
              <Select 
                value={formData.frequency.type} 
                onValueChange={(value: ReportFrequency['type']) => updateFrequency('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="quarterly">Trimestriel</SelectItem>
                  <SelectItem value="yearly">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequency-time" className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Heure d'exécution
              </Label>
              <Input
                id="frequency-time"
                type="time"
                value={formData.frequency.time}
                onChange={(e) => updateFrequency('time', e.target.value)}
              />
            </div>
          </div>

          {/* Options spécifiques selon la fréquence */}
          {formData.frequency.type === 'weekly' && (
            <div>
              <Label htmlFor="day-of-week">Jour de la semaine</Label>
              <Select 
                value={formData.frequency.dayOfWeek?.toString() || '1'} 
                onValueChange={(value) => updateFrequency('dayOfWeek', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Lundi</SelectItem>
                  <SelectItem value="2">Mardi</SelectItem>
                  <SelectItem value="3">Mercredi</SelectItem>
                  <SelectItem value="4">Jeudi</SelectItem>
                  <SelectItem value="5">Vendredi</SelectItem>
                  <SelectItem value="6">Samedi</SelectItem>
                  <SelectItem value="0">Dimanche</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(formData.frequency.type === 'monthly' || formData.frequency.type === 'quarterly' || formData.frequency.type === 'yearly') && (
            <div>
              <Label htmlFor="day-of-month">Jour du mois</Label>
              <Select 
                value={formData.frequency.dayOfMonth?.toString() || '1'} 
                onValueChange={(value) => updateFrequency('dayOfMonth', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.frequency.type === 'yearly' && (
            <div>
              <Label htmlFor="month-of-year">Mois</Label>
              <Select 
                value={formData.frequency.monthOfYear?.toString() || '1'} 
                onValueChange={(value) => updateFrequency('monthOfYear', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Janvier</SelectItem>
                  <SelectItem value="2">Février</SelectItem>
                  <SelectItem value="3">Mars</SelectItem>
                  <SelectItem value="4">Avril</SelectItem>
                  <SelectItem value="5">Mai</SelectItem>
                  <SelectItem value="6">Juin</SelectItem>
                  <SelectItem value="7">Juillet</SelectItem>
                  <SelectItem value="8">Août</SelectItem>
                  <SelectItem value="9">Septembre</SelectItem>
                  <SelectItem value="10">Octobre</SelectItem>
                  <SelectItem value="11">Novembre</SelectItem>
                  <SelectItem value="12">Décembre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Aperçu de la prochaine exécution */}
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-800">
              {getFrequencyPreview()}
            </p>
          </div>
        </div>

        {/* Destinataires */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Destinataires *</Label>
            <Button size="sm" variant="outline" onClick={addRecipient}>
              <Plus className="w-3 h-3 mr-1" />
              Ajouter
            </Button>
          </div>
          
          <div className="space-y-2">
            {formData.recipients.map((recipient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={recipient}
                  onChange={(e) => updateRecipient(index, e.target.value)}
                  placeholder="email@exemple.com"
                  type="email"
                  className="flex-1"
                />
                {formData.recipients.length > 1 && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => removeRecipient(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSubmit} className="flex-1">
          Programmer le rapport
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
      </div>
    </div>
  );
}
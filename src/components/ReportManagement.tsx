import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  Settings, 
  Play, 
  Pause,
  Eye,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { ReportTemplate, AutomatedReport, ReportFrequency, DEFAULT_REPORT_TEMPLATES } from '@/types/reports';
import { ReportScheduler } from './reports/ReportScheduler';
import { ISO27001Report } from './reports/ISO27001Report';
import { NISTReport } from './reports/NISTReport';
import { CISAReport } from './reports/CISAReport';
import { toast } from 'sonner';

interface ReportManagementProps {
  onBack: () => void;
}

export function ReportManagement({ onBack }: ReportManagementProps) {
  const [templates] = useState<ReportTemplate[]>(DEFAULT_REPORT_TEMPLATES);
  const [automatedReports, setAutomatedReports] = useState<AutomatedReport[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');

  const handleGenerateReport = (template: ReportTemplate) => {
    // Simulation de génération PDF
    toast.success(`Génération du rapport ${template.name} en cours...`);
    
    setTimeout(() => {
      // Simuler la création d'un fichier PDF
      const blob = new Blob(['Contenu du rapport PDF simulé'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Rapport PDF généré et téléchargé avec succès');
    }, 2000);
  };

  const handlePreviewReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleScheduleReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsSchedulerOpen(true);
  };

  const handleCreateAutomatedReport = (reportData: Omit<AutomatedReport, 'id' | 'createdAt' | 'executionHistory'>) => {
    const newReport: AutomatedReport = {
      ...reportData,
      id: `auto-report-${Date.now()}`,
      createdAt: new Date().toISOString(),
      executionHistory: []
    };
    
    setAutomatedReports(prev => [...prev, newReport]);
    setIsSchedulerOpen(false);
    toast.success('Rapport automatique programmé avec succès');
  };

  const toggleAutomatedReport = (reportId: string) => {
    setAutomatedReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, isActive: !report.isActive }
        : report
    ));
  };

  const deleteAutomatedReport = (reportId: string) => {
    setAutomatedReports(prev => prev.filter(report => report.id !== reportId));
    toast.success('Rapport automatique supprimé');
  };

  const getStatusBadge = (status: 'success' | 'failed' | 'pending') => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Succès</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Échec</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-orange-600"><Clock className="w-3 h-3 mr-1" />En cours</Badge>;
      default:
        return null;
    }
  };

  const getFrequencyText = (frequency: ReportFrequency) => {
    switch (frequency.type) {
      case 'daily':
        return `Quotidien à ${frequency.time}`;
      case 'weekly':
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return `Hebdomadaire le ${days[frequency.dayOfWeek || 1]} à ${frequency.time}`;
      case 'monthly':
        return `Mensuel le ${frequency.dayOfMonth} à ${frequency.time}`;
      case 'quarterly':
        return `Trimestriel le ${frequency.dayOfMonth} à ${frequency.time}`;
      case 'yearly':
        return `Annuel le ${frequency.dayOfMonth}/${frequency.monthOfYear} à ${frequency.time}`;
      default:
        return 'Personnalisé';
    }
  };

  const renderReportPreview = () => {
    if (!selectedTemplate) return null;

    switch (selectedTemplate.frameworkType) {
      case 'ISO27001':
        return <ISO27001Report template={selectedTemplate} />;
      case 'NIST':
        return <NISTReport template={selectedTemplate} />;
      case 'CISA':
        return <CISAReport template={selectedTemplate} />;
      default:
        return <div>Aperçu non disponible</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Rapports</h2>
          <p className="text-muted-foreground">
            Génération et automatisation des rapports par référentiel
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Modèles de Rapports</TabsTrigger>
          <TabsTrigger value="automated">Rapports Automatiques</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Modèles de rapports */}
        <TabsContent value="templates">
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.frameworkType}</Badge>
                        <Badge variant="outline">{template.estimatedPages} pages</Badge>
                        {template.isActive && (
                          <Badge variant="outline" className="text-green-600">Actif</Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground">{template.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{template.sections.length} sections</span>
                        {template.lastGenerated && (
                          <span>Dernier: {new Date(template.lastGenerated).toLocaleDateString('fr-FR')}</span>
                        )}
                        {template.defaultFrequency && (
                          <span>Fréquence suggérée: {getFrequencyText(template.defaultFrequency)}</span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {template.sections.slice(0, 4).map((section) => (
                          <Badge key={section.id} variant="secondary" className="text-xs">
                            {section.title}
                          </Badge>
                        ))}
                        {template.sections.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.sections.length - 4} autres
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewReport(template)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Aperçu
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateReport(template)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Générer PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleReport(template)}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Automatiser
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rapports automatiques */}
        <TabsContent value="automated">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Rapports Programmés</h3>
              <p className="text-sm text-muted-foreground">
                {automatedReports.filter(r => r.isActive).length} actifs sur {automatedReports.length}
              </p>
            </div>

            {automatedReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun rapport automatique configuré</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Utilisez l'onglet "Modèles" pour programmer vos premiers rapports
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rapport</TableHead>
                    <TableHead>Référentiel</TableHead>
                    <TableHead>Fréquence</TableHead>
                    <TableHead>Prochaine Exécution</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automatedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.recipients.length} destinataire{report.recipients.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {templates.find(t => t.id === report.templateId)?.frameworkType}
                        </Badge>
                      </TableCell>
                      <TableCell>{getFrequencyText(report.frequency)}</TableCell>
                      <TableCell>
                        {new Date(report.nextExecution).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={report.isActive}
                            onCheckedChange={() => toggleAutomatedReport(report.id)}
                          />
                          {report.isActive ? (
                            <Badge variant="outline" className="text-green-600">Actif</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">Inactif</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteAutomatedReport(report.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Historique des générations de rapports</p>
              <p className="text-sm text-muted-foreground mt-2">
                Les rapports générés apparaîtront ici avec leur statut et liens de téléchargement
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog d'aperçu */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Aperçu - {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Prévisualisation du rapport {selectedTemplate?.frameworkType}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {renderReportPreview()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de planification */}
      <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Programmer un Rapport Automatique</DialogTitle>
            <DialogDescription>
              Configuration de la génération automatique pour: {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <ReportScheduler
              template={selectedTemplate}
              onSchedule={handleCreateAutomatedReport}
              onCancel={() => setIsSchedulerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
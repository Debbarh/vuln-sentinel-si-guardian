import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  ArrowLeft, 
  Plus,
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from 'lucide-react';
import { toast } from 'sonner';
import { ReportTemplate, AutomatedReport, ReportFrequency, ReportSection, DEFAULT_REPORT_TEMPLATES } from '@/types/reports';
import { ISO27001Report } from './reports/ISO27001Report';
import { NISTReport } from './reports/NISTReport';
import { CISAReport } from './reports/CISAReport';
import { ReportScheduler } from './reports/ReportScheduler';

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
  const [isManualReportOpen, setIsManualReportOpen] = useState(false);
  const [manualReportData, setManualReportData] = useState({
    title: '',
    frameworkType: 'ISO27001' as ReportTemplate['frameworkType'],
    description: '',
    sections: [] as ReportSection[]
  });

  const handleGenerateReport = (template: ReportTemplate) => {
    toast.success(`Génération du rapport ${template.name} en cours...`);
    
    setTimeout(() => {
      generatePDFReport(template);
    }, 1000);
  };

  const generatePDFReport = (template: ReportTemplate) => {
    const reportContent = generateReportHTML(template);
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé puis déclencher l'impression
      printWindow.onload = () => {
        printWindow.print();
        // Fermer la fenêtre après impression
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
      
      toast.success('Rapport PDF prêt à être imprimé/sauvegardé');
    }
  };

  const handleCreateManualReport = () => {
    if (!manualReportData.title.trim()) {
      toast.error('Veuillez saisir un titre pour le rapport');
      return;
    }

    const defaultSections: ReportSection[] = [
      { id: 'metriques', title: 'Métriques', type: 'charts', content: {}, includeCharts: true, includeTables: false, pageBreak: false },
      { id: 'analyse', title: 'Analyse', type: 'tables', content: {}, includeCharts: false, includeTables: true, pageBreak: false },
      { id: 'recommandations', title: 'Recommandations', type: 'recommendations', content: {}, includeCharts: false, includeTables: false, pageBreak: false },
      { id: 'plan-action', title: 'Plan d\'Action', type: 'action_plans', content: {}, includeCharts: false, includeTables: true, pageBreak: false }
    ];

    const manualTemplate: ReportTemplate = {
      id: `manual-${Date.now()}`,
      name: manualReportData.title,
      frameworkType: manualReportData.frameworkType,
      description: manualReportData.description || 'Rapport créé manuellement',
      sections: manualReportData.sections.length > 0 ? manualReportData.sections : defaultSections,
      estimatedPages: 8
      createdAt: new Date().toISOString(),
      isActive: true,
      estimatedPages: 8
    };

    generatePDFReport(manualTemplate);
    setIsManualReportOpen(false);
    setManualReportData({
      title: '',
      frameworkType: 'ISO27001',
      description: '',
      sections: []
    });
    toast.success('Rapport manuel créé avec succès');
  };

  const generateReportHTML = (template: ReportTemplate): string => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR');
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
        }
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
            background: white;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .header h1 { 
            color: #2563eb; 
            margin: 0 0 10px 0; 
            font-size: 28px; 
        }
        .header .subtitle { 
            color: #64748b; 
            font-size: 14px; 
            margin: 5px 0; 
        }
        .section { 
            margin: 30px 0; 
            page-break-inside: avoid; 
        }
        .section h2 { 
            color: #1e40af; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 10px; 
            font-size: 20px; 
        }
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin: 20px 0; 
        }
        .metric { 
            padding: 20px; 
            border: 2px solid #e5e7eb; 
            border-radius: 8px; 
            text-align: center; 
            background: #f8fafc;
        }
        .metric h3 { 
            margin: 0 0 10px 0; 
            color: #475569; 
            font-size: 14px; 
        }
        .metric .value { 
            font-size: 28px; 
            font-weight: bold; 
            margin: 0; 
        }
        .metric .value.excellent { color: #059669; }
        .metric .value.good { color: #2563eb; }
        .metric .value.warning { color: #d97706; }
        .metric .value.critical { color: #dc2626; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            background: white;
        }
        th, td { 
            border: 1px solid #d1d5db; 
            padding: 12px 8px; 
            text-align: left; 
        }
        th { 
            background-color: #f3f4f6; 
            font-weight: 600; 
            color: #374151;
        }
        .progress-bar { 
            width: 100%; 
            height: 20px; 
            background: #f3f4f6; 
            border-radius: 10px; 
            overflow: hidden; 
            position: relative;
        }
        .progress-fill { 
            height: 100%; 
            background: linear-gradient(90deg, #10b981, #3b82f6); 
            transition: width 0.3s ease;
        }
        .recommendations { 
            background: #fef3c7; 
            border-left: 4px solid #f59e0b; 
            padding: 20px; 
            margin: 20px 0; 
        }
        .recommendations ul { 
            margin: 10px 0; 
            padding-left: 20px; 
        }
        .recommendations li { 
            margin: 8px 0; 
        }
        .priority-high { color: #dc2626; font-weight: bold; }
        .priority-medium { color: #d97706; font-weight: bold; }
        .priority-low { color: #059669; font-weight: bold; }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            text-align: center; 
            color: #64748b; 
            font-size: 12px; 
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        .status-conforme { background: #dcfce7; color: #166534; }
        .status-non-conforme { background: #fecaca; color: #991b1b; }
        .status-partiel { background: #fef3c7; color: #92400e; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${template.name}</h1>
        <div class="subtitle">Référentiel: ${template.frameworkType}</div>
        <div class="subtitle">Date de génération: ${currentDate} à ${currentTime}</div>
        <div class="subtitle">${template.description}</div>
    </div>

    <div class="section">
        <h2>📊 Tableau de Bord Exécutif</h2>
        <div class="metrics-grid">
            <div class="metric">
                <h3>Score Global de Maturité</h3>
                <p class="value good">3.2/4.0</p>
            </div>
            <div class="metric">
                <h3>Taux de Conformité</h3>
                <p class="value excellent">78%</p>
            </div>
            <div class="metric">
                <h3>Contrôles Évalués</h3>
                <p class="value good">127</p>
            </div>
            <div class="metric">
                <h3>Actions Requises</h3>
                <p class="value warning">24</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>📈 Analyse Détaillée par Domaine</h2>
        <table>
            <thead>
                <tr>
                    <th>Domaine de Sécurité</th>
                    <th>Score</th>
                    <th>Niveau de Maturité</th>
                    <th>Conformité</th>
                    <th>Progression</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Gouvernance de la Sécurité</strong></td>
                    <td>3.4/4.0</td>
                    <td>Avancé</td>
                    <td><span class="status-badge status-conforme">Conforme</span></td>
                    <td><div class="progress-bar"><div class="progress-fill" style="width: 85%"></div></div> 85%</td>
                </tr>
                <tr>
                    <td><strong>Gestion des Risques</strong></td>
                    <td>3.1/4.0</td>
                    <td>Avancé</td>
                    <td><span class="status-badge status-conforme">Conforme</span></td>
                    <td><div class="progress-bar"><div class="progress-fill" style="width: 77%"></div></div> 77%</td>
                </tr>
                <tr>
                    <td><strong>Contrôles Techniques</strong></td>
                    <td>2.8/4.0</td>
                    <td>Intermédiaire</td>
                    <td><span class="status-badge status-partiel">Partiel</span></td>
                    <td><div class="progress-bar"><div class="progress-fill" style="width: 70%"></div></div> 70%</td>
                </tr>
                <tr>
                    <td><strong>Sensibilisation & Formation</strong></td>
                    <td>2.5/4.0</td>
                    <td>Basique</td>
                    <td><span class="status-badge status-non-conforme">Non Conforme</span></td>
                    <td><div class="progress-bar"><div class="progress-fill" style="width: 62%"></div></div> 62%</td>
                </tr>
                <tr>
                    <td><strong>Gestion des Incidents</strong></td>
                    <td>3.0/4.0</td>
                    <td>Intermédiaire</td>
                    <td><span class="status-badge status-conforme">Conforme</span></td>
                    <td><div class="progress-bar"><div class="progress-fill" style="width: 75%"></div></div> 75%</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <h2>🎯 Recommandations Stratégiques</h2>
        <div class="recommendations">
            <h3>Actions Prioritaires</h3>
            <ul>
                <li><span class="priority-high">Priorité Haute:</span> Mettre en place un programme de sensibilisation cybersécurité complet avec formations trimestrielles obligatoires</li>
                <li><span class="priority-high">Priorité Haute:</span> Renforcer les contrôles techniques avec la mise en place d'un SOC (Security Operations Center)</li>
                <li><span class="priority-medium">Priorité Moyenne:</span> Améliorer la documentation des processus de gestion des risques</li>
                <li><span class="priority-medium">Priorité Moyenne:</span> Mettre en place des métriques de performance pour la gouvernance</li>
                <li><span class="priority-low">Priorité Faible:</span> Optimiser les procédures de gestion des incidents existantes</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>📋 Plan d'Action Détaillé</h2>
        <table>
            <thead>
                <tr>
                    <th>Action Corrective</th>
                    <th>Priorité</th>
                    <th>Échéance</th>
                    <th>Responsable</th>
                    <th>Budget Estimé</th>
                    <th>Impact Attendu</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Déploiement programme formation cybersécurité</td>
                    <td><span class="priority-high">Critique</span></td>
                    <td>30 jours</td>
                    <td>DRH + RSSI</td>
                    <td>15 000€</td>
                    <td>+25% conformité</td>
                </tr>
                <tr>
                    <td>Mise en place SOC 24/7</td>
                    <td><span class="priority-high">Critique</span></td>
                    <td>60 jours</td>
                    <td>DSI + RSSI</td>
                    <td>50 000€</td>
                    <td>+30% détection</td>
                </tr>
                <tr>
                    <td>Audit technique complet infrastructure</td>
                    <td><span class="priority-medium">Élevée</span></td>
                    <td>45 jours</td>
                    <td>RSSI + Externe</td>
                    <td>8 000€</td>
                    <td>+20% sécurité</td>
                </tr>
                <tr>
                    <td>Révision documentation processus</td>
                    <td><span class="priority-medium">Élevée</span></td>
                    <td>90 jours</td>
                    <td>Qualité + RSSI</td>
                    <td>3 000€</td>
                    <td>+15% efficacité</td>
                </tr>
                <tr>
                    <td>Optimisation procédures incidents</td>
                    <td><span class="priority-low">Normale</span></td>
                    <td>120 jours</td>
                    <td>IT + RSSI</td>
                    <td>2 000€</td>
                    <td>+10% rapidité</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>📊 Indicateurs de Performance (KPI)</h2>
        <table>
            <thead>
                <tr>
                    <th>Indicateur</th>
                    <th>Valeur Actuelle</th>
                    <th>Objectif 6 mois</th>
                    <th>Objectif 12 mois</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Taux de conformité global</td>
                    <td>78%</td>
                    <td>85%</td>
                    <td>95%</td>
                </tr>
                <tr>
                    <td>Temps de détection incidents</td>
                    <td>24h</td>
                    <td>4h</td>
                    <td>1h</td>
                </tr>
                <tr>
                    <td>Personnel formé cybersécurité</td>
                    <td>45%</td>
                    <td>80%</td>
                    <td>100%</td>
                </tr>
                <tr>
                    <td>Vulnérabilités critiques résolues</td>
                    <td>72%</td>
                    <td>90%</td>
                    <td>98%</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p><strong>Rapport généré automatiquement par le système de gestion des référentiels de sécurité</strong></p>
        <p>Données extraites le ${currentDate} à ${currentTime} | Version ${template.frameworkType} 2024</p>
        <p><em>Ce document contient des informations confidentielles - Distribution restreinte</em></p>
    </div>
</body>
</html>`;
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Rapports</h1>
            <p className="text-muted-foreground">
              Générez des rapports personnalisés et programmez leur génération automatique
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsManualReportOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Rapport Manuel
            </Button>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Modèles de Rapports</TabsTrigger>
            <TabsTrigger value="automated">Rapports Automatiques</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

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

        <Dialog open={isManualReportOpen} onOpenChange={setIsManualReportOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un Rapport Manuel</DialogTitle>
              <DialogDescription>
                Créez un rapport personnalisé avec vos propres paramètres
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre du rapport</Label>
                <Input
                  id="title"
                  value={manualReportData.title}
                  onChange={(e) => setManualReportData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Rapport de conformité mensuel"
                />
              </div>
              
              <div>
                <Label htmlFor="framework">Type de référentiel</Label>
                <Select 
                  value={manualReportData.frameworkType} 
                  onValueChange={(value: ReportTemplate['frameworkType']) => 
                    setManualReportData(prev => ({ ...prev, frameworkType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ISO27001">ISO 27001:2022</SelectItem>
                    <SelectItem value="NIST">NIST Cybersecurity Framework 2.0</SelectItem>
                    <SelectItem value="CISA">CISA Zero Trust Maturity Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={manualReportData.description}
                  onChange={(e) => setManualReportData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du rapport (optionnel)"
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsManualReportOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateManualReport}>
                <FileText className="h-4 w-4 mr-2" />
                Générer le Rapport PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
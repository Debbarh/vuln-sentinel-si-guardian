
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, Calendar, TrendingUp, Shield, AlertTriangle, Clock, Settings, Trash2, Edit, Play } from "lucide-react";

const ReportsPanel = () => {
  const navigate = useNavigate();
  // Fonction pour générer et télécharger le PDF
  const generatePDFReport = () => {
    const reportDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rapport de Sécurité - ${reportDate}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3B82F6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1F2937;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #6B7280;
            margin: 10px 0 0 0;
            font-size: 16px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .metric-card {
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 20px;
            background: #F9FAFB;
          }
          .metric-title {
            font-size: 14px;
            font-weight: 600;
            color: #6B7280;
            margin-bottom: 8px;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .metric-subtitle {
            font-size: 12px;
            color: #9CA3AF;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #1F2937;
            border-left: 4px solid #3B82F6;
            padding-left: 15px;
            margin-bottom: 15px;
          }
          .vulnerability-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .vulnerability-table th,
          .vulnerability-table td {
            border: 1px solid #E5E7EB;
            padding: 12px;
            text-align: left;
          }
          .vulnerability-table th {
            background-color: #F3F4F6;
            font-weight: 600;
          }
          .status-green { color: #10B981; }
          .status-blue { color: #3B82F6; }
          .status-orange { color: #F59E0B; }
          .status-red { color: #EF4444; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 12px;
          }
          .asset-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .asset-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            background: #F9FAFB;
            border-radius: 4px;
            border: 1px solid #E5E7EB;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport de Sécurité et Conformité</h1>
          <p>Généré le ${reportDate}</p>
        </div>

        <div class="section">
          <h2>📊 Métriques Clés</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">Taux de Conformité</div>
              <div class="metric-value status-green">${complianceMetrics.complianceRate}%</div>
              <div class="metric-subtitle">${complianceMetrics.compliantAssets}/${complianceMetrics.totalAssets} actifs conformes</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Temps de Résolution Moyen</div>
              <div class="metric-value status-blue">4.2 jours</div>
              <div class="metric-subtitle">Pour les vulnérabilités critiques</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Vulnérabilités Résolues</div>
              <div class="metric-value status-green">89%</div>
              <div class="metric-subtitle">Ce mois-ci</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Prochain Audit</div>
              <div class="metric-value status-orange">42 jours</div>
              <div class="metric-subtitle">${complianceMetrics.nextAudit}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🔍 Évolution des Vulnérabilités</h2>
          <table class="vulnerability-table">
            <thead>
              <tr>
                <th>Période</th>
                <th>Critiques</th>
                <th>Élevées</th>
                <th>Moyennes</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${vulnerabilityTrends.map(trend => `
                <tr>
                  <td>${trend.month}</td>
                  <td class="status-red">${trend.critiques}</td>
                  <td class="status-orange">${trend.elevees}</td>
                  <td class="status-blue">${trend.moyennes}</td>
                  <td><strong>${trend.critiques + trend.elevees + trend.moyennes}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>🛡️ Répartition des Actifs</h2>
          <div class="asset-list">
            ${assetTypes.map(asset => `
              <div class="asset-item">
                <span>${asset.name}</span>
                <strong>${asset.value}</strong>
              </div>
            `).join('')}
          </div>
          <p><strong>Total des actifs:</strong> ${assetTypes.reduce((sum, asset) => sum + asset.value, 0)}</p>
        </div>

        <div class="section">
          <h2>⏱️ Temps de Résolution par Sévérité</h2>
          <table class="vulnerability-table">
            <thead>
              <tr>
                <th>Niveau de Sévérité</th>
                <th>Temps Moyen (jours)</th>
                <th>SLA Cible</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${resolutionTime.map(item => {
                const slaTargets = { 'Critique': 3, 'Élevé': 7, 'Moyen': 14, 'Faible': 30 };
                const target = slaTargets[item.severity];
                const status = item.avgDays <= target ? 'Conforme' : 'À améliorer';
                const statusClass = item.avgDays <= target ? 'status-green' : 'status-red';
                return `
                  <tr>
                    <td>${item.severity}</td>
                    <td>${item.avgDays}</td>
                    <td>${target} jours</td>
                    <td class="${statusClass}">${status}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${scheduledReports.length > 0 ? `
        <div class="section">
          <h2>📅 Rapports Planifiés Actifs</h2>
          <table class="vulnerability-table">
            <thead>
              <tr>
                <th>Rapport</th>
                <th>Fréquence</th>
                <th>Prochaine Exécution</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${scheduledReports.filter(r => r.isActive).map(report => `
                <tr>
                  <td>${report.title}</td>
                  <td>${getFrequencyLabel(report.frequency)}</td>
                  <td>${formatNextExecution(report.nextExecution)}</td>
                  <td class="status-green">Actif</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="footer">
          <p>Rapport généré automatiquement par le système de gestion de sécurité</p>
          <p>Confidentiel - Usage interne uniquement</p>
        </div>
      </body>
      </html>
    `;

    // Créer un blob avec le contenu HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-securite-${new Date().toISOString().split('T')[0]}.html`;
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL
    window.URL.revokeObjectURL(url);

    // Note: Pour un vrai PDF, vous pourriez utiliser window.print() 
    // après avoir ouvert le contenu dans une nouvelle fenêtre
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 100);
      }
    }, 100);
  };
  // États pour la gestion des planifications
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduledReports, setScheduledReports] = useState([
    {
      id: "1",
      title: "Rapport Mensuel de Sécurité",
      type: "security",
      frequency: "monthly",
      recipients: ["admin@entreprise.com", "rssi@entreprise.com"],
      nextExecution: "2025-02-01T09:00:00",
      isActive: true,
      lastExecuted: "2025-01-01T09:00:00",
      format: "pdf"
    },
    {
      id: "2", 
      title: "Audit de Conformité",
      type: "compliance",
      frequency: "quarterly",
      recipients: ["direction@entreprise.com"],
      nextExecution: "2025-04-01T08:00:00",
      isActive: true,
      lastExecuted: "2025-01-01T08:00:00",
      format: "excel"
    }
  ]);

  // État pour le formulaire de création/édition
  const [currentSchedule, setCurrentSchedule] = useState({
    title: "",
    type: "",
    frequency: "",
    recipients: [""],
    time: "09:00",
    dayOfWeek: "",
    dayOfMonth: "1",
    format: "pdf",
    includeCharts: true,
    includeRawData: false,
    notes: ""
  });

  // Données pour les graphiques
  const vulnerabilityTrends = [
    { month: "Oct", critiques: 12, elevees: 28, moyennes: 45 },
    { month: "Nov", critiques: 8, elevees: 23, moyennes: 38 },
    { month: "Dec", critiques: 15, elevees: 31, moyennes: 42 },
    { month: "Jan", critiques: 8, elevees: 23, moyennes: 45 }
  ];

  const assetTypes = [
    { name: "Serveurs", value: 45, color: "#3B82F6" },
    { name: "Bases de données", value: 23, color: "#EF4444" },
    { name: "Applications", value: 34, color: "#10B981" },
    { name: "Réseau", value: 28, color: "#F59E0B" },
    { name: "Sécurité", value: 15, color: "#8B5CF6" }
  ];

  const resolutionTime = [
    { severity: "Critique", avgDays: 2.5 },
    { severity: "Élevé", avgDays: 5.2 },
    { severity: "Moyen", avgDays: 12.8 },
    { severity: "Faible", avgDays: 25.3 }
  ];

  const complianceMetrics = {
    totalAssets: 156,
    compliantAssets: 134,
    complianceRate: 85.9,
    lastAudit: "2024-12-15",
    nextAudit: "2025-03-15"
  };

  // Fonctions de gestion des planifications
  const handleCreateSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      title: currentSchedule.title,
      type: currentSchedule.type,
      frequency: currentSchedule.frequency,
      recipients: currentSchedule.recipients.filter(email => email.trim() !== ""),
      nextExecution: calculateNextExecution(currentSchedule),
      isActive: true,
      lastExecuted: null,
      format: currentSchedule.format
    };
    
    setScheduledReports([...scheduledReports, newSchedule]);
    setCurrentSchedule({
      title: "",
      type: "",
      frequency: "",
      recipients: [""],
      time: "09:00",
      dayOfWeek: "",
      dayOfMonth: "1", 
      format: "pdf",
      includeCharts: true,
      includeRawData: false,
      notes: ""
    });
    setIsScheduleDialogOpen(false);
  };

  const calculateNextExecution = (schedule) => {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':');
    
    switch (schedule.frequency) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return tomorrow.toISOString();
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return nextWeek.toISOString();
      case 'monthly':
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, parseInt(schedule.dayOfMonth));
        nextMonth.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return nextMonth.toISOString();
      case 'quarterly':
        const nextQuarter = new Date(now.getFullYear(), now.getMonth() + 3, 1);
        nextQuarter.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return nextQuarter.toISOString();
      default:
        return new Date().toISOString();
    }
  };

  const toggleScheduleStatus = (id) => {
    setScheduledReports(scheduledReports.map(schedule => 
      schedule.id === id ? { ...schedule, isActive: !schedule.isActive } : schedule
    ));
  };

  const deleteSchedule = (id) => {
    setScheduledReports(scheduledReports.filter(schedule => schedule.id !== id));
  };

  const addRecipient = () => {
    setCurrentSchedule({
      ...currentSchedule,
      recipients: [...currentSchedule.recipients, ""]
    });
  };

  const updateRecipient = (index, value) => {
    const newRecipients = [...currentSchedule.recipients];
    newRecipients[index] = value;
    setCurrentSchedule({
      ...currentSchedule,
      recipients: newRecipients
    });
  };

  const removeRecipient = (index) => {
    if (currentSchedule.recipients.length > 1) {
      const newRecipients = currentSchedule.recipients.filter((_, i) => i !== index);
      setCurrentSchedule({
        ...currentSchedule,
        recipients: newRecipients
      });
    }
  };

  const formatNextExecution = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: "Quotidien",
      weekly: "Hebdomadaire", 
      monthly: "Mensuel",
      quarterly: "Trimestriel"
    };
    return labels[frequency] || frequency;
  };

  const getTypeLabel = (type) => {
    const labels = {
      security: "Sécurité",
      compliance: "Conformité",
      executive: "Exécutif",
      vulnerability: "Vulnérabilités",
      audit: "Audit"
    };
    return labels[type] || type;
  };

  const navigateToReport = (type) => {
    const routes = {
      security: "/reports/security",
      compliance: "/reports/compliance",
      vulnerability: "/reports/vulnerability", 
      executive: "/reports/executive",
      audit: "/reports/audit"
    };
    navigate(routes[type] || "/dashboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rapports et Analyses</h2>
          <p className="text-gray-600">Tableaux de bord et métriques de sécurité</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Planifier Rapport
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Planifier un Rapport Automatique</DialogTitle>
                <DialogDescription>
                  Configurez la génération et l'envoi automatique de rapports
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Nom du rapport */}
                <div>
                  <Label htmlFor="title">Titre du rapport</Label>
                  <Input
                    id="title"
                    value={currentSchedule.title}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, title: e.target.value})}
                    placeholder="Ex: Rapport mensuel de sécurité"
                  />
                </div>

                {/* Type de rapport */}
                <div>
                  <Label htmlFor="type">Type de rapport</Label>
                  <Select value={currentSchedule.type} onValueChange={(value) => setCurrentSchedule({...currentSchedule, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security">Rapport de Sécurité</SelectItem>
                      <SelectItem value="compliance">Conformité ISO 27001</SelectItem>
                      <SelectItem value="vulnerability">Vulnérabilités</SelectItem>
                      <SelectItem value="executive">Tableau de Bord Exécutif</SelectItem>
                      <SelectItem value="audit">Audit et Contrôles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fréquence */}
                <div>
                  <Label htmlFor="frequency">Fréquence</Label>
                  <Select value={currentSchedule.frequency} onValueChange={(value) => setCurrentSchedule({...currentSchedule, frequency: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="quarterly">Trimestriel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Heure d'exécution */}
                <div>
                  <Label htmlFor="time">Heure d'envoi</Label>
                  <Input
                    id="time"
                    type="time"
                    value={currentSchedule.time}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, time: e.target.value})}
                  />
                </div>

                {/* Jour du mois pour mensuel */}
                {currentSchedule.frequency === 'monthly' && (
                  <div>
                    <Label htmlFor="dayOfMonth">Jour du mois</Label>
                    <Select value={currentSchedule.dayOfMonth} onValueChange={(value) => setCurrentSchedule({...currentSchedule, dayOfMonth: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Format de fichier */}
                <div>
                  <Label htmlFor="format">Format du fichier</Label>
                  <Select value={currentSchedule.format} onValueChange={(value) => setCurrentSchedule({...currentSchedule, format: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Destinataires */}
                <div>
                  <Label>Destinataires</Label>
                  <div className="space-y-2">
                    {currentSchedule.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          type="email"
                          placeholder="email@entreprise.com"
                          value={recipient}
                          onChange={(e) => updateRecipient(index, e.target.value)}
                        />
                        {currentSchedule.recipients.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeRecipient(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRecipient}
                      className="w-full"
                    >
                      + Ajouter un destinataire
                    </Button>
                  </div>
                </div>

                {/* Options du rapport */}
                <div className="space-y-3">
                  <Label>Options du rapport</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={currentSchedule.includeCharts}
                      onCheckedChange={(checked) => setCurrentSchedule({...currentSchedule, includeCharts: checked === true})}
                    />
                    <Label htmlFor="includeCharts">Inclure les graphiques</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeRawData"
                      checked={currentSchedule.includeRawData}
                      onCheckedChange={(checked) => setCurrentSchedule({...currentSchedule, includeRawData: checked === true})}
                    />
                    <Label htmlFor="includeRawData">Inclure les données brutes</Label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Commentaires ou instructions spécifiques..."
                    value={currentSchedule.notes}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateSchedule} disabled={!currentSchedule.title || !currentSchedule.type || !currentSchedule.frequency}>
                    Créer la planification
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={generatePDFReport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Métriques de conformité */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conformité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceMetrics.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.compliantAssets}/{complianceMetrics.totalAssets} actifs conformes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Temps de Résolution Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">4.2 jours</div>
            <p className="text-xs text-muted-foreground">Pour les vulnérabilités critiques</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vulnérabilités Résolues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">89%</div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prochain Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">42 jours</div>
            <p className="text-xs text-muted-foreground">{complianceMetrics.nextAudit}</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des vulnérabilités */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Évolution des Vulnérabilités
            </CardTitle>
            <CardDescription>Tendances sur les 4 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vulnerabilityTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="critiques" fill="#EF4444" name="Critiques" />
                <Bar dataKey="elevees" fill="#F59E0B" name="Élevées" />
                <Bar dataKey="moyennes" fill="#3B82F6" name="Moyennes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par type d'actif */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Répartition des Actifs
            </CardTitle>
            <CardDescription>Par catégorie dans le parc SI</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Temps de résolution par sévérité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Temps de Résolution par Sévérité
          </CardTitle>
          <CardDescription>Durée moyenne de traitement des vulnérabilités</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolutionTime} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="severity" type="category" />
              <Tooltip formatter={(value) => [`${value} jours`, "Temps moyen"]} />
              <Bar dataKey="avgDays" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rapports Planifiés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Rapports Planifiés
          </CardTitle>
          <CardDescription>Gestion des rapports automatiques programmés</CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun rapport planifié</p>
              <p className="text-sm">Cliquez sur "Planifier Rapport" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledReports.map((schedule) => (
                <div key={schedule.id} className={`border rounded-lg p-4 ${schedule.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{schedule.title}</h3>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Actif" : "Inactif"}
                        </Badge>
                        <Badge variant="outline">{getTypeLabel(schedule.type)}</Badge>
                        <Badge variant="outline">{getFrequencyLabel(schedule.frequency)}</Badge>
                        <Badge variant="outline">{schedule.format.toUpperCase()}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Prochaine exécution:</strong><br />
                          {formatNextExecution(schedule.nextExecution)}
                        </div>
                        <div>
                          <strong>Destinataires:</strong><br />
                          {schedule.recipients.join(", ")}
                        </div>
                        <div>
                          <strong>Dernière exécution:</strong><br />
                          {schedule.lastExecuted ? formatNextExecution(schedule.lastExecuted) : "Jamais"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToReport(schedule.type)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Voir le rapport
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleScheduleStatus(schedule.id)}
                        className={schedule.isActive ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                      >
                        {schedule.isActive ? (
                          <>
                            <Settings className="h-4 w-4 mr-1" />
                            Suspendre
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Activer
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rapports pré-définis */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports Pré-définis</CardTitle>
          <CardDescription>Rapports standardisés pour les audits et la direction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <h3 className="font-semibold mb-2">Rapport Mensuel de Sécurité</h3>
              <p className="text-sm text-gray-600 mb-3">
                Vue d'ensemble des vulnérabilités traitées et du niveau de sécurité global
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Mensuel</Badge>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Générer
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <h3 className="font-semibold mb-2">Rapport de Conformité</h3>
              <p className="text-sm text-gray-600 mb-3">
                État de conformité aux standards de sécurité (ISO 27001, NIST)
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Trimestriel</Badge>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Générer
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <h3 className="font-semibold mb-2">Tableau de Bord Exécutif</h3>
              <p className="text-sm text-gray-600 mb-3">
                Métriques clés et indicateurs de risque pour la direction
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Hebdomadaire</Badge>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Générer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPanel;

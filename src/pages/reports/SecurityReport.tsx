import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, TrendingUp, Shield, AlertTriangle, Server, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const SecurityReport = () => {
  const navigate = useNavigate();

  // Données du rapport de sécurité
  const securityMetrics = {
    globalRiskScore: 7.2,
    riskEvolution: -0.5,
    totalAssets: 156,
    criticalAssetsOutdated: 12,
    internetExposedAssets: 8
  };

  const vulnerabilitiesByGravity = [
    { severity: "Critique", count: 8, color: "#EF4444" },
    { severity: "Élevée", count: 23, color: "#F59E0B" },
    { severity: "Moyenne", count: 45, color: "#3B82F6" },
    { severity: "Faible", count: 67, color: "#10B981" }
  ];

  const assetTypes = [
    { name: "Serveurs", value: 45, critical: 8 },
    { name: "Bases de données", value: 23, critical: 5 },
    { name: "Applications", value: 34, critical: 3 },
    { name: "Réseau", value: 28, critical: 2 },
    { name: "Sécurité", value: 15, critical: 1 }
  ];

  const recentAlerts = [
    {
      id: "CERT-FR-2025-ALE-001",
      title: "Vulnérabilité critique dans Apache Struts",
      severity: "Critique",
      date: "2025-01-15",
      impactedAssets: 3
    },
    {
      id: "MACERT-2025-002",
      title: "Campagne de phishing ciblée",
      severity: "Élevée", 
      date: "2025-01-12",
      impactedAssets: 0
    }
  ];

  const correctiveActions = [
    { action: "Mise à jour Apache Struts", status: "En cours", deadline: "2025-01-20", responsible: "Équipe Infrastructure" },
    { action: "Patch Windows Server 2019", status: "Terminé", deadline: "2025-01-10", responsible: "Équipe DevOps" },
    { action: "Configuration firewall DMZ", status: "Planifié", deadline: "2025-01-25", responsible: "Équipe Réseau" }
  ];

  const suspiciousEvents = [
    { timestamp: "2025-01-15 14:32", event: "Tentative de connexion SSH répétée", source: "192.168.1.100", action: "Bloqué" },
    { timestamp: "2025-01-14 09:15", event: "Accès non autorisé tenté", source: "External IP", action: "Alerté" }
  ];

  const generateSecurityPDF = () => {
    const reportDate = new Date().toLocaleDateString('fr-FR');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rapport de Sécurité - ${reportDate}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
          .header { text-align: center; border-bottom: 3px solid #EF4444; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #1F2937; margin: 0; font-size: 28px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #1F2937; border-left: 4px solid #EF4444; padding-left: 15px; }
          .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
          .metric-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; background: #F9FAFB; }
          .metric-value { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
          .critical { color: #EF4444; }
          .warning { color: #F59E0B; }
          .success { color: #10B981; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #E5E7EB; padding: 10px; text-align: left; }
          th { background-color: #F3F4F6; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛡️ Rapport de Sécurité</h1>
          <p>Vue globale de la posture de sécurité du SI - ${reportDate}</p>
        </div>

        <div class="section">
          <h2>📊 Résumé Exécutif</h2>
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-value critical">${securityMetrics.globalRiskScore}/10</div>
              <div>Score de risque global</div>
            </div>
            <div class="metric-card">
              <div class="metric-value ${securityMetrics.riskEvolution < 0 ? 'success' : 'critical'}">${securityMetrics.riskEvolution > 0 ? '+' : ''}${securityMetrics.riskEvolution}</div>
              <div>Évolution vs mois précédent</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${securityMetrics.totalAssets}</div>
              <div>Actifs totaux</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🎯 Actifs Critiques</h2>
          <table>
            <thead>
              <tr><th>Type d'actif</th><th>Total</th><th>Critiques non à jour</th><th>Statut</th></tr>
            </thead>
            <tbody>
              ${assetTypes.map(asset => `
                <tr>
                  <td>${asset.name}</td>
                  <td>${asset.value}</td>
                  <td class="${asset.critical > 0 ? 'critical' : 'success'}">${asset.critical}</td>
                  <td class="${asset.critical > 0 ? 'critical' : 'success'}">${asset.critical > 0 ? 'À surveiller' : 'Conforme'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>⚠️ Vulnérabilités par Gravité</h2>
          <table>
            <thead>
              <tr><th>Sévérité</th><th>Nombre</th><th>Priorité</th></tr>
            </thead>
            <tbody>
              ${vulnerabilitiesByGravity.map(vuln => `
                <tr>
                  <td>${vuln.severity}</td>
                  <td class="${vuln.severity === 'Critique' ? 'critical' : vuln.severity === 'Élevée' ? 'warning' : ''}">${vuln.count}</td>
                  <td>${vuln.severity === 'Critique' ? 'Immédiate' : vuln.severity === 'Élevée' ? '< 7 jours' : '< 30 jours'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>🌐 Alertes CERT-FR/MACERT Récentes</h2>
          <table>
            <thead>
              <tr><th>ID</th><th>Titre</th><th>Sévérité</th><th>Date</th><th>Actifs impactés</th></tr>
            </thead>
            <tbody>
              ${recentAlerts.map(alert => `
                <tr>
                  <td>${alert.id}</td>
                  <td>${alert.title}</td>
                  <td class="${alert.severity === 'Critique' ? 'critical' : 'warning'}">${alert.severity}</td>
                  <td>${alert.date}</td>
                  <td>${alert.impactedAssets}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>🔧 Actions Correctives</h2>
          <table>
            <thead>
              <tr><th>Action</th><th>Statut</th><th>Échéance</th><th>Responsable</th></tr>
            </thead>
            <tbody>
              ${correctiveActions.map(action => `
                <tr>
                  <td>${action.action}</td>
                  <td class="${action.status === 'Terminé' ? 'success' : action.status === 'En cours' ? 'warning' : ''}">${action.status}</td>
                  <td>${action.deadline}</td>
                  <td>${action.responsible}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-securite-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 100);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 mr-3 text-red-500" />
                Rapport de Sécurité
              </h1>
              <p className="text-gray-600">Vue globale de la posture de sécurité du SI</p>
            </div>
          </div>
          <Button onClick={generateSecurityPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>

        {/* Résumé exécutif */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Résumé Exécutif
            </CardTitle>
            <CardDescription>Niveau de risque global et évolution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{securityMetrics.globalRiskScore}/10</div>
                <div className="text-sm text-gray-600">Score de risque global</div>
                <Badge variant="destructive" className="mt-2">Risque élevé</Badge>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${securityMetrics.riskEvolution < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {securityMetrics.riskEvolution > 0 ? '+' : ''}{securityMetrics.riskEvolution}
                </div>
                <div className="text-sm text-gray-600">Évolution vs mois précédent</div>
                <Badge variant={securityMetrics.riskEvolution < 0 ? "default" : "destructive"} className="mt-2">
                  {securityMetrics.riskEvolution < 0 ? 'Amélioration' : 'Dégradation'}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{securityMetrics.totalAssets}</div>
                <div className="text-sm text-gray-600">Actifs totaux</div>
                <Badge variant="outline" className="mt-2">Inventaire complet</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actifs critiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Actifs Critiques
            </CardTitle>
            <CardDescription>Répartition par type et statut de mise à jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Type d'actif</th>
                    <th className="text-left p-3">Total</th>
                    <th className="text-left p-3">Critiques non à jour</th>
                    <th className="text-left p-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {assetTypes.map((asset, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 font-medium">{asset.name}</td>
                      <td className="p-3">{asset.value}</td>
                      <td className="p-3">
                        <span className={asset.critical > 0 ? "text-red-600 font-semibold" : "text-green-600"}>
                          {asset.critical}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={asset.critical > 0 ? "destructive" : "default"}>
                          {asset.critical > 0 ? 'À surveiller' : 'Conforme'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Vulnérabilités par gravité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Vulnérabilités par Gravité
            </CardTitle>
            <CardDescription>Distribution des vulnérabilités ouvertes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {vulnerabilitiesByGravity.map((vuln, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: vuln.color}}></div>
                      <span className="font-medium">{vuln.severity}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{color: vuln.color}}>{vuln.count}</div>
                      <div className="text-sm text-gray-500">
                        {vuln.severity === 'Critique' ? 'Immédiate' : 
                         vuln.severity === 'Élevée' ? '< 7 jours' : '< 30 jours'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={vulnerabilitiesByGravity}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {vulnerabilitiesByGravity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Périmètre exposé */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Périmètre Exposé à Internet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-orange-600 mb-4">{securityMetrics.internetExposedAssets}</div>
              <div className="text-lg text-gray-600 mb-4">Actifs exposés à Internet</div>
              <Badge variant="secondary" className="text-lg px-4 py-2">Surveillance renforcée requise</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Alertes récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Alertes Récentes CERT-FR / MACERT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-blue-600">{alert.id}</span>
                    <Badge variant={alert.severity === 'Critique' ? "destructive" : "secondary"}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{alert.title}</h3>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Date: {alert.date}</span>
                    <span>Actifs impactés: {alert.impactedAssets}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions correctives */}
        <Card>
          <CardHeader>
            <CardTitle>Statut des Actions Correctives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Action</th>
                    <th className="text-left p-3">Statut</th>
                    <th className="text-left p-3">Échéance</th>
                    <th className="text-left p-3">Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {correctiveActions.map((action, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{action.action}</td>
                      <td className="p-3">
                        <Badge variant={
                          action.status === 'Terminé' ? "default" :
                          action.status === 'En cours' ? "secondary" : "outline"
                        }>
                          {action.status}
                        </Badge>
                      </td>
                      <td className="p-3">{action.deadline}</td>
                      <td className="p-3">{action.responsible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Événements suspects */}
        <Card>
          <CardHeader>
            <CardTitle>Événements Suspects Récents</CardTitle>
            <CardDescription>Détection SIEM et actions automatiques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suspiciousEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                  <div>
                    <div className="font-medium">{event.event}</div>
                    <div className="text-sm text-gray-600">Source: {event.source} - {event.timestamp}</div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {event.action}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityReport;
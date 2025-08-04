import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, CheckCircle, AlertCircle, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ComplianceReport = () => {
  const navigate = useNavigate();

  const isoDomainsCompliance = [
    { domain: "A.5", name: "Politiques de sécurité", compliance: 95, controls: 2, implemented: 2, partial: 0, notImplemented: 0 },
    { domain: "A.6", name: "Organisation de la sécurité", compliance: 85, controls: 7, implemented: 6, partial: 1, notImplemented: 0 },
    { domain: "A.7", name: "Sécurité des RH", compliance: 90, controls: 6, implemented: 5, partial: 1, notImplemented: 0 },
    { domain: "A.8", name: "Gestion des actifs", compliance: 75, controls: 10, implemented: 7, partial: 2, notImplemented: 1 },
    { domain: "A.9", name: "Contrôle d'accès", compliance: 80, controls: 14, implemented: 11, partial: 2, notImplemented: 1 },
    { domain: "A.10", name: "Cryptographie", compliance: 70, controls: 2, implemented: 1, partial: 1, notImplemented: 0 },
    { domain: "A.11", name: "Sécurité physique", compliance: 85, controls: 15, implemented: 12, partial: 2, notImplemented: 1 },
    { domain: "A.12", name: "Sécurité exploitation", compliance: 78, controls: 7, implemented: 5, partial: 1, notImplemented: 1 },
    { domain: "A.13", name: "Sécurité communications", compliance: 82, controls: 7, implemented: 5, partial: 2, notImplemented: 0 },
    { domain: "A.14", name: "Acquisition et développement", compliance: 88, controls: 3, implemented: 2, partial: 1, notImplemented: 0 }
  ];

  const criticalAssets = [
    { asset: "Serveur AD Principal", requirements: ["A.9.1.1", "A.9.2.1", "A.11.1.1"], status: "Conforme", lastAudit: "2025-01-10" },
    { asset: "Base CRM", requirements: ["A.8.1.1", "A.9.4.1", "A.10.1.1"], status: "Partiel", lastAudit: "2025-01-08" },
    { asset: "Serveur Mail", requirements: ["A.13.1.1", "A.13.2.1"], status: "Non conforme", lastAudit: "2025-01-05" }
  ];

  const evidenceCollected = [
    { type: "Journaux d'audit", count: 156, lastUpdate: "2025-01-15" },
    { type: "Scans de vulnérabilités", count: 23, lastUpdate: "2025-01-14" },
    { type: "Configurations système", count: 87, lastUpdate: "2025-01-13" },
    { type: "Procédures documentées", count: 34, lastUpdate: "2025-01-12" }
  ];

  const nonCompliances = [
    {
      id: "NC-2025-001",
      control: "A.8.1.1",
      description: "Inventaire des actifs incomplet",
      severity: "Majeure",
      dateIdentified: "2025-01-10",
      status: "En cours",
      deadline: "2025-02-10"
    },
    {
      id: "NC-2025-002", 
      control: "A.10.1.1",
      description: "Politique de chiffrement non appliquée",
      severity: "Critique",
      dateIdentified: "2025-01-08",
      status: "Planifié",
      deadline: "2025-01-30"
    }
  ];

  const correctiveActions = [
    {
      action: "Mise à jour inventaire des actifs",
      control: "A.8.1.1",
      responsible: "Équipe Infrastructure",
      deadline: "2025-02-10",
      progress: 60
    },
    {
      action: "Implémentation politique de chiffrement",
      control: "A.10.1.1", 
      responsible: "RSSI",
      deadline: "2025-01-30",
      progress: 25
    }
  ];

  const generateCompliancePDF = () => {
    const reportDate = new Date().toLocaleDateString('fr-FR');
    const overallCompliance = Math.round(isoDomainsCompliance.reduce((sum, domain) => sum + domain.compliance, 0) / isoDomainsCompliance.length);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rapport de Conformité ISO 27001 - ${reportDate}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
          .header { text-align: center; border-bottom: 3px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #1F2937; margin: 0; font-size: 28px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #1F2937; border-left: 4px solid #3B82F6; padding-left: 15px; }
          .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
          .metric-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; background: #F9FAFB; text-align: center; }
          .metric-value { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .compliant { color: #10B981; }
          .partial { color: #F59E0B; }
          .non-compliant { color: #EF4444; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #E5E7EB; padding: 10px; text-align: left; }
          th { background-color: #F3F4F6; font-weight: 600; }
          .progress-bar { background: #E5E7EB; border-radius: 10px; height: 8px; overflow: hidden; }
          .progress-fill { height: 100%; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Rapport de Conformité ISO 27001</h1>
          <p>Évaluation de la conformité aux contrôles de l'Annexe A - ${reportDate}</p>
        </div>

        <div class="section">
          <h2>📊 Résumé de Conformité Globale</h2>
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-value compliant">${overallCompliance}%</div>
              <div>Conformité globale</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${isoDomainsCompliance.length}</div>
              <div>Domaines évalués</div>
            </div>
            <div class="metric-card">
              <div class="metric-value non-compliant">${nonCompliances.length}</div>
              <div>Non-conformités actives</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🎯 Conformité par Domaine ISO 27001</h2>
          <table>
            <thead>
              <tr>
                <th>Domaine</th>
                <th>Nom</th>
                <th>Conformité</th>
                <th>Implémenté</th>
                <th>Partiel</th>
                <th>Non implémenté</th>
              </tr>
            </thead>
            <tbody>
              ${isoDomainsCompliance.map(domain => `
                <tr>
                  <td><strong>${domain.domain}</strong></td>
                  <td>${domain.name}</td>
                  <td class="${domain.compliance >= 90 ? 'compliant' : domain.compliance >= 70 ? 'partial' : 'non-compliant'}">${domain.compliance}%</td>
                  <td class="compliant">${domain.implemented}</td>
                  <td class="partial">${domain.partial}</td>
                  <td class="non-compliant">${domain.notImplemented}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>🏢 Cartographie Actifs Critiques vs Exigences ISO</h2>
          <table>
            <thead>
              <tr><th>Actif</th><th>Contrôles requis</th><th>Statut</th><th>Dernier audit</th></tr>
            </thead>
            <tbody>
              ${criticalAssets.map(asset => `
                <tr>
                  <td><strong>${asset.asset}</strong></td>
                  <td>${asset.requirements.join(', ')}</td>
                  <td class="${asset.status === 'Conforme' ? 'compliant' : asset.status === 'Partiel' ? 'partial' : 'non-compliant'}">${asset.status}</td>
                  <td>${asset.lastAudit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>📁 Preuves Collectées</h2>
          <table>
            <thead>
              <tr><th>Type de preuve</th><th>Nombre</th><th>Dernière mise à jour</th></tr>
            </thead>
            <tbody>
              ${evidenceCollected.map(evidence => `
                <tr>
                  <td>${evidence.type}</td>
                  <td><strong>${evidence.count}</strong></td>
                  <td>${evidence.lastUpdate}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>⚠️ Non-conformités Identifiées</h2>
          <table>
            <thead>
              <tr><th>ID</th><th>Contrôle</th><th>Description</th><th>Sévérité</th><th>Statut</th><th>Échéance</th></tr>
            </thead>
            <tbody>
              ${nonCompliances.map(nc => `
                <tr>
                  <td><strong>${nc.id}</strong></td>
                  <td>${nc.control}</td>
                  <td>${nc.description}</td>
                  <td class="${nc.severity === 'Critique' ? 'non-compliant' : 'partial'}">${nc.severity}</td>
                  <td>${nc.status}</td>
                  <td>${nc.deadline}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>🔧 Actions Correctives Planifiées</h2>
          <table>
            <thead>
              <tr><th>Action</th><th>Contrôle</th><th>Responsable</th><th>Échéance</th><th>Progrès</th></tr>
            </thead>
            <tbody>
              ${correctiveActions.map(action => `
                <tr>
                  <td>${action.action}</td>
                  <td><strong>${action.control}</strong></td>
                  <td>${action.responsible}</td>
                  <td>${action.deadline}</td>
                  <td>${action.progress}%</td>
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
    link.download = `rapport-conformite-iso27001-${new Date().toISOString().split('T')[0]}.html`;
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

  const overallCompliance = Math.round(isoDomainsCompliance.reduce((sum, domain) => sum + domain.compliance, 0) / isoDomainsCompliance.length);

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
                <FileText className="h-8 w-8 mr-3 text-blue-500" />
                Conformité ISO 27001
              </h1>
              <p className="text-gray-600">Évaluation de la conformité aux contrôles de l'Annexe A</p>
            </div>
          </div>
          <Button onClick={generateCompliancePDF}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>

        {/* Résumé global */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé de Conformité Globale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">{overallCompliance}%</div>
                <div className="text-lg text-gray-600">Conformité globale</div>
                <Badge variant="default" className="mt-2">En progression</Badge>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">{isoDomainsCompliance.length}</div>
                <div className="text-lg text-gray-600">Domaines évalués</div>
                <Badge variant="outline" className="mt-2">Annexe A complète</Badge>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-red-600 mb-2">{nonCompliances.length}</div>
                <div className="text-lg text-gray-600">Non-conformités actives</div>
                <Badge variant="destructive" className="mt-2">Traitement prioritaire</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conformité par domaine */}
        <Card>
          <CardHeader>
            <CardTitle>Niveau de Conformité par Domaine ISO 27001</CardTitle>
            <CardDescription>Statut de mise en œuvre des mesures de sécurité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={isoDomainsCompliance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="compliance" fill="#3B82F6" name="Taux de conformité %" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Domaine</th>
                      <th className="text-left p-3">Nom</th>
                      <th className="text-left p-3">Conformité</th>
                      <th className="text-left p-3">Implémenté</th>
                      <th className="text-left p-3">Partiel</th>
                      <th className="text-left p-3">Non implémenté</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isoDomainsCompliance.map((domain, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 font-mono font-bold">{domain.domain}</td>
                        <td className="p-3">{domain.name}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  domain.compliance >= 90 ? 'bg-green-500' :
                                  domain.compliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{width: `${domain.compliance}%`}}
                              ></div>
                            </div>
                            <span className="font-semibold">{domain.compliance}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {domain.implemented}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {domain.partial}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="destructive" className="bg-red-100 text-red-800">
                            {domain.notImplemented}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cartographie actifs critiques */}
        <Card>
          <CardHeader>
            <CardTitle>Cartographie des Actifs Critiques vs Exigences ISO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Actif</th>
                    <th className="text-left p-3">Contrôles requis</th>
                    <th className="text-left p-3">Statut</th>
                    <th className="text-left p-3">Dernier audit</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalAssets.map((asset, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 font-semibold">{asset.asset}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {asset.requirements.map(req => (
                            <Badge key={req} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={
                          asset.status === 'Conforme' ? "default" :
                          asset.status === 'Partiel' ? "secondary" : "destructive"
                        }>
                          {asset.status === 'Conforme' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {asset.status === 'Partiel' && <Clock className="w-3 h-3 mr-1" />}
                          {asset.status === 'Non conforme' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {asset.status}
                        </Badge>
                      </td>
                      <td className="p-3">{asset.lastAudit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Preuves collectées */}
        <Card>
          <CardHeader>
            <CardTitle>Preuves Collectées</CardTitle>
            <CardDescription>Documentation et journaux d'audit disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evidenceCollected.map((evidence, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{evidence.type}</h3>
                    <Badge variant="outline">{evidence.count}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Dernière mise à jour: {evidence.lastUpdate}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Non-conformités */}
        <Card>
          <CardHeader>
            <CardTitle>Écarts Identifiés / Non-conformités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nonCompliances.map((nc, index) => (
                <div key={index} className="border rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-red-800">{nc.id} - {nc.control}</h3>
                      <p className="text-gray-700">{nc.description}</p>
                    </div>
                    <Badge variant={nc.severity === 'Critique' ? "destructive" : "secondary"}>
                      {nc.severity}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Identifié le: {nc.dateIdentified}</span>
                    <span>Échéance: {nc.deadline}</span>
                    <Badge variant="outline">{nc.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions correctives */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Correctives Planifiées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {correctiveActions.map((action, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{action.action}</h3>
                      <p className="text-sm text-gray-600">Contrôle: {action.control} | Responsable: {action.responsible}</p>
                    </div>
                    <Badge variant="outline">Échéance: {action.deadline}</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${action.progress}%`}}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Progrès: {action.progress}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplianceReport;
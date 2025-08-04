import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, CheckCircle, User, Calendar, ExternalLink, Info, Shield, Target, AlertCircle, CheckSquare, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import TreatmentProcedureModal from "./TreatmentProcedureModal";

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: "critique" | "élevé" | "moyen" | "faible";
  status: "ouvert" | "en_cours" | "en_attente" | "resolu";
  asset: string;
  cve: string;
  assignedTo?: string;
  createdDate: string;
  dueDate?: string;
  source: string;
  cvssScore?: number;
  affectedSystems?: string[];
  vulnerability?: {
    impact: string;
    exploitability: string;
    solution: string;
    references: string[];
  };
  timeline?: Array<{
    date: string;
    action: string;
    user: string;
    status: string;
  }>;
}

const AlertsPanel = () => {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedAlertForDetails, setSelectedAlertForDetails] = useState<Alert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      title: "Vulnérabilité critique Apache Struts RCE",
      description: "Une vulnérabilité d'exécution de code à distance a été découverte dans Apache Struts 2.5.30 et versions antérieures.",
      severity: "critique",
      status: "ouvert",
      asset: "Serveur Web Production",
      cve: "CVE-2025-0001",
      createdDate: "2025-01-02",
      dueDate: "2025-01-04",
      source: "DGSSI MaCERT",
      cvssScore: 9.8,
      affectedSystems: ["Serveur Web Production", "Application intranet"],
      vulnerability: {
        impact: "Un attaquant peut exécuter du code arbitraire à distance sur le serveur affecté, compromettant ainsi l'intégrité, la confidentialité et la disponibilité du système.",
        exploitability: "L'exploitation de cette vulnérabilité est simple et ne nécessite aucune authentification. Des exploits publics sont disponibles.",
        solution: "Mettre à jour Apache Struts vers la version 2.5.31 ou supérieure. En attendant, désactiver les plugins vulnérables ou implémenter des règles de filtrage au niveau du pare-feu applicatif.",
        references: [
          "https://struts.apache.org/docs/s2-066.html",
          "https://nvd.nist.gov/vuln/detail/CVE-2025-0001",
          "https://www.cert.ssi.gouv.fr/alerte/CERTFR-2025-ALE-001/"
        ]
      },
      timeline: [
        {
          date: "2025-01-02",
          action: "Vulnérabilité détectée et alerte créée",
          user: "Système automatique",
          status: "ouvert"
        }
      ]
    },
    {
      id: 2,
      title: "Mise à jour sécurité Windows Server disponible",
      description: "Microsoft a publié des correctifs de sécurité pour Windows Server 2022.",
      severity: "élevé",
      status: "en_cours",
      asset: "Contrôleur de domaine",
      cve: "CVE-2025-0002",
      assignedTo: "Équipe Infrastructure",
      createdDate: "2025-01-02",
      dueDate: "2025-01-07",
      source: "DGSSI MaCERT",
      cvssScore: 7.5,
      affectedSystems: ["Contrôleur de domaine", "Serveurs de fichiers"],
      vulnerability: {
        impact: "Élévation de privilèges possible permettant à un utilisateur local d'obtenir des droits administrateur.",
        exploitability: "L'exploitation nécessite un accès local au système. Aucun exploit public connu à ce jour.",
        solution: "Appliquer les mises à jour de sécurité Microsoft KB5034441 et redémarrer les systèmes affectés.",
        references: [
          "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-0002",
          "https://support.microsoft.com/kb/5034441"
        ]
      },
      timeline: [
        {
          date: "2025-01-02",
          action: "Vulnérabilité détectée",
          user: "Système automatique",
          status: "ouvert"
        },
        {
          date: "2025-01-02",
          action: "Assignée à l'équipe Infrastructure",
          user: "Admin RSSI",
          status: "en_cours"
        },
        {
          date: "2025-01-03",
          action: "Analyse d'impact en cours",
          user: "Équipe Infrastructure",
          status: "en_cours"
        }
      ]
    },
    {
      id: 3,
      title: "Vulnérabilité Oracle Database",
      description: "Faille de sécurité permettant une élévation de privilèges dans Oracle Database 19c.",
      severity: "moyen",
      status: "en_attente",
      asset: "Base de données RH",
      cve: "CVE-2025-0003",
      assignedTo: "Admin Base de données",
      createdDate: "2025-01-01",
      dueDate: "2025-01-10",
      source: "DGSSI MaCERT"
    },
    {
      id: 4,
      title: "Correctif Cisco ASA appliqué avec succès",
      description: "Le correctif de sécurité pour Cisco ASA a été installé et testé.",
      severity: "élevé",
      status: "resolu",
      asset: "Firewall Principal",
      cve: "CVE-2024-9999",
      assignedTo: "Équipe Sécurité",
      createdDate: "2024-12-28",
      source: "DGSSI MaCERT"
    }
  ]);

  const handleTreatAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = (alertId: number, status: string, assignedTo?: string, comments?: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: status as Alert["status"], assignedTo }
          : alert
      )
    );
  };

  const handleShowDetails = (alert: Alert) => {
    setSelectedAlertForDetails(alert);
    setIsDetailsOpen(true);
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "ouvert": return 10;
      case "en_cours": return 50;
      case "en_attente": return 75;
      case "resolu": return 100;
      default: return 0;
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case "ouvert": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "en_cours": return <Clock className="h-4 w-4 text-blue-500" />;
      case "en_attente": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "resolu": return <CheckSquare className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critique": return "destructive";
      case "élevé": return "secondary";
      case "moyen": return "outline";
      case "faible": return "default";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ouvert": return "bg-red-100 text-red-800";
      case "en_cours": return "bg-blue-100 text-blue-800";
      case "en_attente": return "bg-yellow-100 text-yellow-800";
      case "resolu": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ouvert": return <AlertTriangle className="h-4 w-4" />;
      case "en_cours": return <Clock className="h-4 w-4" />;
      case "en_attente": return <Clock className="h-4 w-4" />;
      case "resolu": return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ouvert": return "Ouvert";
      case "en_cours": return "En cours";
      case "en_attente": return "En attente";
      case "resolu": return "Résolu";
      default: return status;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const severityMatch = filterSeverity === "all" || alert.severity === filterSeverity;
    const statusMatch = filterStatus === "all" || alert.status === filterStatus;
    return severityMatch && statusMatch;
  });

  const alertStats = {
    total: alerts.length,
    open: alerts.filter(a => a.status === "ouvert").length,
    inProgress: alerts.filter(a => a.status === "en_cours").length,
    resolved: alerts.filter(a => a.status === "resolu").length
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Alertes</h2>
        <p className="text-gray-600">Suivi et traitement des vulnérabilités détectées</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ouvertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertStats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{alertStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Résolues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{alertStats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Sévérité</label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="critique">Critique</SelectItem>
                  <SelectItem value="élevé">Élevé</SelectItem>
                  <SelectItem value="moyen">Moyen</SelectItem>
                  <SelectItem value="faible">Faible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Statut</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="ouvert">Ouvert</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="resolu">Résolu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des alertes */}
      <Card>
        <CardHeader>
          <CardTitle>Alertes de Sécurité</CardTitle>
          <CardDescription>
            {filteredAlerts.length} alerte(s) affichée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                      {getStatusIcon(alert.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{alert.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {alert.createdDate}
                        </span>
                        {alert.assignedTo && (
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {alert.assignedTo}
                          </span>
                        )}
                        <span className="flex items-center">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          {alert.source}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.status)}`}>
                      {getStatusLabel(alert.status)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-4 text-sm">
                    <span><strong>Actif:</strong> {alert.asset}</span>
                    <span><strong>CVE:</strong> {alert.cve}</span>
                    {alert.dueDate && (
                      <span><strong>Échéance:</strong> {alert.dueDate}</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShowDetails(alert)}
                    >
                      Détails
                    </Button>
                    {alert.status !== "resolu" && (
                      <Button 
                        size="sm"
                        onClick={() => handleTreatAlert(alert)}
                      >
                        Traiter
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog des détails */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Détails de la vulnérabilité</span>
            </DialogTitle>
            <DialogDescription>
              Informations complètes et état d'avancement du traitement
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlertForDetails && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedAlertForDetails.title}</h3>
                    <p className="text-gray-600">{selectedAlertForDetails.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">CVE:</span>
                      <span className="font-mono text-sm">{selectedAlertForDetails.cve}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Actif affecté:</span>
                      <span>{selectedAlertForDetails.asset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Source:</span>
                      <span>{selectedAlertForDetails.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date de création:</span>
                      <span>{selectedAlertForDetails.createdDate}</span>
                    </div>
                    {selectedAlertForDetails.dueDate && (
                      <div className="flex justify-between">
                        <span className="font-medium">Échéance:</span>
                        <span className="text-red-600 font-medium">{selectedAlertForDetails.dueDate}</span>
                      </div>
                    )}
                    {selectedAlertForDetails.assignedTo && (
                      <div className="flex justify-between">
                        <span className="font-medium">Assigné à:</span>
                        <span>{selectedAlertForDetails.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">État d'avancement</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Progression</span>
                        <span className="text-sm font-medium">{getProgressPercentage(selectedAlertForDetails.status)}%</span>
                      </div>
                      <Progress value={getProgressPercentage(selectedAlertForDetails.status)} className="h-2" />
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSeverityColor(selectedAlertForDetails.severity)}>
                          {selectedAlertForDetails.severity.toUpperCase()}
                        </Badge>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedAlertForDetails.status)}`}>
                          {getStatusLabel(selectedAlertForDetails.status)}
                        </span>
                        {selectedAlertForDetails.cvssScore && (
                          <Badge variant="outline">
                            CVSS: {selectedAlertForDetails.cvssScore}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedAlertForDetails.affectedSystems && (
                    <div>
                      <h4 className="font-semibold mb-2">Systèmes affectés</h4>
                      <ul className="space-y-1">
                        {selectedAlertForDetails.affectedSystems.map((system, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <Target className="h-3 w-3 text-red-500" />
                            <span>{system}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Détails techniques */}
              {selectedAlertForDetails.vulnerability && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Analyse technique</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          {selectedAlertForDetails.vulnerability.impact}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Exploitabilité</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          {selectedAlertForDetails.vulnerability.exploitability}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Solution recommandée</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          {selectedAlertForDetails.vulnerability.solution}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedAlertForDetails.vulnerability.references && (
                    <div>
                      <h5 className="font-medium mb-2">Références externes</h5>
                      <ul className="space-y-1">
                        {selectedAlertForDetails.vulnerability.references.map((ref, index) => (
                          <li key={index}>
                            <a 
                              href={ref} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>{ref}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              {selectedAlertForDetails.timeline && (
                <div>
                  <h4 className="font-semibold text-lg mb-4">Historique des actions</h4>
                  <div className="space-y-3">
                    {selectedAlertForDetails.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                        <div className="flex-shrink-0 mt-1">
                          {getTimelineIcon(event.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">{event.action}</p>
                              <p className="text-xs text-gray-500">par {event.user}</p>
                            </div>
                            <span className="text-xs text-gray-500">{event.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Bouton de traitement dans les détails */}
              {selectedAlertForDetails.status !== "resolu" && (
                <div className="flex justify-center pt-4 border-t">
                  <Button 
                    onClick={() => {
                      setIsDetailsOpen(false);
                      handleTreatAlert(selectedAlertForDetails);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Target className="h-4 w-4" />
                    <span>Traiter cette vulnérabilité</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <TreatmentProcedureModal
        alert={selectedAlert}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default AlertsPanel;

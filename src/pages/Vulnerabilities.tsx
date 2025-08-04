import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  ChevronRight,
  Calendar,
  Server,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

const Vulnerabilities = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Données d'exemple des vulnérabilités
  const vulnerabilities = [
    {
      id: "CVE-2024-0001",
      title: "SQL Injection dans module authentification",
      description: "Vulnérabilité permettant l'injection de code SQL malveillant dans les requêtes d'authentification",
      severity: "critical",
      status: "open",
      cvssScore: 9.8,
      affectedAssets: ["web-app-prod", "web-app-staging"],
      discoveryDate: "2024-01-15",
      source: "MaCERT",
      category: "Web Application"
    },
    {
      id: "CVE-2024-0002", 
      title: "Buffer Overflow dans service réseau",
      description: "Débordement de tampon pouvant permettre l'exécution de code arbitraire",
      severity: "high",
      status: "in-progress",
      cvssScore: 7.5,
      affectedAssets: ["network-service-1"],
      discoveryDate: "2024-01-12",
      source: "Scan interne",
      category: "Network Service"
    },
    {
      id: "CVE-2024-0003",
      title: "Cross-Site Scripting (XSS) réfléchi",
      description: "Vulnérabilité XSS permettant l'injection de scripts malveillants",
      severity: "medium",
      status: "resolved",
      cvssScore: 6.1,
      affectedAssets: ["web-portal"],
      discoveryDate: "2024-01-10",
      source: "Test de pénétration",
      category: "Web Application"
    },
    {
      id: "CVE-2024-0004",
      title: "Configuration SSL/TLS faible",
      description: "Utilisation de protocoles et chiffrements obsolètes",
      severity: "low",
      status: "open",
      cvssScore: 3.7,
      affectedAssets: ["mail-server", "ftp-server"],
      discoveryDate: "2024-01-08",
      source: "Audit de sécurité",
      category: "Configuration"
    },
    {
      id: "CVE-2024-0005",
      title: "Privilege Escalation dans OS",
      description: "Possibilité d'élévation de privilèges sur le système d'exploitation",
      severity: "high",
      status: "in-progress",
      cvssScore: 8.4,
      affectedAssets: ["server-db-01", "server-app-02"],
      discoveryDate: "2024-01-05",
      source: "MaCERT",
      category: "Operating System"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800";
      case "in-progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <XCircle className="h-4 w-4" />;
      case "high": return <AlertTriangle className="h-4 w-4" />;
      case "medium": return <Clock className="h-4 w-4" />;
      case "low": return <Shield className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesSearch = vuln.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vuln.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vuln.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "all" || vuln.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || vuln.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case "open": return "Ouvert";
      case "in-progress": return "En cours";
      case "resolved": return "Résolu";
      default: return status;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "critical": return "Critique";
      case "high": return "Élevé";
      case "medium": return "Moyen";
      case "low": return "Faible";
      default: return severity;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">VulnGuard</span>
              </Link>
              <ChevronRight className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-medium text-gray-700">Vulnérabilités</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost">Tableau de bord</Button>
              </Link>
              <Link to="/login">
                <Button>Se connecter</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Vulnérabilités
              </h1>
              <p className="text-gray-600">
                Surveillez et traitez les vulnérabilités de votre infrastructure
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Nouveau scan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="container mx-auto px-6 py-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Rechercher une vulnérabilité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sévérité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes sévérités</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="low">Faible</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="open">Ouvert</SelectItem>
                    <SelectItem value="in-progress">En cours</SelectItem>
                    <SelectItem value="resolved">Résolu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {vulnerabilities.filter(v => v.severity === "critical").length}
                  </p>
                  <p className="text-sm text-gray-600">Critiques</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-4">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {vulnerabilities.filter(v => v.severity === "high").length}
                  </p>
                  <p className="text-sm text-gray-600">Élevées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {vulnerabilities.filter(v => v.status === "in-progress").length}
                  </p>
                  <p className="text-sm text-gray-600">En cours</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {vulnerabilities.filter(v => v.status === "resolved").length}
                  </p>
                  <p className="text-sm text-gray-600">Résolues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des vulnérabilités */}
        <div className="space-y-4">
          {filteredVulnerabilities.map((vulnerability) => (
            <Card key={vulnerability.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${getSeverityColor(vulnerability.severity)}`}>
                          {getSeverityIcon(vulnerability.severity)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {vulnerability.title}
                          </h3>
                          <Badge className={getSeverityColor(vulnerability.severity)}>
                            {getSeverityText(vulnerability.severity)}
                          </Badge>
                          <Badge className={getStatusColor(vulnerability.status)}>
                            {getStatusText(vulnerability.status)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {vulnerability.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">ID:</span>
                            <span>{vulnerability.id}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Score CVSS:</span>
                            <span className="font-semibold text-gray-900">{vulnerability.cvssScore}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{vulnerability.discoveryDate}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Globe className="h-4 w-4" />
                            <span>{vulnerability.source}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Server className="h-4 w-4" />
                        <span>{vulnerability.affectedAssets.length} actif(s) affecté(s)</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVulnerabilities.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune vulnérabilité trouvée
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche ou vos filtres.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Vulnerabilities;
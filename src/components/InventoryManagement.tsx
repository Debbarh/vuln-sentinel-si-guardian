import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Server, Database, Globe, Router, Smartphone, Edit, Trash2, Monitor, Shield, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: number;
  name: string;
  type: "Système d'exploitation" | "Logiciel ou application" | "Matériel / Équipement réseau ou sécurité" | "Service web ou applicatif" | "Base de données" | "Composant embarqué" | "Développement spécifique";
  criticality: "Faible" | "Moyenne" | "Haute";
  status: "actif" | "maintenance" | "inactif";
  environment?: "Prod" | "Préprod" | "Dev";
  
  // Champs communs
  version?: string;
  manufacturer?: string;
  cpe?: string;
  
  // Système d'exploitation
  architecture?: "32 bits" | "64 bits";
  language?: string;
  associatedServer?: string;
  
  // Logiciel/Application
  softwareType?: "Bureau" | "Serveur" | "Plugin" | "Mobile";
  hostSystem?: string;
  vendor?: string;
  impactedUsers?: string;
  
  // Matériel
  model?: string;
  firmwareVersion?: string;
  role?: "Switch" | "Firewall" | "Routeur" | "Autre";
  ipAddress?: string;
  externalExposure?: "oui" | "non";
  installationDate?: string;
  
  // Service web
  url?: string;
  technologies?: string;
  frameworks?: string;
  requiresAuth?: "oui" | "non";
  linkedServer?: string;
  owaspScan?: "oui" | "non";
  
  // Base de données
  sgbd?: string;
  usedPort?: string;
  strongAuth?: "oui" | "non";
  
  // Composant embarqué
  hardwareName?: string;
  deviceType?: "caméra" | "imprimante" | "IoT" | "autre";
  brand?: string;
  networkExposure?: "oui" | "non";
  adminAccess?: "oui" | "non";
  
  // Développement spécifique
  appType?: "Web" | "Mobile" | "API" | "Script";
  languages?: string;
  dependencies?: string;
  authentication?: "Oui" | "Non" | "OAuth" | "SSO";
  securityScan?: "oui" | "non";
  knownVulnerabilities?: string;
  hostingServer?: string;
  exposure?: "Internet" | "Interne uniquement";
}

const InventoryManagement = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: 1,
      name: "Serveur Web Production",
      type: "Système d'exploitation",
      manufacturer: "Microsoft",
      version: "2022",
      criticality: "Haute",
      status: "actif",
      environment: "Prod"
    },
    {
      id: 2,
      name: "Base de données RH",
      type: "Base de données",
      sgbd: "Oracle Database",
      version: "19c",
      criticality: "Haute",
      status: "actif",
      environment: "Prod"
    },
    {
      id: 3,
      name: "Firewall Principal",
      type: "Matériel / Équipement réseau ou sécurité",
      manufacturer: "Cisco",
      model: "ASA",
      firmwareVersion: "9.14",
      criticality: "Haute",
      status: "actif",
      role: "Firewall"
    }
  ]);

  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: "",
    type: undefined,
    criticality: "Faible",
    status: "actif",
    environment: "Dev"
  });

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Système d'exploitation": return <Monitor className="h-4 w-4" />;
      case "Logiciel ou application": return <Code className="h-4 w-4" />;
      case "Matériel / Équipement réseau ou sécurité": return <Shield className="h-4 w-4" />;
      case "Service web ou applicatif": return <Globe className="h-4 w-4" />;
      case "Base de données": return <Database className="h-4 w-4" />;
      case "Composant embarqué": return <Router className="h-4 w-4" />;
      case "Développement spécifique": return <Code className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "Haute": return "destructive";
      case "Moyenne": return "secondary";
      case "Faible": return "outline";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "actif": return "bg-green-100 text-green-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      case "inactif": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddAsset = () => {
    if (newAsset.name && newAsset.type) {
      const asset: Asset = {
        id: Math.max(...assets.map(a => a.id), 0) + 1,
        name: newAsset.name!,
        type: newAsset.type!,
        criticality: newAsset.criticality!,
        status: newAsset.status!,
        ...newAsset
      };
      
      setAssets([...assets, asset]);
      setNewAsset({
        name: "",
        type: undefined,
        criticality: "Faible",
        status: "actif",
        environment: "Dev"
      });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteAsset = (id: number) => {
    setAssets(assets.filter(asset => asset.id !== id));
    toast({
      title: "Actif supprimé",
      description: "L'actif a été supprimé avec succès de l'inventaire.",
    });
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset({ ...asset });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAsset = () => {
    if (editingAsset) {
      setAssets(assets.map(asset => 
        asset.id === editingAsset.id ? editingAsset : asset
      ));
      setEditingAsset(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Actif modifié",
        description: "L'actif a été mis à jour avec succès.",
      });
    }
  };

  const renderSpecificFields = (currentAsset = newAsset, setCurrentAsset = setNewAsset) => {
    if (!currentAsset.type) return null;

    switch (currentAsset.type) {
      case "Système d'exploitation":
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="version" className="text-right">Version</Label>
              <Input
                id="version"
                value={currentAsset.version || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, version: e.target.value})}
                className="col-span-3"
                placeholder="ex: 22.04 LTS, 2019"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="architecture" className="text-right">Architecture</Label>
              <Select onValueChange={(value) => setCurrentAsset({...currentAsset, architecture: value as "32 bits" | "64 bits"})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner l'architecture" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="32 bits">32 bits</SelectItem>
                  <SelectItem value="64 bits">64 bits</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="language" className="text-right">Langue</Label>
              <Input
                id="language"
                value={currentAsset.language || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, language: e.target.value})}
                className="col-span-3"
                placeholder="ex: Français, Anglais"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="associatedServer" className="text-right">Serveur associé</Label>
              <Input
                id="associatedServer"
                value={currentAsset.associatedServer || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, associatedServer: e.target.value})}
                className="col-span-3"
                placeholder="ex: SRV-PROD-01"
              />
            </div>
          </>
        );

      case "Logiciel ou application":
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="version" className="text-right">Version</Label>
              <Input
                id="version"
                value={currentAsset.version || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, version: e.target.value})}
                className="col-span-3"
                placeholder="ex: 1.2.3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="softwareType" className="text-right">Type</Label>
              <Select onValueChange={(value) => setCurrentAsset({...currentAsset, softwareType: value as "Bureau" | "Serveur" | "Plugin" | "Mobile"})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bureau">Bureau</SelectItem>
                  <SelectItem value="Serveur">Serveur</SelectItem>
                  <SelectItem value="Plugin">Plugin</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendor" className="text-right">Fournisseur/Éditeur</Label>
              <Input
                id="vendor"
                value={currentAsset.vendor || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, vendor: e.target.value})}
                className="col-span-3"
                placeholder="ex: Microsoft, Adobe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hostSystem" className="text-right">Système hôte</Label>
              <Input
                id="hostSystem"
                value={currentAsset.hostSystem || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, hostSystem: e.target.value})}
                className="col-span-3"
                placeholder="ex: Windows 11, Ubuntu 22.04"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="impactedUsers" className="text-right">Utilisateurs impactés</Label>
              <Input
                id="impactedUsers"
                value={currentAsset.impactedUsers || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, impactedUsers: e.target.value})}
                className="col-span-3"
                placeholder="ex: 50 utilisateurs, Équipe RH"
              />
            </div>
          </>
        );

      case "Matériel / Équipement réseau ou sécurité":
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manufacturer" className="text-right">Fabricant/Marque</Label>
              <Input
                id="manufacturer"
                value={currentAsset.manufacturer || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, manufacturer: e.target.value})}
                className="col-span-3"
                placeholder="ex: Cisco, HP, Fortinet"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">Modèle</Label>
              <Input
                id="model"
                value={currentAsset.model || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, model: e.target.value})}
                className="col-span-3"
                placeholder="ex: ASA 5516-X"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firmwareVersion" className="text-right">Version firmware/OS</Label>
              <Input
                id="firmwareVersion"
                value={currentAsset.firmwareVersion || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, firmwareVersion: e.target.value})}
                className="col-span-3"
                placeholder="ex: 9.14.2"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Rôle</Label>
              <Select onValueChange={(value) => setCurrentAsset({...currentAsset, role: value as "Switch" | "Firewall" | "Routeur" | "Autre"})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner le rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Switch">Switch</SelectItem>
                  <SelectItem value="Firewall">Firewall</SelectItem>
                  <SelectItem value="Routeur">Routeur</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ipAddress" className="text-right">Adresse IP/Accès admin</Label>
              <Input
                id="ipAddress"
                value={currentAsset.ipAddress || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, ipAddress: e.target.value})}
                className="col-span-3"
                placeholder="ex: 192.168.1.1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="externalExposure" className="text-right">Exposition externe</Label>
              <RadioGroup
                value={currentAsset.externalExposure}
                onValueChange={(value) => setCurrentAsset({...currentAsset, externalExposure: value as "oui" | "non"})}
                className="col-span-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="oui" id="ext-oui" />
                  <Label htmlFor="ext-oui">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non" id="ext-non" />
                  <Label htmlFor="ext-non">Non</Label>
                </div>
              </RadioGroup>
            </div>
          </>
        );

      case "Service web ou applicatif":
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">URL/IP publique</Label>
              <Input
                id="url"
                value={currentAsset.url || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, url: e.target.value})}
                className="col-span-3"
                placeholder="ex: https://app.monentreprise.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="technologies" className="text-right">Technologies utilisées</Label>
              <Input
                id="technologies"
                value={currentAsset.technologies || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, technologies: e.target.value})}
                className="col-span-3"
                placeholder="ex: PHP, Node.js, React"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frameworks" className="text-right">Frameworks/dépendances</Label>
              <Textarea
                id="frameworks"
                value={currentAsset.frameworks || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, frameworks: e.target.value})}
                className="col-span-3"
                placeholder="ex: Laravel 9.0, Express.js"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requiresAuth" className="text-right">Authentification requise</Label>
              <RadioGroup
                value={currentAsset.requiresAuth}
                onValueChange={(value) => setCurrentAsset({...currentAsset, requiresAuth: value as "oui" | "non"})}
                className="col-span-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="oui" id="auth-oui" />
                  <Label htmlFor="auth-oui">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non" id="auth-non" />
                  <Label htmlFor="auth-non">Non</Label>
                </div>
              </RadioGroup>
            </div>
          </>
        );

      case "Base de données":
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sgbd" className="text-right">Nom du SGBD</Label>
              <Input
                id="sgbd"
                value={currentAsset.sgbd || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, sgbd: e.target.value})}
                className="col-span-3"
                placeholder="ex: MySQL, PostgreSQL, Oracle"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="version" className="text-right">Version exacte</Label>
              <Input
                id="version"
                value={currentAsset.version || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, version: e.target.value})}
                className="col-span-3"
                placeholder="ex: 8.0.32, 14.7"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usedPort" className="text-right">Port utilisé</Label>
              <Input
                id="usedPort"
                value={currentAsset.usedPort || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, usedPort: e.target.value})}
                className="col-span-3"
                placeholder="ex: 3306, 5432"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="strongAuth" className="text-right">Authentification forte</Label>
              <RadioGroup
                value={currentAsset.strongAuth}
                onValueChange={(value) => setCurrentAsset({...currentAsset, strongAuth: value as "oui" | "non"})}
                className="col-span-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="oui" id="strong-oui" />
                  <Label htmlFor="strong-oui">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non" id="strong-non" />
                  <Label htmlFor="strong-non">Non</Label>
                </div>
              </RadioGroup>
            </div>
          </>
        );

      case "Composant embarqué":
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hardwareName" className="text-right">Nom du matériel</Label>
              <Input
                id="hardwareName"
                value={currentAsset.hardwareName || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, hardwareName: e.target.value})}
                className="col-span-3"
                placeholder="ex: Caméra IP Bureau 1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deviceType" className="text-right">Type</Label>
              <Select onValueChange={(value) => setCurrentAsset({...currentAsset, deviceType: value as "caméra" | "imprimante" | "IoT" | "autre"})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caméra">Caméra</SelectItem>
                  <SelectItem value="imprimante">Imprimante</SelectItem>
                  <SelectItem value="IoT">IoT</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">Marque/modèle</Label>
              <Input
                id="brand"
                value={currentAsset.brand || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, brand: e.target.value})}
                className="col-span-3"
                placeholder="ex: Hikvision DS-2CD2"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="version" className="text-right">Version firmware</Label>
              <Input
                id="version"
                value={currentAsset.version || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, version: e.target.value})}
                className="col-span-3"
                placeholder="ex: V5.7.3"
              />
            </div>
          </>
        );

      case "Développement spécifique":
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appType" className="text-right">Type</Label>
              <Select onValueChange={(value) => setCurrentAsset({...currentAsset, appType: value as "Web" | "Mobile" | "API" | "Script"})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web">Web</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="Script">Script</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">URL/domaine</Label>
              <Input
                id="url"
                value={currentAsset.url || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, url: e.target.value})}
                className="col-span-3"
                placeholder="ex: https://portail-rh.monentreprise.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="languages" className="text-right">Langages utilisés</Label>
              <Input
                id="languages"
                value={currentAsset.languages || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, languages: e.target.value})}
                className="col-span-3"
                placeholder="ex: Python, PHP, JavaScript"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frameworks" className="text-right">Framework(s)</Label>
              <Input
                id="frameworks"
                value={currentAsset.frameworks || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, frameworks: e.target.value})}
                className="col-span-3"
                placeholder="ex: Django, Laravel, React"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dependencies" className="text-right">Dépendances tierces</Label>
              <Textarea
                id="dependencies"
                value={currentAsset.dependencies || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, dependencies: e.target.value})}
                className="col-span-3"
                placeholder="Fichier requirements.txt, package.json..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="version" className="text-right">Version</Label>
              <Input
                id="version"
                value={currentAsset.version || ""}
                onChange={(e) => setCurrentAsset({...currentAsset, version: e.target.value})}
                className="col-span-3"
                placeholder="ex: v1.2.0, commit abc123"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="authentication" className="text-right">Authentification/Rôles</Label>
              <Select onValueChange={(value) => setCurrentAsset({...currentAsset, authentication: value as "Oui" | "Non" | "OAuth" | "SSO"})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner le type d'auth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="Non">Non</SelectItem>
                  <SelectItem value="OAuth">OAuth</SelectItem>
                  <SelectItem value="SSO">SSO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exposure" className="text-right">Exposition</Label>
              <Select onValueChange={(value) => setCurrentAsset({...currentAsset, exposure: value as "Internet" | "Interne uniquement"})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner l'exposition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Internet">Internet</SelectItem>
                  <SelectItem value="Interne uniquement">Interne uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion d'Inventaire SI</h2>
          <p className="text-gray-600">Gérez les composants de votre système d'information</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Actif
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un Nouvel Actif</DialogTitle>
              <DialogDescription>
                Renseignez les informations de l'actif à ajouter à votre inventaire SI.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Champs communs */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nom</Label>
                <Input
                  id="name"
                  value={newAsset.name || ""}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  className="col-span-3"
                  placeholder="ex: Serveur Web Production"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type d'actif</Label>
                <Select onValueChange={(value) => setNewAsset({...newAsset, type: value as Asset["type"]})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Système d'exploitation">Système d'exploitation</SelectItem>
                    <SelectItem value="Logiciel ou application">Logiciel ou application</SelectItem>
                    <SelectItem value="Matériel / Équipement réseau ou sécurité">Matériel / Équipement réseau ou sécurité</SelectItem>
                    <SelectItem value="Service web ou applicatif">Service web ou applicatif</SelectItem>
                    <SelectItem value="Base de données">Base de données</SelectItem>
                    <SelectItem value="Composant embarqué">Composant embarqué</SelectItem>
                    <SelectItem value="Développement spécifique">Développement spécifique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="environment" className="text-right">Environnement</Label>
                <Select onValueChange={(value) => setNewAsset({...newAsset, environment: value as "Prod" | "Préprod" | "Dev"})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner l'environnement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prod">Production</SelectItem>
                    <SelectItem value="Préprod">Pré-production</SelectItem>
                    <SelectItem value="Dev">Développement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="criticality" className="text-right">Criticité</Label>
                <Select onValueChange={(value) => setNewAsset({...newAsset, criticality: value as "Faible" | "Moyenne" | "Haute"})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner la criticité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Haute">Haute</SelectItem>
                    <SelectItem value="Moyenne">Moyenne</SelectItem>
                    <SelectItem value="Faible">Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Statut de l'actif</Label>
                <Select onValueChange={(value) => setNewAsset({...newAsset, status: value as "actif" | "maintenance" | "inactif"})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="maintenance">En maintenance</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cpe" className="text-right">CPE (optionnel)</Label>
                <Input
                  id="cpe"
                  value={newAsset.cpe || ""}
                  onChange={(e) => setNewAsset({...newAsset, cpe: e.target.value})}
                  className="col-span-3"
                  placeholder="ex: cpe:2.3:a:vendor:product:version"
                />
              </div>

              {/* Champs spécifiques selon le type */}
              {renderSpecificFields()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddAsset}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de modification */}
        {editingAsset && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Modifier l'Actif</DialogTitle>
                <DialogDescription>
                  Modifiez les informations de l'actif sélectionné.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Champs communs */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Nom</Label>
                  <Input
                    id="edit-name"
                    value={editingAsset.name || ""}
                    onChange={(e) => setEditingAsset({...editingAsset, name: e.target.value})}
                    className="col-span-3"
                    placeholder="ex: Serveur Web Production"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-type" className="text-right">Type d'actif</Label>
                  <Select value={editingAsset.type} onValueChange={(value) => setEditingAsset({...editingAsset, type: value as Asset["type"]})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Système d'exploitation">Système d'exploitation</SelectItem>
                      <SelectItem value="Logiciel ou application">Logiciel ou application</SelectItem>
                      <SelectItem value="Matériel / Équipement réseau ou sécurité">Matériel / Équipement réseau ou sécurité</SelectItem>
                      <SelectItem value="Service web ou applicatif">Service web ou applicatif</SelectItem>
                      <SelectItem value="Base de données">Base de données</SelectItem>
                      <SelectItem value="Composant embarqué">Composant embarqué</SelectItem>
                      <SelectItem value="Développement spécifique">Développement spécifique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-environment" className="text-right">Environnement</Label>
                  <Select value={editingAsset.environment} onValueChange={(value) => setEditingAsset({...editingAsset, environment: value as "Prod" | "Préprod" | "Dev"})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner l'environnement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prod">Production</SelectItem>
                      <SelectItem value="Préprod">Pré-production</SelectItem>
                      <SelectItem value="Dev">Développement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-criticality" className="text-right">Criticité</Label>
                  <Select value={editingAsset.criticality} onValueChange={(value) => setEditingAsset({...editingAsset, criticality: value as "Faible" | "Moyenne" | "Haute"})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner la criticité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Haute">Haute</SelectItem>
                      <SelectItem value="Moyenne">Moyenne</SelectItem>
                      <SelectItem value="Faible">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">Statut de l'actif</Label>
                  <Select value={editingAsset.status} onValueChange={(value) => setEditingAsset({...editingAsset, status: value as "actif" | "maintenance" | "inactif"})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="maintenance">En maintenance</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-cpe" className="text-right">CPE (optionnel)</Label>
                  <Input
                    id="edit-cpe"
                    value={editingAsset.cpe || ""}
                    onChange={(e) => setEditingAsset({...editingAsset, cpe: e.target.value})}
                    className="col-span-3"
                    placeholder="ex: cpe:2.3:a:vendor:product:version"
                  />
                </div>

                {/* Champs spécifiques selon le type */}
                {renderSpecificFields(editingAsset, setEditingAsset)}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateAsset}>Mettre à jour</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actifs Critiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {assets.filter(a => a.criticality === "Haute").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actifs Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {assets.filter(a => a.status === "actif").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des actifs */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire des Actifs</CardTitle>
          <CardDescription>
            Liste complète des composants de votre système d'information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    {getTypeIcon(asset.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{asset.name}</h3>
                    <p className="text-sm text-gray-600">
                      {asset.manufacturer || asset.vendor || asset.sgbd || asset.brand} {asset.version && `v${asset.version}`}
                    </p>
                    <p className="text-xs text-gray-500">{asset.type} • {asset.environment}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getCriticalityColor(asset.criticality)}>
                    {asset.criticality.toUpperCase()}
                  </Badge>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditAsset(asset)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet actif ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. L'actif "{asset.name}" sera définitivement supprimé de votre inventaire.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
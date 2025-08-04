import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, User, Calendar, AlertTriangle, Settings, PlayCircle, FileText, Paperclip, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import WorkflowManager from "../components/WorkflowManager";
import CustomWorkflowModal from "../components/CustomWorkflowModal";
import ManualProcedureModal from "../components/ManualProcedureModal";

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
}

const TreatmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [activeTab, setActiveTab] = useState("workflow");
  const [currentStep, setCurrentStep] = useState(1);
  const [newStatus, setNewStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [comments, setComments] = useState("");
  const [actionTaken, setActionTaken] = useState("");

  const treatmentSteps = [
    {
      step: 1,
      title: "Évaluation initiale",
      description: "Analyser la vulnérabilité et son impact",
      actions: [
        "Vérifier l'authenticité de la vulnérabilité",
        "Évaluer l'impact sur les systèmes",
        "Confirmer les actifs affectés",
        "Consulter les bases de données de vulnérabilités"
      ]
    },
    {
      step: 2,
      title: "Classification et priorisation",
      description: "Définir le niveau de priorité et les ressources nécessaires",
      actions: [
        "Confirmer le niveau de sévérité",
        "Évaluer l'urgence du traitement",
        "Déterminer les ressources requises",
        "Planifier la fenêtre de maintenance"
      ]
    },
    {
      step: 3,
      title: "Plan d'action",
      description: "Élaborer la stratégie de remédiation",
      actions: [
        "Identifier les correctifs disponibles",
        "Préparer un plan de rollback",
        "Définir les tests de validation",
        "Coordonner avec les équipes concernées"
      ]
    },
    {
      step: 4,
      title: "Implémentation",
      description: "Appliquer les mesures correctives",
      actions: [
        "Appliquer les correctifs/mises à jour",
        "Configurer les mesures de protection",
        "Tester la fonctionnalité des systèmes",
        "Documenter les changements effectués"
      ]
    },
    {
      step: 5,
      title: "Validation et clôture",
      description: "Vérifier l'efficacité et finaliser le traitement",
      actions: [
        "Effectuer les tests de sécurité",
        "Valider la correction de la vulnérabilité",
        "Mettre à jour la documentation",
        "Clôturer l'alerte avec rapport final"
      ]
    }
  ];

  const [showCustomWorkflow, setShowCustomWorkflow] = useState(false);
  const [showManualProcedure, setShowManualProcedure] = useState(false);

  useEffect(() => {
    // Récupérer les données de l'alerte depuis les paramètres d'URL
    const alertData = searchParams.get('alert');
    if (alertData) {
      try {
        const parsedAlert = JSON.parse(decodeURIComponent(alertData));
        setAlert(parsedAlert);
      } catch (error) {
        console.error('Erreur lors du parsing des données de l\'alerte:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de l'alerte",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  const handleStepComplete = () => {
    if (currentStep < treatmentSteps.length) {
      setCurrentStep(currentStep + 1);
      toast({
        title: "Étape complétée",
        description: `Étape ${currentStep} complétée`,
      });
    }
  };

  const handleWorkflowStart = (workflowId: string) => {
    toast({
      title: "Workflow démarré",
      description: `Workflow ${workflowId} démarré avec succès`,
    });
    if (alert) {
      onStatusUpdate(alert.id, "en_cours", assignedTo, "Workflow de traitement démarré");
    }
  };

  const handleTaskComplete = (executionId: string, taskId: string, comments: string) => {
    toast({
      title: "Tâche terminée",
      description: `Tâche ${taskId} terminée`,
    });
  };

  const onStatusUpdate = (alertId: number, status: string, assignedTo?: string, comments?: string) => {
    // Ici vous pouvez implémenter la logique de mise à jour du statut
    console.log('Status update:', { alertId, status, assignedTo, comments });
  };

  const handleFinalSubmit = () => {
    if (!newStatus || !assignedTo) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (alert) {
      onStatusUpdate(alert.id, newStatus, assignedTo, comments);
      toast({
        title: "Succès",
        description: "Procédure de traitement terminée avec succès",
      });
      navigate('/dashboard');
    }
  };

  const handleCustomWorkflowSave = (steps: any[]) => {
    if (alert) {
      onStatusUpdate(alert.id, "en_cours", "Workflow personnalisé", "Workflow personnalisé créé et démarré");
    }
    setShowCustomWorkflow(false);
  };

  const handleManualProcedureComplete = (steps: any[]) => {
    if (alert) {
      onStatusUpdate(alert.id, "resolu", "Procédure manuelle", "Procédure manuelle terminée");
    }
    setShowManualProcedure(false);
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

  const getAssetType = (asset: string) => {
    if (asset.toLowerCase().includes('serveur')) return 'Serveur';
    if (asset.toLowerCase().includes('base')) return 'Base de données';
    if (asset.toLowerCase().includes('firewall')) return 'Sécurité';
    return 'Serveur'; // default
  };

  if (!alert) return null;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* En-tête avec bouton de retour */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au tableau de bord</span>
          </Button>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h1 className="text-2xl font-bold">Traitement de Vulnérabilité - Alerte #{alert.id}</h1>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Informations de l'alerte */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{alert.title}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={getSeverityColor(alert.severity)}>
                {alert.severity.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-500">CVE: {alert.cve}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Actif:</strong> {alert.asset}</div>
              <div><strong>Source:</strong> {alert.source}</div>
              <div><strong>Date création:</strong> {alert.createdDate}</div>
              {alert.dueDate && <div><strong>Échéance:</strong> {alert.dueDate}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Onglets de traitement */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workflow">Workflow Personnalisé</TabsTrigger>
            <TabsTrigger value="manual">Procédure Manuelle</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Workflow Personnalisé</span>
                </CardTitle>
                <CardDescription>
                  Créez et personnalisez votre workflow basé sur la procédure manuelle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-800">
                    Le workflow personnalisé vous permet de récupérer automatiquement la procédure manuelle 
                    et de la modifier selon vos besoins : ajouter/supprimer des étapes, assigner des responsables, 
                    ajouter des notes et des pièces jointes.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setShowCustomWorkflow(true)}
                    size="lg"
                    className="flex items-center space-x-2"
                  >
                    <PlayCircle className="h-5 w-5" />
                    <span>Démarrer le workflow personnalisé</span>
                  </Button>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-sm">Fonctionnalités disponibles:</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Récupération automatique de la procédure manuelle</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Modification des étapes (ajouter/supprimer)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Assignment de responsables par étape</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Ajout de notes et pièces jointes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Suivi en temps réel de l'avancement</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Procédure Manuelle</span>
                </CardTitle>
                <CardDescription>
                  Exécution de la procédure manuelle standard avec responsables et documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <p className="text-sm text-green-800">
                    La procédure manuelle vous permet d'exécuter les étapes standard avec la possibilité 
                    d'assigner des responsables, d'ajouter des notes et des pièces jointes pour chaque étape.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setShowManualProcedure(true)}
                    size="lg"
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <PlayCircle className="h-5 w-5" />
                    <span>Démarrer la procédure manuelle</span>
                  </Button>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-sm">Étapes de la procédure:</h4>
                  <div className="space-y-2">
                    {treatmentSteps.map((step) => (
                      <div key={step.step} className="flex items-center space-x-3 p-3 border rounded">
                        <Badge variant="outline">Étape {step.step}</Badge>
                        <div>
                          <p className="font-medium text-sm">{step.title}</p>
                          <p className="text-xs text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-sm">Fonctionnalités disponibles:</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span>Assignment de responsables par étape</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span>Ajout de notes d'exécution</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-blue-500" />
                      <span>Gestion des pièces jointes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Suivi de progression étape par étape</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modaux pour les workflows */}
      <CustomWorkflowModal
        isOpen={showCustomWorkflow}
        onClose={() => setShowCustomWorkflow(false)}
        alertId={alert.id}
        alertTitle={alert.title}
        onWorkflowSave={handleCustomWorkflowSave}
      />

      <ManualProcedureModal
        isOpen={showManualProcedure}
        onClose={() => setShowManualProcedure(false)}
        alertId={alert.id}
        alertTitle={alert.title}
        onProcedureComplete={handleManualProcedureComplete}
      />
    </div>
  );
};

export default TreatmentPage;
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, BarChart3, FileText, Target } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { FrameworkManagement } from "@/components/FrameworkManagement";
import { AssessmentManagement } from "@/components/AssessmentManagement";
import { toast } from "sonner";

const MaturityAssessment = () => {
  const [activeTab, setActiveTab] = useState("frameworks");

  const handleGenerateReport = () => {
    toast.success("Génération du rapport en cours...");
  };

  const renderResultsDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Global</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.8/4</div>
            <p className="text-xs text-muted-foreground">Niveau de maturité</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Évaluations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Terminées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plans d'Action</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformité</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Taux global</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble des Référentiels</CardTitle>
          <CardDescription>
            État de la maturité par référentiel de sécurité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">ISO 27001:2022</h3>
                <div className="text-sm text-muted-foreground">Score: 3.2/4</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">NIST Cybersecurity Framework</h3>
                <div className="text-sm text-muted-foreground">Score: 2.8/4</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">CISA Zero Trust Maturity Model</h3>
                <div className="text-sm text-muted-foreground">Score: 2.4/4</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActionPlans = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plans d'Action</CardTitle>
          <CardDescription>
            Gestion des actions d'amélioration de la sécurité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Module Plans d'Action</h3>
            <p className="text-muted-foreground mb-4">
              Ce module permettra de gérer les plans d'action basés sur les résultats d'évaluation
            </p>
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Créer un Plan d'Action
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rapports et Exportations</CardTitle>
          <CardDescription>
            Génération de rapports personnalisés et export des données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Module Rapports</h3>
            <p className="text-muted-foreground mb-4">
              Ce module permettra de générer des rapports détaillés et d'exporter les données
            </p>
            <Button onClick={handleGenerateReport}>
              <FileText className="h-4 w-4 mr-2" />
              Générer un Rapport
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestion des Référentiels de Sécurité
              </h1>
              <p className="text-gray-600">
                ISO 27001, NIST CSF et CISA ZTMM - Évaluations et conformité
              </p>
            </div>
          </div>
          
          <Button onClick={handleGenerateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Générer Rapport
          </Button>
        </div>

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="frameworks">Référentiels</TabsTrigger>
            <TabsTrigger value="assessments">Évaluations</TabsTrigger>
            <TabsTrigger value="results">Résultats</TabsTrigger>
            <TabsTrigger value="actions">Plans d'Action</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="frameworks" className="space-y-6">
            <FrameworkManagement />
          </TabsContent>
          
          <TabsContent value="assessments" className="space-y-6">
            <AssessmentManagement />
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            {renderResultsDashboard()}
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-6">
            {renderActionPlans()}
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            {renderReports()}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MaturityAssessment;
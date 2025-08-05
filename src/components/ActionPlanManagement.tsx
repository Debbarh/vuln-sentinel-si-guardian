import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User,
  Plus,
  Filter,
  Download,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Edit,
  BarChart3
} from 'lucide-react';
import { ISO27001_CONTROLS } from '@/data/iso27001Controls';
import { NIST_CSF_FUNCTIONS } from '@/data/nistControls';
import { ActionPlanForm } from './ActionPlanForm';
import { toast } from 'sonner';

interface ActionPlan {
  id: string;
  title: string;
  description: string;
  frameworkType: 'ISO27001' | 'NIST';
  frameworkRef: string; // Ex: "A.5.1" pour ISO ou "GV.OC-01" pour NIST
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate: string;
  estimatedEffort: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completionPercentage: number;
  dependencies: string[];
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
}

// Génération des plans d'action basés sur les référentiels
const generateActionPlansFromFrameworks = (frameworkType: 'ISO27001' | 'NIST' = 'ISO27001'): ActionPlan[] => {
  const plans: ActionPlan[] = [];

  if (frameworkType === 'ISO27001') {
    ISO27001_CONTROLS.forEach(category => {
      category.controls.forEach(control => {
        if (control.maturityLevel < 3) { // Générer des plans pour les contrôles peu matures
          plans.push({
            id: `iso-${control.id}`,
            title: `Améliorer ${control.title}`,
            description: `Renforcer l'implémentation du contrôle ${control.code}: ${control.description}`,
            frameworkType: 'ISO27001',
            frameworkRef: control.code,
            priority: control.maturityLevel === 0 ? 'critical' : 
                     control.maturityLevel === 1 ? 'high' : 'medium',
            status: control.maturityLevel === 0 ? 'not_started' : 'in_progress',
            assignee: control.responsible || 'RSSI',
            dueDate: new Date(Date.now() + (90 - control.maturityLevel * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            estimatedEffort: control.maturityLevel === 0 ? '2-3 mois' : '1-2 mois',
            category: category.name,
            tags: ['sécurité', 'iso27001', category.id],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completionPercentage: control.maturityLevel * 25,
            dependencies: [],
            businessImpact: control.maturityLevel === 0 ? 'critical' : 'medium'
          });
        }
      });
    });
  }

  if (frameworkType === 'NIST') {
    NIST_CSF_FUNCTIONS.forEach(func => {
      func.categories.forEach(category => {
        category.subCategories.forEach(subCategory => {
          if (subCategory.maturityLevel < 3) {
            plans.push({
              id: `nist-${subCategory.id}`,
              title: `Renforcer ${subCategory.title}`,
              description: `Améliorer la sous-catégorie ${subCategory.code}: ${subCategory.description}`,
              frameworkType: 'NIST',
              frameworkRef: subCategory.code,
              priority: subCategory.priority,
              status: subCategory.status === 'not_started' ? 'not_started' : 
                     subCategory.status === 'completed' ? 'completed' : 'in_progress',
              assignee: subCategory.responsible,
              dueDate: new Date(Date.now() + (120 - subCategory.maturityLevel * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              estimatedEffort: subCategory.maturityLevel === 0 ? '3-4 mois' : '1-2 mois',
              category: `${func.name} - ${category.name}`,
              tags: ['cybersécurité', 'nist-csf', func.id.toLowerCase()],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completionPercentage: subCategory.maturityLevel * 25,
              dependencies: [],
              businessImpact: subCategory.priority
            });
          }
        });
      });
    });
  }

  return plans.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

interface ActionPlanManagementProps {
  onBack?: () => void;
}

export function ActionPlanManagement({ onBack }: ActionPlanManagementProps) {
  const [selectedFramework, setSelectedFramework] = useState<'ISO27001' | 'NIST'>('ISO27001');
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>(() => 
    generateActionPlansFromFrameworks(selectedFramework)
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);

  // Régénérer les plans quand le référentiel change
  React.useEffect(() => {
    setActionPlans(generateActionPlansFromFrameworks(selectedFramework));
  }, [selectedFramework]);

  // Filtrer les plans d'action
  const filteredPlans = actionPlans.filter(plan => {
    const statusMatch = statusFilter === 'all' || plan.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || plan.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  // Calculer les statistiques
  const stats = {
    total: actionPlans.length,
    completed: actionPlans.filter(p => p.status === 'completed').length,
    inProgress: actionPlans.filter(p => p.status === 'in_progress').length,
    critical: actionPlans.filter(p => p.priority === 'critical').length,
    overdue: actionPlans.filter(p => new Date(p.dueDate) < new Date() && p.status !== 'completed').length,
    avgCompletion: actionPlans.reduce((sum, p) => sum + p.completionPercentage, 0) / actionPlans.length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Complété</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />En cours</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Bloqué</Badge>;
      default:
        return <Badge variant="outline"><Target className="h-3 w-3 mr-1" />Non démarré</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critique</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Élevé</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Moyen</Badge>;
      default:
        return <Badge variant="outline">Faible</Badge>;
    }
  };

  const handleExportPlans = () => {
    toast.success(`Export des plans d'action ${selectedFramework} en cours...`);
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setShowForm(true);
  };

  const handleEditPlan = (plan: ActionPlan) => {
    setSelectedPlan(plan);
    setShowForm(true);
  };

  const handleFormSubmit = (planData: Partial<ActionPlan>) => {
    if (selectedPlan) {
      // Mise à jour
      setActionPlans(prev => prev.map(p => 
        p.id === selectedPlan.id ? { ...selectedPlan, ...planData } : p
      ));
    } else {
      // Création
      const newPlan: ActionPlan = {
        ...planData as ActionPlan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completionPercentage: 0
      };
      setActionPlans(prev => [newPlan, ...prev]);
    }
    setShowForm(false);
    setSelectedPlan(null);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Actions identifiées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Complétés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.completed / stats.total) * 100)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Actions actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">Priorité max</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Actions urgentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgCompletion)}%</div>
            <Progress value={stats.avgCompletion} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Répartition par priorité */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Priorité</CardTitle>
          <CardDescription>Distribution des plans d'action selon leur priorité</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {['critical', 'high', 'medium', 'low'].map(priority => {
              const count = actionPlans.filter(p => p.priority === priority).length;
              const percentage = Math.round((count / actionPlans.length) * 100);
              return (
                <div key={priority} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{priority}</div>
                  <Progress value={percentage} className="mt-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPlansTable = () => (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="not_started">Non démarré</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="completed">Complété</SelectItem>
            <SelectItem value="blocked">Bloqué</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes priorités</SelectItem>
            <SelectItem value="critical">Critique</SelectItem>
            <SelectItem value="high">Élevé</SelectItem>
            <SelectItem value="medium">Moyen</SelectItem>
            <SelectItem value="low">Faible</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <span className="text-sm text-muted-foreground">
            {filteredPlans.length} plan(s) affiché(s)
          </span>
        </div>
      </div>

      {/* Tableau */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan d'Action</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Assigné</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.title}</div>
                      <div className="text-sm text-muted-foreground">{plan.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {plan.frameworkRef}
                    </Badge>
                  </TableCell>
                  <TableCell>{getPriorityBadge(plan.priority)}</TableCell>
                  <TableCell>{getStatusBadge(plan.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{plan.assignee}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{new Date(plan.dueDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={plan.completionPercentage} className="w-16" />
                      <span className="text-sm">{plan.completionPercentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de référentiel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Gestion des Plans d'Action</h2>
            <p className="text-muted-foreground">
              Plans d'amélioration basés sur {selectedFramework === 'ISO27001' ? 'ISO 27001:2022' : 'NIST CSF 2.0'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedFramework} onValueChange={(value: 'ISO27001' | 'NIST') => setSelectedFramework(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ISO27001">ISO 27001:2022</SelectItem>
              <SelectItem value="NIST">NIST CSF 2.0</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportPlans} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Plan
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Plans d'Action
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="plans">
          {renderPlansTable()}
        </TabsContent>
      </Tabs>

      {/* Formulaire de création/édition */}
      <ActionPlanForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        plan={selectedPlan}
        frameworkType={selectedFramework}
      />
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { ActionPlan } from '@/types/frameworks';
import { ActionPlanForm } from './ActionPlanForm';
import { toast } from 'sonner';

interface ActionPlanManagementProps {
  onBack: () => void;
}

// Données exemple de plans d'action
const SAMPLE_ACTION_PLANS: ActionPlan[] = [
  {
    id: 'action-1',
    assessmentId: 'assessment-1',
    criterionId: 'A.8.1',
    title: 'Mise en place d\'un inventaire automatisé des actifs',
    description: 'Déployer un outil automatisé pour maintenir l\'inventaire des actifs IT à jour en temps réel',
    responsible: 'user2',
    dueDate: '2024-04-15',
    priority: 'high',
    status: 'in_progress',
    comments: 'Évaluation des solutions en cours',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-15T14:30:00Z',
  },
  {
    id: 'action-2',
    assessmentId: 'assessment-1',
    criterionId: 'A.10.1',
    title: 'Définition de la politique cryptographique',
    description: 'Rédiger et faire approuver une politique cryptographique formelle pour l\'organisation',
    responsible: 'user1',
    dueDate: '2024-03-30',
    priority: 'critical',
    status: 'todo',
    comments: '',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'action-3',
    assessmentId: 'assessment-1',
    criterionId: 'A.5.1',
    title: 'Formation du personnel sur les politiques de sécurité',
    description: 'Organiser des sessions de formation pour sensibiliser le personnel aux nouvelles politiques',
    responsible: 'user3',
    dueDate: '2024-03-15',
    priority: 'medium',
    status: 'completed',
    comments: 'Formation terminée avec 95% de participation',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-10T16:00:00Z',
  },
];

export function ActionPlanManagement({ onBack }: ActionPlanManagementProps) {
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>(SAMPLE_ACTION_PLANS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionPlan | null>(null);

  const filteredActions = actionPlans.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || action.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || action.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: ActionPlan['status']) => {
    const variants = {
      todo: { label: 'À Faire', className: 'bg-gray-500', icon: Clock },
      in_progress: { label: 'En Cours', className: 'bg-blue-500', icon: Clock },
      completed: { label: 'Terminée', className: 'bg-green-500', icon: CheckCircle },
      overdue: { label: 'En Retard', className: 'bg-red-500', icon: AlertTriangle },
      cancelled: { label: 'Annulée', className: 'bg-gray-400', icon: AlertTriangle },
    };
    
    const variant = variants[status];
    const IconComponent = variant.icon;
    
    return (
      <Badge className={variant.className}>
        <IconComponent className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: ActionPlan['priority']) => {
    const variants = {
      low: { label: 'Faible', className: 'bg-green-100 text-green-800' },
      medium: { label: 'Moyenne', className: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Élevée', className: 'bg-orange-100 text-orange-800' },
      critical: { label: 'Critique', className: 'bg-red-100 text-red-800' },
    };
    
    return (
      <Badge variant="outline" className={variants[priority].className}>
        {variants[priority].label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getUserName = (userId: string) => {
    const users: Record<string, string> = {
      'user1': 'Alice Martin',
      'user2': 'Bob Dupont', 
      'user3': 'Claire Bernard',
      'user4': 'David Leroy',
    };
    return users[userId] || userId;
  };

  const handleCreateAction = () => {
    setSelectedAction(null);
    setShowForm(true);
  };

  const handleEditAction = (action: ActionPlan) => {
    setSelectedAction(action);
    setShowForm(true);
  };

  const handleDeleteAction = (actionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plan d\'action ?')) {
      setActionPlans(prev => prev.filter(a => a.id !== actionId));
      toast.success('Plan d\'action supprimé');
    }
  };

  const handleQuickStatusUpdate = (actionId: string, newStatus: ActionPlan['status']) => {
    setActionPlans(prev => prev.map(a => 
      a.id === actionId 
        ? { ...a, status: newStatus, updatedAt: new Date().toISOString() }
        : a
    ));
    toast.success('Statut mis à jour');
  };

  const handleFormSubmit = (actionData: Partial<ActionPlan>) => {
    if (selectedAction) {
      // Modification
      setActionPlans(prev => prev.map(a => 
        a.id === selectedAction.id ? { ...a, ...actionData, updatedAt: new Date().toISOString() } : a
      ));
    } else {
      // Création
      const newAction: ActionPlan = {
        id: `action-${Date.now()}`,
        assessmentId: 'assessment-1', // TODO: Link to current assessment
        criterionId: actionData.criterionId || '',
        title: actionData.title || '',
        description: actionData.description || '',
        responsible: actionData.responsible || '',
        dueDate: actionData.dueDate || '',
        priority: actionData.priority || 'medium',
        status: 'todo',
        comments: actionData.comments || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setActionPlans(prev => [...prev, newAction]);
    }
    setShowForm(false);
  };

  const stats = {
    total: actionPlans.length,
    completed: actionPlans.filter(a => a.status === 'completed').length,
    inProgress: actionPlans.filter(a => a.status === 'in_progress').length,
    overdue: actionPlans.filter(a => a.status === 'overdue').length,
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Gestion des Plans d'Action</h2>
            <p className="text-muted-foreground">
              Suivi et gestion des actions d'amélioration
            </p>
          </div>
        </div>
        <Button onClick={handleCreateAction}>
          <Plus className="h-4 w-4 mr-2" />
          Créer une Action
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.completed / stats.total) * 100)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Plans d'Action</CardTitle>
          <CardDescription>
            Gérez et suivez l'avancement des actions d'amélioration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="todo">À Faire</SelectItem>
                <SelectItem value="in_progress">En Cours</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
                <SelectItem value="overdue">En Retard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau des actions */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Critère</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {action.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{action.criterionId}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className="text-sm">{getUserName(action.responsible)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">{formatDate(action.dueDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(action.priority)}</TableCell>
                  <TableCell>
                    <Select
                      value={action.status}
                      onValueChange={(value) => handleQuickStatusUpdate(action.id, value as ActionPlan['status'])}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">À Faire</SelectItem>
                        <SelectItem value="in_progress">En Cours</SelectItem>
                        <SelectItem value="completed">Terminée</SelectItem>
                        <SelectItem value="overdue">En Retard</SelectItem>
                        <SelectItem value="cancelled">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditAction(action)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleDeleteAction(action.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Formulaire de création/modification */}
      <ActionPlanForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        actionPlan={selectedAction}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
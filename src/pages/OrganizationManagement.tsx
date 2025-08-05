import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building, 
  Users, 
  UserPlus, 
  Settings, 
  Shield, 
  Mail, 
  MoreHorizontal,
  Edit,
  Trash2,
  Crown,
  ArrowLeft,
  Building2
} from "lucide-react";

const OrganizationManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  // Données de démonstration
  const organizationInfo = {
    name: "ACME Corporation",
    type: "saas",
    plan: "Enterprise",
    userCount: 45,
    maxUsers: 100,
    createdDate: "2024-01-15",
    logo: null as string | null
  };
  
  // Données des départements
  const departments = [
    {
      id: 1,
      name: "Sécurité Informatique",
      description: "Département responsable de la sécurité des systèmes d'information",
      manager: "Marie Dubois",
      employeeCount: 12,
      status: "active",
      createdDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Développement",
      description: "Équipe de développement logiciel et applications",
      manager: "Pierre Martin",
      employeeCount: 25,
      status: "active",
      createdDate: "2024-01-10"
    },
    {
      id: 3,
      name: "Infrastructure",
      description: "Gestion des infrastructures et systèmes",
      manager: "Jean Leclerc",
      employeeCount: 8,
      status: "active",
      createdDate: "2024-02-01"
    },
    {
      id: 4,
      name: "Conformité",
      description: "Assurance conformité et audit interne",
      manager: "Sophie Moreau",
      employeeCount: 5,
      status: "active",
      createdDate: "2024-01-20"
    }
  ];
  const users = [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean.dupont@acme.com",
      role: "rssi",
      status: "active",
      lastLogin: "2025-01-02",
      avatar: "JD"
    },
    {
      id: 2,
      name: "Marie Martin",
      email: "marie.martin@acme.com",
      role: "admin",
      status: "active",
      lastLogin: "2025-01-02",
      avatar: "MM"
    },
    {
      id: 3,
      name: "Pierre Durand",
      email: "pierre.durand@acme.com",
      role: "security",
      status: "pending",
      lastLogin: "N/A",
      avatar: "PD"
    },
    {
      id: 4,
      name: "Sophie Bernard",
      email: "sophie.bernard@acme.com",
      role: "analyst",
      status: "active",
      lastLogin: "2025-01-01",
      avatar: "SB"
    }
  ];

  // Définition des rôles et permissions
  const organizationRoles = [
    {
      id: 'admin',
      name: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: Crown,
      permissions: ['all'],
      userCount: 2
    },
    {
      id: 'rssi',
      name: 'RSSI',
      description: 'Responsable de la sécurité des systèmes d\'information',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Shield,
      permissions: ['security_full', 'reports', 'users_read', 'frameworks_full'],
      userCount: 1
    },
    {
      id: 'security',
      name: 'Sécurité',
      description: 'Équipe sécurité - Gestion opérationnelle',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Shield,
      permissions: ['security_write', 'assessments', 'vulnerabilities'],
      userCount: 8
    },
    {
      id: 'dev',
      name: 'Développeur',
      description: 'Équipe développement - Accès technique',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Settings,
      permissions: ['technical_read', 'vulnerabilities_read', 'assessments_read'],
      userCount: 15
    },
    {
      id: 'analyst',
      name: 'Analyste',
      description: 'Analyste sécurité - Évaluation et reporting',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Users,
      permissions: ['assessments_write', 'reports_read', 'frameworks_read'],
      userCount: 12
    },
    {
      id: 'executive',
      name: 'Top Management',
      description: 'Direction exécutive - Vue stratégique',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Crown,
      permissions: ['dashboard_executive', 'reports_read', 'strategic_view'],
      userCount: 3
    }
  ];

  const permissionCategories = {
    'all': 'Tous les droits',
    'security_full': 'Sécurité - Gestion complète',
    'security_write': 'Sécurité - Écriture',
    'reports': 'Rapports - Génération',
    'reports_read': 'Rapports - Lecture',
    'users_read': 'Utilisateurs - Lecture',
    'frameworks_full': 'Référentiels - Gestion complète',
    'frameworks_read': 'Référentiels - Lecture',
    'assessments': 'Évaluations - Gestion',
    'assessments_write': 'Évaluations - Écriture',
    'assessments_read': 'Évaluations - Lecture',
    'vulnerabilities': 'Vulnérabilités - Gestion',
    'vulnerabilities_read': 'Vulnérabilités - Lecture',
    'technical_read': 'Technique - Lecture',
    'dashboard_executive': 'Dashboard exécutif',
    'strategic_view': 'Vue stratégique'
  };

  const getRoleBadge = (role: string) => {
    const roleLabels = {
      rssi: { label: "RSSI", variant: "destructive", icon: Crown },
      admin: { label: "Admin", variant: "default", icon: Shield },
      security: { label: "Sécurité", variant: "secondary", icon: Shield },
      dev: { label: "Développeur", variant: "outline", icon: Settings },
      analyst: { label: "Analyste", variant: "outline", icon: Users },
      executive: { label: "Top Management", variant: "outline", icon: Crown }
    } as const;
    
    const roleInfo = roleLabels[role as keyof typeof roleLabels] || { label: role, variant: "outline", icon: Users };
    const IconComponent = roleInfo.icon;
    
    return (
      <Badge variant={roleInfo.variant as any} className="flex items-center space-x-1">
        <IconComponent className="h-3 w-3" />
        <span>{roleInfo.label}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>
      : <Badge variant="secondary">En attente</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au Dashboard
              </Button>
              <div className="p-3 bg-blue-600 rounded-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{organizationInfo.name}</h1>
                <p className="text-gray-600">Gestion de l'organisation</p>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              Plan {organizationInfo.plan}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Building className="h-4 w-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="h-4 w-4 mr-2" />
              Rôles
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building2 className="h-4 w-4 mr-2" />
              Départements
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{organizationInfo.userCount}</div>
                  <p className="text-xs text-muted-foreground">
                    sur {organizationInfo.maxUsers} maximum
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Type de déploiement</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {organizationInfo.type === "saas" ? "SaaS" : "On-premise"}
                  </div>
                  <p className="text-xs text-muted-foreground">Cloud sécurisé</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Créée le</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date(organizationInfo.createdDate).toLocaleDateString('fr-FR')}
                  </div>
                  <p className="text-xs text-muted-foreground">Il y a 1 an</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>
                  Dernières actions dans l'organisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Nouvel utilisateur invité</p>
                      <p className="text-sm text-gray-600">Pierre Durand a été invité • Il y a 2 heures</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Politique de sécurité mise à jour</p>
                      <p className="text-sm text-gray-600">Nouvelle règle d'authentification • Il y a 1 jour</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des utilisateurs */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Utilisateurs de l'organisation</CardTitle>
                    <CardDescription>
                      Gérez les membres de votre organisation et leurs permissions
                    </CardDescription>
                  </div>
                  <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Inviter un utilisateur
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Inviter un nouvel utilisateur</DialogTitle>
                        <DialogDescription>
                          Envoyez une invitation à un nouveau membre de l'équipe
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="inviteEmail">Email</Label>
                          <Input 
                            id="inviteEmail" 
                            type="email" 
                            placeholder="utilisateur@entreprise.com" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inviteRole">Rôle</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un rôle" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="analyst">Analyste</SelectItem>
                              <SelectItem value="dev">Développeur</SelectItem>
                              <SelectItem value="security">Responsable sécurité</SelectItem>
                              <SelectItem value="admin">Administrateur</SelectItem>
                              <SelectItem value="rssi">RSSI</SelectItem>
                              <SelectItem value="executive">Top Management</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={() => setIsInviteDialogOpen(false)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Envoyer l'invitation
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernière connexion</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {user.avatar}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {user.lastLogin !== "N/A" 
                            ? new Date(user.lastLogin).toLocaleDateString('fr-FR')
                            : user.lastLogin
                          }
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des rôles */}
          <TabsContent value="roles">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des Rôles</CardTitle>
                      <CardDescription>
                        Configurez les rôles et permissions de votre organisation
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowRoleForm(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Créer un rôle
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {organizationRoles.map((role) => {
                      const IconComponent = role.icon;
                      return (
                        <Card key={role.id} className={`border-2 ${role.color.split(' ').pop()?.replace('text-', 'border-').replace('-800', '-200')}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                <div className={`p-3 rounded-lg ${role.color.split(' ')[0]} ${role.color.split(' ')[1]}`}>
                                  <IconComponent className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold">{role.name}</h3>
                                    <Badge variant="outline" className={role.color}>
                                      {role.userCount} utilisateur{role.userCount > 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-600 mb-3">{role.description}</p>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-sm font-medium text-gray-700">Permissions:</span>
                                    {role.permissions.slice(0, 3).map((permission) => (
                                      <Badge key={permission} variant="secondary" className="text-xs">
                                        {permissionCategories[permission as keyof typeof permissionCategories]}
                                      </Badge>
                                    ))}
                                    {role.permissions.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{role.permissions.length - 3} autres
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Modifier
                                </Button>
                                <Button size="sm" variant="outline">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Matrice des permissions */}
              <Card>
                <CardHeader>
                  <CardTitle>Matrice des Permissions</CardTitle>
                  <CardDescription>
                    Vue d'ensemble des permissions par rôle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Fonctionnalité</TableHead>
                          {organizationRoles.map((role) => (
                            <TableHead key={role.id} className="text-center min-w-[120px]">
                              <div className="flex flex-col items-center gap-1">
                                <role.icon className="h-4 w-4" />
                                <span className="text-xs">{role.name}</span>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(permissionCategories).map(([permKey, permLabel]) => (
                          <TableRow key={permKey}>
                            <TableCell className="font-medium">{permLabel}</TableCell>
                            {organizationRoles.map((role) => (
                              <TableCell key={role.id} className="text-center">
                                {role.permissions.includes(permKey) || role.permissions.includes('all') ? (
                                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    ✓
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                                    ×
                                  </div>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Paramètres */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de l'organisation</CardTitle>
                  <CardDescription>
                    Configurez les paramètres généraux de votre organisation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Nom de l'organisation</Label>
                    <Input id="orgName" value={organizationInfo.name} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Logo de l'organisation</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {organizationInfo.logo ? (
                          <img 
                            src={organizationInfo.logo} 
                            alt="Logo organisation"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input 
                          type="file" 
                          accept="image/*"
                          className="cursor-pointer"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Formats acceptés: PNG, JPG, SVG (max 2MB)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button>Sauvegarder les modifications</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Zone de danger</CardTitle>
                  <CardDescription>
                    Actions irréversibles pour votre organisation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer l'organisation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gestion des départements */}
          <TabsContent value="departments">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des Départements</CardTitle>
                      <CardDescription>
                        Organisez les départements de votre entreprise
                      </CardDescription>
                    </div>
                    <Button onClick={() => {
                      setSelectedDepartment(null);
                      setShowDepartmentForm(true);
                    }}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Créer un département
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {departments.map((dept) => (
                      <Card key={dept.id} className="border-2 border-blue-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="p-3 rounded-lg bg-blue-100 text-blue-800">
                                <Building2 className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">{dept.name}</h3>
                                  <Badge variant="outline" className="text-green-700 border-green-200">
                                    {dept.employeeCount} employé{dept.employeeCount > 1 ? 's' : ''}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {dept.status === 'active' ? 'Actif' : 'Inactif'}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 mb-3">{dept.description}</p>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700">Manager:</span>
                                    <span className="ml-2">{dept.manager}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedDepartment(dept);
                                  setShowDepartmentForm(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Modifier
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Users className="h-4 w-4 mr-2" />
                                    Voir les employés
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Paramètres
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques des départements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total départements</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{departments.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Départements actifs
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total employés</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {departments.reduce((total, dept) => total + dept.employeeCount, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Répartis dans tous les départements
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Employés moyens</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(departments.reduce((total, dept) => total + dept.employeeCount, 0) / departments.length)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Par département
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Formulaire de création de rôle */}
        {showRoleForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Créer un nouveau rôle</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowRoleForm(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="roleName">Nom du rôle</Label>
                      <Input id="roleName" placeholder="Ex: Analyste Senior" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="roleIcon">Icône</Label>
                      <Select defaultValue="shield">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shield">🛡️ Shield</SelectItem>
                          <SelectItem value="user">👤 User</SelectItem>
                          <SelectItem value="settings">⚙️ Settings</SelectItem>
                          <SelectItem value="crown">👑 Crown</SelectItem>
                          <SelectItem value="briefcase">💼 Briefcase</SelectItem>
                          <SelectItem value="computer">💻 Computer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roleDescription">Description</Label>
                    <Textarea 
                      id="roleDescription" 
                      placeholder="Décrivez les responsabilités de ce rôle..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roleColor">Couleur du rôle</Label>
                    <Select defaultValue="blue">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">🔵 Bleu</SelectItem>
                        <SelectItem value="green">🟢 Vert</SelectItem>
                        <SelectItem value="red">🔴 Rouge</SelectItem>
                        <SelectItem value="purple">🟣 Violet</SelectItem>
                        <SelectItem value="orange">🟠 Orange</SelectItem>
                        <SelectItem value="gray">⚫ Gris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Permissions du rôle</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700">Gestion des évaluations</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="view_assessments" className="rounded" />
                            <Label htmlFor="view_assessments" className="text-sm">Consulter les évaluations</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="create_assessments" className="rounded" />
                            <Label htmlFor="create_assessments" className="text-sm">Créer des évaluations</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="edit_assessments" className="rounded" />
                            <Label htmlFor="edit_assessments" className="text-sm">Modifier les évaluations</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="delete_assessments" className="rounded" />
                            <Label htmlFor="delete_assessments" className="text-sm">Supprimer les évaluations</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700">Gestion des utilisateurs</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="view_users" className="rounded" />
                            <Label htmlFor="view_users" className="text-sm">Consulter les utilisateurs</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="invite_users" className="rounded" />
                            <Label htmlFor="invite_users" className="text-sm">Inviter des utilisateurs</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="edit_users" className="rounded" />
                            <Label htmlFor="edit_users" className="text-sm">Modifier les utilisateurs</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="delete_users" className="rounded" />
                            <Label htmlFor="delete_users" className="text-sm">Supprimer les utilisateurs</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700">Gestion des rapports</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="view_reports" className="rounded" />
                            <Label htmlFor="view_reports" className="text-sm">Consulter les rapports</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="generate_reports" className="rounded" />
                            <Label htmlFor="generate_reports" className="text-sm">Générer des rapports</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="export_reports" className="rounded" />
                            <Label htmlFor="export_reports" className="text-sm">Exporter les rapports</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="schedule_reports" className="rounded" />
                            <Label htmlFor="schedule_reports" className="text-sm">Programmer les rapports</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700">Administration</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="manage_settings" className="rounded" />
                            <Label htmlFor="manage_settings" className="text-sm">Gérer les paramètres</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="manage_roles" className="rounded" />
                            <Label htmlFor="manage_roles" className="text-sm">Gérer les rôles</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="view_audit_logs" className="rounded" />
                            <Label htmlFor="view_audit_logs" className="text-sm">Consulter les logs d'audit</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowRoleForm(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      Créer le rôle
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Formulaire de création de département */}
        {showDepartmentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {selectedDepartment ? 'Modifier le département' : 'Créer un nouveau département'}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowDepartmentForm(false);
                    setSelectedDepartment(null);
                  }}
                >
                  ×
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deptName">Nom du département</Label>
                    <Input 
                      id="deptName" 
                      placeholder="Ex: Ressources Humaines"
                      defaultValue={selectedDepartment?.name || ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deptDescription">Description</Label>
                    <Textarea 
                      id="deptDescription" 
                      placeholder="Décrivez les responsabilités de ce département..."
                      rows={3}
                      defaultValue={selectedDepartment?.description || ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deptManager">Manager du département</Label>
                    <Input 
                      id="deptManager" 
                      placeholder="Nom du manager (ex: Jean Dupont)"
                      defaultValue={selectedDepartment?.manager || ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Le manager peut être un utilisateur de l'organisation ou une personne externe
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deptStatus">Statut</Label>
                    <Select defaultValue={selectedDepartment?.status || "active"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowDepartmentForm(false);
                        setSelectedDepartment(null);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      {selectedDepartment ? 'Modifier le département' : 'Créer le département'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationManagement;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  ArrowLeft
} from "lucide-react";

const OrganizationManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Données de démonstration
  const organizationInfo = {
    name: "ACME Corporation",
    type: "saas",
    plan: "Enterprise",
    userCount: 45,
    maxUsers: 100,
    createdDate: "2024-01-15"
  };

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
          <TabsList className="grid w-full grid-cols-4">
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
                    <Button>
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
                    <Label htmlFor="orgType">Type de déploiement</Label>
                    <Select value={organizationInfo.type}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas">SaaS (Cloud)</SelectItem>
                        <SelectItem value="onpremise">On-premise</SelectItem>
                        <SelectItem value="hybrid">Hybride</SelectItem>
                      </SelectContent>
                    </Select>
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
        </Tabs>
      </div>
    </div>
  );
};

export default OrganizationManagement;
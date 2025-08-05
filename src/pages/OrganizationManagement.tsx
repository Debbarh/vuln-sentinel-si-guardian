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

  const getRoleBadge = (role: string) => {
    const roleLabels = {
      rssi: { label: "RSSI", variant: "destructive", icon: Crown },
      admin: { label: "Admin", variant: "default", icon: Shield },
      security: { label: "Sécurité", variant: "secondary", icon: Shield },
      tech: { label: "Technique", variant: "outline", icon: Settings },
      analyst: { label: "Analyste", variant: "outline", icon: Users }
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <Building className="h-4 w-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Utilisateurs
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
                              <SelectItem value="tech">Responsable technique</SelectItem>
                              <SelectItem value="security">Responsable sécurité</SelectItem>
                              <SelectItem value="admin">Administrateur</SelectItem>
                              <SelectItem value="rssi">RSSI</SelectItem>
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
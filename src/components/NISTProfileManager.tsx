import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Plus, 
  Target, 
  Users, 
  Building2,
  Edit,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { NISTProfile, NISTTier, NIST_TIERS } from '@/types/nist';
import { NIST_CSF_FUNCTIONS } from '@/data/nistControls';
import { toast } from 'sonner';

interface NISTProfileManagerProps {
  onBack: () => void;
}

export function NISTProfileManager({ onBack }: NISTProfileManagerProps) {
  const [profiles, setProfiles] = useState<NISTProfile[]>([
    {
      id: 'profile-1',
      name: 'Profil Actuel Organisation',
      type: 'current',
      description: 'État actuel de la cybersécurité de l\'organisation',
      organizationId: 'org-1',
      functions: [
        {
          functionId: 'GOVERN',
          targetTier: 'risk_informed',
          selectedSubCategories: ['GV.OC-01', 'GV.OC-02', 'GV.SC-01'],
          priority: 'high'
        },
        {
          functionId: 'IDENTIFY',
          targetTier: 'repeatable',
          selectedSubCategories: ['ID.AM-01', 'ID.AM-02'],
          priority: 'critical'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'profile-2',
      name: 'Profil Cible 2024',
      type: 'target',
      description: 'Objectifs de cybersécurité pour fin 2024',
      organizationId: 'org-1',
      functions: [
        {
          functionId: 'GOVERN',
          targetTier: 'repeatable',
          selectedSubCategories: ['GV.OC-01', 'GV.OC-02', 'GV.OC-03', 'GV.SC-01', 'GV.SC-02'],
          priority: 'critical'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [selectedProfile, setSelectedProfile] = useState<NISTProfile | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProfile, setNewProfile] = useState<Partial<NISTProfile>>({
    name: '',
    type: 'current',
    description: '',
    functions: []
  });

  const handleCreateProfile = () => {
    if (!newProfile.name) {
      toast.error('Le nom du profil est obligatoire');
      return;
    }

    const profile: NISTProfile = {
      id: `profile-${Date.now()}`,
      name: newProfile.name,
      type: newProfile.type || 'current',
      description: newProfile.description || '',
      organizationId: 'org-1',
      functions: newProfile.functions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProfiles(prev => [...prev, profile]);
    setNewProfile({ name: '', type: 'current', description: '', functions: [] });
    setShowCreateDialog(false);
    toast.success('Profil créé avec succès');
  };

  const handleDuplicateProfile = (profile: NISTProfile) => {
    const duplicated: NISTProfile = {
      ...profile,
      id: `profile-${Date.now()}`,
      name: `${profile.name} (Copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProfiles(prev => [...prev, duplicated]);
    toast.success('Profil dupliqué avec succès');
  };

  const getProfileTypeLabel = (type: NISTProfile['type']) => {
    const labels = {
      current: 'Actuel',
      target: 'Cible',
      community: 'Communautaire'
    };
    return labels[type];
  };

  const getProfileTypeColor = (type: NISTProfile['type']) => {
    const colors = {
      current: 'bg-blue-500',
      target: 'bg-green-500',
      community: 'bg-purple-500'
    };
    return colors[type];
  };

  const getTierLabel = (tier: NISTTier) => {
    return NIST_TIERS[tier].label;
  };

  const calculateProfileCompleteness = (profile: NISTProfile) => {
    const totalPossibleSubCategories = NIST_CSF_FUNCTIONS.reduce((sum, func) => 
      sum + func.categories.reduce((s, cat) => s + cat.subCategories.length, 0), 0
    );
    
    const selectedSubCategories = profile.functions.reduce((sum, func) => 
      sum + func.selectedSubCategories.length, 0
    );

    return Math.round((selectedSubCategories / totalPossibleSubCategories) * 100);
  };

  const renderProfileCard = (profile: NISTProfile) => {
    const completeness = calculateProfileCompleteness(profile);
    
    return (
      <Card key={profile.id} className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center space-x-2">
                <span>{profile.name}</span>
                <Badge className={getProfileTypeColor(profile.type)}>
                  {getProfileTypeLabel(profile.type)}
                </Badge>
              </CardTitle>
              <CardDescription>{profile.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={() => setSelectedProfile(profile)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDuplicateProfile(profile)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Fonctions couvertes:</span>
              <div className="text-muted-foreground">{profile.functions.length}/6</div>
            </div>
            <div>
              <span className="font-medium">Complétude:</span>
              <div className="text-muted-foreground">{completeness}%</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {profile.functions.slice(0, 3).map((func) => (
                <Badge key={func.functionId} variant="outline" className="text-xs">
                  {func.functionId}
                </Badge>
              ))}
              {profile.functions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.functions.length - 3} autres
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Target className="h-4 w-4 mr-1" />
              Évaluer
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCreateProfileDialog = () => (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un Nouveau Profil NIST</DialogTitle>
          <DialogDescription>
            Définissez un profil personnalisé basé sur vos besoins organisationnels
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nom du Profil *</Label>
              <Input
                id="profile-name"
                value={newProfile.name}
                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                placeholder="Ex: Profil Banque 2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-type">Type de Profil</Label>
              <Select 
                value={newProfile.type} 
                onValueChange={(value: NISTProfile['type']) => setNewProfile({ ...newProfile, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Profil Actuel</SelectItem>
                  <SelectItem value="target">Profil Cible</SelectItem>
                  <SelectItem value="community">Profil Communautaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profile-description">Description</Label>
            <Textarea
              id="profile-description"
              value={newProfile.description}
              onChange={(e) => setNewProfile({ ...newProfile, description: e.target.value })}
              placeholder="Décrivez l'objectif et le contexte de ce profil..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateProfile}>
              Créer le Profil
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

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
            <h2 className="text-2xl font-bold">Gestion des Profils NIST</h2>
            <p className="text-muted-foreground">
              Créez et gérez vos profils de cybersécurité NIST CSF 2.0
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Profil
          </Button>
        </div>
      </div>

      {/* Onglets de gestion */}
      <Tabs defaultValue="profiles">
        <TabsList>
          <TabsTrigger value="profiles">Mes Profils</TabsTrigger>
          <TabsTrigger value="community">Profils Communautaires</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.filter(p => p.type !== 'community').map(renderProfileCard)}
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Profils Communautaires</span>
              </CardTitle>
              <CardDescription>
                Profils partagés par secteur d'activité et cas d'usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Profils par Secteur</h3>
                <p className="text-muted-foreground mb-4">
                  Les profils communautaires seront disponibles prochainement
                </p>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Rejoindre la Communauté
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Profils</CardTitle>
              <CardDescription>
                Modèles prédéfinis pour différents types d'organisations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Templates Disponibles</h3>
                <p className="text-muted-foreground mb-4">
                  Les templates seront disponibles pour différents secteurs et tailles d'organisation
                </p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderCreateProfileDialog()}
    </div>
  );
}
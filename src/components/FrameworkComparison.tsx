import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  BarChart3,
  GitCompare,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { ISO27001_CONTROLS } from '@/data/iso27001Controls';
import { NIST_CSF_FUNCTIONS } from '@/data/nistControls';

interface FrameworkComparisonProps {
  onBack: () => void;
}

export function FrameworkComparison({ onBack }: FrameworkComparisonProps) {
  const [comparisonType, setComparisonType] = useState<'overview' | 'detailed' | 'mapping'>('overview');

  // Calcul des statistiques ISO 27001
  const iso27001Stats = {
    totalControls: ISO27001_CONTROLS.reduce((sum, cat) => sum + cat.controls.length, 0),
    categories: ISO27001_CONTROLS.length,
    implementedControls: ISO27001_CONTROLS.reduce((sum, cat) => 
      sum + cat.controls.filter(c => c.maturityLevel >= 2).length, 0
    ),
    avgMaturity: ISO27001_CONTROLS.reduce((sum, cat) => 
      sum + cat.controls.reduce((s, c) => s + c.maturityLevel, 0) / cat.controls.length, 0
    ) / ISO27001_CONTROLS.length,
    complianceRate: 0
  };
  iso27001Stats.complianceRate = Math.round((iso27001Stats.implementedControls / iso27001Stats.totalControls) * 100);

  // Calcul des statistiques NIST CSF
  const nistStats = {
    totalSubCategories: NIST_CSF_FUNCTIONS.reduce((sum, func) => 
      sum + func.categories.reduce((s, cat) => s + cat.subCategories.length, 0), 0
    ),
    functions: NIST_CSF_FUNCTIONS.length,
    categories: NIST_CSF_FUNCTIONS.reduce((sum, func) => sum + func.categories.length, 0),
    implementedSubCategories: NIST_CSF_FUNCTIONS.reduce((sum, func) => 
      sum + func.categories.reduce((s, cat) => 
        s + cat.subCategories.filter(sub => sub.maturityLevel >= 2).length, 0
      ), 0
    ),
    avgMaturity: 0,
    complianceRate: 0
  };
  
  const allSubCategories = NIST_CSF_FUNCTIONS.flatMap(func => 
    func.categories.flatMap(cat => cat.subCategories)
  );
  nistStats.avgMaturity = allSubCategories.reduce((sum, sub) => sum + sub.maturityLevel, 0) / allSubCategories.length;
  nistStats.complianceRate = Math.round((nistStats.implementedSubCategories / nistStats.totalSubCategories) * 100);

  // Données pour comparaison radar
  const comparisonRadarData = [
    {
      aspect: 'Couverture Organisationnelle',
      ISO27001: 3.2,
      NIST: 2.8,
      fullMark: 4
    },
    {
      aspect: 'Couverture Technique',
      ISO27001: 2.7,
      NIST: 3.1,
      fullMark: 4
    },
    {
      aspect: 'Gestion des Risques',
      ISO27001: 3.0,
      NIST: 3.3,
      fullMark: 4
    },
    {
      aspect: 'Réponse aux Incidents',
      ISO27001: 2.4,
      NIST: 3.0,
      fullMark: 4
    },
    {
      aspect: 'Continuité d\'Activité',
      ISO27001: 2.6,
      NIST: 2.9,
      fullMark: 4
    },
    {
      aspect: 'Conformité Réglementaire',
      ISO27001: 3.4,
      NIST: 2.5,
      fullMark: 4
    }
  ];

  // Données pour comparaison par domaine
  const domainComparisonData = [
    { domain: 'Gouvernance', ISO27001: iso27001Stats.avgMaturity, NIST: nistStats.avgMaturity },
    { domain: 'Protection', ISO27001: 2.8, NIST: 3.1 },
    { domain: 'Détection', ISO27001: 2.3, NIST: 2.7 },
    { domain: 'Réponse', ISO27001: 2.1, NIST: 2.9 },
    { domain: 'Récupération', ISO27001: 2.4, NIST: 2.6 }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Comparaison des métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>ISO 27001:2022</span>
            </CardTitle>
            <CardDescription>Standard international de sécurité de l'information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Contrôles totaux</span>
              <Badge variant="outline">{iso27001Stats.totalControls}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Catégories</span>
              <Badge variant="outline">{iso27001Stats.categories}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Maturité moyenne</span>
              <Badge className="bg-blue-500">{iso27001Stats.avgMaturity.toFixed(1)}/4</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conformité</span>
                <span className="text-sm text-muted-foreground">{iso27001Stats.complianceRate}%</span>
              </div>
              <Progress value={iso27001Stats.complianceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>NIST CSF 2.0</span>
            </CardTitle>
            <CardDescription>Framework de cybersécurité du NIST</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sous-catégories totales</span>
              <Badge variant="outline">{nistStats.totalSubCategories}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fonctions</span>
              <Badge variant="outline">{nistStats.functions}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Maturité moyenne</span>
              <Badge className="bg-green-500">{nistStats.avgMaturity.toFixed(1)}/4</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conformité</span>
                <span className="text-sm text-muted-foreground">{nistStats.complianceRate}%</span>
              </div>
              <Progress value={nistStats.complianceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques de comparaison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Comparaison Multi-Domaines</CardTitle>
            <CardDescription>Analyse radar des forces relatives de chaque framework</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={comparisonRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="aspect" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 10 }} />
                <Radar name="ISO 27001" dataKey="ISO27001" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Radar name="NIST CSF" dataKey="NIST" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maturité par Domaine</CardTitle>
            <CardDescription>Comparaison directe des scores de maturité</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={domainComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="ISO27001" fill="#3b82f6" name="ISO 27001" />
                <Bar dataKey="NIST" fill="#10b981" name="NIST CSF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations Stratégiques</CardTitle>
          <CardDescription>Analyse comparative et suggestions d'amélioration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Points Forts Identifiés</span>
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• ISO 27001 excelle en gouvernance et conformité réglementaire</li>
                <li>• NIST CSF offre une approche complète de la gestion des incidents</li>
                <li>• Complémentarité naturelle entre les deux frameworks</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span>Axes d'Amélioration</span>
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Renforcer les capacités de détection et de réponse ISO 27001</li>
                <li>• Améliorer la conformité réglementaire dans NIST CSF</li>
                <li>• Harmoniser les processus entre les deux référentiels</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMapping = () => (
    <Card>
      <CardHeader>
        <CardTitle>Mapping des Référentiels</CardTitle>
        <CardDescription>
          Correspondances identifiées entre ISO 27001:2022 et NIST CSF 2.0
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center py-8">
            <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Mapping Détaillé</h3>
            <p className="text-muted-foreground mb-4">
              Le mapping complet entre les contrôles ISO 27001 et les sous-catégories NIST sera disponible prochainement
            </p>
            <Button variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Générer le Mapping Automatique
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
            <h2 className="text-2xl font-bold">Comparaison des Référentiels</h2>
            <p className="text-muted-foreground">
              Analyse comparative ISO 27001:2022 vs NIST CSF 2.0
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={comparisonType} onValueChange={(value: any) => setComparisonType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Vue d'ensemble</SelectItem>
              <SelectItem value="detailed">Analyse détaillée</SelectItem>
              <SelectItem value="mapping">Mapping des contrôles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Onglets de comparaison */}
      <Tabs value={comparisonType} onValueChange={(value: 'overview' | 'detailed' | 'mapping') => setComparisonType(value)}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="detailed">Analyse détaillée</TabsTrigger>
          <TabsTrigger value="mapping">Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse Détaillée</CardTitle>
              <CardDescription>
                Comparaison approfondie des métriques et performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analyse Approfondie</h3>
                <p className="text-muted-foreground">
                  L'analyse détaillée sera disponible avec plus de données d'évaluation
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          {renderMapping()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
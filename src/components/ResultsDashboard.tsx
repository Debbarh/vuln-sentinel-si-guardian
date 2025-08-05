import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  ArrowLeft,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Assessment } from '@/types/frameworks';
import { ISO27001_CONTROLS } from '@/data/iso27001Controls';
import { toast } from 'sonner';

interface ResultsDashboardProps {
  onBack: () => void;
}

// Données basées sur les vraies catégories ISO 27001:2022
const SAMPLE_RESULTS = {
  overallScore: 2.8,
  overallLevel: 'Défini',
  totalGaps: 28,
  completedActions: 18,
  totalActions: 32,
  complianceRate: 72,
};

// Données radar basées sur les 4 catégories ISO 27001:2022
const RADAR_DATA = [
  { subject: 'Contrôles Organisationnels (37)', A: 2.9, B: 3.2, fullMark: 4 },
  { subject: 'Contrôles Humains (8)', A: 3.1, B: 3.3, fullMark: 4 },
  { subject: 'Contrôles Physiques (14)', A: 2.8, B: 3.0, fullMark: 4 },
  { subject: 'Contrôles Technologiques (34)', A: 2.6, B: 3.1, fullMark: 4 },
];

// Données de barres avec quelques contrôles représentatifs de chaque catégorie
const BAR_DATA = [
  // Contrôles Organisationnels
  { name: '5.1 Politiques SI', score: 3.2, target: 3.5, category: 'Organisationnel' },
  { name: '5.15 Contrôle d\'accès', score: 2.9, target: 3.2, category: 'Organisationnel' },
  { name: '5.24 Gestion incidents', score: 2.5, target: 3.0, category: 'Organisationnel' },
  
  // Contrôles Humains
  { name: '6.3 Sensibilisation', score: 3.1, target: 3.3, category: 'Humain' },
  { name: '6.7 Travail à distance', score: 2.8, target: 3.2, category: 'Humain' },
  
  // Contrôles Physiques
  { name: '7.1 Périmètre sécurisé', score: 3.0, target: 3.2, category: 'Physique' },
  { name: '7.8 Protection équipements', score: 2.7, target: 3.0, category: 'Physique' },
  
  // Contrôles Technologiques
  { name: '8.7 Protection malware', score: 3.5, target: 3.5, category: 'Technologique' },
  { name: '8.24 Cryptographie', score: 2.1, target: 3.0, category: 'Technologique' },
  { name: '8.8 Vulnérabilités', score: 2.4, target: 3.2, category: 'Technologique' },
];

const GAPS_DATA = [
  {
    reference: 'ISO 27001:2022',
    criterion: '5.9',
    subCriterion: 'Inventaire des informations et autres actifs associés',
    score: 1.2,
    level: 'Initial',
    recommendation: 'Mettre en place un inventaire automatisé des actifs informationnels'
  },
  {
    reference: 'ISO 27001:2022', 
    criterion: '8.24',
    subCriterion: 'Utilisation de la cryptographie',
    score: 1.8,
    level: 'Reproductible',
    recommendation: 'Définir une politique cryptographique formelle et l\'implémenter'
  },
  {
    reference: 'ISO 27001:2022',
    criterion: '8.11',
    subCriterion: 'Masquage des données',
    score: 1.5,
    level: 'Initial',
    recommendation: 'Implémenter des techniques de masquage pour les données sensibles'
  },
  {
    reference: 'ISO 27001:2022',
    criterion: '5.21',
    subCriterion: 'Gestion de la chaîne d\'approvisionnement TIC',
    score: 1.9,
    level: 'Reproductible',
    recommendation: 'Évaluer et gérer les risques liés aux fournisseurs TIC'
  },
];

export function ResultsDashboard({ onBack }: ResultsDashboardProps) {
  const [selectedAssessment, setSelectedAssessment] = useState('assessment-1');
  const [activeTab, setActiveTab] = useState('overview');

  const handleExportReport = () => {
    toast.success('Génération du rapport PDF en cours...');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Global</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{SAMPLE_RESULTS.overallScore}/4</div>
            <p className="text-xs text-muted-foreground">
              Niveau {SAMPLE_RESULTS.overallLevel}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lacunes Identifiées</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{SAMPLE_RESULTS.totalGaps}</div>
            <p className="text-xs text-muted-foreground">À traiter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions Complétées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {SAMPLE_RESULTS.completedActions}/{SAMPLE_RESULTS.totalActions}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((SAMPLE_RESULTS.completedActions / SAMPLE_RESULTS.totalActions) * 100)}% complété
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conformité</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{SAMPLE_RESULTS.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">Global</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Maturité par Domaine</CardTitle>
            <CardDescription>Vue radar des scores par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 4]} />
                <Radar name="Actuel" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Cible" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scores par Critère</CardTitle>
            <CardDescription>Comparaison score actuel vs objectif</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={BAR_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" name="Score Actuel" />
                <Bar dataKey="target" fill="#82ca9d" name="Objectif" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderGaps = () => (
    <Card>
      <CardHeader>
        <CardTitle>Lacunes Prioritaires</CardTitle>
        <CardDescription>
          Domaines nécessitant une attention immédiate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référentiel</TableHead>
              <TableHead>Critère</TableHead>
              <TableHead>Sous-critère</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead>Recommandation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {GAPS_DATA.map((gap, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Badge variant="outline">{gap.reference}</Badge>
                </TableCell>
                <TableCell className="font-medium">{gap.criterion}</TableCell>
                <TableCell>{gap.subCriterion}</TableCell>
                <TableCell>
                  <Badge variant="destructive">{gap.score}/4</Badge>
                </TableCell>
                <TableCell>{gap.level}</TableCell>
                <TableCell className="max-w-xs">{gap.recommendation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
            <h2 className="text-2xl font-bold">Tableau de Bord des Résultats</h2>
            <p className="text-muted-foreground">
              Visualisation de la maturité sécurité
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assessment-1">Évaluation Q1 2024</SelectItem>
              <SelectItem value="assessment-2">Audit ISO 27001</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="gaps">Lacunes</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          {renderGaps()}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des Tendances</CardTitle>
              <CardDescription>
                Évolution de la maturité dans le temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analyse Temporelle</h3>
                <p className="text-muted-foreground">
                  Les graphiques de tendances seront disponibles avec plus de données
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
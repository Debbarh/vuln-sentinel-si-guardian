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

// Calculer les résultats basés sur les vraies données ISO 27001:2022
const calculateResultsFromISO27001 = () => {
  const categoryStats = ISO27001_CONTROLS.map(category => {
    const totalControls = category.controls.length;
    const implementedControls = category.controls.filter(c => c.maturityLevel >= 2).length;
    const avgMaturity = category.controls.reduce((sum, c) => sum + c.maturityLevel, 0) / totalControls;
    
    return {
      id: category.id,
      name: category.name,
      totalControls,
      implementedControls,
      avgMaturity: Math.round(avgMaturity * 10) / 10,
      complianceRate: Math.round((implementedControls / totalControls) * 100)
    };
  });

  const overallMaturity = categoryStats.reduce((sum, cat) => sum + cat.avgMaturity, 0) / categoryStats.length;
  const overallCompliance = categoryStats.reduce((sum, cat) => sum + cat.complianceRate, 0) / categoryStats.length;
  const totalGaps = ISO27001_CONTROLS.reduce((sum, cat) => 
    sum + cat.controls.filter(c => c.maturityLevel < 2).length, 0
  );

  return {
    overallScore: Math.round(overallMaturity * 10) / 10,
    overallLevel: getMaturityLevel(overallMaturity),
    totalGaps,
    completedActions: 18, // Exemple
    totalActions: 32, // Exemple
    complianceRate: Math.round(overallCompliance),
    categoryStats
  };
};

const getMaturityLevel = (score: number): string => {
  if (score < 1) return 'Initial';
  if (score < 2) return 'Reproductible';
  if (score < 3) return 'Défini';
  if (score < 4) return 'Géré';
  return 'Optimisé';
};

const CALCULATED_RESULTS = calculateResultsFromISO27001();

// Données radar basées sur les vraies catégories avec les vrais scores
const RADAR_DATA = CALCULATED_RESULTS.categoryStats.map(cat => ({
  subject: `${cat.name.replace('Contrôles ', '')} (${cat.totalControls})`,
  current: cat.avgMaturity,
  target: Math.min(cat.avgMaturity + 0.5, 4),
  fullMark: 4
}));

// Données de barres avec les vrais contrôles et leurs scores actuels
const generateBarData = () => {
  const barData: any[] = [];
  
  ISO27001_CONTROLS.forEach(category => {
    // Prendre les 3 premiers contrôles de chaque catégorie comme exemples
    category.controls.slice(0, 3).forEach(control => {
      barData.push({
        name: `${control.code} ${control.title.substring(0, 20)}...`,
        score: control.maturityLevel,
        target: Math.min(control.maturityLevel + 1, 4),
        category: category.name.replace('Contrôles ', '')
      });
    });
  });
  
  return barData;
};

const BAR_DATA = generateBarData();

// Lacunes basées sur les vrais contrôles avec maturityLevel < 2
const generateGapsData = () => {
  const gaps: any[] = [];
  
  ISO27001_CONTROLS.forEach(category => {
    category.controls
      .filter(control => control.maturityLevel < 2)
      .slice(0, 10) // Limiter à 10 lacunes pour l'affichage
      .forEach(control => {
        gaps.push({
          reference: 'ISO 27001:2022',
          criterion: control.code,
          subCriterion: control.title,
          score: control.maturityLevel,
          level: getMaturityLevel(control.maturityLevel),
          recommendation: control.gaps.length > 0 ? control.gaps[0] : 'Améliorer l\'implémentation de ce contrôle',
          priority: control.priority
        });
      });
  });
  
  return gaps.sort((a, b) => {
    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
           (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
  });
};

const GAPS_DATA = generateGapsData();

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
            <div className="text-2xl font-bold">{CALCULATED_RESULTS.overallScore}/4</div>
            <p className="text-xs text-muted-foreground">
              Niveau {CALCULATED_RESULTS.overallLevel}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lacunes Identifiées</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CALCULATED_RESULTS.totalGaps}</div>
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
              {CALCULATED_RESULTS.completedActions}/{CALCULATED_RESULTS.totalActions}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((CALCULATED_RESULTS.completedActions / CALCULATED_RESULTS.totalActions) * 100)}% complété
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conformité</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CALCULATED_RESULTS.complianceRate}%</div>
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
                <Radar name="Actuel" dataKey="current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Cible" dataKey="target" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
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
                <TableCell className="max-w-xs truncate">{gap.subCriterion}</TableCell>
                <TableCell>
                  <Badge variant={gap.score === 0 ? "destructive" : "secondary"}>
                    {gap.score}/4
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    gap.level === 'Initial' ? 'text-red-600' : 
                    gap.level === 'Reproductible' ? 'text-orange-600' : 'text-blue-600'
                  }>
                    {gap.level}
                  </Badge>
                </TableCell>
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
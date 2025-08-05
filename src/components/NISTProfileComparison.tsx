import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle2,
  Target,
  Lightbulb
} from 'lucide-react';
import { NISTProfile, NISTFunction, NISTTier, NIST_TIERS, getTierToScore } from '@/types/nist';
import { NIST_CSF_FUNCTIONS } from '@/data/nistControls';

interface ProfileComparison {
  function: NISTFunction;
  currentScore: number;
  targetScore: number;
  communityScore: number;
  gap: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

interface GapAnalysisResult {
  totalGaps: number;
  criticalGaps: number;
  highPriorityGaps: number;
  averageGap: number;
  mostCriticalFunction: NISTFunction;
  quickWins: ProfileComparison[];
  longTermGoals: ProfileComparison[];
}

// Données d'exemple pour les profils communautaires
const COMMUNITY_PROFILES: NISTProfile[] = [
  {
    id: 'financial-services',
    name: 'Services Financiers',
    type: 'community',
    description: 'Profil de référence pour le secteur des services financiers',
    sector: 'Finance',
    functions: [
      { functionId: 'GOVERN', targetTier: 'adaptive', selectedSubCategories: [], priority: 'critical' },
      { functionId: 'IDENTIFY', targetTier: 'repeatable', selectedSubCategories: [], priority: 'high' },
      { functionId: 'PROTECT', targetTier: 'adaptive', selectedSubCategories: [], priority: 'critical' },
      { functionId: 'DETECT', targetTier: 'repeatable', selectedSubCategories: [], priority: 'high' },
      { functionId: 'RESPOND', targetTier: 'repeatable', selectedSubCategories: [], priority: 'high' },
      { functionId: 'RECOVER', targetTier: 'risk_informed', selectedSubCategories: [], priority: 'medium' }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'healthcare',
    name: 'Santé',
    type: 'community', 
    description: 'Profil de référence pour le secteur de la santé',
    sector: 'Santé',
    functions: [
      { functionId: 'GOVERN', targetTier: 'repeatable', selectedSubCategories: [], priority: 'high' },
      { functionId: 'IDENTIFY', targetTier: 'repeatable', selectedSubCategories: [], priority: 'high' },
      { functionId: 'PROTECT', targetTier: 'adaptive', selectedSubCategories: [], priority: 'critical' },
      { functionId: 'DETECT', targetTier: 'risk_informed', selectedSubCategories: [], priority: 'medium' },
      { functionId: 'RESPOND', targetTier: 'risk_informed', selectedSubCategories: [], priority: 'medium' },
      { functionId: 'RECOVER', targetTier: 'risk_informed', selectedSubCategories: [], priority: 'medium' }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'manufacturing',
    name: 'Industrie Manufacturing',
    type: 'community',
    description: 'Profil de référence pour l\'industrie manufacturière',
    sector: 'Manufacturing',
    functions: [
      { functionId: 'GOVERN', targetTier: 'risk_informed', selectedSubCategories: [], priority: 'medium' },
      { functionId: 'IDENTIFY', targetTier: 'repeatable', selectedSubCategories: [], priority: 'high' },
      { functionId: 'PROTECT', targetTier: 'repeatable', selectedSubCategories: [], priority: 'high' },
      { functionId: 'DETECT', targetTier: 'risk_informed', selectedSubCategories: [], priority: 'medium' },
      { functionId: 'RESPOND', targetTier: 'risk_informed', selectedSubCategories: [], priority: 'medium' },
      { functionId: 'RECOVER', targetTier: 'repeatable', selectedSubCategories: [], priority: 'high' }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

interface NISTProfileComparisonProps {
  currentProfile: NISTProfile;
  targetProfile: NISTProfile;
  onGenerateActionPlan: (gaps: ProfileComparison[]) => void;
}

export function NISTProfileComparison({ 
  currentProfile, 
  targetProfile, 
  onGenerateActionPlan 
}: NISTProfileComparisonProps) {
  const [selectedCommunityProfile, setSelectedCommunityProfile] = useState<string>('');
  const [analysisView, setAnalysisView] = useState<'summary' | 'detailed' | 'roadmap'>('summary');

  const performGapAnalysis = (): { comparisons: ProfileComparison[], analysis: GapAnalysisResult } => {
    const comparisons: ProfileComparison[] = [];
    
    NIST_CSF_FUNCTIONS.forEach(functionData => {
      const currentFunc = currentProfile.functions.find(f => f.functionId === functionData.id);
      const targetFunc = targetProfile.functions.find(f => f.functionId === functionData.id);
      const communityFunc = selectedCommunityProfile ? 
        COMMUNITY_PROFILES.find(p => p.id === selectedCommunityProfile)?.functions
          .find(f => f.functionId === functionData.id) : null;

      const currentScore = currentFunc ? getTierToScore(currentFunc.targetTier) : 1;
      const targetScore = targetFunc ? getTierToScore(targetFunc.targetTier) : 1;
      const communityScore = communityFunc ? getTierToScore(communityFunc.targetTier) : 1;
      
      const gap = targetScore - currentScore;
      
      const priority = gap >= 3 ? 'critical' :
                      gap >= 2 ? 'high' :
                      gap >= 1 ? 'medium' : 'low';

      const recommendations = generateFunctionRecommendations(functionData.id, gap);

      comparisons.push({
        function: functionData.id,
        currentScore,
        targetScore,
        communityScore,
        gap,
        priority,
        recommendations
      });
    });

    const totalGaps = comparisons.filter(c => c.gap > 0).length;
    const criticalGaps = comparisons.filter(c => c.priority === 'critical').length;
    const highPriorityGaps = comparisons.filter(c => c.priority === 'high').length;
    const averageGap = comparisons.reduce((sum, c) => sum + c.gap, 0) / comparisons.length;
    const mostCriticalFunction = comparisons.sort((a, b) => b.gap - a.gap)[0]?.function;
    
    const quickWins = comparisons.filter(c => c.gap > 0 && c.gap <= 1);
    const longTermGoals = comparisons.filter(c => c.gap > 1);

    const analysis: GapAnalysisResult = {
      totalGaps,
      criticalGaps,
      highPriorityGaps,
      averageGap,
      mostCriticalFunction,
      quickWins,
      longTermGoals
    };

    return { comparisons, analysis };
  };

  const generateFunctionRecommendations = (functionId: NISTFunction, gap: number): string[] => {
    const baseRecommendations: Record<NISTFunction, string[]> = {
      GOVERN: [
        "Établir une politique de cybersécurité formelle",
        "Créer un comité de gouvernance cybersécurité",
        "Définir les rôles et responsabilités",
        "Mettre en place des indicateurs de performance"
      ],
      IDENTIFY: [
        "Réaliser un inventaire complet des actifs",
        "Cartographier les flux de données",
        "Évaluer les risques de tiers",
        "Identifier les actifs critiques"
      ],
      PROTECT: [
        "Renforcer les contrôles d'accès",
        "Déployer le chiffrement des données",
        "Améliorer la gestion des correctifs",
        "Former les utilisateurs"
      ],
      DETECT: [
        "Déployer des outils de surveillance",
        "Établir un SOC/SIEM",
        "Créer des playbooks de détection",
        "Implémenter le threat hunting"
      ],
      RESPOND: [
        "Créer un plan de réponse aux incidents",
        "Former l'équipe de réponse",
        "Établir des communications de crise",
        "Tester les procédures régulièrement"
      ],
      RECOVER: [
        "Développer un plan de continuité",
        "Tester les sauvegardes",
        "Établir des RTO/RPO",
        "Planifier la récupération"
      ]
    };

    const recommendations = baseRecommendations[functionId] || [];
    return gap > 1 ? recommendations : recommendations.slice(0, 2);
  };

  const { comparisons, analysis } = performGapAnalysis();

  // Données pour les graphiques
  const chartData = comparisons.map(comp => ({
    function: comp.function,
    current: comp.currentScore,
    target: comp.targetScore,
    community: comp.communityScore,
    gap: comp.gap
  }));

  const roadmapData = comparisons
    .filter(c => c.gap > 0)
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  const renderSummaryView = () => (
    <div className="space-y-6">
      {/* KPIs de l'analyse */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Écarts Totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.totalGaps}</div>
            <div className="text-xs text-muted-foreground">
              sur 6 fonctions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Priorité Critique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analysis.criticalGaps}</div>
            <div className="text-xs text-muted-foreground">
              à traiter immédiatement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Écart Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.averageGap.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">
              niveaux de maturité
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analysis.quickWins.length}</div>
            <div className="text-xs text-muted-foreground">
              améliorations rapides
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique de comparaison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des Profils</CardTitle>
          <CardDescription>
            Analyse des écarts entre profil actuel et cible
            {selectedCommunityProfile && " avec référence sectorielle"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="function" />
              <YAxis domain={[0, 4]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#94a3b8" name="Actuel" />
              <Bar dataKey="target" fill="#3b82f6" name="Cible" />
              {selectedCommunityProfile && (
                <Bar dataKey="community" fill="#10b981" name="Référence Sectorielle" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderDetailedView = () => (
    <div className="space-y-4">
      {comparisons.map(comp => (
        <Card key={comp.function}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge 
                  style={{ backgroundColor: NIST_CSF_FUNCTIONS.find(f => f.id === comp.function)?.color }}
                  className="text-white"
                >
                  {comp.function}
                </Badge>
                <CardTitle className="text-lg">
                  {NIST_CSF_FUNCTIONS.find(f => f.id === comp.function)?.name}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  comp.priority === 'critical' ? 'destructive' :
                  comp.priority === 'high' ? 'default' :
                  comp.priority === 'medium' ? 'secondary' : 'outline'
                }>
                  {comp.priority === 'critical' ? 'Critique' :
                   comp.priority === 'high' ? 'Élevé' :
                   comp.priority === 'medium' ? 'Moyen' : 'Faible'}
                </Badge>
                {comp.gap > 0 ? (
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                ) : comp.gap < 0 ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progression visuelle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Niveau Actuel</span>
                  <span>{NIST_TIERS[Object.keys(NIST_TIERS)[comp.currentScore - 1] as NISTTier]?.label}</span>
                </div>
                <Progress value={(comp.currentScore / 4) * 100} className="h-2" />
                
                <div className="flex items-center justify-between text-sm">
                  <span>Niveau Cible</span>
                  <span>{NIST_TIERS[Object.keys(NIST_TIERS)[comp.targetScore - 1] as NISTTier]?.label}</span>
                </div>
                <Progress value={(comp.targetScore / 4) * 100} className="h-2" />
              </div>

              {/* Écart et recommandations */}
              {comp.gap > 0 && (
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Écart: {comp.gap} niveau(x)</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Recommandations:
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      {comp.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderRoadmapView = () => (
    <div className="space-y-6">
      {/* Quick Wins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Quick Wins (0-3 mois)
          </CardTitle>
          <CardDescription>
            Améliorations rapides avec impact immédiat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.quickWins.map(win => (
              <div key={win.function} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{win.function}</Badge>
                  <span className="font-medium">
                    {NIST_CSF_FUNCTIONS.find(f => f.id === win.function)?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    +{win.gap} niveau
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Objectifs à long terme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Objectifs Long Terme (3-12 mois)
          </CardTitle>
          <CardDescription>
            Transformations majeures nécessitant un investissement significatif
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.longTermGoals.map(goal => (
              <div key={goal.function} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={goal.priority === 'critical' ? 'destructive' : 'default'}>
                    {goal.function}
                  </Badge>
                  <span className="font-medium">
                    {NIST_CSF_FUNCTIONS.find(f => f.id === goal.function)?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {goal.priority === 'critical' ? 'Critique' : 'Élevé'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    +{goal.gap} niveaux
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline graphique */}
      <Card>
        <CardHeader>
          <CardTitle>Roadmap de Progression</CardTitle>
          <CardDescription>Évolution prévue des niveaux de maturité</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="function" />
              <YAxis domain={[0, 4]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="current" stroke="#94a3b8" name="Actuel" />
              <Line type="monotone" dataKey="target" stroke="#3b82f6" name="Cible" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedCommunityProfile} onValueChange={setSelectedCommunityProfile}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Comparer avec un secteur" />
            </SelectTrigger>
            <SelectContent>
              {COMMUNITY_PROFILES.map(profile => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Button
              variant={analysisView === 'summary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnalysisView('summary')}
            >
              Synthèse
            </Button>
            <Button
              variant={analysisView === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnalysisView('detailed')}
            >
              Détaillé
            </Button>
            <Button
              variant={analysisView === 'roadmap' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnalysisView('roadmap')}
            >
              Roadmap
            </Button>
          </div>
        </div>

        <Button 
          onClick={() => onGenerateActionPlan(comparisons.filter(c => c.gap > 0))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Générer Plan d'Action
        </Button>
      </div>

      {/* Contenu selon la vue */}
      {analysisView === 'summary' && renderSummaryView()}
      {analysisView === 'detailed' && renderDetailedView()}
      {analysisView === 'roadmap' && renderRoadmapView()}
    </div>
  );
}
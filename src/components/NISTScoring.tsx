import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { NISTFunction, NISTTier, NIST_TIERS, getTierToScore } from '@/types/nist';
import { NIST_CSF_FUNCTIONS } from '@/data/nistControls';

interface NISTResponse {
  subCategoryId: string;
  currentTier: NISTTier;
  targetTier: NISTTier;
  implementationStatus: 'not_implemented' | 'partial' | 'full' | 'not_applicable';
  evidence: string;
  gaps: string[];
  comment: string;
}

interface NISTScoringProps {
  responses: NISTResponse[];
}

interface FunctionScore {
  function: NISTFunction;
  currentScore: number;
  targetScore: number;
  gapScore: number;
  maturityLevel: NISTTier;
  implementation: number;
  totalSubCategories: number;
  assessedSubCategories: number;
}

interface GapAnalysis {
  function: NISTFunction;
  category: string;
  subCategory: string;
  currentTier: NISTTier;
  targetTier: NISTTier;
  gap: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export function NISTScoring({ responses }: NISTScoringProps) {
  
  const calculateFunctionScores = (): FunctionScore[] => {
    return NIST_CSF_FUNCTIONS.map(functionData => {
      const subCategories = functionData.categories.flatMap(c => c.subCategories);
      const functionResponses = responses.filter(r => 
        subCategories.some(sc => sc.id === r.subCategoryId)
      );

      const currentScores = functionResponses.map(r => getTierToScore(r.currentTier));
      const targetScores = functionResponses.map(r => getTierToScore(r.targetTier));
      
      const avgCurrent = currentScores.length > 0 
        ? currentScores.reduce((sum, score) => sum + score, 0) / currentScores.length 
        : 0;
      const avgTarget = targetScores.length > 0 
        ? targetScores.reduce((sum, score) => sum + score, 0) / targetScores.length 
        : 0;

      const implementedCount = functionResponses.filter(r => 
        r.implementationStatus === 'full' || r.implementationStatus === 'partial'
      ).length;

      const maturityLevel = avgCurrent >= 3.5 ? 'adaptive' :
                           avgCurrent >= 2.5 ? 'repeatable' :
                           avgCurrent >= 1.5 ? 'risk_informed' : 'partial';

      return {
        function: functionData.id,
        currentScore: avgCurrent,
        targetScore: avgTarget,
        gapScore: avgTarget - avgCurrent,
        maturityLevel,
        implementation: (implementedCount / subCategories.length) * 100,
        totalSubCategories: subCategories.length,
        assessedSubCategories: functionResponses.length
      };
    });
  };

  const performGapAnalysis = (): GapAnalysis[] => {
    const gaps: GapAnalysis[] = [];

    NIST_CSF_FUNCTIONS.forEach(functionData => {
      functionData.categories.forEach(category => {
        category.subCategories.forEach(subCategory => {
          const response = responses.find(r => r.subCategoryId === subCategory.id);
          if (response) {
            const currentScore = getTierToScore(response.currentTier);
            const targetScore = getTierToScore(response.targetTier);
            const gap = targetScore - currentScore;

            if (gap > 0) {
              const priority = gap >= 3 ? 'critical' :
                             gap >= 2 ? 'high' :
                             gap >= 1 ? 'medium' : 'low';

              const recommendations = generateRecommendations(functionData.id, response);

              gaps.push({
                function: functionData.id,
                category: category.name,
                subCategory: subCategory.title,
                currentTier: response.currentTier,
                targetTier: response.targetTier,
                gap,
                priority,
                recommendations
              });
            }
          }
        });
      });
    });

    return gaps.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const generateRecommendations = (functionId: NISTFunction, response: NISTResponse): string[] => {
    const recommendations: Record<NISTFunction, string[]> = {
      GOVERN: [
        "Établir une politique de gouvernance de la cybersécurité formelle",
        "Définir les rôles et responsabilités en matière de cybersécurité",
        "Mettre en place un comité de pilotage cybersécurité",
        "Développer un programme de formation et sensibilisation"
      ],
      IDENTIFY: [
        "Réaliser un inventaire complet des actifs",
        "Effectuer une évaluation des risques régulière",
        "Cartographier les flux de données sensibles",
        "Identifier les fournisseurs critiques"
      ],
      PROTECT: [
        "Implémenter des contrôles d'accès basés sur les rôles",
        "Déployer des solutions de chiffrement",
        "Mettre en place la gestion des correctifs",
        "Renforcer la sécurité des données"
      ],
      DETECT: [
        "Déployer des outils de surveillance en temps réel",
        "Établir des indicateurs de compromission",
        "Mettre en place un SOC ou SIEM",
        "Développer des capacités de threat hunting"
      ],
      RESPOND: [
        "Créer un plan de réponse aux incidents",
        "Former une équipe de réponse d'urgence",
        "Établir des procédures de communication de crise",
        "Tester régulièrement les procédures de réponse"
      ],
      RECOVER: [
        "Développer un plan de continuité d'activité",
        "Implémenter des solutions de sauvegarde",
        "Tester les procédures de récupération",
        "Établir des objectifs de temps de récupération"
      ]
    };

    return recommendations[functionId] || [];
  };

  const functionScores = calculateFunctionScores();
  const gapAnalysis = performGapAnalysis();
  const overallScore = functionScores.reduce((sum, f) => sum + f.currentScore, 0) / functionScores.length;
  const overallTarget = functionScores.reduce((sum, f) => sum + f.targetScore, 0) / functionScores.length;
  const overallGap = overallTarget - overallScore;

  // Données pour les graphiques
  const chartData = functionScores.map(score => ({
    function: score.function,
    current: score.currentScore,
    target: score.targetScore,
    gap: score.gapScore,
    implementation: score.implementation
  }));

  const radarData = functionScores.map(score => ({
    function: score.function,
    score: score.currentScore,
    fullMark: 4
  }));

  return (
    <div className="space-y-6">
      {/* Score global */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallScore.toFixed(1)}/4</div>
            <div className="text-xs text-muted-foreground">
              Niveau {overallScore >= 3.5 ? 'Adaptatif' : 
                     overallScore >= 2.5 ? 'Répétable' :
                     overallScore >= 1.5 ? 'Informé par les Risques' : 'Partiel'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Écart à Combler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overallGap.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">
              Objectif: {overallTarget.toFixed(1)}/4
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sous-catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responses.length}</div>
            <div className="text-xs text-muted-foreground">
              / 64 évaluées
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Écarts Critiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {gapAnalysis.filter(g => g.priority === 'critical').length}
            </div>
            <div className="text-xs text-muted-foreground">
              À traiter en priorité
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scores par Fonction</CardTitle>
            <CardDescription>Comparaison entre niveau actuel et cible</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="function" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#3b82f6" name="Actuel" />
                <Bar dataKey="target" fill="#10b981" name="Cible" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profil de Maturité</CardTitle>
            <CardDescription>Vue radar des capacités actuelles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="function" />
                <PolarRadiusAxis angle={0} domain={[0, 4]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Détail par fonction */}
      <Card>
        <CardHeader>
          <CardTitle>Détail par Fonction</CardTitle>
          <CardDescription>Analyse détaillée des scores et implémentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {functionScores.map(score => (
              <div key={score.function} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge 
                    style={{ backgroundColor: NIST_CSF_FUNCTIONS.find(f => f.id === score.function)?.color }}
                    className="text-white"
                  >
                    {score.function}
                  </Badge>
                  <div>
                    <div className="font-medium">
                      {NIST_CSF_FUNCTIONS.find(f => f.id === score.function)?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {score.assessedSubCategories}/{score.totalSubCategories} sous-catégories évaluées
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Score: {score.currentScore.toFixed(1)}/4</div>
                    <div className="text-xs text-muted-foreground">
                      Cible: {score.targetScore.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {score.implementation.toFixed(0)}% implémenté
                    </div>
                    <Progress value={score.implementation} className="w-20" />
                  </div>
                  <Badge variant={
                    score.maturityLevel === 'adaptive' ? 'default' :
                    score.maturityLevel === 'repeatable' ? 'secondary' :
                    score.maturityLevel === 'risk_informed' ? 'outline' : 'destructive'
                  }>
                    {NIST_TIERS[score.maturityLevel].label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyse des écarts */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse des Écarts Prioritaires</CardTitle>
          <CardDescription>Écarts identifiés avec recommandations d'amélioration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gapAnalysis.slice(0, 10).map((gap, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      gap.priority === 'critical' ? 'destructive' :
                      gap.priority === 'high' ? 'default' :
                      gap.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {gap.priority === 'critical' ? 'Critique' :
                       gap.priority === 'high' ? 'Élevé' :
                       gap.priority === 'medium' ? 'Moyen' : 'Faible'}
                    </Badge>
                    <Badge variant="outline">{gap.function}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Écart: {gap.gap} niveau(x)
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="font-medium">{gap.subCategory}</div>
                  <div className="text-sm text-muted-foreground">{gap.category}</div>
                  <div className="text-xs mt-1">
                    {NIST_TIERS[gap.currentTier].label} → {NIST_TIERS[gap.targetTier].label}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Recommandations:</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {gap.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
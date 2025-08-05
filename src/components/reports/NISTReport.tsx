import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { ReportTemplate } from '@/types/reports';
import { Shield, Target, TrendingUp, Activity, Zap, Eye, Users, Cog } from 'lucide-react';

interface NISTReportProps {
  template: ReportTemplate;
}

export function NISTReport({ template }: NISTReportProps) {
  // Données simulées pour NIST CSF 2.0
  const mockData = {
    overallMaturity: 3.4,
    cyberResilienceScore: 78,
    
    functions: [
      { id: 'GOVERN', name: 'GOUVERNER', categories: 5, implemented: 4, maturity: 3.6, score: 72 },
      { id: 'IDENTIFY', name: 'IDENTIFIER', categories: 6, implemented: 5, maturity: 3.8, score: 85 },
      { id: 'PROTECT', name: 'PROTÉGER', categories: 6, implemented: 4, maturity: 3.2, score: 67 },
      { id: 'DETECT', name: 'DÉTECTER', categories: 3, implemented: 2, maturity: 2.9, score: 58 },
      { id: 'RESPOND', name: 'RÉPONDRE', categories: 5, implemented: 3, maturity: 3.1, score: 62 },
      { id: 'RECOVER', name: 'RÉCUPÉRER', categories: 5, implemented: 4, maturity: 3.5, score: 80 }
    ],
    
    profileComparison: {
      current: [
        { function: 'GOUVERNER', current: 72, target: 90 },
        { function: 'IDENTIFIER', current: 85, target: 95 },
        { function: 'PROTÉGER', current: 67, target: 85 },
        { function: 'DÉTECTER', current: 58, target: 80 },
        { function: 'RÉPONDRE', current: 62, target: 85 },
        { function: 'RÉCUPÉRER', current: 80, target: 90 }
      ]
    },
    
    implementationTiers: {
      tier1: 15, // Partiel
      tier2: 35, // Informé sur les risques
      tier3: 40, // Répétable
      tier4: 10  // Adaptatif
    },
    
    riskCategories: [
      { category: 'Menaces Persistantes Avancées', level: 'Élevé', trend: 'stable' },
      { category: 'Attaques par Ransomware', level: 'Critique', trend: 'croissant' },
      { category: 'Compromission des Identités', level: 'Élevé', trend: 'croissant' },
      { category: 'Vulnérabilités Zero-Day', level: 'Moyen', trend: 'stable' }
    ]
  };

  const TIER_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className="space-y-8 p-6 bg-white">
      {/* En-tête du rapport */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rapport NIST Cybersecurity Framework 2.0</h1>
        <p className="text-lg text-gray-600 mt-2">Évaluation Complète de la Posture de Cybersécurité</p>
        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
          <span>Généré le: {new Date().toLocaleDateString('fr-FR')}</span>
          <span>•</span>
          <span>Période: Mai 2024</span>
          <span>•</span>
          <span>Version: 2.0</span>
        </div>
      </div>

      {/* Tableau de bord exécutif */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Tableau de Bord Exécutif
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockData.overallMaturity}/5</p>
                  <p className="text-sm text-gray-600">Maturité Globale</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockData.cyberResilienceScore}%</p>
                  <p className="text-sm text-gray-600">Résilience Cyber</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Cog className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">6/6</p>
                  <p className="text-sm text-gray-600">Fonctions Couvertes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Niveau 3</p>
                  <p className="text-sm text-gray-600">Tier d'Impl.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Points Clés du Framework</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Niveau de maturité global de {mockData.overallMaturity}/5 démontrant une approche structurée</li>
            <li>• Score de résilience cyber de {mockData.cyberResilienceScore}% indiquant une capacité de récupération solide</li>
            <li>• Fonction IDENTIFIER la plus mature avec 85% d'implémentation</li>
            <li>• Amélioration requise sur la fonction DÉTECTER (58%)</li>
          </ul>
        </div>
      </section>

      {/* Analyse des 6 Fonctions */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Analyse des Six Fonctions du Framework</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil Actuel vs Cible</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={mockData.profileComparison.current}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="function" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Actuel" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Cible" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance par Fonction</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={mockData.functions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Détail par fonction */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockData.functions.map((func, index) => {
            const iconMap: Record<string, React.ReactNode> = {
              'GOVERN': <Cog className="w-5 h-5" />,
              'IDENTIFY': <Eye className="w-5 h-5" />,
              'PROTECT': <Shield className="w-5 h-5" />,
              'DETECT': <Activity className="w-5 h-5" />,
              'RESPOND': <Zap className="w-5 h-5" />,
              'RECOVER': <TrendingUp className="w-5 h-5" />
            };
            
            return (
              <Card key={func.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {iconMap[func.id]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{func.name}</h3>
                      <p className="text-xs text-gray-500">{func.id}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score:</span>
                      <span className="font-semibold">{func.score}%</span>
                    </div>
                    <Progress value={func.score} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Catégories: {func.implemented}/{func.categories}</span>
                      <span>Maturité: {func.maturity}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Niveaux d'Implémentation (Tiers) */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Niveaux d'Implémentation (Implementation Tiers)</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Tier 1 - Partiel', value: mockData.implementationTiers.tier1 },
                      { name: 'Tier 2 - Informé', value: mockData.implementationTiers.tier2 },
                      { name: 'Tier 3 - Répétable', value: mockData.implementationTiers.tier3 },
                      { name: 'Tier 4 - Adaptatif', value: mockData.implementationTiers.tier4 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.split(' - ')[1]} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1, 2, 3].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TIER_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Analyse des Tiers d'Implémentation</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <div className="flex-1">
                    <p className="font-medium">Tier 1 - Partiel ({mockData.implementationTiers.tier1}%)</p>
                    <p className="text-sm text-gray-600">Gestion réactive des risques</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <div className="flex-1">
                    <p className="font-medium">Tier 2 - Informé ({mockData.implementationTiers.tier2}%)</p>
                    <p className="text-sm text-gray-600">Conscience des risques</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <div className="flex-1">
                    <p className="font-medium">Tier 3 - Répétable ({mockData.implementationTiers.tier3}%)</p>
                    <p className="text-sm text-gray-600">Processus formalisés</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <div className="flex-1">
                    <p className="font-medium">Tier 4 - Adaptatif ({mockData.implementationTiers.tier4}%)</p>
                    <p className="text-sm text-gray-600">Amélioration continue</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Analyse des Risques */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Paysage des Menaces et Risques</h2>
        
        <div className="space-y-4">
          {mockData.riskCategories.map((risk, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{risk.category}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant={
                        risk.level === 'Critique' ? 'destructive' : 
                        risk.level === 'Élevé' ? 'secondary' : 'outline'
                      }>
                        {risk.level}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Tendance: {risk.trend === 'croissant' ? '📈' : '➡️'} {risk.trend}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Plan d'Amélioration */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Plan d'Amélioration NIST CSF 2.0</h2>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">1. Renforcement de la Fonction DÉTECTER</h3>
              <p className="text-sm text-gray-600 mb-3">
                Améliorer les capacités de détection des anomalies et événements de sécurité.
              </p>
              <div className="flex gap-2 mb-2">
                <Badge variant="destructive">Priorité Critique</Badge>
                <Badge variant="outline">3-6 mois</Badge>
              </div>
              <div className="text-xs text-gray-500">
                Impact sur les fonctions: DÉTECTER (+25%), RÉPONDRE (+15%)
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">2. Optimisation de la Fonction PROTÉGER</h3>
              <p className="text-sm text-gray-600 mb-3">
                Renforcer les contrôles de protection des données et systèmes critiques.
              </p>
              <div className="flex gap-2 mb-2">
                <Badge variant="secondary">Priorité Élevée</Badge>
                <Badge variant="outline">6-12 mois</Badge>
              </div>
              <div className="text-xs text-gray-500">
                Impact sur les fonctions: PROTÉGER (+18%), RÉCUPÉRER (+10%)
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">3. Progression vers Tier 4 (Adaptatif)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Développer les capacités d'adaptation et d'amélioration continue.
              </p>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline">Priorité Moyenne</Badge>
                <Badge variant="outline">12-18 mois</Badge>
              </div>
              <div className="text-xs text-gray-500">
                Impact global: +20% sur l'ensemble des fonctions
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Conclusion et Roadmap */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Conclusion et Feuille de Route</h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                L'organisation démontre une maturité cybersécurité solide avec un score global de {mockData.cyberResilienceScore}% 
                de résilience. Le profil actuel révèle des forces dans l'identification et la récupération, 
                avec des opportunités d'amélioration dans la détection et la réponse.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Points Forts</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Gouvernance bien établie (72%)</li>
                    <li>• Excellente identification des actifs (85%)</li>
                    <li>• Capacité de récupération robuste (80%)</li>
                    <li>• 40% des processus au niveau répétable</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Axes d'Amélioration</h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Renforcer la détection (58% → 80%)</li>
                    <li>• Améliorer la réponse (62% → 85%)</li>
                    <li>• Progresser vers Tier 4 adaptatif</li>
                    <li>• Réduire les processus partiels (15%)</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Feuille de Route 18 Mois</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <h4 className="font-medium text-blue-700">0-6 mois</h4>
                    <ul className="text-sm text-blue-600 mt-1">
                      <li>• SIEM avancé</li>
                      <li>• Détection comportementale</li>
                      <li>• Playbooks de réponse</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700">6-12 mois</h4>
                    <ul className="text-sm text-blue-600 mt-1">
                      <li>• Zero Trust Architecture</li>
                      <li>• Automatisation réponse</li>
                      <li>• Threat Intelligence</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700">12-18 mois</h4>
                    <ul className="text-sm text-blue-600 mt-1">
                      <li>• IA/ML sécurité</li>
                      <li>• Amélioration continue</li>
                      <li>• Certification Tier 4</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pied de page */}
      <div className="text-center text-xs text-gray-500 border-t pt-4 mt-8">
        <p>Ce rapport a été généré automatiquement selon le NIST Cybersecurity Framework 2.0</p>
        <p>Document confidentiel - Diffusion restreinte</p>
      </div>
    </div>
  );
}
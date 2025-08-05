import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { ReportTemplate } from '@/types/reports';
import { Shield, Users, Network, Lock, Eye, Zap, Cloud, UserCheck } from 'lucide-react';

interface CISAReportProps {
  template: ReportTemplate;
}

export function CISAReport({ template }: CISAReportProps) {
  // Données simulées pour CISA ZTMM
  const mockData = {
    overallZTMaturity: 2.3, // Sur échelle 1-4 (Traditional, Initial, Advanced, Optimal)
    readinessScore: 68,
    
    pillars: [
      { 
        id: 'IDENTITY', 
        name: 'Identité', 
        maturity: 'advanced', 
        score: 75, 
        subComponents: 12,
        implemented: 9
      },
      { 
        id: 'DEVICE', 
        name: 'Dispositifs', 
        maturity: 'initial', 
        score: 58, 
        subComponents: 10,
        implemented: 6
      },
      { 
        id: 'NETWORK', 
        name: 'Réseaux/Environnement', 
        maturity: 'initial', 
        score: 62, 
        subComponents: 14,
        implemented: 8
      },
      { 
        id: 'APPLICATION', 
        name: 'Applications et Charges de Travail', 
        maturity: 'advanced', 
        score: 78, 
        subComponents: 11,
        implemented: 9
      },
      { 
        id: 'DATA', 
        name: 'Données', 
        maturity: 'initial', 
        score: 55, 
        subComponents: 9,
        implemented: 5
      }
    ],
    
    crossCuttingCapabilities: [
      { name: 'Visibilité et Analytics', score: 65, maturity: 'initial' },
      { name: 'Automatisation et Orchestration', score: 45, maturity: 'traditional' },
      { name: 'Gouvernance', score: 72, maturity: 'advanced' }
    ],
    
    maturityDistribution: {
      traditional: 25,
      initial: 40,
      advanced: 30,
      optimal: 5
    },
    
    implementationRoadmap: [
      { phase: 'Phase 1', duration: '0-6 mois', focus: 'Identité et Accès' },
      { phase: 'Phase 2', duration: '6-12 mois', focus: 'Sécurité Réseau' },
      { phase: 'Phase 3', duration: '12-18 mois', focus: 'Protection Données' },
      { phase: 'Phase 4', duration: '18-24 mois', focus: 'Optimisation Continue' }
    ],
    
    zeroTrustPrinciples: [
      { principle: 'Ne jamais faire confiance, toujours vérifier', compliance: 68 },
      { principle: 'Assumer la compromission', compliance: 45 },
      { principle: 'Vérifier explicitement', compliance: 72 },
      { principle: 'Utiliser les privilèges minimums', compliance: 58 },
      { principle: 'Microsegmentation', compliance: 35 },
      { principle: 'Sécuriser avec cryptographie', compliance: 65 }
    ]
  };

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case 'traditional': return '#ef4444';
      case 'initial': return '#f97316';
      case 'advanced': return '#3b82f6';
      case 'optimal': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getMaturityLabel = (maturity: string) => {
    switch (maturity) {
      case 'traditional': return 'Traditionnel';
      case 'initial': return 'Initial';
      case 'advanced': return 'Avancé';
      case 'optimal': return 'Optimal';
      default: return maturity;
    }
  };

  return (
    <div className="space-y-8 p-6 bg-white">
      {/* En-tête du rapport */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rapport CISA Zero Trust Maturity Model</h1>
        <p className="text-lg text-gray-600 mt-2">Évaluation de la Maturité Zero Trust selon le Modèle CISA</p>
        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
          <span>Généré le: {new Date().toLocaleDateString('fr-FR')}</span>
          <span>•</span>
          <span>Période: Mai 2024</span>
          <span>•</span>
          <span>Modèle CISA ZTMM v2.0</span>
        </div>
      </div>

      {/* Tableau de bord Zero Trust */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Vue d'Ensemble Zero Trust
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockData.overallZTMaturity}/4</p>
                  <p className="text-sm text-gray-600">Maturité ZT</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockData.readinessScore}%</p>
                  <p className="text-sm text-gray-600">Préparation ZT</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Network className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5/5</p>
                  <p className="text-sm text-gray-600">Piliers Couverts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">30%</p>
                  <p className="text-sm text-gray-600">Niveau Avancé</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">État Actuel Zero Trust</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Maturité Zero Trust globale de {mockData.overallZTMaturity}/4 (niveau Initial à Avancé)</li>
            <li>• {mockData.readinessScore}% de préparation pour une architecture Zero Trust complète</li>
            <li>• Piliers Applications et Identité les plus matures (75-78%)</li>
            <li>• Priorité sur la sécurisation des données et l'automatisation</li>
          </ul>
        </div>
      </section>

      {/* Analyse des 5 Piliers */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Analyse des Cinq Piliers Zero Trust</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Maturité par Pilier</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData.pillars}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Radar Zero Trust</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={mockData.pillars}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Détail par pilier */}
        <div className="mt-6 space-y-4">
          {mockData.pillars.map((pillar, index) => {
            const iconMap: Record<string, React.ReactNode> = {
              'IDENTITY': <Users className="w-5 h-5" />,
              'DEVICE': <Shield className="w-5 h-5" />,
              'NETWORK': <Network className="w-5 h-5" />,
              'APPLICATION': <Cloud className="w-5 h-5" />,
              'DATA': <Lock className="w-5 h-5" />
            };
            
            return (
              <Card key={pillar.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {iconMap[pillar.id]}
                      </div>
                      <div>
                        <h3 className="font-semibold">{pillar.name}</h3>
                        <p className="text-sm text-gray-600">{pillar.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant="outline" 
                        style={{ color: getMaturityColor(pillar.maturity), borderColor: getMaturityColor(pillar.maturity) }}
                      >
                        {getMaturityLabel(pillar.maturity)}
                      </Badge>
                      <Badge variant="outline">{pillar.score}%</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Sous-composants</p>
                      <p className="font-semibold">{pillar.implemented}/{pillar.subComponents}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Score ZT</p>
                      <p className="font-semibold">{pillar.score}%</p>
                    </div>
                    <div>
                      <Progress value={pillar.score} className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Capacités Transversales */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Capacités Transversales (Cross-Cutting)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockData.crossCuttingCapabilities.map((capability, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-sm">{capability.name}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score:</span>
                      <span className="font-semibold">{capability.score}%</span>
                    </div>
                    <Progress value={capability.score} className="h-2" />
                    <Badge 
                      variant="outline" 
                      style={{ color: getMaturityColor(capability.maturity), borderColor: getMaturityColor(capability.maturity) }}
                    >
                      {getMaturityLabel(capability.maturity)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Distribution de Maturité */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Distribution des Niveaux de Maturité</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Répartition Actuelle</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Traditionnel</span>
                      <span>{mockData.maturityDistribution.traditional}%</span>
                    </div>
                    <Progress value={mockData.maturityDistribution.traditional} className="h-2 mt-1" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Initial</span>
                      <span>{mockData.maturityDistribution.initial}%</span>
                    </div>
                    <Progress value={mockData.maturityDistribution.initial} className="h-2 mt-1" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Avancé</span>
                      <span>{mockData.maturityDistribution.advanced}%</span>
                    </div>
                    <Progress value={mockData.maturityDistribution.advanced} className="h-2 mt-1" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Optimal</span>
                      <span>{mockData.maturityDistribution.optimal}%</span>
                    </div>
                    <Progress value={mockData.maturityDistribution.optimal} className="h-2 mt-1" />
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Conformité aux Principes ZT</h3>
                <div className="space-y-3">
                  {mockData.zeroTrustPrinciples.slice(0, 4).map((principle, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{principle.principle}</span>
                        <span className="font-semibold">{principle.compliance}%</span>
                      </div>
                      <Progress value={principle.compliance} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
      </section>

      {/* Feuille de Route Zero Trust */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Feuille de Route Zero Trust</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockData.implementationRoadmap.map((phase, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold">{phase.phase}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <strong>Durée:</strong> {phase.duration}
                    </div>
                    <div className="text-sm">
                      <strong>Focus:</strong> {phase.focus}
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="w-full justify-center">
                    {phase.duration}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recommandations Zero Trust */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recommandations Prioritaires Zero Trust</h2>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">1. Renforcement de la Sécurité des Données</h3>
              <p className="text-sm text-gray-600 mb-3">
                Implémenter le chiffrement de bout en bout et la classification automatique des données.
              </p>
              <div className="flex gap-2 mb-2">
                <Badge variant="destructive">Critique</Badge>
                <Badge variant="outline">Pilier: DONNÉES</Badge>
                <Badge variant="outline">6-12 mois</Badge>
              </div>
              <div className="text-xs text-gray-500">
                Impact: Passage du niveau Initial à Avancé pour le pilier Données (+23 points)
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">2. Automatisation et Orchestration</h3>
              <p className="text-sm text-gray-600 mb-3">
                Développer les capacités d'automatisation pour les réponses aux incidents ZT.
              </p>
              <div className="flex gap-2 mb-2">
                <Badge variant="secondary">Élevée</Badge>
                <Badge variant="outline">Transversal</Badge>
                <Badge variant="outline">12-18 mois</Badge>
              </div>
              <div className="text-xs text-gray-500">
                Impact: +25 points sur les capacités transversales d'automatisation
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">3. Microsegmentation Réseau</h3>
              <p className="text-sm text-gray-600 mb-3">
                Implémenter une microsegmentation granulaire basée sur l'identité et le contexte.
              </p>
              <div className="flex gap-2 mb-2">
                <Badge variant="secondary">Élevée</Badge>
                <Badge variant="outline">Pilier: RÉSEAU</Badge>
                <Badge variant="outline">6-18 mois</Badge>
              </div>
              <div className="text-xs text-gray-500">
                Impact: Progression vers niveau Avancé pour réseaux/environnement (+16 points)
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Conclusion Zero Trust */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Conclusion et Vision Zero Trust</h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                L'organisation présente une maturité Zero Trust de {mockData.overallZTMaturity}/4, 
                positionnée entre les niveaux Initial et Avancé. Les fondations sont solides avec 
                {mockData.readinessScore}% de préparation pour une architecture Zero Trust complète.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Atouts Zero Trust</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Pilier Identité au niveau Avancé (75%)</li>
                    <li>• Applications sécurisées (78%)</li>
                    <li>• Gouvernance solide (72%)</li>
                    <li>• 30% des composants au niveau Avancé</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Défis Zero Trust</h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Sécurité des données (55%)</li>
                    <li>• Automatisation limitée (45%)</li>
                    <li>• Microsegmentation insuffisante (35%)</li>
                    <li>• 25% encore au niveau Traditionnel</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Vision Zero Trust 2026</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Objectif: Atteindre le niveau Avancé (3/4) sur 80% des piliers et progresser vers 
                  l'optimal sur les piliers critiques (Identité, Données).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <h4 className="font-medium text-blue-700">Objectifs Quantitatifs</h4>
                    <ul className="text-sm text-blue-600 mt-1">
                      <li>• Score global ZT: 85%+</li>
                      <li>• 4/5 piliers niveau Avancé</li>
                      <li>• 80% automatisation</li>
                      <li>• Conformité principes ZT: 90%+</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700">Jalons Stratégiques</h4>
                    <ul className="text-sm text-blue-600 mt-1">
                      <li>• Q1 2025: Données niveau Avancé</li>
                      <li>• Q3 2025: Automatisation 70%</li>
                      <li>• Q1 2026: Microsegmentation complète</li>
                      <li>• Q4 2026: Certification ZT Optimal</li>
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
        <p>Ce rapport a été généré selon le CISA Zero Trust Maturity Model v2.0</p>
        <p>Document confidentiel - Classification Zero Trust Restricted</p>
      </div>
    </div>
  );
}
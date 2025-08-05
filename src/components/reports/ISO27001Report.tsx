import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ReportTemplate } from '@/types/reports';
import { Shield, AlertTriangle, CheckCircle2, Target, TrendingUp, Users, FileText, Calendar } from 'lucide-react';

interface ISO27001ReportProps {
  template: ReportTemplate;
}

export function ISO27001Report({ template }: ISO27001ReportProps) {
  // Données simulées pour l'aperçu
  const mockData = {
    overallMaturity: 3.2,
    totalControls: 93,
    implementedControls: 67,
    compliancePercentage: 72,
    
    categories: [
      { name: 'Contrôles Organisationnels', controls: 37, implemented: 28, maturity: 3.4, compliance: 76 },
      { name: 'Contrôles des Personnes', controls: 8, implemented: 6, maturity: 3.0, compliance: 75 },
      { name: 'Contrôles Physiques', controls: 14, implemented: 12, maturity: 3.6, compliance: 86 },
      { name: 'Contrôles Technologiques', controls: 34, implemented: 21, maturity: 2.8, compliance: 62 }
    ],
    
    controlsAnalysis: {
      notImplemented: 26,
      partiallyImplemented: 34,
      implemented: 23,
      fullyImplemented: 10
    },
    
    maturityEvolution: [
      { month: 'Jan', maturity: 2.1 },
      { month: 'Fév', maturity: 2.3 },
      { month: 'Mar', maturity: 2.7 },
      { month: 'Avr', maturity: 2.9 },
      { month: 'Mai', maturity: 3.2 }
    ],
    
    topRisks: [
      { area: 'Gestion des accès', severity: 'Critique', impact: 'Élevé' },
      { area: 'Sauvegarde', severity: 'Élevé', impact: 'Moyen' },
      { area: 'Formation', severity: 'Moyen', impact: 'Moyen' }
    ]
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className="space-y-8 p-6 bg-white">
      {/* En-tête du rapport */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rapport de Conformité ISO 27001:2022</h1>
        <p className="text-lg text-gray-600 mt-2">Évaluation complète du Système de Management de la Sécurité de l'Information</p>
        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
          <span>Généré le: {new Date().toLocaleDateString('fr-FR')}</span>
          <span>•</span>
          <span>Période: Mai 2024</span>
          <span>•</span>
          <span>Version: 1.0</span>
        </div>
      </div>

      {/* Résumé exécutif */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Résumé Exécutif
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
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockData.compliancePercentage}%</p>
                  <p className="text-sm text-gray-600">Conformité</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockData.implementedControls}/{mockData.totalControls}</p>
                  <p className="text-sm text-gray-600">Contrôles Impl.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockData.topRisks.length}</p>
                  <p className="text-sm text-gray-600">Risques Majeurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Points Clés</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• L'organisation atteint un niveau de maturité de {mockData.overallMaturity}/5, indiquant une approche structurée</li>
            <li>• {mockData.compliancePercentage}% de conformité avec les exigences ISO 27001:2022</li>
            <li>• Les contrôles physiques présentent le meilleur taux d'implémentation (86%)</li>
            <li>• Des améliorations sont nécessaires sur les contrôles technologiques (62%)</li>
          </ul>
        </div>
      </section>

      {/* Analyse par catégories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Analyse par Catégories de Contrôles</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Contrôles</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData.categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="implemented" fill="#22c55e" name="Implémentés" />
                  <Bar dataKey="controls" fill="#e5e7eb" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>État d'Implémentation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Non implémenté', value: mockData.controlsAnalysis.notImplemented, color: '#ef4444' },
                      { name: 'Partiellement', value: mockData.controlsAnalysis.partiallyImplemented, color: '#f97316' },
                      { name: 'Implémenté', value: mockData.controlsAnalysis.implemented, color: '#eab308' },
                      { name: 'Entièrement', value: mockData.controlsAnalysis.fullyImplemented, color: '#22c55e' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1, 2, 3].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Détail par catégorie */}
        <div className="mt-6 space-y-4">
          {mockData.categories.map((category, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{category.name}</h3>
                  <Badge variant={category.compliance >= 80 ? "default" : category.compliance >= 60 ? "secondary" : "destructive"}>
                    {category.compliance}% conforme
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Contrôles implémentés</p>
                    <p className="font-semibold">{category.implemented}/{category.controls}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Niveau de maturité</p>
                    <p className="font-semibold">{category.maturity}/5</p>
                  </div>
                  <div>
                    <Progress value={category.compliance} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Évolution de la maturité */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          Évolution de la Maturité
        </h2>
        
        <Card>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.maturityEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="maturity" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Analyse des écarts */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Analyse des Écarts Critiques</h2>
        
        <div className="space-y-4">
          {mockData.topRisks.map((risk, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{risk.area}</h3>
                    <p className="text-sm text-gray-600">Impact: {risk.impact}</p>
                  </div>
                  <Badge variant={risk.severity === 'Critique' ? 'destructive' : risk.severity === 'Élevé' ? 'secondary' : 'outline'}>
                    {risk.severity}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recommandations */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recommandations Prioritaires</h2>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">1. Renforcement des Contrôles d'Accès</h3>
              <p className="text-sm text-gray-600 mb-2">
                Mettre en place une gestion des identités et accès plus robuste avec authentification multi-facteurs.
              </p>
              <div className="flex gap-2">
                <Badge variant="destructive">Priorité Critique</Badge>
                <Badge variant="outline">3-6 mois</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">2. Amélioration des Sauvegardes</h3>
              <p className="text-sm text-gray-600 mb-2">
                Réviser la stratégie de sauvegarde et tester régulièrement les procédures de restauration.
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">Priorité Élevée</Badge>
                <Badge variant="outline">1-3 mois</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">3. Programme de Sensibilisation</h3>
              <p className="text-sm text-gray-600 mb-2">
                Développer un programme de formation continue sur la sécurité de l'information.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">Priorité Moyenne</Badge>
                <Badge variant="outline">6-12 mois</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Conclusion */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Conclusion et Prochaines Étapes</h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                L'organisation démontre un engagement solide envers la sécurité de l'information avec un niveau de maturité 
                de {mockData.overallMaturity}/5. Les fondations sont établies, mais des améliorations ciblées permettront 
                d'atteindre une conformité complète ISO 27001:2022.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Prochaines Étapes Recommandées:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Prioriser les contrôles d'accès et d'authentification</li>
                  <li>• Réviser et tester les procédures de continuité d'activité</li>
                  <li>• Renforcer la formation et la sensibilisation du personnel</li>
                  <li>• Planifier un audit de certification dans 6-9 mois</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pied de page */}
      <div className="text-center text-xs text-gray-500 border-t pt-4 mt-8">
        <p>Ce rapport a été généré automatiquement par le système d'évaluation ISO 27001</p>
        <p>Document confidentiel - Diffusion restreinte</p>
      </div>
    </div>
  );
}
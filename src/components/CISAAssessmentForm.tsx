import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  Target, 
  TrendingUp, 
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lightbulb,
  Shield
} from 'lucide-react';
import { CISAMaturityLevel, CISAZTMMPillar } from '@/types/cisa';
import { CISA_ZTMM_PILLARS, CISA_MATURITY_LEVELS } from '@/data/cisaControls';

interface CISAResponse {
  subComponentId: string;
  currentMaturityLevel: CISAMaturityLevel;
  targetMaturityLevel: CISAMaturityLevel;
  implementationStatus: 'not_implemented' | 'partial' | 'full' | 'not_applicable';
  evidence: string;
  gaps: string[];
  comment: string;
}

interface CISAAssessmentFormProps {
  onComplete: (responses: CISAResponse[]) => void;
  onBack: () => void;
}

// Questions spécialisées CISA par pilier
const CISA_ASSESSMENT_QUESTIONS = {
  'ztmm-identity': {
    implementation: "Dans quelle mesure les identités et l'authentification sont-elles gérées selon les principes Zero Trust ?",
    effectiveness: "Les contrôles d'identité sont-ils efficaces pour prévenir les accès non autorisés ?",
    evidence: "Quelles preuves démontrent la mise en œuvre des contrôles d'identité ?",
    gaps: "Quels écarts existent dans la gestion des identités ?"
  },
  'ztmm-devices': {
    implementation: "Les appareils sont-ils sécurisés et conformes aux politiques Zero Trust ?",
    effectiveness: "La gestion des appareils prévient-elle efficacement les compromissions ?",
    evidence: "Quels contrôles techniques sont en place pour sécuriser les appareils ?",
    gaps: "Quelles vulnérabilités subsistent dans la gestion des appareils ?"
  },
  'ztmm-networks': {
    implementation: "L'infrastructure réseau suit-elle les principes de micro-segmentation Zero Trust ?",
    effectiveness: "Les contrôles réseau limitent-ils efficacement les mouvements latéraux ?",
    evidence: "Quelles technologies de sécurité réseau sont déployées ?",
    gaps: "Quels segments du réseau ne sont pas encore sécurisés ?"
  },
  'ztmm-applications': {
    implementation: "Les applications et charges de travail sont-elles sécurisées selon Zero Trust ?",
    effectiveness: "Les protections applicatives préviennent-elles les attaques ?",
    evidence: "Quels contrôles de sécurité applicative sont implémentés ?",
    gaps: "Quelles applications présentent encore des risques ?"
  },
  'ztmm-data': {
    implementation: "Les données sont-elles classifiées et protégées selon leur sensibilité ?",
    effectiveness: "Les contrôles de protection des données sont-ils adéquats ?",
    evidence: "Quelles mesures de chiffrement et de contrôle d'accès sont en place ?",
    gaps: "Quelles données ne sont pas encore suffisamment protégées ?"
  },
  'ztmm-visibility': {
    implementation: "L'organisation dispose-t-elle d'une visibilité complète sur son environnement ?",
    effectiveness: "Les outils de monitoring détectent-ils efficacement les anomalies ?",
    evidence: "Quels systèmes de surveillance et d'analyse sont opérationnels ?",
    gaps: "Quelles zones aveugles subsistent dans la surveillance ?"
  },
  'ztmm-automation': {
    implementation: "Les processus de sécurité sont-ils automatisés et orchestrés ?",
    effectiveness: "L'automatisation améliore-t-elle la réponse aux incidents ?",
    evidence: "Quels outils d'orchestration et d'automatisation sont utilisés ?",
    gaps: "Quels processus manuels ralentissent encore la réponse ?"
  },
  'ztmm-governance': {
    implementation: "La gouvernance Zero Trust est-elle établie et appliquée ?",
    effectiveness: "Les politiques Zero Trust sont-elles respectées ?",
    evidence: "Quels processus de gouvernance et de conformité sont en place ?",
    gaps: "Quelles lacunes existent dans la gouvernance ?"
  }
};

export function CISAAssessmentForm({ onComplete, onBack }: CISAAssessmentFormProps) {
  const [responses, setResponses] = useState<Map<string, CISAResponse>>(new Map());
  const [currentPillar, setCurrentPillar] = useState<string>('ztmm-identity');

  const currentPillarData = CISA_ZTMM_PILLARS.find(p => p.id === currentPillar);
  const allSubComponents = CISA_ZTMM_PILLARS.flatMap(p => p.subComponents);

  const calculateProgress = () => {
    return Math.round((responses.size / allSubComponents.length) * 100);
  };

  const updateResponse = (subComponentId: string, field: keyof CISAResponse, value: any) => {
    setResponses(prev => {
      const current = prev.get(subComponentId) || {
        subComponentId,
        currentMaturityLevel: 'traditional' as CISAMaturityLevel,
        targetMaturityLevel: 'initial' as CISAMaturityLevel,
        implementationStatus: 'not_implemented' as const,
        evidence: '',
        gaps: [],
        comment: ''
      };

      const updated = { ...current, [field]: value };
      const newMap = new Map(prev);
      newMap.set(subComponentId, updated);
      return newMap;
    });
  };

  const getResponse = (subComponentId: string): CISAResponse => {
    return responses.get(subComponentId) || {
      subComponentId,
      currentMaturityLevel: 'traditional',
      targetMaturityLevel: 'initial',
      implementationStatus: 'not_implemented',
      evidence: '',
      gaps: [],
      comment: ''
    };
  };

  const calculatePillarScore = (pillarId: string): number => {
    const pillarData = CISA_ZTMM_PILLARS.find(p => p.id === pillarId);
    if (!pillarData) return 0;

    const pillarResponses = pillarData.subComponents.map(sc => getResponse(sc.id));
    
    const totalScore = pillarResponses.reduce((sum, response) => {
      const levelMapping = { traditional: 1, initial: 2, advanced: 3, optimal: 4 };
      return sum + levelMapping[response.currentMaturityLevel];
    }, 0);

    return pillarData.subComponents.length > 0 ? totalScore / pillarData.subComponents.length : 0;
  };

  const renderSubComponentAssessment = (subComponent: any) => {
    const response = getResponse(subComponent.id);
    const questions = CISA_ASSESSMENT_QUESTIONS[currentPillar] || CISA_ASSESSMENT_QUESTIONS['ztmm-identity'];
    const isCompleted = response.currentMaturityLevel && response.implementationStatus && response.evidence;

    return (
      <Card key={subComponent.id} className={`mb-6 ${isCompleted ? 'border-purple-200 bg-purple-50/50' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {isCompleted && <CheckCircle2 className="h-5 w-5 text-purple-600" />}
                <span>{subComponent.title}</span>
                <Badge variant="outline" className="ml-2 bg-purple-100">
                  CISA ZTMM
                </Badge>
              </CardTitle>
              <CardDescription className="mt-2">
                {subComponent.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Niveau de maturité actuel */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Niveau de maturité actuel
            </Label>
            <RadioGroup
              value={response.currentMaturityLevel}
              onValueChange={(value: CISAMaturityLevel) => 
                updateResponse(subComponent.id, 'currentMaturityLevel', value)
              }
            >
              {(Object.keys(CISA_MATURITY_LEVELS) as CISAMaturityLevel[]).map((level) => (
                <div key={level} className="flex items-center space-x-3">
                  <RadioGroupItem value={level} id={`${subComponent.id}-current-${level}`} />
                  <Label 
                    htmlFor={`${subComponent.id}-current-${level}`} 
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{CISA_MATURITY_LEVELS[level].label}</span>
                        <p className="text-sm text-muted-foreground">
                          {CISA_MATURITY_LEVELS[level].description}
                        </p>
                      </div>
                      <Badge 
                        style={{ backgroundColor: CISA_MATURITY_LEVELS[level].color }}
                        className="text-white"
                      >
                        Niveau {CISA_MATURITY_LEVELS[level].level}
                      </Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Niveau cible */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Niveau cible souhaité
            </Label>
            <RadioGroup
              value={response.targetMaturityLevel}
              onValueChange={(value: CISAMaturityLevel) => 
                updateResponse(subComponent.id, 'targetMaturityLevel', value)
              }
            >
              {(Object.keys(CISA_MATURITY_LEVELS) as CISAMaturityLevel[]).map((level) => (
                <div key={level} className="flex items-center space-x-3">
                  <RadioGroupItem value={level} id={`${subComponent.id}-target-${level}`} />
                  <Label 
                    htmlFor={`${subComponent.id}-target-${level}`} 
                    className="flex-1 cursor-pointer"
                  >
                    <span className="font-medium">{CISA_MATURITY_LEVELS[level].label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* État d'implémentation */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {questions.implementation}
            </Label>
            <RadioGroup
              value={response.implementationStatus}
              onValueChange={(value: any) => 
                updateResponse(subComponent.id, 'implementationStatus', value)
              }
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="not_implemented" id={`${subComponent.id}-not-impl`} />
                <Label htmlFor={`${subComponent.id}-not-impl`}>Non implémenté</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="partial" id={`${subComponent.id}-partial`} />
                <Label htmlFor={`${subComponent.id}-partial`}>Partiellement implémenté</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="full" id={`${subComponent.id}-full`} />
                <Label htmlFor={`${subComponent.id}-full`}>Complètement implémenté</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="not_applicable" id={`${subComponent.id}-na`} />
                <Label htmlFor={`${subComponent.id}-na`}>Non applicable</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Preuves et justifications */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {questions.evidence}
            </Label>
            <Textarea
              value={response.evidence}
              onChange={(e) => updateResponse(subComponent.id, 'evidence', e.target.value)}
              placeholder="Décrivez les preuves, documents, processus ou contrôles en place..."
              rows={3}
            />
          </div>

          {/* Écarts identifiés */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {questions.gaps}
            </Label>
            <Textarea
              value={response.gaps.join('\n')}
              onChange={(e) => updateResponse(
                subComponent.id, 
                'gaps', 
                e.target.value.split('\n').filter(gap => gap.trim())
              )}
              placeholder="Listez les écarts, faiblesses ou améliorations nécessaires (un par ligne)..."
              rows={3}
            />
          </div>

          {/* Commentaires additionnels */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Commentaires et recommandations
            </Label>
            <Textarea
              value={response.comment}
              onChange={(e) => updateResponse(subComponent.id, 'comment', e.target.value)}
              placeholder="Ajoutez des commentaires, contexte ou recommandations..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPillarTab = (pillarData: CISAZTMMPillar) => {
    const score = calculatePillarScore(pillarData.id);
    const completedSubComponents = pillarData.subComponents.filter(sc => {
      const response = getResponse(sc.id);
      return response.currentMaturityLevel && response.implementationStatus && response.evidence;
    }).length;

    return (
      <TabsContent key={pillarData.id} value={pillarData.id} className="space-y-6">
        {/* Statistiques du pilier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                <span>{pillarData.name}</span>
              </div>
              <Badge 
                className="bg-purple-600 text-white"
              >
                Score: {score.toFixed(1)}/4
              </Badge>
            </CardTitle>
            <CardDescription>
              {pillarData.description}
            </CardDescription>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <Progress value={(completedSubComponents / pillarData.subComponents.length) * 100} />
              </div>
              <span className="text-sm text-muted-foreground">
                {completedSubComponents}/{pillarData.subComponents.length} complétées
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Sous-composants */}
        <div className="space-y-4">
          {pillarData.subComponents.map(subComponent => 
            renderSubComponentAssessment(subComponent)
          )}
        </div>
      </TabsContent>
    );
  };

  const canComplete = responses.size >= allSubComponents.length * 0.8; // Au moins 80% complété

  return (
    <div className="space-y-6">
      {/* En-tête avec progression */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Évaluation CISA Zero Trust</h2>
            <p className="text-muted-foreground">
              Évaluation spécialisée du Zero Trust Maturity Model
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Progression globale</div>
            <div className="flex items-center gap-2">
              <Progress value={calculateProgress()} className="w-32" />
              <span className="text-sm font-medium">{calculateProgress()}%</span>
            </div>
          </div>
          <Button 
            onClick={() => onComplete(Array.from(responses.values()))}
            disabled={!canComplete}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Finaliser l'évaluation
          </Button>
        </div>
      </div>

      {/* Navigation par pilier */}
      <Tabs value={currentPillar} onValueChange={setCurrentPillar}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {CISA_ZTMM_PILLARS.map((pillarData) => {
            const score = calculatePillarScore(pillarData.id);
            const isCapability = pillarData.id.includes('visibility') || 
                                pillarData.id.includes('automation') || 
                                pillarData.id.includes('governance');
            return (
              <TabsTrigger 
                key={pillarData.id} 
                value={pillarData.id} 
                className={`flex flex-col ${isCapability ? 'bg-blue-50' : ''}`}
              >
                <span className="font-medium text-xs">
                  {pillarData.name.split(' ')[0]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {score.toFixed(1)}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CISA_ZTMM_PILLARS.map(pillarData => renderPillarTab(pillarData))}
      </Tabs>
    </div>
  );
}
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
  ChevronRight, 
  Target, 
  TrendingUp, 
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lightbulb
} from 'lucide-react';
import { NISTSubCategory, NISTFunction, NISTTier, NIST_TIERS } from '@/types/nist';
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

interface NISTAssessmentFormProps {
  onComplete: (responses: NISTResponse[]) => void;
  onBack: () => void;
}

// Questions spécialisées NIST par fonction
const NIST_ASSESSMENT_QUESTIONS = {
  GOVERN: {
    implementation: "Dans quelle mesure votre organisation a-t-elle établi des processus de gouvernance pour cette sous-catégorie ?",
    effectiveness: "Quelle est l'efficacité des contrôles mis en place ?",
    evidence: "Quelles preuves documentaires démontrent l'implémentation ?",
    gaps: "Quels sont les principaux écarts identifiés ?"
  },
  IDENTIFY: {
    implementation: "Votre organisation identifie-t-elle de manière systématique les éléments de cette sous-catégorie ?",
    effectiveness: "Les processus d'identification sont-ils complets et à jour ?",
    evidence: "Quelles sont les sources de données utilisées pour l'identification ?",
    gaps: "Quels éléments ne sont pas encore identifiés ou inventoriés ?"
  },
  PROTECT: {
    implementation: "Les mesures de protection pour cette sous-catégorie sont-elles déployées ?",
    effectiveness: "Ces protections sont-elles efficaces contre les menaces identifiées ?",
    evidence: "Quels contrôles techniques et organisationnels sont en place ?",
    gaps: "Quelles vulnérabilités de protection subsistent ?"
  },
  DETECT: {
    implementation: "Votre organisation dispose-t-elle de capacités de détection pour cette sous-catégorie ?",
    effectiveness: "Les mécanismes de détection fonctionnent-ils de manière fiable ?",
    evidence: "Quels outils et processus de détection sont utilisés ?",
    gaps: "Quelles activités malveillantes pourraient ne pas être détectées ?"
  },
  RESPOND: {
    implementation: "Des procédures de réponse sont-elles définies et testées pour cette sous-catégorie ?",
    effectiveness: "L'organisation peut-elle répondre efficacement aux incidents ?",
    evidence: "Quels plans et équipes de réponse sont opérationnels ?",
    gaps: "Quelles lacunes existent dans la capacité de réponse ?"
  },
  RECOVER: {
    implementation: "Des capacités de récupération sont-elles établies pour cette sous-catégorie ?",
    effectiveness: "L'organisation peut-elle récupérer rapidement après un incident ?",
    evidence: "Quels plans de continuité et de récupération sont testés ?",
    gaps: "Quels risques de non-récupération persistent ?"
  }
};

export function NISTAssessmentForm({ onComplete, onBack }: NISTAssessmentFormProps) {
  const [responses, setResponses] = useState<Map<string, NISTResponse>>(new Map());
  const [currentFunction, setCurrentFunction] = useState<NISTFunction>('GOVERN');
  const [currentCategory, setCurrentCategory] = useState<string>('');

  const currentFunctionData = NIST_CSF_FUNCTIONS.find(f => f.id === currentFunction);
  const allSubCategories = NIST_CSF_FUNCTIONS.flatMap(f => 
    f.categories.flatMap(c => c.subCategories)
  );

  const calculateProgress = () => {
    return Math.round((responses.size / allSubCategories.length) * 100);
  };

  const updateResponse = (subCategoryId: string, field: keyof NISTResponse, value: any) => {
    setResponses(prev => {
      const current = prev.get(subCategoryId) || {
        subCategoryId,
        currentTier: 'partial' as NISTTier,
        targetTier: 'repeatable' as NISTTier,
        implementationStatus: 'not_implemented' as const,
        evidence: '',
        gaps: [],
        comment: ''
      };

      const updated = { ...current, [field]: value };
      const newMap = new Map(prev);
      newMap.set(subCategoryId, updated);
      return newMap;
    });
  };

  const getResponse = (subCategoryId: string): NISTResponse => {
    return responses.get(subCategoryId) || {
      subCategoryId,
      currentTier: 'partial',
      targetTier: 'repeatable',
      implementationStatus: 'not_implemented',
      evidence: '',
      gaps: [],
      comment: ''
    };
  };

  const calculateFunctionScore = (functionId: NISTFunction): number => {
    const functionData = NIST_CSF_FUNCTIONS.find(f => f.id === functionId);
    if (!functionData) return 0;

    const subCategories = functionData.categories.flatMap(c => c.subCategories);
    const functionResponses = subCategories.map(sc => getResponse(sc.id));
    
    const totalScore = functionResponses.reduce((sum, response) => {
      const tierMapping = { partial: 1, risk_informed: 2, repeatable: 3, adaptive: 4 };
      return sum + tierMapping[response.currentTier];
    }, 0);

    return subCategories.length > 0 ? totalScore / subCategories.length : 0;
  };

  const renderSubCategoryAssessment = (subCategory: NISTSubCategory) => {
    const response = getResponse(subCategory.id);
    const questions = NIST_ASSESSMENT_QUESTIONS[subCategory.functionId];
    const isCompleted = response.currentTier && response.implementationStatus && response.evidence;

    return (
      <Card key={subCategory.id} className={`mb-6 ${isCompleted ? 'border-green-200 bg-green-50/50' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                <span>{subCategory.code} - {subCategory.title}</span>
                <Badge variant="outline" className="ml-2">
                  {subCategory.functionId}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-2">
                {subCategory.description}
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
              value={response.currentTier}
              onValueChange={(value: NISTTier) => 
                updateResponse(subCategory.id, 'currentTier', value)
              }
            >
              {(Object.keys(NIST_TIERS) as NISTTier[]).map((tier) => (
                <div key={tier} className="flex items-center space-x-3">
                  <RadioGroupItem value={tier} id={`${subCategory.id}-current-${tier}`} />
                  <Label 
                    htmlFor={`${subCategory.id}-current-${tier}`} 
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{NIST_TIERS[tier].label}</span>
                        <p className="text-sm text-muted-foreground">
                          {NIST_TIERS[tier].description}
                        </p>
                      </div>
                      <Badge 
                        style={{ backgroundColor: NIST_TIERS[tier].color }}
                        className="text-white"
                      >
                        Niveau {NIST_TIERS[tier].level}
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
              value={response.targetTier}
              onValueChange={(value: NISTTier) => 
                updateResponse(subCategory.id, 'targetTier', value)
              }
            >
              {(Object.keys(NIST_TIERS) as NISTTier[]).map((tier) => (
                <div key={tier} className="flex items-center space-x-3">
                  <RadioGroupItem value={tier} id={`${subCategory.id}-target-${tier}`} />
                  <Label 
                    htmlFor={`${subCategory.id}-target-${tier}`} 
                    className="flex-1 cursor-pointer"
                  >
                    <span className="font-medium">{NIST_TIERS[tier].label}</span>
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
                updateResponse(subCategory.id, 'implementationStatus', value)
              }
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="not_implemented" id={`${subCategory.id}-not-impl`} />
                <Label htmlFor={`${subCategory.id}-not-impl`}>Non implémenté</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="partial" id={`${subCategory.id}-partial`} />
                <Label htmlFor={`${subCategory.id}-partial`}>Partiellement implémenté</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="full" id={`${subCategory.id}-full`} />
                <Label htmlFor={`${subCategory.id}-full`}>Complètement implémenté</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="not_applicable" id={`${subCategory.id}-na`} />
                <Label htmlFor={`${subCategory.id}-na`}>Non applicable</Label>
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
              onChange={(e) => updateResponse(subCategory.id, 'evidence', e.target.value)}
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
                subCategory.id, 
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
              onChange={(e) => updateResponse(subCategory.id, 'comment', e.target.value)}
              placeholder="Ajoutez des commentaires, contexte ou recommandations..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFunctionTab = (functionData: any) => {
    const score = calculateFunctionScore(functionData.id);
    const completedSubCategories = functionData.categories
      .flatMap((c: any) => c.subCategories)
      .filter((sc: any) => {
        const response = getResponse(sc.id);
        return response.currentTier && response.implementationStatus && response.evidence;
      }).length;
    
    const totalSubCategories = functionData.categories
      .flatMap((c: any) => c.subCategories).length;

    return (
      <TabsContent key={functionData.id} value={functionData.id} className="space-y-6">
        {/* Statistiques de la fonction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{functionData.name}</span>
              <Badge 
                style={{ backgroundColor: functionData.color }}
                className="text-white"
              >
                Score: {score.toFixed(1)}/4
              </Badge>
            </CardTitle>
            <CardDescription>
              {functionData.description}
            </CardDescription>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <Progress value={(completedSubCategories / totalSubCategories) * 100} />
              </div>
              <span className="text-sm text-muted-foreground">
                {completedSubCategories}/{totalSubCategories} complétées
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Catégories et sous-catégories */}
        <Accordion type="multiple" defaultValue={functionData.categories.map((c: any) => c.id)}>
          {functionData.categories.map((category: any) => (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left">
                    <span className="font-medium">{category.code} - {category.name}</span>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <Badge variant="outline">
                    {category.subCategories.filter((sc: any) => {
                      const response = getResponse(sc.id);
                      return response.currentTier && response.implementationStatus;
                    }).length}/{category.subCategories.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  {category.subCategories.map((subCategory: any) => 
                    renderSubCategoryAssessment(subCategory)
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </TabsContent>
    );
  };

  const canComplete = responses.size >= allSubCategories.length * 0.8; // Au moins 80% complété

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
            <h2 className="text-2xl font-bold">Évaluation NIST CSF 2.0</h2>
            <p className="text-muted-foreground">
              Évaluation spécialisée du Cybersecurity Framework
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            Finaliser l'évaluation
          </Button>
        </div>
      </div>

      {/* Navigation par fonction */}
      <Tabs value={currentFunction} onValueChange={(value) => setCurrentFunction(value as NISTFunction)}>
        <TabsList className="grid w-full grid-cols-6">
          {NIST_CSF_FUNCTIONS.map((functionData) => {
            const score = calculateFunctionScore(functionData.id);
            return (
              <TabsTrigger key={functionData.id} value={functionData.id} className="flex flex-col">
                <span className="font-medium">{functionData.id}</span>
                <span className="text-xs">{score.toFixed(1)}/4</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {NIST_CSF_FUNCTIONS.map(functionData => renderFunctionTab(functionData))}
      </Tabs>
    </div>
  );
}
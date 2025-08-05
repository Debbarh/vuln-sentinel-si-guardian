import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  CheckCircle, 
  Circle,
  ArrowLeft,
  FileText,
  User
} from 'lucide-react';
import { Assessment, Criterion, Question, AssessmentResponse } from '@/types/frameworks';
import { DEFAULT_FRAMEWORKS } from '@/types/frameworks';
import { getUserDisplayName, SAMPLE_USERS } from '@/types/users';
import { ISO27001_CONTROLS } from '@/data/iso27001Controls';
import { NIST_CSF_FUNCTIONS } from '@/data/nistControls';
import { CISA_ZTMM_PILLARS } from '@/data/cisaControls';
import { NISTAssessmentForm } from './NISTAssessmentForm';
import { CISAAssessmentForm } from './CISAAssessmentForm';
import { toast } from 'sonner';

interface AssessmentCompletionProps {
  assessment: Assessment;
  onBack: () => void;
  onUpdate: (assessment: Assessment) => void;
}

// Génération des critères et questions à partir des contrôles ISO 27001 et NIST CSF
const generateCriteriaFromFramework = (frameworkId: string): { criteria: Criterion[], questions: Question[] } => {
  const criteria: Criterion[] = [];
  const questions: Question[] = [];
  
  if (frameworkId === 'iso27001') {
    ISO27001_CONTROLS.forEach((category, categoryIndex) => {
      // Ajouter la catégorie principale
      criteria.push({
        id: category.id,
        frameworkId,
        code: category.id,
        name: category.name,
        description: category.description,
        level: 1,
        order: categoryIndex + 1,
      });
      
      // Ajouter les contrôles de cette catégorie
      category.controls.forEach((control, controlIndex) => {
        criteria.push({
          id: control.id,
          frameworkId,
          code: control.code,
          name: control.title,
          description: control.description,
          parentId: category.id,
          level: 2,
          order: controlIndex + 1,
        });
        
        // Générer des questions d'évaluation standardisées pour chaque contrôle
        const baseQuestionId = `q-${control.id}`;
        
        // Question principale d'implémentation
        questions.push({
          id: `${baseQuestionId}-implementation`,
          criterionId: control.id,
          text: `Quel est le niveau d'implémentation du contrôle "${control.title}" ?`,
          description: control.description,
          type: 'radio',
          options: [
            { id: `${baseQuestionId}-opt1`, value: '0', label: 'Non implémenté (0)', maturityLevel: 0, order: 1 },
            { id: `${baseQuestionId}-opt2`, value: '1', label: 'Initial - Implémentation ad hoc (1)', maturityLevel: 1, order: 2 },
            { id: `${baseQuestionId}-opt3`, value: '2', label: 'Reproductible - Procédures définies (2)', maturityLevel: 2, order: 3 },
            { id: `${baseQuestionId}-opt4`, value: '3', label: 'Défini - Processus standardisés (3)', maturityLevel: 3, order: 4 },
            { id: `${baseQuestionId}-opt5`, value: '4', label: 'Géré - Mesures et contrôles (4)', maturityLevel: 4, order: 5 },
          ],
          required: true,
          order: 1,
        });
      });
    });
  }
  
  if (frameworkId === 'nist-csf-2') {
    NIST_CSF_FUNCTIONS.forEach((nistFunction, functionIndex) => {
      // Ajouter la fonction principale (niveau 1)
      criteria.push({
        id: nistFunction.id,
        frameworkId,
        code: nistFunction.id,
        name: nistFunction.name,
        description: nistFunction.description,
        level: 1,
        order: functionIndex + 1,
      });
      
      // Ajouter les catégories (niveau 2)
      nistFunction.categories.forEach((category, categoryIndex) => {
        criteria.push({
          id: category.id,
          frameworkId,
          code: category.code,
          name: category.name,
          description: category.description,
          parentId: nistFunction.id,
          level: 2,
          order: categoryIndex + 1,
        });
        
        // Ajouter les sous-catégories (niveau 3)
        category.subCategories.forEach((subCategory, subIndex) => {
          criteria.push({
            id: subCategory.id,
            frameworkId,
            code: subCategory.code,
            name: subCategory.title,
            description: subCategory.description,
            parentId: category.id,
            level: 3,
            order: subIndex + 1,
          });
          
          // Générer des questions d'évaluation NIST pour chaque sous-catégorie
          const baseQuestionId = `q-${subCategory.id}`;
          
          // Question sur le niveau NIST (Partial, Risk Informed, Repeatable, Adaptive)
          questions.push({
            id: `${baseQuestionId}-tier`,
            criterionId: subCategory.id,
            text: `Quel est le niveau de maturité pour "${subCategory.title}" ?`,
            description: subCategory.description,
            type: 'radio',
            options: [
              { id: `${baseQuestionId}-partial`, value: '1', label: 'Partiel - Pratiques informelles et réactives', maturityLevel: 1, order: 1 },
              { id: `${baseQuestionId}-risk`, value: '2', label: 'Informé par les Risques - Politiques approuvées', maturityLevel: 2, order: 2 },
              { id: `${baseQuestionId}-repeat`, value: '3', label: 'Répétable - Pratiques formalisées', maturityLevel: 3, order: 3 },
              { id: `${baseQuestionId}-adapt`, value: '4', label: 'Adaptatif - Pratiques continues et intégrées', maturityLevel: 4, order: 4 },
            ],
            required: true,
            order: 1,
          });
          
          // Question sur l'implémentation actuelle
          questions.push({
            id: `${baseQuestionId}-implementation`,
            criterionId: subCategory.id,
            text: `Cette sous-catégorie est-elle actuellement implémentée dans votre organisation ?`,
            description: 'Évaluer le niveau d\'implémentation actuel',
            type: 'radio',
            options: [
              { id: `${baseQuestionId}-impl-no`, value: 'no', label: 'Non implémenté', order: 1 },
              { id: `${baseQuestionId}-impl-partial`, value: 'partial', label: 'Partiellement implémenté', order: 2 },
              { id: `${baseQuestionId}-impl-yes`, value: 'yes', label: 'Complètement implémenté', order: 3 },
              { id: `${baseQuestionId}-impl-na`, value: 'na', label: 'Non applicable', order: 4 },
            ],
            required: true,
            order: 2,
          });
        });
      });
    });
  }
  
  if (frameworkId === 'cisa-ztmm') {
    CISA_ZTMM_PILLARS.forEach((pillar, pillarIndex) => {
      // Ajouter le pilier principal (niveau 1)
      criteria.push({
        id: pillar.id,
        frameworkId,
        code: pillar.id,
        name: pillar.name,
        description: pillar.description,
        level: 1,
        order: pillarIndex + 1,
      });
      
      // Ajouter les sous-composants (niveau 2)
      pillar.subComponents.forEach((subComponent, subIndex) => {
        criteria.push({
          id: subComponent.id,
          frameworkId,
          code: subComponent.id,
          name: subComponent.title,
          description: subComponent.description,
          parentId: pillar.id,
          level: 2,
          order: subIndex + 1,
        });
        
        // Générer des questions d'évaluation CISA pour chaque sous-composant
        const baseQuestionId = `q-${subComponent.id}`;
        
        // Question sur le niveau de maturité CISA
        questions.push({
          id: `${baseQuestionId}-maturity`,
          criterionId: subComponent.id,
          text: `Quel est le niveau de maturité Zero Trust pour "${subComponent.title}" ?`,
          description: subComponent.description,
          type: 'radio',
          options: [
            { id: `${baseQuestionId}-traditional`, value: '1', label: 'Traditionnel - Sécurité périmétrique', maturityLevel: 1, order: 1 },
            { id: `${baseQuestionId}-initial`, value: '2', label: 'Initial - Premières mesures Zero Trust', maturityLevel: 2, order: 2 },
            { id: `${baseQuestionId}-advanced`, value: '3', label: 'Avancé - Capacités Zero Trust étendues', maturityLevel: 3, order: 3 },
            { id: `${baseQuestionId}-optimal`, value: '4', label: 'Optimal - Architecture Zero Trust complète', maturityLevel: 4, order: 4 },
          ],
          required: true,
          order: 1,
        });
        
        // Question sur l'implémentation actuelle
        questions.push({
          id: `${baseQuestionId}-implementation`,
          criterionId: subComponent.id,
          text: `Cette capacité Zero Trust est-elle actuellement implémentée ?`,
          description: 'Évaluer le niveau d\'implémentation actuel',
          type: 'radio',
          options: [
            { id: `${baseQuestionId}-impl-no`, value: 'no', label: 'Non implémenté', order: 1 },
            { id: `${baseQuestionId}-impl-partial`, value: 'partial', label: 'Partiellement implémenté', order: 2 },
            { id: `${baseQuestionId}-impl-yes`, value: 'yes', label: 'Complètement implémenté', order: 3 },
            { id: `${baseQuestionId}-impl-na`, value: 'na', label: 'Non applicable', order: 4 },
          ],
          required: true,
          order: 2,
        });
      });
    });
  }
  
  return { criteria, questions };
};

export function AssessmentCompletion({ assessment, onBack, onUpdate }: AssessmentCompletionProps) {
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [currentFrameworkIndex, setCurrentFrameworkIndex] = useState(0);
  const [currentCriterionId, setCurrentCriterionId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showNISTSpecialized, setShowNISTSpecialized] = useState(false);
  const [showCISASpecialized, setShowCISASpecialized] = useState(false);

  const frameworks = DEFAULT_FRAMEWORKS.filter(f => assessment.frameworkIds.includes(f.id));
  const currentFramework = frameworks[currentFrameworkIndex];

  // Vérifier si NIST CSF 2.0 et CISA ZTMM sont présents pour afficher les interfaces spécialisées
  const hasNISTFramework = assessment.frameworkIds.includes('nist-csf-2');
  const hasCISAFramework = assessment.frameworkIds.includes('cisa-ztmm');

  const handleNISTAssessmentComplete = (nistResponses: any[]) => {
    // Convertir les réponses NIST en format standard
    const convertedResponses: AssessmentResponse[] = nistResponses.map(nr => ({
      id: `nist-response-${nr.subCategoryId}`,
      assessmentId: assessment.id,
      questionId: `nist-${nr.subCategoryId}`,
      value: nr.currentTier,
      comment: nr.comment,
      evaluator: 'current-user',
      answeredAt: new Date().toISOString(),
    }));

    setResponses(prev => [
      ...prev.filter(r => !r.questionId.startsWith('nist-')),
      ...convertedResponses
    ]);

    setShowNISTSpecialized(false);
    toast.success('Évaluation NIST complétée avec succès');
  };

  const handleCISAAssessmentComplete = (cisaResponses: any[]) => {
    // Convertir les réponses CISA en format standard
    const convertedResponses: AssessmentResponse[] = cisaResponses.map(cr => ({
      id: `cisa-response-${cr.subComponentId}`,
      assessmentId: assessment.id,
      questionId: `cisa-${cr.subComponentId}`,
      value: cr.currentMaturityLevel,
      comment: cr.comment,
      evaluator: 'current-user',
      answeredAt: new Date().toISOString(),
    }));

    setResponses(prev => [
      ...prev.filter(r => !r.questionId.startsWith('cisa-')),
      ...convertedResponses
    ]);

    setShowCISASpecialized(false);
    toast.success('Évaluation CISA Zero Trust complétée avec succès');
  };
  
  // Générer les critères et questions dynamiquement
  const { criteria, questions } = generateCriteriaFromFramework(currentFramework?.id || '');
  const topLevelCriteria = criteria.filter(c => !c.parentId).sort((a, b) => a.order - b.order);
  
  // Calculer les statistiques de progression
  const allQuestions = questions;
  const answeredQuestions = responses.filter(r => 
    allQuestions.some(q => q.id === r.questionId)
  );
  const progressPercentage = allQuestions.length > 0 
    ? Math.round((answeredQuestions.length / allQuestions.length) * 100) 
    : 0;

  const getQuestionsByCriterion = (criterionId: string) => {
    return questions.filter(q => q.criterionId === criterionId).sort((a, b) => a.order - b.order);
  };

  const getChildCriteria = (parentId?: string) => {
    return criteria.filter(c => c.parentId === parentId).sort((a, b) => a.order - b.order);
  };

  const getResponseForQuestion = (questionId: string) => {
    return responses.find(r => r.questionId === questionId);
  };

  const handleAnswerChange = (questionId: string, value: string | string[], comment?: string) => {
    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === questionId);
      const newResponse: AssessmentResponse = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `response-${Date.now()}-${questionId}`,
        assessmentId: assessment.id,
        questionId,
        value,
        comment,
        evaluator: 'current-user', // TODO: Get from auth context
        answeredAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newResponse;
        return updated;
      } else {
        return [...prev, newResponse];
      }
    });
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Brouillon sauvegardé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitAssessment = async () => {
    const requiredQuestions = allQuestions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => 
      !responses.some(r => r.questionId === q.id)
    );

    if (missingAnswers.length > 0) {
      toast.error(`${missingAnswers.length} question(s) obligatoire(s) non répondue(s)`);
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Submit to backend
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      const updatedAssessment: Assessment = {
        ...assessment,
        status: 'completed',
        updatedAt: new Date().toISOString(),
      };
      
      onUpdate(updatedAssessment);
      toast.success('Évaluation soumise avec succès');
      onBack();
    } catch (error) {
      toast.error('Erreur lors de la soumission');
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const response = getResponseForQuestion(question.id);
    const isAnswered = !!response;

    return (
      <Card key={question.id} className={`mb-4 ${isAnswered ? 'border-green-200' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center space-x-2">
                {isAnswered ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <span>{question.text}</span>
                {question.required && (
                  <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                )}
              </CardTitle>
              {question.description && (
                <CardDescription className="mt-2">
                  {question.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Options de réponse */}
          {question.type === 'radio' && question.options && (
            <RadioGroup
              value={response?.value as string || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${question.id}-${option.id}`} />
                  <Label htmlFor={`${question.id}-${option.id}`} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {option.maturityLevel !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          Niveau {option.maturityLevel}
                        </Badge>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'checkbox' && question.options && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${option.id}`}
                    checked={Array.isArray(response?.value) && response.value.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(response?.value) ? response.value : [];
                      const newValues = checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      handleAnswerChange(question.id, newValues);
                    }}
                  />
                  <Label htmlFor={`${question.id}-${option.id}`} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {question.type === 'text' && (
            <Textarea
              value={response?.value as string || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Saisissez votre réponse..."
              rows={3}
            />
          )}

          {/* Champ de commentaire */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Commentaire (optionnel)
            </Label>
            <Textarea
              value={response?.comment || ''}
              onChange={(e) => handleAnswerChange(
                question.id, 
                response?.value || '', 
                e.target.value
              )}
              placeholder="Ajoutez des notes ou justifications..."
              rows={2}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCriterion = (criterion: Criterion) => {
    const childCriteria = getChildCriteria(criterion.id);
    const criterionQuestions = getQuestionsByCriterion(criterion.id);
    const allSubQuestions = childCriteria.flatMap(child => getQuestionsByCriterion(child.id));
    const totalQuestions = criterionQuestions.length + allSubQuestions.length;
    const answeredInCriterion = responses.filter(r => 
      [...criterionQuestions, ...allSubQuestions].some(q => q.id === r.questionId)
    ).length;

    return (
      <AccordionItem key={criterion.id} value={criterion.id}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="text-left">
              <span className="font-medium">{criterion.code} - {criterion.name}</span>
              <p className="text-sm text-muted-foreground">{criterion.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={answeredInCriterion === totalQuestions ? "default" : "outline"}>
                {answeredInCriterion}/{totalQuestions}
              </Badge>
            </div>
          </div>
        </AccordionTrigger>
        
        <AccordionContent>
          <div className="pl-4 space-y-4">
            {/* Questions directes du critère */}
            {criterionQuestions.map(question => renderQuestion(question))}
            
            {/* Sous-critères */}
            {childCriteria.length > 0 && (
              <Accordion type="multiple">
                {childCriteria.map(child => renderCriterion(child))}
              </Accordion>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const canSubmit = allQuestions.filter(q => q.required).every(q => 
    responses.some(r => r.questionId === q.id)
  );

  // Afficher l'interface NIST spécialisée si demandée
  if (showNISTSpecialized) {
    return (
      <NISTAssessmentForm
        onComplete={handleNISTAssessmentComplete}
        onBack={() => setShowNISTSpecialized(false)}
      />
    );
  }

  // Afficher l'interface CISA spécialisée si demandée
  if (showCISASpecialized) {
    return (
      <CISAAssessmentForm
        onComplete={handleCISAAssessmentComplete}
        onBack={() => setShowCISASpecialized(false)}
      />
    );
  }

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
            <h2 className="text-2xl font-bold">{assessment.name}</h2>
            <p className="text-muted-foreground">
              Réalisation de l'évaluation - {assessment.scope}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {hasNISTFramework && (
            <Button 
              variant="outline" 
              onClick={() => setShowNISTSpecialized(true)}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Interface NIST Spécialisée
            </Button>
          )}
          {hasCISAFramework && (
            <Button 
              variant="outline" 
              onClick={() => setShowCISASpecialized(true)}
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Interface CISA Zero Trust
            </Button>
          )}
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          <Button onClick={handleSubmitAssessment} disabled={!canSubmit || isSaving}>
            <Send className="h-4 w-4 mr-2" />
            Soumettre l'Évaluation
          </Button>
        </div>
      </div>

      {/* Barre de progression */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Progression de l'Évaluation</CardTitle>
            <Badge variant="outline" className="text-sm">
              {answeredQuestions.length}/{allQuestions.length} questions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression globale</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Navigation par référentiel */}
      {frameworks.length > 1 && (
        <Tabs value={currentFramework?.id} onValueChange={(value) => {
          const index = frameworks.findIndex(f => f.id === value);
          setCurrentFrameworkIndex(index);
        }}>
          <TabsList className="grid w-full grid-cols-3">
            {frameworks.map((framework) => (
              <TabsTrigger key={framework.id} value={framework.id}>
                {framework.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Questions par critère */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{currentFramework?.name}</span>
          </CardTitle>
          <CardDescription>
            Répondez aux questions d'évaluation pour chaque critère
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topLevelCriteria.length > 0 ? (
            <Accordion type="multiple" defaultValue={[topLevelCriteria[0]?.id]}>
              {topLevelCriteria.map(criterion => renderCriterion(criterion))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune question disponible</h3>
              <p className="text-muted-foreground">
                Les questions d'évaluation pour ce référentiel seront bientôt disponibles
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
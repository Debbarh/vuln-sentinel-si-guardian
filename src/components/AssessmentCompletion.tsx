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
import { toast } from 'sonner';

interface AssessmentCompletionProps {
  assessment: Assessment;
  onBack: () => void;
  onUpdate: (assessment: Assessment) => void;
}

// Données exemple de critères et questions
const SAMPLE_CRITERIA: Criterion[] = [
  {
    id: 'A.5',
    frameworkId: 'iso27001',
    code: 'A.5',
    name: 'Politiques de sécurité de l\'information',
    description: 'Objectif: Fournir l\'orientation et le support de la direction pour la sécurité de l\'information.',
    level: 1,
    order: 1,
  },
  {
    id: 'A.5.1',
    frameworkId: 'iso27001',
    code: 'A.5.1',
    name: 'Politiques pour la sécurité de l\'information',
    description: 'Un ensemble de politiques pour la sécurité de l\'information doit être défini.',
    parentId: 'A.5',
    level: 2,
    order: 1,
  },
  {
    id: 'A.6',
    frameworkId: 'iso27001',
    code: 'A.6',
    name: 'Organisation de la sécurité de l\'information',
    description: 'Objectif: Organiser la sécurité de l\'information au sein de l\'organisation.',
    level: 1,
    order: 2,
  },
  {
    id: 'A.6.1',
    frameworkId: 'iso27001',
    code: 'A.6.1',
    name: 'Organisation interne',
    description: 'Un cadre de gestion doit être mis en place pour initier et contrôler la mise en œuvre.',
    parentId: 'A.6',
    level: 2,
    order: 1,
  },
];

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    criterionId: 'A.5.1',
    text: 'Des politiques de sécurité de l\'information sont-elles définies et documentées ?',
    description: 'Vérifier l\'existence de politiques formelles approuvées par la direction',
    type: 'radio',
    options: [
      { id: 'opt1', value: '0', label: 'Non implémenté', maturityLevel: 0, order: 1 },
      { id: 'opt2', value: '1', label: 'Partiellement implémenté', maturityLevel: 1, order: 2 },
      { id: 'opt3', value: '2', label: 'Largement implémenté', maturityLevel: 2, order: 3 },
      { id: 'opt4', value: '3', label: 'Complètement implémenté', maturityLevel: 3, order: 4 },
    ],
    required: true,
    order: 1,
  },
  {
    id: 'q2',
    criterionId: 'A.5.1',
    text: 'Les politiques sont-elles communiquées à tous les employés et parties prenantes pertinentes ?',
    description: 'Évaluer l\'efficacité de la communication des politiques',
    type: 'radio',
    options: [
      { id: 'opt5', value: '0', label: 'Non implémenté', maturityLevel: 0, order: 1 },
      { id: 'opt6', value: '1', label: 'Partiellement implémenté', maturityLevel: 1, order: 2 },
      { id: 'opt7', value: '2', label: 'Largement implémenté', maturityLevel: 2, order: 3 },
      { id: 'opt8', value: '3', label: 'Complètement implémenté', maturityLevel: 3, order: 4 },
    ],
    required: true,
    order: 2,
  },
  {
    id: 'q3',
    criterionId: 'A.6.1',
    text: 'Un responsable de la sécurité de l\'information a-t-il été désigné ?',
    description: 'Vérifier l\'existence d\'un RSSI ou équivalent',
    type: 'radio',
    options: [
      { id: 'opt9', value: '0', label: 'Non implémenté', maturityLevel: 0, order: 1 },
      { id: 'opt10', value: '1', label: 'Partiellement implémenté', maturityLevel: 1, order: 2 },
      { id: 'opt11', value: '2', label: 'Largement implémenté', maturityLevel: 2, order: 3 },
      { id: 'opt12', value: '3', label: 'Complètement implémenté', maturityLevel: 3, order: 4 },
    ],
    required: true,
    order: 1,
  },
];

export function AssessmentCompletion({ assessment, onBack, onUpdate }: AssessmentCompletionProps) {
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [currentFrameworkIndex, setCurrentFrameworkIndex] = useState(0);
  const [currentCriterionId, setCurrentCriterionId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const frameworks = DEFAULT_FRAMEWORKS.filter(f => assessment.frameworkIds.includes(f.id));
  const currentFramework = frameworks[currentFrameworkIndex];
  
  // Filtrer les critères par framework actuel
  const criteria = SAMPLE_CRITERIA.filter(c => c.frameworkId === currentFramework?.id);
  const topLevelCriteria = criteria.filter(c => !c.parentId).sort((a, b) => a.order - b.order);
  
  // Calculer les statistiques de progression
  const allQuestions = SAMPLE_QUESTIONS.filter(q => 
    criteria.some(c => c.id === q.criterionId)
  );
  const answeredQuestions = responses.filter(r => 
    allQuestions.some(q => q.id === r.questionId)
  );
  const progressPercentage = allQuestions.length > 0 
    ? Math.round((answeredQuestions.length / allQuestions.length) * 100) 
    : 0;

  const getQuestionsByCriterion = (criterionId: string) => {
    return SAMPLE_QUESTIONS.filter(q => q.criterionId === criterionId).sort((a, b) => a.order - b.order);
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
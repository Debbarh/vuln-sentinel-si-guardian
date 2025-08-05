import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2, 
  FileQuestion,
  FolderOpen,
  ArrowLeft 
} from 'lucide-react';
import { ReferenceFramework, Criterion, Question } from '@/types/frameworks';
import { CriterionForm } from './CriterionForm';
import { QuestionForm } from './QuestionForm';
import { toast } from 'sonner';
import { ISO27001_CONTROLS } from '@/data/iso27001Controls';
import { NIST_CSF_FUNCTIONS } from '@/data/nistControls';

interface FrameworkDetailsProps {
  framework: ReferenceFramework;
  onBack: () => void;
  onUpdate: (framework: ReferenceFramework) => void;
}

export function FrameworkDetails({ framework, onBack, onUpdate }: FrameworkDetailsProps) {
  // Initialisation des critères basée sur le framework sélectionné
  const getInitialCriteria = (): Criterion[] => {
    if (framework.id === 'iso27001' && framework.type === 'ISO27001') {
      const criteria: Criterion[] = [];
      
      // Ajouter les catégories principales (niveau 1)
      ISO27001_CONTROLS.forEach((category, categoryIndex) => {
        criteria.push({
          id: category.id,
          frameworkId: framework.id,
          code: category.id,
          name: category.name,
          description: category.description,
          level: 1,
          order: categoryIndex + 1,
        });
        
        // Ajouter les contrôles (niveau 2)
        category.controls.forEach((control, controlIndex) => {
          criteria.push({
            id: control.id,
            frameworkId: framework.id,
            code: control.code,
            name: control.title,
            description: control.description,
            parentId: category.id,
            level: 2,
            order: controlIndex + 1,
          });
        });
      });
      
      return criteria;
    }
    
    if (framework.id === 'nist-csf-2' && framework.type === 'NIST') {
      const criteria: Criterion[] = [];
      
      // Ajouter les fonctions principales (niveau 1)
      NIST_CSF_FUNCTIONS.forEach((nistFunction, functionIndex) => {
        criteria.push({
          id: nistFunction.id,
          frameworkId: framework.id,
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
            frameworkId: framework.id,
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
              frameworkId: framework.id,
              code: subCategory.code,
              name: subCategory.title,
              description: subCategory.description,
              parentId: category.id,
              level: 3,
              order: subIndex + 1,
            });
          });
        });
      });
      
      return criteria;
    }
    
    return [];
  };

  const [criteria, setCriteria] = useState<Criterion[]>(getInitialCriteria());

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q1',
      criterionId: 'A.5.1',
      text: 'Des politiques de sécurité de l\'information sont-elles définies et documentées ?',
      description: 'Vérifier l\'existence de politiques formelles',
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
  ]);

  const [selectedCriterion, setSelectedCriterion] = useState<Criterion | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showCriterionForm, setShowCriterionForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [parentCriterionId, setParentCriterionId] = useState<string | null>(null);

  const getChildCriteria = (parentId?: string) => {
    return criteria.filter(c => c.parentId === parentId).sort((a, b) => a.order - b.order);
  };

  const getQuestionsByCriterion = (criterionId: string) => {
    return questions.filter(q => q.criterionId === criterionId).sort((a, b) => a.order - b.order);
  };

  const handleAddCriterion = (parentId?: string) => {
    setParentCriterionId(parentId || null);
    setSelectedCriterion(null);
    setShowCriterionForm(true);
  };

  const handleEditCriterion = (criterion: Criterion) => {
    setSelectedCriterion(criterion);
    setParentCriterionId(criterion.parentId || null);
    setShowCriterionForm(true);
  };

  const handleDeleteCriterion = (criterionId: string) => {
    // Vérifier s'il y a des sous-critères ou des questions
    const hasChildren = criteria.some(c => c.parentId === criterionId);
    const hasQuestions = questions.some(q => q.criterionId === criterionId);

    if (hasChildren || hasQuestions) {
      toast.error('Impossible de supprimer un critère qui contient des sous-éléments');
      return;
    }

    setCriteria(prev => prev.filter(c => c.id !== criterionId));
    toast.success('Critère supprimé avec succès');
  };

  const handleAddQuestion = (criterionId: string) => {
    setParentCriterionId(criterionId);
    setSelectedQuestion(null);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setParentCriterionId(question.criterionId);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    toast.success('Question supprimée avec succès');
  };

  const handleCriterionSubmit = (criterionData: Partial<Criterion>) => {
    if (selectedCriterion) {
      // Modification
      setCriteria(prev => prev.map(c => 
        c.id === selectedCriterion.id ? { ...c, ...criterionData } : c
      ));
    } else {
      // Création
      const newCriterion: Criterion = {
        id: `criterion-${Date.now()}`,
        frameworkId: framework.id,
        code: criterionData.code || '',
        name: criterionData.name || '',
        description: criterionData.description || '',
        parentId: parentCriterionId || undefined,
        level: parentCriterionId ? 2 : 1,
        order: criteria.filter(c => c.parentId === parentCriterionId).length + 1,
        ...criterionData,
      };
      setCriteria(prev => [...prev, newCriterion]);
    }
    setShowCriterionForm(false);
  };

  const handleQuestionSubmit = (questionData: Partial<Question>) => {
    if (selectedQuestion) {
      // Modification
      setQuestions(prev => prev.map(q => 
        q.id === selectedQuestion.id ? { ...q, ...questionData } : q
      ));
    } else {
      // Création
      const newQuestion: Question = {
        id: `question-${Date.now()}`,
        criterionId: parentCriterionId || '',
        text: questionData.text || '',
        description: questionData.description,
        type: questionData.type || 'radio',
        options: questionData.options || [],
        required: questionData.required || true,
        order: questions.filter(q => q.criterionId === parentCriterionId).length + 1,
        ...questionData,
      };
      setQuestions(prev => [...prev, newQuestion]);
    }
    setShowQuestionForm(false);
  };

  const renderCriterion = (criterion: Criterion, level: number = 0) => {
    const childCriteria = getChildCriteria(criterion.id);
    const criterionQuestions = getQuestionsByCriterion(criterion.id);

    return (
      <AccordionItem key={criterion.id} value={criterion.id}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-blue-500" />
              <div className="text-left">
                <span className="font-medium">{criterion.code} - {criterion.name}</span>
                <p className="text-sm text-muted-foreground">{criterion.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="outline" className="text-xs">
                {childCriteria.length} sous-critères
              </Badge>
              <Badge variant="outline" className="text-xs">
                {criterionQuestions.length} questions
              </Badge>
            </div>
          </div>
        </AccordionTrigger>
        
        <AccordionContent>
          <div className="pl-6 space-y-4">
            {/* Actions du critère */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddCriterion(criterion.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter Sous-critère
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddQuestion(criterion.id)}
              >
                <FileQuestion className="h-4 w-4 mr-1" />
                Ajouter Question
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditCriterion(criterion)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteCriterion(criterion.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Sous-critères */}
            {childCriteria.length > 0 && (
              <Accordion type="multiple">
                {childCriteria.map(child => renderCriterion(child, level + 1))}
              </Accordion>
            )}

            {/* Questions */}
            {criterionQuestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Questions d'évaluation :</h4>
                {criterionQuestions.map(question => (
                  <div key={question.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{question.text}</p>
                        {question.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {question.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {question.type}
                          </Badge>
                          {question.required && (
                            <Badge variant="outline" className="text-xs text-red-600">
                              Obligatoire
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const topLevelCriteria = getChildCriteria();

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
            <h2 className="text-2xl font-bold">{framework.name}</h2>
            <p className="text-muted-foreground">
              Version {framework.version} - Gestion des critères et questions
            </p>
          </div>
        </div>
        <Button onClick={() => handleAddCriterion()}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Critère
        </Button>
      </div>

      {/* Informations du référentiel */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du Référentiel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium">Nom</h4>
              <p className="text-muted-foreground">{framework.name}</p>
            </div>
            <div>
              <h4 className="font-medium">Version</h4>
              <p className="text-muted-foreground">{framework.version}</p>
            </div>
            <div>
              <h4 className="font-medium">Type</h4>
              <Badge>{framework.type}</Badge>
            </div>
          </div>
          {framework.description && (
            <div className="mt-4">
              <h4 className="font-medium">Description</h4>
              <p className="text-muted-foreground">{framework.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Structure hiérarchique */}
      <Card>
        <CardHeader>
          <CardTitle>Structure des Critères</CardTitle>
          <CardDescription>
            Organisez les critères, sous-critères et questions d'évaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topLevelCriteria.length > 0 ? (
            <Accordion type="multiple">
              {topLevelCriteria.map(criterion => renderCriterion(criterion))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun critère défini</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par ajouter des critères d'évaluation à ce référentiel
              </p>
              <Button onClick={() => handleAddCriterion()}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le Premier Critère
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CriterionForm
        isOpen={showCriterionForm}
        onClose={() => setShowCriterionForm(false)}
        criterion={selectedCriterion}
        parentId={parentCriterionId}
        onSubmit={handleCriterionSubmit}
      />

      <QuestionForm
        isOpen={showQuestionForm}
        onClose={() => setShowQuestionForm(false)}
        question={selectedQuestion}
        criterionId={parentCriterionId || ''}
        onSubmit={handleQuestionSubmit}
      />
    </div>
  );
}
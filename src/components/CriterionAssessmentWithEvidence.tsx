import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Star, 
  Shield, 
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { CriterionEvidenceManagement, type CriterionEvidence } from './CriterionEvidenceManagement';
import { ISO27001_CONTROLS } from '@/data/iso27001Controls';
import { NIST_CSF_FUNCTIONS } from '@/data/nistControls';
import { CISA_ZTMM_PILLARS } from '@/data/cisaControls';
import { toast } from 'sonner';

interface CriterionAssessmentWithEvidenceProps {
  frameworkType: 'ISO27001' | 'NIST' | 'CISA';
  assessmentId: string;
  onBack: () => void;
  userRole?: 'department' | 'rssi';
  currentUser?: string;
}

interface CriterionAssessmentData {
  criterionId: string;
  maturityLevel: number;
  implementationNotes: string;
  gaps: string[];
  evidenceCount: number;
  approvedEvidenceCount: number;
  lastUpdated: string;
}

export function CriterionAssessmentWithEvidence({
  frameworkType,
  assessmentId,
  onBack,
  userRole = 'department',
  currentUser = 'Utilisateur Actuel'
}: CriterionAssessmentWithEvidenceProps) {
  const [selectedCriterion, setSelectedCriterion] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState<Record<string, CriterionAssessmentData>>({});
  const [evidencesData, setEvidencesData] = useState<Record<string, CriterionEvidence[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [maturityFilter, setMaturityFilter] = useState<string>('all');

  // Récupérer les critères selon le type de référentiel
  const getCriteria = () => {
    switch (frameworkType) {
      case 'ISO27001':
        return ISO27001_CONTROLS.flatMap(category => 
          category.controls.map(control => ({
            id: control.id,
            code: control.code,
            title: control.title,
            description: control.description,
            category: category.name,
            frameworkType: 'ISO27001' as const,
            currentMaturity: control.maturityLevel,
            targetMaturity: 5
          }))
        );
      case 'NIST':
        return NIST_CSF_FUNCTIONS.flatMap(func => 
          func.categories.flatMap(category =>
            category.subCategories.map(subCat => ({
              id: subCat.id,
              code: subCat.code,
              title: subCat.title,
              description: subCat.description,
              category: `${func.name} > ${category.name}`,
              frameworkType: 'NIST' as const,
              currentMaturity: subCat.maturityLevel,
              targetMaturity: 5
            }))
          )
        );
      case 'CISA':
        return CISA_ZTMM_PILLARS.flatMap(pillar =>
          pillar.subComponents.map(subComp => ({
            id: subComp.id,
            code: subComp.id,
            title: subComp.title,
            description: subComp.description,
            category: pillar.name,
            frameworkType: 'CISA' as const,
            currentMaturity: 1, // Niveau par défaut
            targetMaturity: 4 // Optimal pour CISA
          }))
        );
      default:
        return [];
    }
  };

  const criteria = getCriteria();
  
  // Filtrer les critères
  const filteredCriteria = criteria.filter(criterion => {
    const matchesSearch = criterion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         criterion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         criterion.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMaturity = maturityFilter === 'all' || 
                          (maturityFilter === 'low' && criterion.currentMaturity <= 2) ||
                          (maturityFilter === 'medium' && criterion.currentMaturity === 3) ||
                          (maturityFilter === 'high' && criterion.currentMaturity >= 4);
    
    return matchesSearch && matchesMaturity;
  });

  const handleEvidenceSubmit = (evidence: Omit<CriterionEvidence, 'id' | 'submittedAt'>) => {
    const newEvidence: CriterionEvidence = {
      ...evidence,
      id: `evidence-${Date.now()}-${Math.random()}`,
      submittedAt: new Date().toISOString()
    };
    
    setEvidencesData(prev => ({
      ...prev,
      [evidence.criterionId]: [...(prev[evidence.criterionId] || []), newEvidence]
    }));

    // Mettre à jour les statistiques d'évaluation
    setAssessmentData(prev => ({
      ...prev,
      [evidence.criterionId]: {
        ...prev[evidence.criterionId],
        evidenceCount: (prev[evidence.criterionId]?.evidenceCount || 0) + 1,
        lastUpdated: new Date().toISOString()
      }
    }));

    toast.success('Preuve soumise avec succès');
  };

  const handleEvidenceValidation = (evidenceId: string, status: 'approved' | 'rejected', remarks?: string) => {
    setEvidencesData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(criterionId => {
        updated[criterionId] = updated[criterionId].map(evidence =>
          evidence.id === evidenceId
            ? {
                ...evidence,
                status,
                rssiRemarks: remarks,
                validatedBy: 'RSSI Principal',
                validatedAt: new Date().toISOString()
              }
            : evidence
        );
      });
      return updated;
    });

    // Mettre à jour le compteur de preuves approuvées
    if (status === 'approved') {
      const criterionId = Object.keys(evidencesData).find(id => 
        evidencesData[id].some(ev => ev.id === evidenceId)
      );
      
      if (criterionId) {
        setAssessmentData(prev => ({
          ...prev,
          [criterionId]: {
            ...prev[criterionId],
            approvedEvidenceCount: (prev[criterionId]?.approvedEvidenceCount || 0) + 1,
            lastUpdated: new Date().toISOString()
          }
        }));
      }
    }

    toast.success(`Preuve ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès`);
  };

  const getMaturityBadge = (maturity: number, maxMaturity: number = 5) => {
    const percentage = (maturity / maxMaturity) * 100;
    const variant = percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'destructive';
    
    return (
      <Badge variant={variant}>
        {maturity}/{maxMaturity}
      </Badge>
    );
  };

  const getCriterionStats = (criterionId: string) => {
    const evidences = evidencesData[criterionId] || [];
    const approvedEvidences = evidences.filter(e => e.status === 'approved');
    const pendingEvidences = evidences.filter(e => e.status === 'pending');
    
    return {
      total: evidences.length,
      approved: approvedEvidences.length,
      pending: pendingEvidences.length,
      maturityGain: approvedEvidences.reduce((sum, e) => sum + e.maturityContribution, 0)
    };
  };

  const getOverallProgress = () => {
    const totalCriteria = criteria.length;
    const criteriaWithEvidences = criteria.filter(c => {
      const stats = getCriterionStats(c.id);
      return stats.approved > 0;
    }).length;
    
    return totalCriteria > 0 ? (criteriaWithEvidences / totalCriteria) * 100 : 0;
  };

  if (selectedCriterion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedCriterion(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Évaluation détaillée</h2>
            <p className="text-muted-foreground">{frameworkType} - {selectedCriterion.code}</p>
          </div>
        </div>

        <CriterionEvidenceManagement
          criterion={selectedCriterion}
          evidences={evidencesData[selectedCriterion.id] || []}
          onEvidenceSubmit={handleEvidenceSubmit}
          onEvidenceValidation={handleEvidenceValidation}
          userRole={userRole}
          currentUser={currentUser}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Évaluation avec Preuves</h2>
              <p className="text-muted-foreground">
                {frameworkType} - Évaluation {assessmentId}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {userRole === 'rssi' ? <Shield className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
            {userRole === 'rssi' ? 'RSSI' : 'Département'}
          </Badge>
        </div>
      </div>

      {/* Tableau de bord */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Critères total</p>
                <p className="text-2xl font-bold">{criteria.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avec preuves</p>
                <p className="text-2xl font-bold">
                  {criteria.filter(c => getCriterionStats(c.id).approved > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Preuves approuvées</p>
                <p className="text-2xl font-bold">
                  {Object.values(evidencesData).flat().filter(e => e.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">En attente validation</p>
                <p className="text-2xl font-bold">
                  {Object.values(evidencesData).flat().filter(e => e.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de progression */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression de l'évaluation</span>
            <span className="text-sm text-muted-foreground">{getOverallProgress().toFixed(0)}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un critère..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={maturityFilter} onValueChange={setMaturityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par maturité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="low">Faible (≤2)</SelectItem>
                <SelectItem value="medium">Moyen (3)</SelectItem>
                <SelectItem value="high">Élevé (≥4)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des critères */}
      <div className="grid gap-4">
        {filteredCriteria.map((criterion) => {
          const stats = getCriterionStats(criterion.id);
          const hasApprovedEvidences = stats.approved > 0;
          const hasPendingEvidences = stats.pending > 0;
          
          return (
            <Card key={criterion.id} className={`cursor-pointer transition-all hover:shadow-md ${hasApprovedEvidences ? 'border-green-200 bg-green-50/50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {criterion.code}
                      </Badge>
                      {getMaturityBadge(criterion.currentMaturity, criterion.targetMaturity)}
                      {hasApprovedEvidences && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {stats.approved} preuve{stats.approved > 1 ? 's' : ''} approuvée{stats.approved > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {hasPendingEvidences && userRole === 'rssi' && (
                        <Badge variant="outline" className="text-orange-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {stats.pending} en attente
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold">{criterion.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {criterion.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Catégorie: {criterion.category}</span>
                      {stats.total > 0 && (
                        <span>
                          Preuves: {stats.approved}/{stats.total}
                          {stats.maturityGain > 0 && ` (+${stats.maturityGain} pts)`}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedCriterion(criterion)}
                    className="ml-4"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Gérer les preuves
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCriteria.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucun critère trouvé avec les filtres appliqués</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
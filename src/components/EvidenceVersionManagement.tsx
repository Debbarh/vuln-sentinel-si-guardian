import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  MessageSquare,
  Shield,
  AlertTriangle,
  Plus,
  Star,
  History,
  GitBranch,
  Download,
  Edit,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Evidence, EvidenceVersion, EvidenceSubmission, RSIValidation } from '@/types/evidence';
import { FileUploadZone, AttachmentViewer } from './FileUploadZone';
import { toast } from 'sonner';

interface EvidenceVersionManagementProps {
  actionPlanId: string;
  actionPlanTitle: string;
  evidences: Evidence[];
  onEvidenceSubmit: (evidence: EvidenceSubmission) => void;
  onNewVersionSubmit: (evidenceId: string, newVersion: EvidenceSubmission) => void;
  onEvidenceValidation: (
    evidenceId: string, 
    versionId: string, 
    validationData: {
      status: 'approved' | 'rejected' | 'requires_modification';
      overallScore: number;
      criteria: {
        completeness: number;
        relevance: number;
        quality: number;
        implementation: number;
      };
      remarks: string;
      recommendations: string[];
      nextActions: string[];
      validationAttachments?: File[];
    }
  ) => void;
  userRole: 'department' | 'rssi';
  currentUser: string;
}

export function EvidenceVersionManagement({
  actionPlanId,
  actionPlanTitle,
  evidences,
  onEvidenceSubmit,
  onNewVersionSubmit,
  onEvidenceValidation,
  userRole,
  currentUser
}: EvidenceVersionManagementProps) {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isNewVersionDialogOpen, setIsNewVersionDialogOpen] = useState(false);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<EvidenceVersion | null>(null);
  const [expandedEvidences, setExpandedEvidences] = useState<Set<string>>(new Set());
  
  const [newEvidence, setNewEvidence] = useState<EvidenceSubmission>({
    title: '',
    description: '',
    department: '',
    evidenceType: 'document',
    maturityContribution: 1,
    changeLog: 'Version initiale',
    attachments: []
  });
  
  const [newVersion, setNewVersion] = useState<EvidenceSubmission>({
    title: '',
    description: '',
    department: '',
    evidenceType: 'document',
    maturityContribution: 1,
    changeLog: '',
    attachments: []
  });
  
  // États pour la validation RSSI complète
  const [validationData, setValidationData] = useState({
    status: 'approved' as 'approved' | 'rejected' | 'requires_modification',
    overallScore: 7,
    criteria: {
      completeness: 7,
      relevance: 7,
      quality: 7,
      implementation: 7
    },
    remarks: '',
    recommendations: [''],
    nextActions: [''],
    validationAttachments: [] as File[]
  });

  const handleSubmitEvidence = () => {
    if (!newEvidence.title || !newEvidence.description || !newEvidence.department) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onEvidenceSubmit(newEvidence);
    setNewEvidence({
      title: '',
      description: '',
      department: '',
      evidenceType: 'document',
      maturityContribution: 1,
      changeLog: 'Version initiale',
      attachments: []
    });
    setIsSubmitDialogOpen(false);
    toast.success('Preuve soumise avec succès');
  };

  const handleSubmitNewVersion = () => {
    if (!selectedEvidence || !newVersion.title || !newVersion.description || !newVersion.changeLog) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onNewVersionSubmit(selectedEvidence.id, newVersion);
    setNewVersion({
      title: '',
      description: '',
      department: '',
      evidenceType: 'document',
      maturityContribution: 1,
      changeLog: '',
      attachments: []
    });
    setIsNewVersionDialogOpen(false);
    setSelectedEvidence(null);
    toast.success('Nouvelle version soumise avec succès');
  };

  const handleValidation = () => {
    if (!selectedEvidence || !selectedVersion) return;

    // Calculer le score global
    const { completeness, relevance, quality, implementation } = validationData.criteria;
    const calculatedScore = Math.round((completeness + relevance + quality + implementation) / 4);
    
    const finalValidationData = {
      ...validationData,
      overallScore: calculatedScore,
      recommendations: validationData.recommendations.filter(r => r.trim() !== ''),
      nextActions: validationData.nextActions.filter(a => a.trim() !== '')
    };

    onEvidenceValidation(selectedEvidence.id, selectedVersion.id, finalValidationData);
    
    // Reset
    setIsValidationDialogOpen(false);
    setSelectedEvidence(null);
    setSelectedVersion(null);
    setValidationData({
      status: 'approved',
      overallScore: 7,
      criteria: { completeness: 7, relevance: 7, quality: 7, implementation: 7 },
      remarks: '',
      recommendations: [''],
      nextActions: [''],
      validationAttachments: []
    });
    
    toast.success(`Version ${finalValidationData.status === 'approved' ? 'approuvée' : finalValidationData.status === 'rejected' ? 'rejetée' : 'marquée pour modification'} avec succès`);
  };

  const getStatusBadge = (status: EvidenceVersion['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejetée</Badge>;
      case 'requires_modification':
        return <Badge variant="outline" className="text-yellow-600"><AlertCircle className="w-3 h-3 mr-1" />Modification requise</Badge>;
      default:
        return null;
    }
  };

  const getEvidenceTypeLabel = (type: EvidenceVersion['evidenceType']) => {
    switch (type) {
      case 'document': return 'Document';
      case 'screenshot': return 'Capture d\'écran';
      case 'certificate': return 'Certificat';
      case 'procedure': return 'Procédure';
      case 'other': return 'Autre';
      default: return type;
    }
  };

  const getMaturityContributionBadge = (contribution: number) => {
    const color = contribution >= 4 ? 'text-green-600' : contribution >= 3 ? 'text-blue-600' : contribution >= 2 ? 'text-orange-600' : 'text-gray-600';
    return (
      <Badge variant="outline" className={color}>
        <Star className="w-3 h-3 mr-1" />
        +{contribution} pts
      </Badge>
    );
  };

  const toggleEvidenceExpansion = (evidenceId: string) => {
    setExpandedEvidences(prev => {
      const newSet = new Set(prev);
      if (newSet.has(evidenceId)) {
        newSet.delete(evidenceId);
      } else {
        newSet.add(evidenceId);
      }
      return newSet;
    });
  };

  const getLatestVersion = (evidence: Evidence): EvidenceVersion | undefined => {
    return evidence.versions.find(v => v.isLatest);
  };

  const addRecommendation = () => {
    setValidationData(prev => ({
      ...prev,
      recommendations: [...prev.recommendations, '']
    }));
  };

  const updateRecommendation = (index: number, value: string) => {
    setValidationData(prev => ({
      ...prev,
      recommendations: prev.recommendations.map((r, i) => i === index ? value : r)
    }));
  };

  const removeRecommendation = (index: number) => {
    setValidationData(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }));
  };

  const addNextAction = () => {
    setValidationData(prev => ({
      ...prev,
      nextActions: [...prev.nextActions, '']
    }));
  };

  const updateNextAction = (index: number, value: string) => {
    setValidationData(prev => ({
      ...prev,
      nextActions: prev.nextActions.map((a, i) => i === index ? value : a)
    }));
  };

  const removeNextAction = (index: number) => {
    setValidationData(prev => ({
      ...prev,
      nextActions: prev.nextActions.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Preuves avec Gestion de Versions
            </CardTitle>
            <CardDescription>
              Gestion des preuves avec historique pour: {actionPlanTitle}
            </CardDescription>
          </div>
          {userRole === 'department' && (
            <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle preuve
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Soumettre une nouvelle preuve</DialogTitle>
                  <DialogDescription>
                    Créer une nouvelle preuve pour cette action
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre de la preuve *</Label>
                    <Input
                      id="title"
                      value={newEvidence.title}
                      onChange={(e) => setNewEvidence({...newEvidence, title: e.target.value})}
                      placeholder="Ex: Politique de sécurité mise à jour"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newEvidence.description}
                      onChange={(e) => setNewEvidence({...newEvidence, description: e.target.value})}
                      placeholder="Décrivez la preuve et son contexte..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Département *</Label>
                      <Select value={newEvidence.department} onValueChange={(value) => setNewEvidence({...newEvidence, department: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le département" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="it">Informatique</SelectItem>
                          <SelectItem value="security">Sécurité</SelectItem>
                          <SelectItem value="hr">Ressources Humaines</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="operations">Opérations</SelectItem>
                          <SelectItem value="legal">Juridique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="evidenceType">Type de preuve</Label>
                      <Select value={newEvidence.evidenceType} onValueChange={(value: EvidenceVersion['evidenceType']) => setNewEvidence({...newEvidence, evidenceType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="screenshot">Capture d'écran</SelectItem>
                          <SelectItem value="certificate">Certificat</SelectItem>
                          <SelectItem value="procedure">Procédure</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="maturityContribution">Contribution à la maturité (1-5 points)</Label>
                    <Select value={newEvidence.maturityContribution.toString()} onValueChange={(value) => setNewEvidence({...newEvidence, maturityContribution: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 point - Preuve basique</SelectItem>
                        <SelectItem value="2">2 points - Preuve partielle</SelectItem>
                        <SelectItem value="3">3 points - Preuve substantielle</SelectItem>
                        <SelectItem value="4">4 points - Preuve complète</SelectItem>
                        <SelectItem value="5">5 points - Preuve exceptionnelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Zone d'upload de fichiers */}
                  <div>
                    <Label>Pièces jointes</Label>
                    <FileUploadZone
                      files={newEvidence.attachments}
                      onFilesChange={(files) => setNewEvidence({...newEvidence, attachments: files})}
                      maxFiles={5}
                      maxFileSize={10}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSubmitEvidence} className="flex-1">
                      Créer la preuve
                    </Button>
                    <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)} className="flex-1">
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {evidences.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune preuve soumise pour cette action</p>
          </div>
        ) : (
          <div className="space-y-4">
            {evidences.map((evidence) => {
              const latestVersion = getLatestVersion(evidence);
              const isExpanded = expandedEvidences.has(evidence.id);
              const approvedVersions = evidence.versions.filter(v => v.status === 'approved').length;
              const pendingVersions = evidence.versions.filter(v => v.status === 'pending').length;
              
              return (
                <Card key={evidence.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    {/* En-tête de la preuve */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleEvidenceExpansion(evidence.id)}
                          >
                            {isExpanded ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </Button>
                          <h3 className="font-semibold">{evidence.title}</h3>
                          <Badge variant="outline">
                            v{evidence.currentVersion}/{evidence.totalVersions}
                          </Badge>
                          {latestVersion && getStatusBadge(latestVersion.status)}
                          {getMaturityContributionBadge(evidence.maturityContribution)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
                          <span>Type: {getEvidenceTypeLabel(evidence.evidenceType)}</span>
                          <span>Département: {evidence.department}</span>
                          <span>Versions approuvées: {approvedVersions}</span>
                          {latestVersion?.attachments && (
                            <span>Pièces jointes: {latestVersion.attachments.length}</span>
                          )}
                          {pendingVersions > 0 && userRole === 'rssi' && (
                            <span className="text-orange-600">En attente: {pendingVersions}</span>
                          )}
                        </div>
                        
                        {latestVersion && (
                          <>
                            <p className="text-sm text-muted-foreground ml-8">
                              {latestVersion.description}
                            </p>
                            {latestVersion.attachments && latestVersion.attachments.length > 0 && (
                              <div className="ml-8">
                                <AttachmentViewer 
                                  attachments={latestVersion.attachments}
                                  title="Pièces jointes de la version actuelle"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {userRole === 'department' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEvidence(evidence);
                              setNewVersion({
                                title: evidence.title,
                                description: latestVersion?.description || '',
                                department: evidence.department,
                                evidenceType: evidence.evidenceType,
                                maturityContribution: evidence.maturityContribution,
                                changeLog: '',
                                attachments: []
                              });
                              setIsNewVersionDialogOpen(true);
                            }}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Nouvelle version
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleEvidenceExpansion(evidence.id)}
                        >
                          <History className="w-3 h-3 mr-1" />
                          Historique
                        </Button>
                      </div>
                    </div>

                    {/* Historique des versions (affiché si étendu) */}
                    {isExpanded && (
                      <div className="mt-4 ml-8">
                        <Separator className="mb-4" />
                        <h4 className="text-sm font-medium mb-3">Historique des versions</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Version</TableHead>
                              <TableHead>Modifications</TableHead>
                              <TableHead>Pièces jointes</TableHead>
                              <TableHead>Soumise par</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {evidence.versions
                              .sort((a, b) => b.version - a.version)
                              .map((version) => (
                                <TableRow key={version.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={version.isLatest ? "default" : "outline"}>
                                        v{version.version}
                                      </Badge>
                                      {version.isLatest && (
                                        <Badge variant="outline" className="text-green-600">
                                          Actuelle
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <p className="text-sm">{version.changeLog}</p>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {version.attachments.length} fichier{version.attachments.length > 1 ? 's' : ''}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{version.submittedBy}</TableCell>
                                  <TableCell>
                                    {new Date(version.submittedAt).toLocaleDateString('fr-FR')}
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      {getStatusBadge(version.status)}
                                      {version.rssiValidation && (
                                        <div className="text-xs text-muted-foreground">
                                          Score: {version.rssiValidation.overallScore}/10
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      {userRole === 'rssi' && version.status === 'pending' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setSelectedEvidence(evidence);
                                            setSelectedVersion(version);
                                            setIsValidationDialogOpen(true);
                                          }}
                                        >
                                          <Shield className="w-3 h-3 mr-1" />
                                          Valider
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedEvidence(evidence);
                                          setSelectedVersion(version);
                                          if (version.rssiValidation) {
                                            setValidationData({
                                              status: version.rssiValidation.status,
                                              overallScore: version.rssiValidation.overallScore,
                                              criteria: version.rssiValidation.criteria,
                                              remarks: version.rssiValidation.remarks,
                                              recommendations: version.rssiValidation.recommendations.length > 0 ? version.rssiValidation.recommendations : [''],
                                              nextActions: version.rssiValidation.nextActions.length > 0 ? version.rssiValidation.nextActions : [''],
                                              validationAttachments: []
                                            });
                                          }
                                          setIsValidationDialogOpen(true);
                                        }}
                                      >
                                        <Eye className="w-3 h-3 mr-1" />
                                        Voir
                                      </Button>
                                      {version.rssiValidation && version.rssiValidation.remarks && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          title="Voir les remarques RSSI"
                                        >
                                          <MessageSquare className="w-3 h-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog pour nouvelle version */}
        <Dialog open={isNewVersionDialogOpen} onOpenChange={setIsNewVersionDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvelle version de preuve</DialogTitle>
              <DialogDescription>
                Mettre à jour: {selectedEvidence?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-title">Titre de la preuve</Label>
                <Input
                  id="new-title"
                  value={newVersion.title}
                  onChange={(e) => setNewVersion({...newVersion, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="new-description">Description *</Label>
                <Textarea
                  id="new-description"
                  value={newVersion.description}
                  onChange={(e) => setNewVersion({...newVersion, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="changelog">Modifications apportées *</Label>
                <Textarea
                  id="changelog"
                  value={newVersion.changeLog}
                  onChange={(e) => setNewVersion({...newVersion, changeLog: e.target.value})}
                  placeholder="Décrivez les modifications apportées dans cette version..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="new-maturity">Contribution à la maturité</Label>
                <Select value={newVersion.maturityContribution.toString()} onValueChange={(value) => setNewVersion({...newVersion, maturityContribution: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 point - Preuve basique</SelectItem>
                    <SelectItem value="2">2 points - Preuve partielle</SelectItem>
                    <SelectItem value="3">3 points - Preuve substantielle</SelectItem>
                    <SelectItem value="4">4 points - Preuve complète</SelectItem>
                    <SelectItem value="5">5 points - Preuve exceptionnelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Zone d'upload pour nouvelle version */}
              <div>
                <Label>Pièces jointes pour cette version</Label>
                <FileUploadZone
                  files={newVersion.attachments}
                  onFilesChange={(files) => setNewVersion({...newVersion, attachments: files})}
                  maxFiles={5}
                  maxFileSize={10}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSubmitNewVersion} className="flex-1">
                  Soumettre la version
                </Button>
                <Button variant="outline" onClick={() => setIsNewVersionDialogOpen(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de validation RSSI complète */}
        <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Validation RSSI Complète
              </DialogTitle>
              <DialogDescription>
                {selectedEvidence?.title} - Version {selectedVersion?.version}
              </DialogDescription>
            </DialogHeader>
            {selectedEvidence && selectedVersion && (
              <div className="space-y-6">
                {/* Informations de base */}
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <p><strong>Type:</strong> {getEvidenceTypeLabel(selectedVersion.evidenceType)}</p>
                  <p><strong>Département:</strong> {selectedVersion.department}</p>
                  <p><strong>Soumise par:</strong> {selectedVersion.submittedBy}</p>
                  <p><strong>Contribution maturité:</strong> +{selectedVersion.maturityContribution} points</p>
                  <p><strong>Modifications:</strong> {selectedVersion.changeLog}</p>
                </div>

                {/* Description et pièces jointes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label>Description de la preuve</Label>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {selectedVersion.description}
                    </p>
                  </div>
                  <div>
                    <AttachmentViewer 
                      attachments={selectedVersion.attachments}
                      title="Pièces jointes"
                    />
                  </div>
                </div>

                {userRole === 'rssi' && selectedVersion.status === 'pending' && (
                  <>
                    {/* Critères d'évaluation */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Évaluation détaillée</h4>
                      
                      <div>
                        <Label>Statut de validation</Label>
                        <Select value={validationData.status} onValueChange={(value: 'approved' | 'rejected' | 'requires_modification') => 
                          setValidationData(prev => ({...prev, status: value}))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approuvée</SelectItem>
                            <SelectItem value="requires_modification">Modification requise</SelectItem>
                            <SelectItem value="rejected">Rejetée</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Complétude (1-10): {validationData.criteria.completeness}</Label>
                          <Slider
                            value={[validationData.criteria.completeness]}
                            onValueChange={([value]) => setValidationData(prev => ({
                              ...prev,
                              criteria: {...prev.criteria, completeness: value}
                            }))}
                            min={1}
                            max={10}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Pertinence (1-10): {validationData.criteria.relevance}</Label>
                          <Slider
                            value={[validationData.criteria.relevance]}
                            onValueChange={([value]) => setValidationData(prev => ({
                              ...prev,
                              criteria: {...prev.criteria, relevance: value}
                            }))}
                            min={1}
                            max={10}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Qualité (1-10): {validationData.criteria.quality}</Label>
                          <Slider
                            value={[validationData.criteria.quality]}
                            onValueChange={([value]) => setValidationData(prev => ({
                              ...prev,
                              criteria: {...prev.criteria, quality: value}
                            }))}
                            min={1}
                            max={10}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Mise en œuvre (1-10): {validationData.criteria.implementation}</Label>
                          <Slider
                            value={[validationData.criteria.implementation]}
                            onValueChange={([value]) => setValidationData(prev => ({
                              ...prev,
                              criteria: {...prev.criteria, implementation: value}
                            }))}
                            min={1}
                            max={10}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-md">
                        <p className="text-sm font-medium">
                          Score global calculé: {Math.round((validationData.criteria.completeness + validationData.criteria.relevance + validationData.criteria.quality + validationData.criteria.implementation) / 4)}/10
                        </p>
                      </div>
                    </div>

                    {/* Remarques */}
                    <div>
                      <Label htmlFor="validation-remarks">Remarques générales</Label>
                      <Textarea
                        id="validation-remarks"
                        value={validationData.remarks}
                        onChange={(e) => setValidationData(prev => ({...prev, remarks: e.target.value}))}
                        placeholder="Commentaires généraux sur la preuve..."
                        rows={3}
                      />
                    </div>

                    {/* Recommandations */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Recommandations</Label>
                        <Button size="sm" variant="outline" onClick={addRecommendation}>
                          <Plus className="w-3 h-3 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {validationData.recommendations.map((rec, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={rec}
                              onChange={(e) => updateRecommendation(index, e.target.value)}
                              placeholder="Recommandation..."
                              className="flex-1"
                            />
                            {validationData.recommendations.length > 1 && (
                              <Button size="sm" variant="outline" onClick={() => removeRecommendation(index)}>
                                <XCircle className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions suivantes */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Actions suivantes</Label>
                        <Button size="sm" variant="outline" onClick={addNextAction}>
                          <Plus className="w-3 h-3 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {validationData.nextActions.map((action, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={action}
                              onChange={(e) => updateNextAction(index, e.target.value)}
                              placeholder="Action suivante..."
                              className="flex-1"
                            />
                            {validationData.nextActions.length > 1 && (
                              <Button size="sm" variant="outline" onClick={() => removeNextAction(index)}>
                                <XCircle className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pièces jointes RSSI */}
                    <div>
                      <Label>Documents de validation RSSI (optionnel)</Label>
                      <FileUploadZone
                        files={validationData.validationAttachments}
                        onFilesChange={(files) => setValidationData(prev => ({...prev, validationAttachments: files}))}
                        maxFiles={3}
                        maxFileSize={5}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleValidation} className="flex-1">
                        Finaliser la validation
                      </Button>
                      <Button variant="outline" onClick={() => setIsValidationDialogOpen(false)} className="flex-1">
                        Annuler
                      </Button>
                    </div>
                  </>
                )}

                {/* Affichage de la validation existante */}
                {selectedVersion.rssiValidation && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Validation RSSI</h4>
                    
                    <div className="bg-muted p-4 rounded-md space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <p><strong>Statut:</strong> {selectedVersion.rssiValidation.status === 'approved' ? 'Approuvée' : selectedVersion.rssiValidation.status === 'rejected' ? 'Rejetée' : 'Modification requise'}</p>
                        <p><strong>Score global:</strong> {selectedVersion.rssiValidation.overallScore}/10</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p>Complétude: {selectedVersion.rssiValidation.criteria.completeness}/10</p>
                        <p>Pertinence: {selectedVersion.rssiValidation.criteria.relevance}/10</p>
                        <p>Qualité: {selectedVersion.rssiValidation.criteria.quality}/10</p>
                        <p>Mise en œuvre: {selectedVersion.rssiValidation.criteria.implementation}/10</p>
                      </div>
                      
                      {selectedVersion.rssiValidation.remarks && (
                        <div>
                          <strong>Remarques:</strong>
                          <p className="mt-1">{selectedVersion.rssiValidation.remarks}</p>
                        </div>
                      )}
                      
                      {selectedVersion.rssiValidation.recommendations.length > 0 && (
                        <div>
                          <strong>Recommandations:</strong>
                          <ul className="mt-1 list-disc list-inside">
                            {selectedVersion.rssiValidation.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedVersion.rssiValidation.nextActions.length > 0 && (
                        <div>
                          <strong>Actions suivantes:</strong>
                          <ul className="mt-1 list-disc list-inside">
                            {selectedVersion.rssiValidation.nextActions.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Validée par: {selectedVersion.rssiValidation.validatedBy}</p>
                        <p>Date: {new Date(selectedVersion.rssiValidation.validatedAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      
                      {selectedVersion.rssiValidation.validationAttachments && selectedVersion.rssiValidation.validationAttachments.length > 0 && (
                        <AttachmentViewer 
                          attachments={selectedVersion.rssiValidation.validationAttachments}
                          title="Documents joints par le RSSI"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
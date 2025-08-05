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
  ChevronRight
} from 'lucide-react';
import { Evidence, EvidenceVersion, EvidenceSubmission } from '@/types/evidence';
import { toast } from 'sonner';

interface EvidenceVersionManagementProps {
  actionPlanId: string;
  actionPlanTitle: string;
  evidences: Evidence[];
  onEvidenceSubmit: (evidence: EvidenceSubmission) => void;
  onNewVersionSubmit: (evidenceId: string, newVersion: EvidenceSubmission) => void;
  onEvidenceValidation: (evidenceId: string, versionId: string, status: 'approved' | 'rejected', remarks?: string) => void;
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
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<EvidenceVersion | null>(null);
  const [expandedEvidences, setExpandedEvidences] = useState<Set<string>>(new Set());
  
  const [newEvidence, setNewEvidence] = useState<EvidenceSubmission>({
    title: '',
    description: '',
    department: '',
    evidenceType: 'document',
    maturityContribution: 1,
    changeLog: 'Version initiale'
  });
  
  const [newVersion, setNewVersion] = useState<EvidenceSubmission>({
    title: '',
    description: '',
    department: '',
    evidenceType: 'document',
    maturityContribution: 1,
    changeLog: ''
  });
  
  const [validationRemarks, setValidationRemarks] = useState('');

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
      changeLog: 'Version initiale'
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
      changeLog: ''
    });
    setIsNewVersionDialogOpen(false);
    setSelectedEvidence(null);
    toast.success('Nouvelle version soumise avec succès');
  };

  const handleValidation = (status: 'approved' | 'rejected') => {
    if (!selectedEvidence || !selectedVersion) return;

    onEvidenceValidation(selectedEvidence.id, selectedVersion.id, status, validationRemarks);
    setIsValidationDialogOpen(false);
    setSelectedEvidence(null);
    setSelectedVersion(null);
    setValidationRemarks('');
    toast.success(`Version ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès`);
  };

  const getStatusBadge = (status: EvidenceVersion['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejetée</Badge>;
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
              <DialogContent className="max-w-md">
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
                          {pendingVersions > 0 && userRole === 'rssi' && (
                            <span className="text-orange-600">En attente: {pendingVersions}</span>
                          )}
                        </div>
                        
                        {latestVersion && (
                          <p className="text-sm text-muted-foreground ml-8">
                            {latestVersion.description}
                          </p>
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
                                changeLog: ''
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
                                  <TableCell>{version.submittedBy}</TableCell>
                                  <TableCell>
                                    {new Date(version.submittedAt).toLocaleDateString('fr-FR')}
                                  </TableCell>
                                  <TableCell>{getStatusBadge(version.status)}</TableCell>
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
                                          setValidationRemarks(version.rssiRemarks || '');
                                          setIsValidationDialogOpen(true);
                                        }}
                                      >
                                        <Eye className="w-3 h-3 mr-1" />
                                        Voir
                                      </Button>
                                      {version.rssiRemarks && (
                                        <Button
                                          size="sm"
                                          variant="outline"
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
          <DialogContent className="max-w-md">
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

        {/* Dialog de validation RSSI */}
        <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Validation RSSI
              </DialogTitle>
              <DialogDescription>
                {selectedEvidence?.title} - Version {selectedVersion?.version}
              </DialogDescription>
            </DialogHeader>
            {selectedEvidence && selectedVersion && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <p><strong>Type:</strong> {getEvidenceTypeLabel(selectedVersion.evidenceType)}</p>
                  <p><strong>Département:</strong> {selectedVersion.department}</p>
                  <p><strong>Soumise par:</strong> {selectedVersion.submittedBy}</p>
                  <p><strong>Contribution maturité:</strong> +{selectedVersion.maturityContribution} points</p>
                  <p><strong>Modifications:</strong> {selectedVersion.changeLog}</p>
                </div>
                <div>
                  <Label>Description de la preuve</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedVersion.description}
                  </p>
                </div>
                <div>
                  <Label htmlFor="validation-remarks">Remarques RSSI</Label>
                  <Textarea
                    id="validation-remarks"
                    value={validationRemarks}
                    onChange={(e) => setValidationRemarks(e.target.value)}
                    placeholder="Commentaires, recommandations ou demandes de modification..."
                    rows={4}
                  />
                </div>
                {userRole === 'rssi' && selectedVersion.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleValidation('approved')}
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approuver cette version
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleValidation('rejected')}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter cette version
                    </Button>
                  </div>
                )}
                {selectedVersion.status !== 'pending' && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      <strong>Statut:</strong> {selectedVersion.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                    </p>
                    {selectedVersion.validatedBy && (
                      <p className="text-sm">
                        <strong>Validée par:</strong> {selectedVersion.validatedBy}
                      </p>
                    )}
                    {selectedVersion.validatedAt && (
                      <p className="text-sm">
                        <strong>Date:</strong> {new Date(selectedVersion.validatedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
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
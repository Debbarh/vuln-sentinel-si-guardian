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
  Star
} from 'lucide-react';
import { toast } from 'sonner';

export interface CriterionEvidence {
  id: string;
  criterionId: string;
  frameworkType: 'ISO27001' | 'NIST' | 'CISA';
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  submittedBy: string;
  submittedAt: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  validatedBy?: string;
  validatedAt?: string;
  rssiRemarks?: string;
  evidenceType: 'document' | 'screenshot' | 'certificate' | 'procedure' | 'other';
  maturityContribution: number; // 1-5 points de contribution à la maturité
}

interface CriterionInfo {
  id: string;
  code: string;
  title: string;
  description: string;
  frameworkType: 'ISO27001' | 'NIST' | 'CISA';
  currentMaturity: number;
  targetMaturity: number;
}

interface CriterionEvidenceManagementProps {
  criterion: CriterionInfo;
  evidences: CriterionEvidence[];
  onEvidenceSubmit: (evidence: Omit<CriterionEvidence, 'id' | 'submittedAt'>) => void;
  onEvidenceValidation: (evidenceId: string, status: 'approved' | 'rejected', remarks?: string) => void;
  userRole: 'department' | 'rssi';
  currentUser: string;
}

export function CriterionEvidenceManagement({
  criterion,
  evidences,
  onEvidenceSubmit,
  onEvidenceValidation,
  userRole,
  currentUser
}: CriterionEvidenceManagementProps) {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<CriterionEvidence | null>(null);
  const [newEvidence, setNewEvidence] = useState({
    title: '',
    description: '',
    department: '',
    evidenceType: 'document' as CriterionEvidence['evidenceType'],
    maturityContribution: 1
  });
  const [validationRemarks, setValidationRemarks] = useState('');

  const handleSubmitEvidence = () => {
    if (!newEvidence.title || !newEvidence.description || !newEvidence.department) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onEvidenceSubmit({
      criterionId: criterion.id,
      frameworkType: criterion.frameworkType,
      title: newEvidence.title,
      description: newEvidence.description,
      submittedBy: currentUser,
      department: newEvidence.department,
      status: 'pending',
      evidenceType: newEvidence.evidenceType,
      maturityContribution: newEvidence.maturityContribution
    });

    setNewEvidence({
      title: '',
      description: '',
      department: '',
      evidenceType: 'document',
      maturityContribution: 1
    });
    setIsSubmitDialogOpen(false);
    toast.success('Preuve soumise avec succès');
  };

  const handleValidation = (status: 'approved' | 'rejected') => {
    if (!selectedEvidence) return;

    onEvidenceValidation(selectedEvidence.id, status, validationRemarks);
    setIsValidationDialogOpen(false);
    setSelectedEvidence(null);
    setValidationRemarks('');
    toast.success(`Preuve ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès`);
  };

  const getStatusBadge = (status: CriterionEvidence['status']) => {
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

  const getEvidenceTypeLabel = (type: CriterionEvidence['evidenceType']) => {
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

  const approvedEvidences = evidences.filter(e => e.status === 'approved');
  const totalMaturityGain = approvedEvidences.reduce((sum, e) => sum + e.maturityContribution, 0);
  const currentMaturityWithEvidences = Math.min(5, criterion.currentMaturity + (totalMaturityGain / 10));

  return (
    <div className="space-y-6">
      {/* En-tête du critère */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {criterion.code} - {criterion.title}
              </CardTitle>
              <CardDescription className="max-w-3xl">
                {criterion.description}
              </CardDescription>
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  Framework: {criterion.frameworkType}
                </Badge>
                <Badge variant="outline">
                  Maturité actuelle: {currentMaturityWithEvidences.toFixed(1)}/5
                </Badge>
                <Badge variant="outline">
                  Preuves approuvées: {approvedEvidences.length}
                </Badge>
                {totalMaturityGain > 0 && (
                  <Badge variant="outline" className="text-green-600">
                    +{totalMaturityGain} points de maturité
                  </Badge>
                )}
              </div>
            </div>
            {userRole === 'department' && (
              <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une preuve
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Soumettre une preuve</DialogTitle>
                    <DialogDescription>
                      Preuve de mise en œuvre pour: {criterion.code}
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
                        placeholder="Décrivez comment cette preuve démontre la mise en œuvre du critère..."
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
                      <Select value={newEvidence.evidenceType} onValueChange={(value: CriterionEvidence['evidenceType']) => setNewEvidence({...newEvidence, evidenceType: value})}>
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
                        Soumettre
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
      </Card>

      {/* Liste des preuves */}
      <Card>
        <CardHeader>
          <CardTitle>Preuves soumises ({evidences.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {evidences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune preuve soumise pour ce critère</p>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Toutes ({evidences.length})</TabsTrigger>
                <TabsTrigger value="pending">En attente ({evidences.filter(e => e.status === 'pending').length})</TabsTrigger>
                <TabsTrigger value="approved">Approuvées ({evidences.filter(e => e.status === 'approved').length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejetées ({evidences.filter(e => e.status === 'rejected').length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <EvidenceTable 
                  evidences={evidences} 
                  onValidate={(evidence) => {
                    setSelectedEvidence(evidence);
                    setIsValidationDialogOpen(true);
                  }}
                  userRole={userRole}
                  getStatusBadge={getStatusBadge}
                  getEvidenceTypeLabel={getEvidenceTypeLabel}
                  getMaturityContributionBadge={getMaturityContributionBadge}
                />
              </TabsContent>
              
              <TabsContent value="pending">
                <EvidenceTable 
                  evidences={evidences.filter(e => e.status === 'pending')} 
                  onValidate={(evidence) => {
                    setSelectedEvidence(evidence);
                    setIsValidationDialogOpen(true);
                  }}
                  userRole={userRole}
                  getStatusBadge={getStatusBadge}
                  getEvidenceTypeLabel={getEvidenceTypeLabel}
                  getMaturityContributionBadge={getMaturityContributionBadge}
                />
              </TabsContent>
              
              <TabsContent value="approved">
                <EvidenceTable 
                  evidences={evidences.filter(e => e.status === 'approved')} 
                  onValidate={(evidence) => {
                    setSelectedEvidence(evidence);
                    setIsValidationDialogOpen(true);
                  }}
                  userRole={userRole}
                  getStatusBadge={getStatusBadge}
                  getEvidenceTypeLabel={getEvidenceTypeLabel}
                  getMaturityContributionBadge={getMaturityContributionBadge}
                />
              </TabsContent>
              
              <TabsContent value="rejected">
                <EvidenceTable 
                  evidences={evidences.filter(e => e.status === 'rejected')} 
                  onValidate={(evidence) => {
                    setSelectedEvidence(evidence);
                    setIsValidationDialogOpen(true);
                  }}
                  userRole={userRole}
                  getStatusBadge={getStatusBadge}
                  getEvidenceTypeLabel={getEvidenceTypeLabel}
                  getMaturityContributionBadge={getMaturityContributionBadge}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Dialog de validation RSSI */}
      <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Validation RSSI
            </DialogTitle>
            <DialogDescription>
              {selectedEvidence?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedEvidence && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p><strong>Type:</strong> {getEvidenceTypeLabel(selectedEvidence.evidenceType)}</p>
                <p><strong>Département:</strong> {selectedEvidence.department}</p>
                <p><strong>Soumise par:</strong> {selectedEvidence.submittedBy}</p>
                <p><strong>Contribution maturité:</strong> +{selectedEvidence.maturityContribution} points</p>
              </div>
              <div>
                <Label>Description de la preuve</Label>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {selectedEvidence.description}
                </p>
              </div>
              <div>
                <Label htmlFor="remarks">Remarques RSSI</Label>
                <Textarea
                  id="remarks"
                  value={validationRemarks}
                  onChange={(e) => setValidationRemarks(e.target.value)}
                  placeholder="Commentaires, recommandations ou demandes de modification..."
                  rows={4}
                />
              </div>
              {userRole === 'rssi' && selectedEvidence.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleValidation('approved')}
                    className="flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approuver
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleValidation('rejected')}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              )}
              {selectedEvidence.status !== 'pending' && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Statut:</strong> {selectedEvidence.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                  </p>
                  {selectedEvidence.validatedBy && (
                    <p className="text-sm">
                      <strong>Validée par:</strong> {selectedEvidence.validatedBy}
                    </p>
                  )}
                  {selectedEvidence.validatedAt && (
                    <p className="text-sm">
                      <strong>Date:</strong> {new Date(selectedEvidence.validatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface EvidenceTableProps {
  evidences: CriterionEvidence[];
  onValidate: (evidence: CriterionEvidence) => void;
  userRole: 'department' | 'rssi';
  getStatusBadge: (status: CriterionEvidence['status']) => React.ReactNode;
  getEvidenceTypeLabel: (type: CriterionEvidence['evidenceType']) => string;
  getMaturityContributionBadge: (contribution: number) => React.ReactNode;
}

function EvidenceTable({ 
  evidences, 
  onValidate, 
  userRole, 
  getStatusBadge, 
  getEvidenceTypeLabel, 
  getMaturityContributionBadge 
}: EvidenceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Preuve</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Département</TableHead>
          <TableHead>Contribution</TableHead>
          <TableHead>Soumise par</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evidences.map((evidence) => (
          <TableRow key={evidence.id}>
            <TableCell>
              <div>
                <p className="font-medium">{evidence.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{evidence.description}</p>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {getEvidenceTypeLabel(evidence.evidenceType)}
              </Badge>
            </TableCell>
            <TableCell>{evidence.department}</TableCell>
            <TableCell>{getMaturityContributionBadge(evidence.maturityContribution)}</TableCell>
            <TableCell>{evidence.submittedBy}</TableCell>
            <TableCell>
              {new Date(evidence.submittedAt).toLocaleDateString('fr-FR')}
            </TableCell>
            <TableCell>{getStatusBadge(evidence.status)}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onValidate(evidence)}
                >
                  {userRole === 'rssi' && evidence.status === 'pending' ? (
                    <>
                      <Shield className="w-3 h-3 mr-1" />
                      Valider
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Voir
                    </>
                  )}
                </Button>
                {evidence.rssiRemarks && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onValidate(evidence)}
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
  );
}
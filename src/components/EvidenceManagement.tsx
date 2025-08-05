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
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  MessageSquare,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export interface Evidence {
  id: string;
  actionPlanId: string;
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
}

interface EvidenceManagementProps {
  actionPlanId: string;
  actionPlanTitle: string;
  evidences: Evidence[];
  onEvidenceSubmit: (evidence: Omit<Evidence, 'id' | 'submittedAt'>) => void;
  onEvidenceValidation: (evidenceId: string, status: 'approved' | 'rejected', remarks?: string) => void;
  userRole: 'department' | 'rssi';
  currentUser: string;
}

export function EvidenceManagement({
  actionPlanId,
  actionPlanTitle,
  evidences,
  onEvidenceSubmit,
  onEvidenceValidation,
  userRole,
  currentUser
}: EvidenceManagementProps) {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [newEvidence, setNewEvidence] = useState({
    title: '',
    description: '',
    department: '',
    evidenceType: 'document' as Evidence['evidenceType']
  });
  const [validationRemarks, setValidationRemarks] = useState('');

  const handleSubmitEvidence = () => {
    if (!newEvidence.title || !newEvidence.description || !newEvidence.department) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onEvidenceSubmit({
      actionPlanId,
      title: newEvidence.title,
      description: newEvidence.description,
      submittedBy: currentUser,
      department: newEvidence.department,
      status: 'pending',
      evidenceType: newEvidence.evidenceType
    });

    setNewEvidence({
      title: '',
      description: '',
      department: '',
      evidenceType: 'document'
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

  const getStatusBadge = (status: Evidence['status']) => {
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

  const getEvidenceTypeLabel = (type: Evidence['evidenceType']) => {
    switch (type) {
      case 'document': return 'Document';
      case 'screenshot': return 'Capture d\'écran';
      case 'certificate': return 'Certificat';
      case 'procedure': return 'Procédure';
      case 'other': return 'Autre';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Preuves de Réalisation
            </CardTitle>
            <CardDescription>
              Gestion des preuves pour: {actionPlanTitle}
            </CardDescription>
          </div>
          {userRole === 'department' && (
            <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Ajouter une preuve
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Soumettre une preuve</DialogTitle>
                  <DialogDescription>
                    Ajoutez une preuve de réalisation de l'action
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
                    <Select value={newEvidence.evidenceType} onValueChange={(value: Evidence['evidenceType']) => setNewEvidence({...newEvidence, evidenceType: value})}>
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
      <CardContent>
        {evidences.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune preuve soumise pour cette action</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preuve</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Département</TableHead>
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
                      <p className="text-sm text-muted-foreground">{evidence.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getEvidenceTypeLabel(evidence.evidenceType)}
                    </Badge>
                  </TableCell>
                  <TableCell>{evidence.department}</TableCell>
                  <TableCell>{evidence.submittedBy}</TableCell>
                  <TableCell>
                    {new Date(evidence.submittedAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{getStatusBadge(evidence.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {userRole === 'rssi' && evidence.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEvidence(evidence);
                            setIsValidationDialogOpen(true);
                          }}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Valider
                        </Button>
                      )}
                      {evidence.rssiRemarks && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEvidence(evidence);
                            setValidationRemarks(evidence.rssiRemarks || '');
                            setIsValidationDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Remarques
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Dialog de validation RSSI */}
        <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
          <DialogContent>
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
      </CardContent>
    </Card>
  );
}
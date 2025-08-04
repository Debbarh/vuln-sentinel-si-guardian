import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Play, BarChart3, Archive, Edit, Trash2 } from 'lucide-react';
import { Assessment } from '@/types/frameworks';

export function AssessmentManagement() {
  const [assessments, setAssessments] = useState<Assessment[]>([
    {
      id: '1',
      name: 'Évaluation Q1 2024',
      description: 'Évaluation trimestrielle de la maturité sécurité',
      frameworkIds: ['iso27001', 'nist-csf'],
      scope: 'Organisation complète',
      evaluators: ['user1', 'user2'],
      dueDate: '2024-03-31',
      status: 'in_progress',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-02-01T14:30:00Z',
      createdBy: 'admin',
    },
    {
      id: '2',
      name: 'Audit ISO 27001',
      description: 'Préparation audit de certification',
      frameworkIds: ['iso27001'],
      scope: 'Département IT',
      evaluators: ['user1'],
      dueDate: '2024-04-15',
      status: 'draft',
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z',
      createdBy: 'admin',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Assessment['status']) => {
    const variants = {
      draft: { label: 'Brouillon', className: 'bg-gray-500' },
      in_progress: { label: 'En Cours', className: 'bg-blue-500' },
      completed: { label: 'Terminée', className: 'bg-green-500' },
      archived: { label: 'Archivée', className: 'bg-gray-400' },
    };
    
    return (
      <Badge className={variants[status].className}>
        {variants[status].label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Évaluations</h2>
          <p className="text-muted-foreground">
            Créez et gérez vos évaluations de maturité sécurité
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Créer une Nouvelle Évaluation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Évaluations</CardTitle>
          <CardDescription>
            Liste de toutes les évaluations avec leur statut actuel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une évaluation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="in_progress">En Cours</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
                <SelectItem value="archived">Archivée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de l'Évaluation</TableHead>
                <TableHead>Référentiels</TableHead>
                <TableHead>Périmètre</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{assessment.name}</div>
                      {assessment.description && (
                        <div className="text-sm text-muted-foreground">
                          {assessment.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {assessment.frameworkIds.map((id) => (
                        <Badge key={id} variant="outline" className="text-xs">
                          {id.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{assessment.scope}</TableCell>
                  <TableCell>
                    {assessment.dueDate ? formatDate(assessment.dueDate) : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {assessment.status === 'in_progress' && (
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {assessment.status === 'completed' && (
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
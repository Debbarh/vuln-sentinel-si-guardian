import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import { DEFAULT_FRAMEWORKS, ReferenceFramework } from '@/types/frameworks';
import { FrameworkForm } from './FrameworkForm';
import { FrameworkDetails } from './FrameworkDetails';
import { toast } from 'sonner';

export function FrameworkManagement() {
  const [frameworks, setFrameworks] = useState<ReferenceFramework[]>(DEFAULT_FRAMEWORKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<ReferenceFramework | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'details'>('list');

  const filteredFrameworks = frameworks.filter(framework =>
    framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    framework.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFrameworkBadgeColor = (type: string) => {
    switch (type) {
      case 'ISO27001': return 'bg-blue-500';
      case 'NIST': return 'bg-green-500';
      case 'CISA': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAddFramework = () => {
    setSelectedFramework(null);
    setShowForm(true);
  };

  const handleEditFramework = (framework: ReferenceFramework) => {
    setSelectedFramework(framework);
    setShowForm(true);
  };

  const handleViewDetails = (framework: ReferenceFramework) => {
    setSelectedFramework(framework);
    setCurrentView('details');
  };

  const handleDeleteFramework = (frameworkId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce référentiel ?')) {
      setFrameworks(prev => prev.filter(f => f.id !== frameworkId));
      toast.success('Référentiel supprimé avec succès');
    }
  };

  const handleFormSubmit = (frameworkData: Partial<ReferenceFramework>) => {
    if (selectedFramework) {
      // Modification
      setFrameworks(prev => prev.map(f => 
        f.id === selectedFramework.id ? { ...f, ...frameworkData } : f
      ));
    } else {
      // Création
      const newFramework: ReferenceFramework = {
        id: frameworkData.id || '',
        name: frameworkData.name || '',
        version: frameworkData.version || '',
        description: frameworkData.description || '',
        type: frameworkData.type || 'ISO27001',
        createdAt: frameworkData.createdAt || new Date().toISOString(),
        updatedAt: frameworkData.updatedAt || new Date().toISOString(),
      };
      setFrameworks(prev => [...prev, newFramework]);
    }
    setShowForm(false);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedFramework(null);
  };

  if (currentView === 'details' && selectedFramework) {
    return (
      <FrameworkDetails
        framework={selectedFramework}
        onBack={handleBackToList}
        onUpdate={(framework) => {
          setFrameworks(prev => prev.map(f => 
            f.id === framework.id ? framework : f
          ));
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Référentiels</h2>
          <p className="text-muted-foreground">
            Gérez les référentiels de sécurité et leurs critères d'évaluation
          </p>
        </div>
        <Button onClick={handleAddFramework}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Référentiel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Référentiels Disponibles</CardTitle>
          <CardDescription>
            Liste des référentiels de sécurité configurés dans l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un référentiel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du Référentiel</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFrameworks.map((framework) => (
                <TableRow key={framework.id}>
                  <TableCell className="font-medium">{framework.name}</TableCell>
                  <TableCell>
                    <Badge className={getFrameworkBadgeColor(framework.type)}>
                      {framework.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{framework.version}</TableCell>
                  <TableCell className="max-w-xs truncate">{framework.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(framework)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditFramework(framework)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(framework)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleDeleteFramework(framework.id)}
                      >
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

      {/* Formulaire de création/modification */}
      <FrameworkForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        framework={selectedFramework}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
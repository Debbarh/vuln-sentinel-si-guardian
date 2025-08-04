import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import { DEFAULT_FRAMEWORKS, ReferenceFramework } from '@/types/frameworks';

export function FrameworkManagement() {
  const [frameworks, setFrameworks] = useState<ReferenceFramework[]>(DEFAULT_FRAMEWORKS);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Référentiels</h2>
          <p className="text-muted-foreground">
            Gérez les référentiels de sécurité et leurs critères d'évaluation
          </p>
        </div>
        <Button>
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
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
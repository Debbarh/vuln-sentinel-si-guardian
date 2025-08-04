import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ExecutiveReport = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-8 w-8 mr-3 text-purple-500" />
                Tableau de Bord Exécutif
              </h1>
              <p className="text-gray-600">Vue synthétique pour la direction générale</p>
            </div>
          </div>
          <Button onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Score de Sécurité Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-4">7.2/10</div>
              <Badge variant="secondary">Risque modéré</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveReport;
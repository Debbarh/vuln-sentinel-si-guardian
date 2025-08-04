import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AuditReport = () => {
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
                <FileCheck className="h-8 w-8 mr-3 text-green-500" />
                Audit et Contrôles
              </h1>
              <p className="text-gray-600">Suivi des contrôles et leur efficacité</p>
            </div>
          </div>
          <Button onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Audits Réalisés</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Liste des audits en cours et terminés...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditReport;
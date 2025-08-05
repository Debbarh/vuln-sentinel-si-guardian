import { ISO27001Category, ISO27001Control } from "@/types/iso27001";

export const ISO27001_CONTROLS: ISO27001Category[] = [
  {
    id: "A.5",
    name: "Contrôles Organisationnels",
    description: "Les contrôles organisationnels se concentrent sur les politiques, les procédures, les responsabilités et autres mesures au niveau de l'organisation nécessaires pour une sécurité de l'information efficace.",
    overallMaturity: 0,
    totalControls: 37,
    implementedControls: 0,
    controls: [
      {
        id: "A.5.1",
        code: "5.1",
        title: "Politiques pour la sécurité de l'information",
        description: "Établir et approuver des politiques de sécurité de l'information et des politiques spécifiques à des sujets, et les communiquer aux parties prenantes pertinentes.",
        category: "A.5",
        maturityLevel: 0,
        evidence: [],
        gaps: ["Absence de politique formelle de sécurité de l'information"],
        actionPlan: [],
        responsible: "RSSI",
        priority: "critical",
        status: "not_started"
      },
      {
        id: "A.5.2",
        code: "5.2",
        title: "Rôles et responsabilités en matière de sécurité de l'information",
        description: "Définir et attribuer les rôles et responsabilités en matière de sécurité de l'information.",
        category: "A.5",
        maturityLevel: 0,
        evidence: [],
        gaps: ["Rôles et responsabilités non définis"],
        actionPlan: [],
        responsible: "DRH",
        priority: "high",
        status: "not_started"
      }
      // ... Les 35 autres contrôles organisationnels seraient ici
    ]
  },
  {
    id: "A.6", 
    name: "Contrôles Humains",
    description: "Les contrôles humains se concentrent sur la gestion de la sécurité de l'information en relation avec les individus, en particulier les employés.",
    overallMaturity: 0,
    totalControls: 8,
    implementedControls: 0,
    controls: [
      {
        id: "A.6.1",
        code: "6.1",
        title: "Sélection",
        description: "Les antécédents des candidats à l'emploi doivent être vérifiés avant l'emploi.",
        category: "A.6",
        maturityLevel: 0,
        evidence: [],
        gaps: ["Processus de vérification des antécédents insuffisant"],
        actionPlan: [],
        responsible: "DRH",
        priority: "medium",
        status: "not_started"
      }
      // ... Les 7 autres contrôles humains
    ]
  },
  {
    id: "A.7",
    name: "Contrôles Physiques", 
    description: "Les contrôles physiques se concentrent sur l'environnement physique du SMSI.",
    overallMaturity: 0,
    totalControls: 14,
    implementedControls: 0,
    controls: [
      {
        id: "A.7.1",
        code: "7.1",
        title: "Périmètre de sécurité physique",
        description: "Des périmètres de sécurité physique doivent être définis et utilisés.",
        category: "A.7",
        maturityLevel: 0,
        evidence: [],
        gaps: ["Périmètres de sécurité non définis"],
        actionPlan: [],
        responsible: "Sécurité Physique",
        priority: "high",
        status: "not_started"
      }
      // ... Les 13 autres contrôles physiques
    ]
  },
  {
    id: "A.8",
    name: "Contrôles Technologiques",
    description: "Les contrôles technologiques sont les mesures de sécurité qui sont mises en œuvre via des technologies de l'information.",
    overallMaturity: 0,
    totalControls: 34,
    implementedControls: 0,
    controls: [
      {
        id: "A.8.1",
        code: "8.1", 
        title: "Dispositifs d'extrémité utilisateur (Nouveau)",
        description: "Les informations stockées, traitées ou accessibles sur les dispositifs d'extrémité utilisateur doivent être protégées.",
        category: "A.8",
        maturityLevel: 0,
        evidence: [],
        gaps: ["Protection des endpoints insuffisante"],
        actionPlan: [],
        responsible: "DSI",
        priority: "high",
        status: "not_started"
      }
      // ... Les 33 autres contrôles technologiques
    ]
  }
];
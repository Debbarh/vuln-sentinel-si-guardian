import { CISAZTMMPillar, CISACapability, CISAMaturityLevel } from "@/types/cisa";

// Niveaux de maturité CISA ZTMM
export const CISA_MATURITY_LEVELS: Record<CISAMaturityLevel, { label: string; description: string; level: number; color: string }> = {
  traditional: {
    label: 'Traditionnel',
    description: 'Approche de sécurité basée sur le périmètre avec contrôles statiques',
    level: 1,
    color: '#ef4444'
  },
  initial: {
    label: 'Initial',
    description: 'Première étape vers Zero Trust avec implémentations basiques',
    level: 2,
    color: '#f97316'
  },
  advanced: {
    label: 'Avancé',
    description: 'Implémentation mature avec automatisation et contextualisation',
    level: 3,
    color: '#3b82f6'
  },
  optimal: {
    label: 'Optimal',
    description: 'Zero Trust complet avec orchestration intelligente et adaptatif',
    level: 4,
    color: '#10b981'
  }
};

// Les 5 Piliers du CISA ZTMM
export const CISA_ZTMM_PILLARS: CISAZTMMPillar[] = [
  {
    id: "IDENTITY",
    name: "Identité",
    description: "Gestion des identités des utilisateurs et entités non-humaines, authentification et autorisation basées sur des politiques dynamiques",
    color: "#1f2937",
    order: 1,
    overallMaturity: 1,
    totalSubComponents: 4,
    implementedSubComponents: 1,
    subComponents: [
      {
        id: "IDENTITY-TRADITIONAL",
        pillarId: "IDENTITY",
        maturityLevel: "traditional",
        title: "Authentification traditionnelle",
        description: "Authentification basée sur des mots de passe simples et des annuaires locaux. Accès large et peu granulaire.",
        elements: [
          "Authentification par mot de passe uniquement",
          "Annuaires locaux (Active Directory on-premise)",
          "Accès basé sur l'appartenance réseau",
          "Politiques d'accès statiques",
          "Gestion manuelle des comptes utilisateurs"
        ],
        currentImplementation: 0,
        targetImplementation: 1,
        evidence: [],
        gaps: [
          "Absence d'authentification multi-facteurs",
          "Pas de gestion centralisée des identités",
          "Politiques d'accès peu granulaires",
          "Vulnérabilité aux attaques par mots de passe"
        ],
        actionPlan: [],
        responsible: "Direction IT",
        priority: "high",
        status: "not_started"
      },
      {
        id: "IDENTITY-INITIAL",
        pillarId: "IDENTITY",
        maturityLevel: "initial",
        title: "Authentification renforcée",
        description: "Introduction de l'authentification multi-facteurs (MFA) et gestion centralisée des identités.",
        elements: [
          "Déploiement de l'authentification multi-facteurs (MFA)",
          "Système de gestion des identités centralisé",
          "Intégration avec applications critiques",
          "Politiques d'accès basées sur les rôles (RBAC)",
          "Synchronisation des annuaires"
        ],
        currentImplementation: 0,
        targetImplementation: 2,
        evidence: [],
        gaps: [
          "MFA non déployé sur toutes les applications",
          "Gestion des identités partiellement centralisée",
          "Manque d'analyse comportementale"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "critical",
        status: "not_started"
      },
      {
        id: "IDENTITY-ADVANCED",
        pillarId: "IDENTITY",
        maturityLevel: "advanced",
        title: "Authentification contextuelle",
        description: "Authentification adaptative basée sur le contexte, analyse comportementale des utilisateurs (UEBA) et gestion des accès privilégiés.",
        elements: [
          "Authentification adaptative basée sur le contexte",
          "Analyse comportementale des utilisateurs (UEBA)",
          "Gestion des accès privilégiés (PAM)",
          "Intégration avec politiques d'accès dynamiques",
          "Détection d'anomalies d'authentification"
        ],
        currentImplementation: 0,
        targetImplementation: 3,
        evidence: [],
        gaps: [
          "Pas d'authentification adaptative",
          "UEBA non implémenté",
          "PAM basique ou absent"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "medium",
        status: "not_started"
      },
      {
        id: "IDENTITY-OPTIMAL",
        pillarId: "IDENTITY",
        maturityLevel: "optimal",
        title: "Authentification continue et dynamique",
        description: "Authentification continue, micro-segmentation basée sur l'identité, intégration complète avec systèmes d'orchestration.",
        elements: [
          "Authentification continue et re-validation dynamique",
          "Politiques d'accès granulaires et contextuelles",
          "Micro-segmentation basée sur l'identité",
          "Intégration avec systèmes SOAR",
          "Gestion automatisée du cycle de vie des identités"
        ],
        currentImplementation: 0,
        targetImplementation: 4,
        evidence: [],
        gaps: [
          "Authentification continue non implémentée",
          "Micro-segmentation identitaire absente",
          "Intégration SOAR manquante"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "low",
        status: "not_started"
      }
    ]
  },
  {
    id: "DEVICES",
    name: "Appareils",
    description: "Sécurisation de tous les appareils accédant aux ressources, qu'ils soient gérés ou non, avec évaluation continue de conformité",
    color: "#7c2d12",
    order: 2,
    overallMaturity: 1,
    totalSubComponents: 4,
    implementedSubComponents: 1,
    subComponents: [
      {
        id: "DEVICES-TRADITIONAL",
        pillarId: "DEVICES",
        maturityLevel: "traditional",
        title: "Gestion basique des appareils",
        description: "Gestion limitée des appareils avec inventaires manuels et politiques de sécurité basiques.",
        elements: [
          "Inventaire manuel des appareils",
          "Antivirus basique sur les postes de travail",
          "Absence de gestion centralisée",
          "Politiques de sécurité statiques",
          "Pas de visibilité sur les appareils non gérés"
        ],
        currentImplementation: 1,
        targetImplementation: 1,
        evidence: ["Antivirus déployé", "Inventaire Excel maintenu"],
        gaps: [
          "Inventaire incomplet et non automatisé",
          "Pas de gestion centralisée des appareils",
          "Visibilité limitée sur l'état de sécurité"
        ],
        actionPlan: [],
        responsible: "Support IT",
        priority: "medium",
        status: "in_progress"
      },
      {
        id: "DEVICES-INITIAL",
        pillarId: "DEVICES",
        maturityLevel: "initial",
        title: "Gestion centralisée des appareils",
        description: "Introduction de la gestion des appareils mobiles (MDM) et automatisation de la gestion des correctifs.",
        elements: [
          "Solution MDM/EMM déployée",
          "Gestion automatisée des correctifs",
          "Inventaire automatisé des appareils",
          "Politiques de conformité de base",
          "Chiffrement des appareils mobiles"
        ],
        currentImplementation: 0,
        targetImplementation: 2,
        evidence: [],
        gaps: [
          "Solution MDM non déployée",
          "Gestion des correctifs manuelle",
          "Inventaire non automatisé"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "high",
        status: "not_started"
      },
      {
        id: "DEVICES-ADVANCED",
        pillarId: "DEVICES",
        maturityLevel: "advanced",
        title: "Évaluation continue de la posture",
        description: "Évaluation continue de la posture de sécurité, accès conditionnel basé sur la conformité et micro-segmentation.",
        elements: [
          "Solutions EDR/XDR déployées",
          "Évaluation continue de la posture de sécurité",
          "Accès conditionnel basé sur la conformité",
          "Micro-segmentation des appareils",
          "Détection des appareils non conformes"
        ],
        currentImplementation: 0,
        targetImplementation: 3,
        evidence: [],
        gaps: [
          "Pas de solution EDR/XDR",
          "Évaluation de conformité manuelle",
          "Accès conditionnel non implémenté"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "medium",
        status: "not_started"
      },
      {
        id: "DEVICES-OPTIMAL",
        pillarId: "DEVICES",
        maturityLevel: "optimal",
        title: "Remédiation automatique et intégration",
        description: "Automatisation complète de la conformité, remédiation automatique et intégration avec plateformes de sécurité.",
        elements: [
          "Remédiation automatique des non-conformités",
          "Intégration avec plateformes de sécurité",
          "Évaluation dynamique de la confiance des appareils",
          "Orchestration de la sécurité des endpoints",
          "Machine Learning pour la détection d'anomalies"
        ],
        currentImplementation: 0,
        targetImplementation: 4,
        evidence: [],
        gaps: [
          "Remédiation automatique absente",
          "Intégration limitée des plateformes",
          "Pas d'évaluation dynamique de confiance"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "low",
        status: "not_started"
      }
    ]
  },
  {
    id: "NETWORKS",
    name: "Réseaux",
    description: "Sécurisation de l'infrastructure réseau avec micro-segmentation granulaire et contrôles d'accès contextuels",
    color: "#0f766e",
    order: 3,
    overallMaturity: 1,
    totalSubComponents: 4,
    implementedSubComponents: 1,
    subComponents: [
      {
        id: "NETWORKS-TRADITIONAL",
        pillarId: "NETWORKS",
        maturityLevel: "traditional",
        title: "Architecture réseau périmétrique",
        description: "Réseau plat ou segmentation rudimentaire basée sur des VLANs avec pare-feu de périmètre.",
        elements: [
          "Pare-feu de périmètre traditionnel",
          "Segmentation VLAN basique",
          "VPN pour accès distant",
          "Architecture réseau en château fort",
          "Contrôles d'accès basés sur l'adresse IP"
        ],
        currentImplementation: 2,
        targetImplementation: 1,
        evidence: ["Pare-feu en place", "VLANs configurés"],
        gaps: [
          "Segmentation insuffisante",
          "Pas de micro-segmentation",
          "Visibilité limitée du trafic interne"
        ],
        actionPlan: [],
        responsible: "Administrateur Réseau",
        priority: "medium",
        status: "in_progress"
      },
      {
        id: "NETWORKS-INITIAL",
        pillarId: "NETWORKS",
        maturityLevel: "initial",
        title: "Segmentation et surveillance de base",
        description: "Introduction de la segmentation réseau et surveillance du trafic avec détection d'intrusions.",
        elements: [
          "Segmentation réseau améliorée",
          "Surveillance du trafic (NetFlow/sFlow)",
          "Systèmes de détection d'intrusions (IDS/IPS)",
          "Politiques de contrôle d'accès réseau",
          "Monitoring des connexions suspectes"
        ],
        currentImplementation: 0,
        targetImplementation: 2,
        evidence: [],
        gaps: [
          "Surveillance du trafic limitée",
          "IDS/IPS non déployés",
          "Segmentation insuffisante"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "high",
        status: "not_started"
      },
      {
        id: "NETWORKS-ADVANCED",
        pillarId: "NETWORKS",
        maturityLevel: "advanced",
        title: "Micro-segmentation et NDR",
        description: "Micro-segmentation des réseaux, politiques au niveau workload et détection/réponse réseau (NDR).",
        elements: [
          "Micro-segmentation granulaire",
          "Pare-feu d'application web (WAF)",
          "Détection et réponse réseau (NDR)",
          "Prévention des fuites de données (DLP) réseau",
          "Politiques de sécurité dynamiques"
        ],
        currentImplementation: 0,
        targetImplementation: 3,
        evidence: [],
        gaps: [
          "Micro-segmentation non implémentée",
          "Solutions NDR absentes",
          "WAF non déployé"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "medium",
        status: "not_started"
      },
      {
        id: "NETWORKS-OPTIMAL",
        pillarId: "NETWORKS",
        maturityLevel: "optimal",
        title: "SDN et ZTNA",
        description: "Réseau défini par logiciel avec application dynamique des politiques et Zero Trust Network Access.",
        elements: [
          "Réseau défini par logiciel (SDN)",
          "Application dynamique des politiques",
          "Orchestration de la sécurité réseau",
          "Zero Trust Network Access (ZTNA)",
          "Intégration identité-appareil-réseau"
        ],
        currentImplementation: 0,
        targetImplementation: 4,
        evidence: [],
        gaps: [
          "SDN non implémenté",
          "ZTNA absent",
          "Orchestration manuelle"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "low",
        status: "not_started"
      }
    ]
  },
  {
    id: "APPLICATIONS",
    name: "Applications et Charges de Travail",
    description: "Sécurisation des applications et workloads avec approche DevSecOps et protection comportementale",
    color: "#7c3aed",
    order: 4,
    overallMaturity: 1,
    totalSubComponents: 4,
    implementedSubComponents: 0,
    subComponents: [
      {
        id: "APPLICATIONS-TRADITIONAL",
        pillarId: "APPLICATIONS",
        maturityLevel: "traditional",
        title: "Sécurité applicative ponctuelle",
        description: "Sécurité des applications limitée avec tests de sécurité ponctuels et analyse statique basique.",
        elements: [
          "Tests de pénétration occasionnels",
          "Analyse statique du code (SAST) limitée",
          "Revues de code manuelles",
          "Sécurité intégrée tardivement",
          "Pas de protection runtime"
        ],
        currentImplementation: 0,
        targetImplementation: 1,
        evidence: [],
        gaps: [
          "Tests de sécurité insuffisants",
          "Pas d'intégration DevSecOps",
          "Protection runtime absente"
        ],
        actionPlan: [],
        responsible: "Responsable Développement",
        priority: "medium",
        status: "not_started"
      },
      {
        id: "APPLICATIONS-INITIAL",
        pillarId: "APPLICATIONS",
        maturityLevel: "initial",
        title: "SDLC sécurisé et WAF",
        description: "Intégration de la sécurité dans le SDLC avec déploiement de WAF et gestion des vulnérabilités.",
        elements: [
          "Cycle de développement sécurisé (SDLC)",
          "Pare-feu d'applications web (WAF)",
          "Gestion des vulnérabilités applicatives",
          "Tests de sécurité automatisés",
          "Formation sécurité des développeurs"
        ],
        currentImplementation: 0,
        targetImplementation: 2,
        evidence: [],
        gaps: [
          "SDLC non sécurisé",
          "WAF non déployé",
          "Tests automatisés manquants"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "high",
        status: "not_started"
      },
      {
        id: "APPLICATIONS-ADVANCED",
        pillarId: "APPLICATIONS",
        maturityLevel: "advanced",
        title: "DevSecOps et micro-segmentation",
        description: "Approche DevSecOps mature avec protection des API et micro-segmentation des conteneurs.",
        elements: [
          "Pipeline DevSecOps complet",
          "Protection et sécurité des API",
          "Micro-segmentation des conteneurs",
          "Analyse dynamique du code (DAST)",
          "Sécurité des environnements cloud-native"
        ],
        currentImplementation: 0,
        targetImplementation: 3,
        evidence: [],
        gaps: [
          "DevSecOps non implémenté",
          "Protection API insuffisante",
          "Conteneurs non sécurisés"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "medium",
        status: "not_started"
      },
      {
        id: "APPLICATIONS-OPTIMAL",
        pillarId: "APPLICATIONS",
        maturityLevel: "optimal",
        title: "RASP et orchestration intelligente",
        description: "Protection comportementale avec RASP, orchestration de sécurité et gestion avancée des secrets.",
        elements: [
          "Runtime Application Self-Protection (RASP)",
          "Politiques de sécurité comportementales",
          "Orchestration de la sécurité des applications",
          "Gestion avancée des secrets et certificats",
          "IA/ML pour la détection d'anomalies applicatives"
        ],
        currentImplementation: 0,
        targetImplementation: 4,
        evidence: [],
        gaps: [
          "RASP non déployé",
          "Orchestration manuelle",
          "Gestion des secrets basique"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "low",
        status: "not_started"
      }
    ]
  },
  {
    id: "DATA",
    name: "Données",
    description: "Protection des informations sensibles avec classification, chiffrement et contrôles d'accès contextuels",
    color: "#be185d",
    order: 5,
    overallMaturity: 1,
    totalSubComponents: 4,
    implementedSubComponents: 1,
    subComponents: [
      {
        id: "DATA-TRADITIONAL",
        pillarId: "DATA",
        maturityLevel: "traditional",
        title: "Protection basique des données",
        description: "Protection limitée basée sur des contrôles d'accès système et chiffrement minimal.",
        elements: [
          "Contrôles d'accès au niveau système de fichiers",
          "Chiffrement limité des données au repos",
          "Sauvegardes non chiffrées",
          "Pas de classification des données",
          "Protection périmétrique uniquement"
        ],
        currentImplementation: 1,
        targetImplementation: 1,
        evidence: ["Contrôles NTFS en place"],
        gaps: [
          "Classification des données absente",
          "Chiffrement insuffisant",
          "Pas de DLP"
        ],
        actionPlan: [],
        responsible: "Administrateur Système",
        priority: "high",
        status: "in_progress"
      },
      {
        id: "DATA-INITIAL",
        pillarId: "DATA",
        maturityLevel: "initial",
        title: "Classification et chiffrement",
        description: "Classification des données et chiffrement des données sensibles avec DLP basique.",
        elements: [
          "Système de classification des données",
          "Chiffrement des données au repos et en transit",
          "Data Loss Prevention (DLP) basique",
          "Politiques de rétention des données",
          "Contrôles d'accès basés sur la classification"
        ],
        currentImplementation: 0,
        targetImplementation: 2,
        evidence: [],
        gaps: [
          "Classification non implémentée",
          "Chiffrement partiel",
          "DLP non déployé"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "critical",
        status: "not_started"
      },
      {
        id: "DATA-ADVANCED",
        pillarId: "DATA",
        maturityLevel: "advanced",
        title: "Protection contextuelle et DRM",
        description: "Protection basée sur le contexte avec gestion des droits numériques et détection d'anomalies.",
        elements: [
          "Digital Rights Management (DRM)",
          "Détection des anomalies d'accès aux données",
          "Chiffrement granulaire et tokenisation",
          "Gestion avancée des clés de chiffrement",
          "Protection des données non structurées"
        ],
        currentImplementation: 0,
        targetImplementation: 3,
        evidence: [],
        gaps: [
          "DRM non implémenté",
          "Détection d'anomalies absente",
          "Tokenisation manquante"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "medium",
        status: "not_started"
      },
      {
        id: "DATA-OPTIMAL",
        pillarId: "DATA",
        maturityLevel: "optimal",
        title: "Protection data-centric et chiffrement homomorphe",
        description: "Protection centrée sur les données avec politiques dynamiques et technologies de chiffrement avancées.",
        elements: [
          "Chiffrement homomorphe pour l'analyse",
          "Politiques d'accès dynamiques temps réel",
          "Protection des données non structurées",
          "Classification automatique par IA/ML",
          "Gouvernance des données intégrée"
        ],
        currentImplementation: 0,
        targetImplementation: 4,
        evidence: [],
        gaps: [
          "Chiffrement homomorphe absent",
          "Politiques statiques",
          "Classification manuelle"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "low",
        status: "not_started"
      }
    ]
  }
];

// Les 3 Capacités Transversales
export const CISA_ZTMM_CAPABILITIES: CISACapability[] = [
  {
    id: "VISIBILITY",
    name: "Visibilité et Analyse",
    description: "Collecte, agrégation et analyse des données de sécurité pour une compréhension complète de l'état de sécurité",
    color: "#059669",
    order: 1,
    overallMaturity: 1,
    totalSubComponents: 4,
    implementedSubComponents: 1,
    subComponents: [
      {
        id: "VISIBILITY-TRADITIONAL",
        capabilityId: "VISIBILITY",
        maturityLevel: "traditional",
        title: "Collecte de journaux basique",
        description: "Collecte limitée des journaux avec analyse manuelle et réactive des événements de sécurité.",
        elements: [
          "Journaux d'événements Windows/Linux basiques",
          "Analyse manuelle des logs",
          "Alertes rudimentaires",
          "Pas de corrélation d'événements",
          "Réponse réactive aux incidents"
        ],
        currentImplementation: 1,
        targetImplementation: 1,
        evidence: ["Logs système collectés"],
        gaps: [
          "Analyse manuelle inefficace",
          "Pas de centralisation",
          "Corrélation absente"
        ],
        actionPlan: [],
        responsible: "Support IT",
        priority: "medium",
        status: "in_progress"
      },
      {
        id: "VISIBILITY-INITIAL",
        capabilityId: "VISIBILITY",
        maturityLevel: "initial",
        title: "SIEM et centralisation",
        description: "Collecte centralisée avec SIEM, corrélation d'événements de base et tableaux de bord.",
        elements: [
          "SIEM (Security Information and Event Management)",
          "Collecte centralisée des journaux",
          "Tableaux de bord de sécurité",
          "Alertes automatisées améliorées",
          "Corrélation d'événements basique"
        ],
        currentImplementation: 0,
        targetImplementation: 2,
        evidence: [],
        gaps: [
          "SIEM non déployé",
          "Collecte non centralisée",
          "Tableaux de bord manquants"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "high",
        status: "not_started"
      },
      {
        id: "VISIBILITY-ADVANCED",
        capabilityId: "VISIBILITY",
        maturityLevel: "advanced",
        title: "UEBA et détection avancée",
        description: "Analyse comportementale avec UEBA, détection de menaces avancées et renseignement intégré.",
        elements: [
          "User and Entity Behavior Analytics (UEBA)",
          "Détection des menaces avancées persistantes (APT)",
          "Intégration du renseignement sur les menaces",
          "Analyse forensique avancée",
          "Hunting proactif des menaces"
        ],
        currentImplementation: 0,
        targetImplementation: 3,
        evidence: [],
        gaps: [
          "UEBA non implémenté",
          "Détection APT limitée",
          "Threat intelligence manquant"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "medium",
        status: "not_started"
      },
      {
        id: "VISIBILITY-OPTIMAL",
        capabilityId: "VISIBILITY",
        maturityLevel: "optimal",
        title: "IA/ML et analyse prédictive",
        description: "Intelligence artificielle pour détection prédictive avec visibilité unifiée en temps réel.",
        elements: [
          "IA/ML pour la détection des menaces",
          "Analyse prédictive des risques",
          "Visibilité unifiée temps réel",
          "Threat hunting automatisé",
          "Analyse comportementale avancée"
        ],
        currentImplementation: 0,
        targetImplementation: 4,
        evidence: [],
        gaps: [
          "IA/ML non déployés",
          "Analyse prédictive absente",
          "Visibilité fragmentée"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "low",
        status: "not_started"
      }
    ]
  },
  {
    id: "AUTOMATION",
    name: "Automatisation et Orchestration",
    description: "Automatisation des processus de sécurité et orchestration des réponses pour améliorer l'efficacité",
    color: "#dc2626",
    order: 2,
    overallMaturity: 1,
    totalSubComponents: 4,
    implementedSubComponents: 0,
    subComponents: [
      {
        id: "AUTOMATION-TRADITIONAL",
        capabilityId: "AUTOMATION",
        maturityLevel: "traditional",
        title: "Processus manuels",
        description: "Opérations manuelles avec réponses ad-hoc aux incidents et absence d'intégration.",
        elements: [
          "Opérations de sécurité entièrement manuelles",
          "Scripts simples et isolés",
          "Réponses aux incidents ad-hoc",
          "Absence d'intégration entre outils",
          "Processus documentés mais non automatisés"
        ],
        currentImplementation: 1,
        targetImplementation: 1,
        evidence: ["Procédures documentées"],
        gaps: [
          "Tout est manuel",
          "Pas d'intégration",
          "Réponse lente aux incidents"
        ],
        actionPlan: [],
        responsible: "Équipe Sécurité",
        priority: "medium",
        status: "in_progress"
      },
      {
        id: "AUTOMATION-INITIAL",
        capabilityId: "AUTOMATION",
        maturityLevel: "initial",
        title: "Automatisation basique",
        description: "Automatisation de tâches simples avec scripts de réponse et intégration limitée.",
        elements: [
          "Automatisation de tâches répétitives",
          "Scripts de réponse aux incidents",
          "Intégration limitée entre outils de sécurité",
          "Workflows de sécurité documentés",
          "Déploiement automatisé de correctifs"
        ],
        currentImplementation: 0,
        targetImplementation: 2,
        evidence: [],
        gaps: [
          "Automatisation limitée",
          "Scripts non standardisés",
          "Intégration faible"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "high",
        status: "not_started"
      },
      {
        id: "AUTOMATION-ADVANCED",
        capabilityId: "AUTOMATION",
        maturityLevel: "advanced",
        title: "SOAR et orchestration",
        description: "Orchestration des workflows avec SOAR, réponse automatisée et gestion des playbooks.",
        elements: [
          "Security Orchestration, Automation and Response (SOAR)",
          "Réponse automatisée aux incidents",
          "Intégration avancée des outils de sécurité",
          "Gestion centralisée des playbooks",
          "Application dynamique des politiques"
        ],
        currentImplementation: 0,
        targetImplementation: 3,
        evidence: [],
        gaps: [
          "SOAR non déployé",
          "Réponse manuelle",
          "Playbooks statiques"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "medium",
        status: "not_started"
      },
      {
        id: "AUTOMATION-OPTIMAL",
        capabilityId: "AUTOMATION",
        maturityLevel: "optimal",
        title: "Auto-remédiation et intégration GRC",
        description: "Automatisation complète avec auto-remédiation et intégration des systèmes de gouvernance.",
        elements: [
          "Auto-remédiation intelligente",
          "Intégration GRC (Gouvernance, Risque, Conformité)",
          "Orchestration intelligente basée sur l'IA",
          "Prise de décision autonome",
          "Optimisation continue des processus"
        ],
        currentImplementation: 0,
        targetImplementation: 4,
        evidence: [],
        gaps: [
          "Auto-remédiation absente",
          "GRC non intégré",
          "Décisions manuelles"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "low",
        status: "not_started"
      }
    ]
  },
  {
    id: "GOVERNANCE",
    name: "Gouvernance",
    description: "Politiques, processus et procédures pour une mise en œuvre cohérente du Zero Trust",
    color: "#7c2d12",
    order: 3,
    overallMaturity: 1,
    totalSubComponents: 4,
    implementedSubComponents: 1,
    subComponents: [
      {
        id: "GOVERNANCE-TRADITIONAL",
        capabilityId: "GOVERNANCE",
        maturityLevel: "traditional",
        title: "Gouvernance statique",
        description: "Politiques statiques avec gestion réactive des risques et audits de conformité ponctuels.",
        elements: [
          "Politiques de sécurité statiques",
          "Évaluation des risques manuelle",
          "Audits de conformité ponctuels",
          "Gestion documentaire basique",
          "Processus de gouvernance informels"
        ],
        currentImplementation: 2,
        targetImplementation: 1,
        evidence: ["Politiques documentées", "Audits annuels"],
        gaps: [
          "Politiques trop statiques",
          "Évaluation des risques occasionnelle",
          "Conformité réactive"
        ],
        actionPlan: [],
        responsible: "Direction Générale",
        priority: "medium",
        status: "in_progress"
      },
      {
        id: "GOVERNANCE-INITIAL",
        capabilityId: "GOVERNANCE",
        maturityLevel: "initial",
        title: "Politiques granulaires",
        description: "Politiques plus granulaires basées sur les rôles avec amélioration de la gestion des risques.",
        elements: [
          "Politiques basées sur les rôles (RBAC)",
          "Registre des risques centralisé",
          "Suivi des contrôles de sécurité",
          "Processus de gestion des exceptions",
          "Revues périodiques des politiques"
        ],
        currentImplementation: 0,
        targetImplementation: 2,
        evidence: [],
        gaps: [
          "RBAC non implémenté",
          "Registre des risques manquant",
          "Suivi manuel"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "high",
        status: "not_started"
      },
      {
        id: "GOVERNANCE-ADVANCED",
        capabilityId: "GOVERNANCE",
        maturityLevel: "advanced",
        title: "Politiques contextuelles",
        description: "Politiques dynamiques basées sur le contexte avec gestion continue des risques.",
        elements: [
          "Politiques contextuelles et adaptatives",
          "Gestion des risques en temps réel",
          "Conformité continue et automatisée",
          "Gestion automatisée des exceptions",
          "Tableau de bord de gouvernance"
        ],
        currentImplementation: 0,
        targetImplementation: 3,
        evidence: [],
        gaps: [
          "Politiques statiques",
          "Gestion des risques périodique",
          "Conformité manuelle"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "medium",
        status: "not_started"
      },
      {
        id: "GOVERNANCE-OPTIMAL",
        capabilityId: "GOVERNANCE",
        maturityLevel: "optimal",
        title: "Gouvernance data-driven",
        description: "Gouvernance axée sur les données avec politiques adaptatives et gestion automatisée.",
        elements: [
          "Politiques adaptatives auto-appliquées",
          "Gestion des risques basée sur l'IA",
          "Conformité automatisée en temps réel",
          "Audit continu et intelligent",
          "Optimisation continue de la gouvernance"
        ],
        currentImplementation: 0,
        targetImplementation: 4,
        evidence: [],
        gaps: [
          "Politiques non adaptatives",
          "IA non utilisée",
          "Audit périodique"
        ],
        actionPlan: [],
        responsible: "RSSI",
        priority: "low",
        status: "not_started"
      }
    ]
  }
];

// Mapping des scores vers les niveaux de maturité
export const getScoreToMaturityLevel = (score: number): CISAMaturityLevel => {
  if (score < 1.5) return 'traditional';
  if (score < 2.5) return 'initial';
  if (score < 3.5) return 'advanced';
  return 'optimal';
};

export const getMaturityLevelToScore = (level: CISAMaturityLevel): number => {
  const mapping = {
    traditional: 1,
    initial: 2,
    advanced: 3,
    optimal: 4
  };
  return mapping[level];
};
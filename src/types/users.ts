// Types pour les utilisateurs et évaluateurs

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'evaluator' | 'viewer' | 'manager';
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Evaluator extends User {
  role: 'evaluator' | 'admin' | 'manager';
  specializations: string[]; // ISO27001, NIST, CISA
  certifications?: string[];
}

// Données exemple d'utilisateurs
export const SAMPLE_USERS: User[] = [
  {
    id: 'user1',
    email: 'alice.martin@company.com',
    firstName: 'Alice',
    lastName: 'Martin',
    role: 'admin',
    department: 'IT Security',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'user2',
    email: 'bob.dupont@company.com',
    firstName: 'Bob',
    lastName: 'Dupont',
    role: 'evaluator',
    department: 'Risk Management',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'user3',
    email: 'claire.bernard@company.com',
    firstName: 'Claire',
    lastName: 'Bernard',
    role: 'evaluator',
    department: 'Compliance',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'user4',
    email: 'david.leroy@company.com',
    firstName: 'David',
    lastName: 'Leroy',
    role: 'manager',
    department: 'IT Operations',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
];

export const getEvaluators = (): Evaluator[] => {
  return SAMPLE_USERS.filter(user => 
    user.role === 'evaluator' || user.role === 'admin' || user.role === 'manager'
  ).map(user => ({
    ...user,
    specializations: user.role === 'admin' ? ['ISO27001', 'NIST', 'CISA'] : ['ISO27001'],
    certifications: user.role === 'admin' ? ['ISO 27001 Lead Auditor'] : [],
  })) as Evaluator[];
};

export const getUserDisplayName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`;
};
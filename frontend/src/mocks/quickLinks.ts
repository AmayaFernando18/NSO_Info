import type { QuickAccessDto } from '../types';

export const mockQuickLinks: QuickAccessDto[] = [
  {
    id: '1',
    title: 'Dispatch Center',
    description: 'Real-time system dispatch dashboard',
    url: '/dispatch',
    icon: 'Zap'
  },
  {
    id: '2',
    title: 'Demand Forecast',
    description: 'System demand predictions',
    url: '/forecast',
    icon: 'ChartBarIcon'
  },
  {
    id: '3',
    title: 'System Stability',
    description: 'Real-time stability monitoring',
    url: '/stability',
    icon: 'Activity'
  },
  {
    id: '4',
    title: 'Employee Portal',
    description: 'HR and personnel services',
    url: '/employee',
    icon: 'UserIcon'
  },
  {
    id: '5',
    title: 'Training Programs',
    description: 'Operator training and certification',
    url: '/training',
    icon: 'AcademicCapIcon'
  },
  {
    id: '6',
    title: 'Documentation',
    description: 'Standard operating procedures',
    url: '/docs',
    icon: 'DocumentTextIcon'
  },
  {
    id: '7',
    title: 'Analytics',
    description: 'System performance analytics',
    url: '/analytics',
    icon: 'ChartBarIcon'
  }
];

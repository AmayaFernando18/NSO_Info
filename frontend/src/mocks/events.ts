import type { EventDto } from '../types';

export const mockEvents: EventDto[] = [
  {
    id: '1',
    title: 'Dispatch Operations Training',
    description: 'Advanced training on real-time system dispatch and control.',
    eventDate: '2026-02-17',
    category: 'Training'
  },
  {
    id: '2',
    title: 'Procurement Planning Workshop',
    description: 'Strategic planning for long-term electricity procurement.',
    eventDate: '2026-02-20',
    category: 'Workshop'
  },
  {
    id: '3',
    title: 'System Planning Review',
    description: 'Review of demand forecasts and system expansion plans.',
    eventDate: '2026-02-23',
    category: 'Meeting'
  },
  {
    id: '4',
    title: 'Emergency Operation Drill',
    description: 'Simulation of emergency system scenarios and response.',
    eventDate: '2026-02-27',
    category: 'Drill'
  },
  {
    id: '5',
    title: 'Stakeholder Coordination Meeting',
    description: 'Coordination with generators and transmission operators.',
    eventDate: '2026-03-03',
    category: 'Coordination'
  }
];

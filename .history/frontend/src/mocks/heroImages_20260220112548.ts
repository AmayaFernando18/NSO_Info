import type { HeroCarouselImageDto } from '../types';

export const mockHeroImages: HeroCarouselImageDto[] = [
  {
    id: '1',
    title: 'Reliable System Operations',
    description: 'Ensuring stable power supply for Sri Lanka',
    imageUrl: '/images/lab.png',
    order: 1
  },
  {
    id: '2',
    title: 'Advanced Dispatch Management',
    description: 'Optimizing system performance in real-time',
    imageUrl: '/images/operator.jpg',
    order: 2
  },
  {
    id: '3',
    title: 'Strategic Planning & Procurement',
    description: 'Efficient electricity resource management',
    imageUrl: '/images/work.jpg',
    order: 3
  }
];

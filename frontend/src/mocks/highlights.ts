import type { HighlightDto } from '../types';

export const mockHighlights: HighlightDto[] = [
  {
    id: '1',
    title: 'Total Net Generation in 2025',
    // description: 'System Generation',
    value: '18051.56 GWh',
    icon: 'Zap',
    trend: 'up',
    // trendValue: '+145 MW'
  },
  {
    id: '2',
    title: 'Maximum Peak Demand of the year',
    // description: ' At 1830 hrs of 30th October',
    value: '2895.85MW',
    icon: 'TrendingUp',
    trend: 'up',
    // trendValue: '+0.05 Hz'
  },
  {
    id: '3',
    title: 'RE contribution with major hydro',
    // description: 'Competitive bids won',
    value: '10965.59 GWh',
    icon: 'Leaf',
    trend: 'up',
    // trendValue: '+2.1%'
  },
  {
    id: '4',
    title: 'Total installed capacity',
    // description: 'Monthly uptime',
    value: '7044.2 MW',
    icon: 'BarChart3',
    trend: 'up',
    // trendValue: '+0.3%'
  }
];

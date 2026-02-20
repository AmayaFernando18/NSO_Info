import { Zap } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Logo({ size = 'medium', className = '' }: LogoProps) {
  const sizes = {
    small: 'h-5 w-5',
    medium: 'h-6 w-6',
    large: 'h-8 w-8',
  };

  const iconSize = sizes[size];

  return (
    <div className={`bg-gradient-to-br from-accent to-gold p-2 rounded-lg ${className}`}>
      <Zap className={`${iconSize} text-white`} />
    </div>
  );
}

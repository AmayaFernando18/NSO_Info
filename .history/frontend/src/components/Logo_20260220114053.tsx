interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Logo({ size = 'medium', className = '' }: LogoProps) {
  const sizes = {
    small: 'h-8',
    medium: 'h-10',
    large: 'h-16',
  };

  const logoHeight = sizes[size];

  return (
    <div className={className}>
      <img 
        src="/images/nso-logo.png" 
        alt="NSO Logo" 
        className={`${logoHeight} w-auto object-contain`}
      />
    </div>
  );
}

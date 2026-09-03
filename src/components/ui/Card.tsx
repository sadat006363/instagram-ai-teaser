import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'dark';
}

export const Card = ({ children, className = '', variant = 'default' }: CardProps) => {
  const variants = {
    default: 'bg-gray-800/50 border border-gray-700',
    glass: 'bg-white/5 backdrop-blur-sm border border-white/10',
    dark: 'bg-gray-900/80 border border-gray-800',
  };

  return (
    <div className={`rounded-2xl ${variants[variant]} p-6 ${className}`}>
      {children}
    </div>
  );
};
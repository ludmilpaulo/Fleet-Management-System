'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpModal from './help-modal';

interface HelpButtonProps {
  role: 'admin' | 'staff' | 'driver' | 'inspector';
  page: string;
  className?: string;
  variant?: 'default' | 'floating' | 'inline';
}

export default function HelpButton({ role, page, className = '', variant = 'floating' }: HelpButtonProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'floating':
        return 'fixed bottom-6 right-6 z-40 shadow-lg hover:shadow-xl transition-all duration-300';
      case 'inline':
        return 'inline-flex items-center gap-2';
      default:
        return '';
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'floating':
        return 'default';
      case 'inline':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsHelpOpen(true)}
        className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white ${getVariantStyles()} ${className}`}
        variant={getButtonVariant() as any}
        size={variant === 'floating' ? 'lg' : 'sm'}
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        {variant === 'inline' && 'Help'}
      </Button>

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        role={role}
        page={page}
      />
    </>
  );
}

import { ClipboardCopy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoReadIndicatorProps {
  enabled: boolean;
}

const AutoReadIndicator = ({ enabled }: AutoReadIndicatorProps) => {
  return (
    <div className='flex items-center gap-1 text-xs text-muted-foreground'>
      <ClipboardCopy className={cn('w-3 h-3', enabled ? 'text-green-500' : 'text-gray-400')} />
      <span>Auto-read {enabled ? 'active' : 'disabled'}</span>
    </div>
  );
};

export default AutoReadIndicator;

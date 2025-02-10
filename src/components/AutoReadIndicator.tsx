import { ClipboardCheck } from 'lucide-react';

interface AutoReadIndicatorProps {
  enabled: boolean;
}

const AutoReadIndicator = ({ enabled }: AutoReadIndicatorProps) => {
  if (!enabled) return null;

  return (
    <div className='flex items-center gap-1 text-xs text-muted-foreground'>
      <ClipboardCheck className='w-3 h-3' />
      <span>Auto-read active</span>
    </div>
  );
};

export default AutoReadIndicator;

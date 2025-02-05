import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { CHAINS } from '@/entrypoints/popup/constants';
import type { Chain } from '@/entrypoints/popup/types';

interface ChainSelectProps {
  value: Chain;
  onChange: (value: Chain) => void;
  children: React.ReactNode;
}

const ChainSelect = ({ value, onChange, children }: ChainSelectProps) => {
  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Select value={value} onValueChange={(value) => onChange(value as Chain)}>
          <SelectTrigger className='w-[140px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position='item-aligned'>
            {Object.entries(CHAINS).map(([key, chain]) => (
              <SelectItem key={key} value={key}>
                <span className='flex items-center gap-2'>
                  {chain.icon} {chain.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {children}
    </div>
  );
};

export default ChainSelect;

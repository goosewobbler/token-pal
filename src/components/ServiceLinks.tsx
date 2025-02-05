import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { SERVICES } from '@/entrypoints/popup/services';
import type { ServiceLink } from '@/entrypoints/popup/types';
import { browser } from 'wxt/browser';
import { cn } from '@/lib/utils';
import type { MouseEvent } from 'react';

interface LinksSectionProps {
  links: ServiceLink[];
  showLabels: boolean;
  isFastClickMode: boolean;
  serviceColumns: number;
}

const ServiceButton = ({
  serviceId,
  url,
  showLabel,
  isFastClickMode,
}: {
  serviceId: string;
  showLabel: boolean;
  isFastClickMode: boolean;
  url?: string;
}) => {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();

    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      browser.tabs.create({ url, active: false });
      return;
    }

    if (e.button === 0) {
      browser.tabs.create({ url, active: true });
      window.close();
    }
  };

  return (
    <Button
      variant='ghost'
      size='sm'
      className={cn('flex-1 justify-start', isFastClickMode && 'py-1')}
      onClick={(e) => handleClick(e as unknown as MouseEvent)}
      onAuxClick={(e) => handleClick(e as unknown as MouseEvent)}
    >
      <div className='flex items-center gap-2 w-full'>
        <span className='flex-shrink-0 w-4 h-4'>{SERVICES[serviceId].icon}</span>
        {showLabel && <span className='truncate max-w-[100px] text-left'>{SERVICES[serviceId].name}</span>}
      </div>
    </Button>
  );
};

const LinksSection = ({ links, showLabels, isFastClickMode, serviceColumns }: LinksSectionProps) => {
  if (!links.length) return undefined;

  return (
    <div>
      {links.length > 0 && (
        <div className='mt-4'>
          <Card>
            <CardContent className='pt-4'>
              <div
                className={cn('grid gap-2', {
                  'grid-cols-2': serviceColumns === 2,
                  'grid-cols-3': serviceColumns === 3,
                  'grid-cols-4': serviceColumns === 4,
                })}
              >
                {links.map(
                  (link) =>
                    link.url && (
                      <ServiceButton
                        key={link.name}
                        {...link}
                        showLabel={showLabels}
                        isFastClickMode={isFastClickMode}
                      />
                    ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LinksSection;

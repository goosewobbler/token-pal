import { Button } from '@/components/ui/Button';
import type { ServiceLink } from '@/entrypoints/popup/types';
import { browser } from 'wxt/browser';
import type { MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { ServiceType } from '@/entrypoints/popup/constants';
import { Globe } from 'lucide-react';

interface TokenLinksProps {
  links: ServiceLink[];
  showLabels: boolean;
  isFastClickMode: boolean;
  websiteUrl?: string;
}

const TokenLinks = ({ links, showLabels, isFastClickMode, websiteUrl }: TokenLinksProps) => {
  if (!links.length) return null;

  const allLinks = [...links];
  if (websiteUrl) {
    allLinks.unshift({
      serviceId: 'website',
      name: 'Website',
      type: ServiceType.WEBSITE,
      description: 'Website',
      url: websiteUrl,
      icon: <Globe className='w-4 h-4' />,
    });
  }

  const handleClick = (e: MouseEvent, url?: string) => {
    e.preventDefault();

    if (!url) return;

    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      browser.tabs.create({ url, active: false });
      return;
    }

    if (e.button === 0) {
      browser.tabs.create({ url, active: true });
      window.close();
    }
  };

  console.log('links', allLinks);

  return (
    <div className='flex border-x border-b rounded-b-lg -mt-[1px]'>
      <div className='flex gap-2 w-full'>
        {allLinks.map(({ serviceId, url, name, icon }) => (
          <Button
            key={serviceId}
            variant='ghost'
            size='sm'
            className={cn('flex-1', isFastClickMode && 'py-1')}
            onClick={(e) => handleClick(e as unknown as MouseEvent, url)}
            onAuxClick={(e) => handleClick(e as unknown as MouseEvent, url)}
          >
            <div className='flex items-center justify-center gap-2'>
              <span className='flex-shrink-0 w-4 h-4'>{icon}</span>
              {showLabels && <span className='truncate max-w-[100px]'>{name}</span>}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TokenLinks;

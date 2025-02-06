import { useState, useCallback, useEffect } from 'react';
import { Settings2, ExternalLink, ClipboardPaste } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn, extractAddress, getServiceLinks, getSocialLinks } from '@/lib/utils';
import AddressStatus from '@/components/AddressStatus';
import AutoReadIndicator from '@/components/AutoReadIndicator';
import ServiceLinks from '@/components/ServiceLinks';
import TokenLinks from '@/components/TokenLinks';
import { SERVICES } from '@/entrypoints/popup/services';
import { useSettings } from '@/contexts/SettingsContext';
import { browser } from 'wxt/browser';
import { useClipboard } from '@/hooks/useClipboard';
import { useAddressAnalysis } from '@/hooks/useAddressAnalysis';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import type { ServiceLink } from '@/entrypoints/popup/types';
import { useCurrentTab } from '@/hooks/useCurrentTab';

interface MainScreenProps {
  address: string;
  onOpenSettings: () => void;
}

const MainScreen = ({ address: initialAddress, onOpenSettings }: MainScreenProps) => {
  const [address, setAddress] = useState(initialAddress);
  const [inputState, setInputState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [serviceLinks, setServiceLinks] = useState<ServiceLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<ServiceLink[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isClipboardEnabled, setIsClipboardEnabled] = useState(true);

  const {
    showLabels,
    isFastClickMode,
    autoReadClipboard,
    servicePrefs,
    showLinks,
    preferredExplorers,
    fastClickPrefs,
    serviceColumns,
  } = useSettings();

  const { isAnalyzing, analysis: tokenInfo, analyzeAddress, isValid } = useAddressAnalysis();
  const { url, isLoading: isTabLoading } = useCurrentTab();

  // Load last address on mount
  useEffect(() => {
    browser.storage.local.get('lastAddress').then((result) => {
      if (result.lastAddress) {
        setAddress(result.lastAddress as string);
        handleAddressUpdate(result.lastAddress as string);
      }
    });
  }, []);

  // Store address when it changes
  useEffect(() => {
    if (address.trim()) {
      browser.storage.local.set({ lastAddress: address });
    }
  }, [address]);

  // Update input state when analysis validation changes
  useEffect(() => {
    if (!address.trim() || isAnalyzing) {
      setInputState('idle');
    } else if (isValid === true) {
      setInputState('valid');
    } else if (isValid === false) {
      setInputState('invalid');
    }
  }, [isValid, address, isAnalyzing]);

  // Update links when token info or preferences change
  useEffect(() => {
    const updateLinks = async () => {
      // Only update links when we have a successful analysis and not typing
      if (isTyping || isAnalyzing) return;
      if (!tokenInfo.chain && !tokenInfo.name && !tokenInfo.currency) {
        setServiceLinks([]);
        setSocialLinks([]);
        return;
      }

      const extractedAddress = extractAddress(address)?.address || '';
      const serviceLinks = await getServiceLinks(extractedAddress, servicePrefs, tokenInfo);
      const socialLinks = getSocialLinks(tokenInfo);

      console.log('serviceLinks', serviceLinks);
      console.log('socialLinks', socialLinks);

      setServiceLinks(serviceLinks);
      setSocialLinks(socialLinks);
    };
    updateLinks();
  }, [tokenInfo, address, servicePrefs, isTyping, isAnalyzing]);

  // Reset clipboard monitoring when extension reopens
  useEffect(() => {
    setIsClipboardEnabled(true);
  }, []);

  // When tab URL loads, analyze it
  useEffect(() => {
    if (url && !isTabLoading) {
      setAddress(url);
      handleAddressUpdate(url);
    }
  }, [url, isTabLoading]);

  const handleAddressUpdate = useCallback(
    (address: string) => {
      setInputState('idle');
      setServiceLinks([]);
      setSocialLinks([]);
      analyzeAddress(address);
    },
    [analyzeAddress],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setIsTyping(true);
    setIsClipboardEnabled(false); // Disable on manual input
    setServiceLinks([]);
    setSocialLinks([]);
    const timeoutId = setTimeout(() => {
      setIsTyping(false);
      handleAddressUpdate(value);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsTyping(false);
    };
  };

  const handleClipboardContent = useCallback(
    (text: string) => {
      setAddress(text);
      handleAddressUpdate(text);
    },
    [handleAddressUpdate],
  );

  // Setup clipboard monitoring
  useClipboard(autoReadClipboard && isClipboardEnabled, handleClipboardContent, address);

  const handlePasteClick = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setIsClipboardEnabled(true); // Re-enable on paste button click
      handleClipboardContent(text);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  }, [handleClipboardContent]);

  const handleExplorerClick = useCallback(() => {
    if (!tokenInfo.chain) return;

    const tokenAddress = tokenInfo.baseToken || extractAddress(address)?.address || '';
    const preferredExplorer = preferredExplorers[tokenInfo.chain as keyof typeof preferredExplorers];
    const explorerService = SERVICES[preferredExplorer];
    if (!explorerService) return;

    const url = explorerService.url({
      chain: tokenInfo.chain,
      tokenAddress,
      currency: tokenInfo.currency,
    });
    browser.tabs.create({ url });
  }, [tokenInfo, address, preferredExplorers]);

  const handleOpenServicesClick = useCallback(async () => {
    if (!tokenInfo.chain) {
      console.log('No chain found in tokenInfo:', tokenInfo);
      return;
    }

    const tokenAddress = tokenInfo.baseToken || extractAddress(address)?.address || '';
    const services = await getServiceLinks(tokenAddress, fastClickPrefs, tokenInfo);

    for (const { url } of services) {
      if (url) {
        browser.tabs.create({ url });
      }
    }
  }, [tokenInfo, address, fastClickPrefs]);

  const getStatus = () => {
    if (isTyping || isAnalyzing) {
      return 'loading';
    }

    if (tokenInfo.chain || tokenInfo.name || tokenInfo.currency || tokenInfo.symbol) {
      return 'success';
    }

    return 'error';
  };

  const status = getStatus();

  const getExplorerName = useCallback(() => {
    if (!tokenInfo.chain) return '';
    const preferredExplorer = preferredExplorers[tokenInfo.chain as keyof typeof preferredExplorers];
    return SERVICES[preferredExplorer]?.name || '';
  }, [tokenInfo, preferredExplorers]);

  return (
    <Card>
      <CardHeader className='space-y-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-2xl'>Trench Buddy</CardTitle>
            <AutoReadIndicator enabled={autoReadClipboard && isClipboardEnabled} />
          </div>
          <Button variant='ghost' size='icon' onClick={onOpenSettings}>
            <Settings2 className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex space-x-2 mb-4'>
          <div className='relative flex-1'>
            <Input
              type='text'
              placeholder='Enter CA, URL or ticker...'
              value={address}
              spellCheck='false'
              autoCorrect='off'
              onChange={handleInputChange}
              className={cn(
                'pr-10 text-sm font-mono',
                inputState === 'valid' && 'border-green-500 focus:border-green-500',
                inputState === 'idle' && 'border-gray-300 focus:border-gray-300',
                inputState === 'invalid' && 'border-red-500 focus:border-red-500',
              )}
            />
          </div>
          <TooltipProvider>
            <Tooltip delayDuration={1000}>
              <TooltipTrigger asChild>
                <Button size='icon' variant='ghost' onClick={handlePasteClick} className='hover:bg-muted'>
                  <ClipboardPaste className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paste from clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {isFastClickMode && (
            <TooltipProvider>
              <Tooltip delayDuration={1000}>
                <TooltipTrigger asChild>
                  <Button size='icon' variant='ghost' onClick={handleOpenServicesClick} className='hover:bg-muted'>
                    <ExternalLink className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open configured fast click services</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <AddressStatus
          status={status}
          tokenInfo={tokenInfo}
          address={address}
          onExplorerClick={handleExplorerClick}
          explorerName={getExplorerName()}
          isFastClickMode={isFastClickMode}
          fastClickPrefs={fastClickPrefs}
        />

        <TokenLinks
          links={socialLinks}
          showLabels={showLabels}
          isFastClickMode={isFastClickMode}
          websiteUrl={tokenInfo.website?.url}
        />

        {showLinks && (
          <ServiceLinks
            links={serviceLinks}
            showLabels={showLabels}
            isFastClickMode={isFastClickMode}
            serviceColumns={serviceColumns}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MainScreen;

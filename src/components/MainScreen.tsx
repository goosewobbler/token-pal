import { useState, useCallback, useEffect, useRef } from 'react';
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
import { useAddressInput } from '@/hooks/useAddressInput';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import type { ServiceLink } from '@/entrypoints/popup/types';

interface MainScreenProps {
  address: string;
  onOpenSettings: () => void;
}

const MainScreen = ({ onOpenSettings }: MainScreenProps) => {
  const [address, setAddress] = useState('');
  const [inputState, setInputState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [serviceLinks, setServiceLinks] = useState<ServiceLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<ServiceLink[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isClipboardEnabled, setIsClipboardEnabled] = useState(true);
  const previousAddressRef = useRef<string>('');

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

  // Define handleAddressUpdate first
  const handleAddressUpdate = useCallback(
    (address: string) => {
      setInputState('idle');
      setServiceLinks([]);
      setSocialLinks([]);
      analyzeAddress(address);
    },
    [analyzeAddress],
  );

  // Define handleInputChange
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAddress(value);
      setIsTyping(true);
      setIsClipboardEnabled(false); // Disable on manual input
      setServiceLinks([]);
      setSocialLinks([]);

      const timeoutId = setTimeout(() => {
        setIsTyping(false);
        // Check if manually entered content is a URL
        if (value.startsWith('http')) {
          const matchesAnyService = Object.values(SERVICES).some((service) => service.urlPattern?.test(value));
          if (!matchesAnyService) {
            // For manually typed non-matching URLs, set invalid state and clear analysis
            setInputState('invalid');
            setServiceLinks([]);
            setSocialLinks([]);
            // Reset token info by triggering analysis with empty string
            analyzeAddress('');
            return;
          }
        }
        handleAddressUpdate(value);
      }, 300);

      return () => {
        clearTimeout(timeoutId);
        setIsTyping(false);
      };
    },
    [handleAddressUpdate, analyzeAddress],
  );

  // Then define handleNewContent which depends on handleAddressUpdate
  const handleNewContent = useCallback(
    (content: string) => {
      // Check if content is a URL
      if (content.startsWith('http')) {
        // Check if URL matches any of our service patterns
        const matchesAnyService = Object.values(SERVICES).some((service) => service.urlPattern?.test(content));

        if (!matchesAnyService) {
          // For auto-read/pasted non-matching URLs, just keep state idle
          setInputState('idle');
          return;
        }
      }

      // Update address for non-URLs or matching service URLs
      setAddress(content);

      const extracted = extractAddress(content);
      if (!extracted.invalid) {
        handleAddressUpdate(content);
      } else if (previousAddressRef.current) {
        // Fall back to previous address if new content is invalid
        setAddress(previousAddressRef.current);
        handleAddressUpdate(previousAddressRef.current);
      }
    },
    [handleAddressUpdate],
  );

  // Load last address but don't set it immediately
  useEffect(() => {
    browser.storage.local.get('lastAddress').then((result) => {
      previousAddressRef.current = (result.lastAddress as string) || '';
    });
  }, []);

  useAddressInput(autoReadClipboard && isClipboardEnabled, handleNewContent);

  // Store address when it changes and is valid
  useEffect(() => {
    if (address.trim() && inputState === 'valid') {
      browser.storage.local.set({ lastAddress: address });
      previousAddressRef.current = address;
    }
  }, [address, inputState]);

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

      setServiceLinks(serviceLinks);
      setSocialLinks(socialLinks);
    };
    updateLinks();
  }, [tokenInfo, address, servicePrefs, isTyping, isAnalyzing]);

  // Reset clipboard monitoring when extension reopens
  useEffect(() => {
    setIsClipboardEnabled(true);
  }, []);

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

  const handlePasteClick = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Don't reset input state if pasting the same content
      if (text === address) {
        return;
      }
      setIsClipboardEnabled(true); // Re-enable on paste button click
      handleNewContent(text);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  }, [handleNewContent, address]);

  return (
    <Card>
      <CardHeader className='space-y-1'>
        <div className='flex justify-between items-center'>
          <div className='flex gap-2 items-center'>
            <CardTitle className='text-2xl'>Token Pal</CardTitle>
            <AutoReadIndicator enabled={autoReadClipboard && isClipboardEnabled} />
          </div>
          <Button variant='ghost' size='icon' onClick={onOpenSettings}>
            <Settings2 className='w-4 h-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex mb-4 space-x-2'>
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
          {!autoReadClipboard && (
            <TooltipProvider>
              <Tooltip delayDuration={1000}>
                <TooltipTrigger asChild>
                  <Button size='icon' variant='ghost' onClick={handlePasteClick} className='hover:bg-muted'>
                    <ClipboardPaste className='w-4 h-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Paste from clipboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isFastClickMode && (
            <TooltipProvider>
              <Tooltip delayDuration={1000}>
                <TooltipTrigger asChild>
                  <Button size='icon' variant='ghost' onClick={handleOpenServicesClick} className='hover:bg-muted'>
                    <ExternalLink className='w-4 h-4' />
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

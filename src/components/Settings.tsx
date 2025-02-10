import { X, Zap, ClipboardCopy, ExternalLink, Type, HelpCircle, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { CHAINS, ChainNames, ServiceNames } from '@/entrypoints/popup/constants';
import { useSettings } from '@/contexts/SettingsContext';
import { SERVICES } from '@/entrypoints/popup/services';
import type { Chain, ServicePreferences } from '@/entrypoints/popup/types';
import AutoReadIndicator from '@/components/AutoReadIndicator';
import { Tabs, TabsHeader, TabsBody, Tab, TabPanel } from '@material-tailwind/react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { browser } from 'wxt/browser';
import React from 'react';

interface SettingsProps {
  onClose: () => void;
}

const Settings = ({ onClose }: SettingsProps) => {
  const {
    showLabels,
    setShowLabels,
    isFastClickMode,
    setIsFastClickMode,
    autoReadClipboard,
    setAutoReadClipboard,
    selectedSettingsChain,
    setSelectedSettingsChain,
    servicePrefs,
    setServicePrefs,
    fastClickPrefs,
    setFastClickPrefs,
    serviceColumns,
    setServiceColumns,
    showLinks,
    setShowLinks,
    preferredExplorers,
    setPreferredExplorers,
    chain,
  } = useSettings();

  const [activeTab, setActiveTab] = useState('main');

  // Save preferences whenever they change
  useEffect(() => {
    const savePreferences = async () => {
      try {
        await browser.storage.local.set({
          showLabels,
          isFastClickMode,
          servicePrefs,
          fastClickPrefs,
          autoReadClipboard,
          preferredExplorers,
        });

        // Also save to localStorage as fallback
        localStorage.setItem('showLabels', JSON.stringify(showLabels));
        localStorage.setItem('isFastClickMode', JSON.stringify(isFastClickMode));
        localStorage.setItem('servicePrefs', JSON.stringify(servicePrefs));
        localStorage.setItem('fastClickPrefs', JSON.stringify(fastClickPrefs));
        localStorage.setItem('autoReadClipboard', JSON.stringify(autoReadClipboard));
        localStorage.setItem('preferredExplorers', JSON.stringify(preferredExplorers));
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    };

    savePreferences();
  }, [showLabels, isFastClickMode, servicePrefs, fastClickPrefs, autoReadClipboard, preferredExplorers]);

  // Helper function to get services for selected chain
  const getChainServices = () => {
    const services = new Set<[string, (typeof SERVICES)[keyof typeof SERVICES]]>();

    // Add services for this chain, excluding block explorers
    const chainServices = Object.entries(SERVICES).filter(([name, service]) => {
      // Skip if not supported on this chain
      if (!service.supportedChains.includes(selectedSettingsChain)) {
        return false;
      }

      // Skip if it's a block explorer for this chain
      const chain = CHAINS[selectedSettingsChain];
      if (chain.explorers.includes(ServiceNames[name as keyof typeof ServiceNames])) {
        return false;
      }

      // Skip trenchradar except for Solana
      if (name === ServiceNames.trenchradar && selectedSettingsChain !== ChainNames.solana) {
        return false;
      }

      return true;
    });

    // Sort services alphabetically by name
    const sortedServices = chainServices.sort((a, b) => {
      const nameA = SERVICES[a[0] as keyof typeof SERVICES].name;
      const nameB = SERVICES[b[0] as keyof typeof SERVICES].name;
      return nameA.localeCompare(nameB);
    });

    for (const service of sortedServices) {
      services.add(service);
    }

    return Array.from(services);
  };

  const currentChainName = selectedSettingsChain || chain;

  const getChainExplorers = () => {
    const currentChain = CHAINS[currentChainName];
    return currentChain.explorers || [];
  };

  return (
    <Card className='w-full p-0 border-0 rounded-none'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div className='flex items-center gap-4'>
          <CardTitle className='text-lg font-bold'>Settings</CardTitle>
          <AutoReadIndicator enabled={autoReadClipboard} />
        </div>
        <Button variant='ghost' size='icon' onClick={onClose}>
          <X className='w-4 h-4' />
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Tabs value={activeTab} className='w-full'>
          <TabsHeader
            className='w-full p-1 rounded-md bg-muted'
            indicatorProps={{
              className: 'bg-transparent',
            }}
            placeholder=''
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            <Tab
              value='main'
              onClick={() => setActiveTab('main')}
              className={cn(
                'py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === 'main'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              placeholder=''
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              Main
            </Tab>
            <Tab
              value='explorers'
              onClick={() => setActiveTab('explorers')}
              className={cn(
                'py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === 'explorers'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              placeholder=''
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              Block Explorers
            </Tab>
            <Tab
              value='services'
              onClick={() => setActiveTab('services')}
              className={cn(
                'py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === 'services'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              placeholder=''
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              Services
            </Tab>
          </TabsHeader>

          <TabsBody
            className='mt-4'
            animate={{}}
            placeholder=''
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            <TabPanel value='main'>
              <Card>
                <CardContent className='pt-6 space-y-4'>
                  <TooltipProvider delayDuration={0}>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Zap className='w-4 h-4' />
                        <span className='text-sm'>Fast-Click Mode</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className='w-3.5 h-3.5 text-muted-foreground cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enable to add a "Fast-Click" button to open all configured links at once.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch checked={isFastClickMode} onCheckedChange={setIsFastClickMode} />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <ClipboardCopy className='w-4 h-4' />
                        <span className='text-sm'>Auto-read Clipboard</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className='w-3.5 h-3.5 text-muted-foreground cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Automatically read addresses from clipboard without having to paste.</p>
                            <p>Setting this option disables reading the URL from the current tab.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch checked={autoReadClipboard} onCheckedChange={setAutoReadClipboard} />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <ExternalLink className='w-4 h-4' />
                        <span className='text-sm'>Show Service Links</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className='w-3.5 h-3.5 text-muted-foreground cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Show links to services on the main page.</p>
                            <p>Configure services in the Display Services tab.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch checked={showLinks} onCheckedChange={setShowLinks} />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Type className='w-4 h-4' />
                        <span className='text-sm'>Show Service Labels</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className='w-3.5 h-3.5 text-muted-foreground cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Show text labels on displayed service links.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch checked={showLabels} onCheckedChange={setShowLabels} />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <LayoutGrid className='w-4 h-4' />
                        <span className='text-sm'>Service Columns</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className='w-3.5 h-3.5 text-muted-foreground cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Number of columns to display service links in</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <Select
                        value={serviceColumns.toString()}
                        onValueChange={(value) => setServiceColumns(Number(value) as 2 | 3 | 4)}
                      >
                        <SelectTrigger className='w-16 h-6'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='2'>2</SelectItem>
                          <SelectItem value='3'>3</SelectItem>
                          <SelectItem value='4'>4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value='explorers'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <CardTitle className='text-sm font-medium'>Block Explorer</CardTitle>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className='w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Select the block explorer for this chain.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select
                      value={currentChainName}
                      onValueChange={(value) => setSelectedSettingsChain(value as Chain)}
                    >
                      <SelectTrigger className='w-[140px]'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position='item-aligned'>
                        {Object.entries(CHAINS).map(([key, chain]) => (
                          <SelectItem key={key} value={key}>
                            <span className='flex items-center gap-2'>
                              <div className='flex items-center justify-center w-4 h-4'>{chain.icon}</div>
                              {chain.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Select
                    value={preferredExplorers[currentChainName]}
                    onValueChange={(value) => {
                      setPreferredExplorers({
                        ...preferredExplorers,
                        [selectedSettingsChain]: value,
                      });
                    }}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select block explorer' />
                    </SelectTrigger>
                    <SelectContent>
                      {getChainExplorers().map((explorer) => (
                        <SelectItem key={explorer} value={explorer}>
                          <span className='flex items-center gap-2'>
                            <div className='flex items-center justify-center w-4 h-4'>{SERVICES[explorer].icon}</div>
                            {SERVICES[explorer].name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value='services'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <CardTitle className='text-sm font-medium'>Services</CardTitle>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className='w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Configure services to be displayed or opened in Fast-Click mode.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select
                      value={currentChainName}
                      onValueChange={(value) => setSelectedSettingsChain(value as Chain)}
                    >
                      <SelectTrigger className='w-[140px]'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position='item-aligned'>
                        {Object.entries(CHAINS).map(([key, chain]) => (
                          <SelectItem key={key} value={key}>
                            <span className='flex items-center gap-2'>
                              <div className='flex items-center justify-center w-4 h-4'>{chain.icon}</div>
                              {chain.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-[1fr,auto,auto] gap-4'>
                    <div className='text-sm font-medium text-muted-foreground'>Service</div>
                    <div className='text-sm font-medium text-center text-muted-foreground'>Display</div>
                    <div className='text-sm font-medium text-center text-muted-foreground'>Fast-Click</div>

                    {getChainServices().map(([name, service]) => (
                      <React.Fragment key={name}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className='flex items-center gap-2 cursor-help'>
                                <div className='flex items-center justify-center w-4 h-4'>
                                  {service.icon || <ExternalLink className='w-4 h-4' />}
                                </div>
                                <span className='text-sm'>{SERVICES[name as keyof typeof SERVICES].name || name}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{service.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <div className='flex justify-center'>
                          <Switch
                            checked={servicePrefs[selectedSettingsChain]?.[name] !== false}
                            onCheckedChange={(checked) => {
                              const updatedPrefs: ServicePreferences = {
                                ...servicePrefs,
                                [selectedSettingsChain]: {
                                  ...servicePrefs[selectedSettingsChain],
                                  [name]: checked,
                                },
                              };
                              setServicePrefs(updatedPrefs);
                            }}
                          />
                        </div>

                        <div className='flex justify-center'>
                          <Switch
                            checked={fastClickPrefs[selectedSettingsChain]?.[name] !== false}
                            onCheckedChange={(checked) => {
                              const updatedPrefs: ServicePreferences = {
                                ...fastClickPrefs,
                                [selectedSettingsChain]: {
                                  ...fastClickPrefs[selectedSettingsChain],
                                  [name]: checked,
                                },
                              };
                              setFastClickPrefs(updatedPrefs);
                            }}
                          />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Settings;

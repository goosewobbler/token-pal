import { useState, useEffect } from 'react';
import { browser } from 'wxt/browser';
import { defaultExplorers, type ServiceNames, CHAINS, ChainNames } from './constants';
import { SERVICES } from './services';
import { TooltipProvider } from '@/components/ui/Tooltip';
import Settings from '@/components/Settings';
import { SettingsProvider } from '@/contexts/SettingsContext';
import MainScreen from '@/components/MainScreen';
import type { Chain } from './types';
import { Toaster } from '@/components/ui/Toaster';

interface ServicePreferences {
  [chain: string]: {
    [service: string]: boolean;
  };
}

interface StorageData {
  showLabels: boolean;
  isFastClickMode: boolean;
  servicePrefs: ServicePreferences;
  autoReadClipboard: boolean;
  address: string;
  chain: Chain;
  preferredExplorers: Record<Chain, string>;
  fastClickPrefs: ServicePreferences;
  showLinks: boolean;
  serviceColumns: number;
}

const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;

  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultValue;
  }
};

const useDarkMode = () => {
  useEffect(() => {
    // Check if system prefers dark mode
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // Listen for changes in system dark mode preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
};

// Create default preferences with all services enabled
const createDefaultServicePrefs = () => {
  const prefs: ServicePreferences = {};

  // For each chain
  for (const chain of Object.keys(CHAINS)) {
    prefs[chain] = {};
    // Enable all services that support this chain, but ignore block explorers
    for (const [serviceName, service] of Object.entries(SERVICES)) {
      if (
        service.supportedChains.includes(chain as ChainNames) &&
        !CHAINS[chain].explorers.includes(serviceName as ServiceNames)
      ) {
        prefs[chain][serviceName] = true;
      }
    }
  }

  return prefs;
};

const App = () => {
  useDarkMode();

  const defaultServicePrefs = createDefaultServicePrefs();

  const [chain, setChain] = useState<Chain | undefined>(ChainNames.solana);
  const [showLabels, setShowLabels] = useState(() => getStoredValue('showLabels', true));
  const [isFastClickMode, setIsFastClickMode] = useState(() => getStoredValue('isFastClickMode', true));
  const [autoReadClipboard, setAutoReadClipboard] = useState(() => getStoredValue('autoReadClipboard', false));
  const [serviceColumns, setServiceColumns] = useState(() => getStoredValue('serviceColumns', 3));
  const [showLinks, setShowLinks] = useState(() => getStoredValue('showLinks', true));
  const [servicePrefs, setServicePrefs] = useState(() => getStoredValue('servicePrefs', defaultServicePrefs));
  const [fastClickPrefs, setFastClickPrefs] = useState(() => getStoredValue('fastClickPrefs', defaultServicePrefs));
  const [selectedSettingsChain, setSelectedSettingsChain] = useState<Chain>(ChainNames.solana);
  const [showSettings, setShowSettings] = useState(false);
  const [preferredExplorers, setPreferredExplorers] = useState<Record<Chain, string>>(defaultExplorers);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = (await browser.storage.local.get([
        'showLabels',
        'isFastClickMode',
        'autoReadClipboard',
        'servicePrefs',
        'fastClickPrefs',
        'showLinks',
        'preferredExplorers',
      ])) as unknown as StorageData;

      if (settings.showLabels !== undefined) setShowLabels(settings.showLabels);
      if (settings.isFastClickMode !== undefined) setIsFastClickMode(settings.isFastClickMode);
      if (settings.autoReadClipboard !== undefined) setAutoReadClipboard(settings.autoReadClipboard);
      if (settings.servicePrefs) setServicePrefs(settings.servicePrefs);
      if (settings.fastClickPrefs) setFastClickPrefs(settings.fastClickPrefs);
      if (settings.showLinks !== undefined) setShowLinks(settings.showLinks);
      if (settings.preferredExplorers) setPreferredExplorers(settings.preferredExplorers);
    };

    loadSettings();
  }, []);

  useEffect(() => {
    browser.storage.local.set({
      showLabels,
      isFastClickMode,
      autoReadClipboard,
      servicePrefs,
      fastClickPrefs,
      showLinks,
      preferredExplorers,
    });
  }, [showLabels, isFastClickMode, autoReadClipboard, servicePrefs, fastClickPrefs, showLinks, preferredExplorers]);

  const settingsState = {
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
    setChain,
  };

  return (
    <TooltipProvider delayDuration={3000}>
      <SettingsProvider value={settingsState}>
        <div className='min-w-[480px] h-fit'>
          {showSettings ? (
            <Settings onClose={() => setShowSettings(false)} />
          ) : (
            <MainScreen address='' onOpenSettings={() => setShowSettings(true)} />
          )}
        </div>
        <Toaster />
      </SettingsProvider>
    </TooltipProvider>
  );
};

export default App;

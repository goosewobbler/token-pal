import { createContext, useContext, type PropsWithChildren } from 'react';
import type { Chain, ServicePreferences } from '@/entrypoints/popup/types';

interface SettingsContextType {
  showLabels: boolean;
  setShowLabels: (show: boolean) => void;
  isFastClickMode: boolean;
  setIsFastClickMode: (enabled: boolean) => void;
  autoReadClipboard: boolean;
  setAutoReadClipboard: (enabled: boolean) => void;
  selectedSettingsChain: Chain;
  setSelectedSettingsChain: (chain: Chain) => void;
  servicePrefs: ServicePreferences;
  setServicePrefs: (prefs: ServicePreferences) => void;
  fastClickPrefs: ServicePreferences;
  setFastClickPrefs: (prefs: ServicePreferences) => void;
  serviceColumns: number;
  setServiceColumns: (columns: number) => void;
  showLinks: boolean;
  setShowLinks: (show: boolean) => void;
  preferredExplorers: Record<Chain, string>;
  setPreferredExplorers: (value: Record<Chain, string>) => void;
  chain?: Chain;
  setChain: (chain: Chain | undefined) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children, value }: PropsWithChildren<{ value: SettingsContextType }>) => {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

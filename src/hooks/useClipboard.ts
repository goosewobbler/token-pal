import { useEffect } from 'react';

export const useClipboard = (enabled: boolean, onContent: (text: string) => void, currentAddress: string) => {
  useEffect(() => {
    if (!enabled) return;

    let lastContent = '';
    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        // Only process if content has changed and is different from current address
        if (text !== lastContent && text !== currentAddress) {
          lastContent = text;
          onContent(text);
        }
      } catch (err) {
        console.error('Failed to read clipboard:', err);
      }
    };

    const interval = setInterval(checkClipboard, 1000);
    return () => clearInterval(interval);
  }, [enabled, onContent, currentAddress]);
};

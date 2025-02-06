import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

export const useCurrentTab = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentTab = async () => {
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (tab?.url) {
          setUrl(tab.url);
        }
      } catch (err) {
        console.error('Failed to get current tab:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentTab();
  }, []);

  return { url, isLoading };
};

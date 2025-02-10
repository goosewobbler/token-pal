import { useEffect, useState, useRef, useCallback } from 'react';
import { browser } from 'wxt/browser';

export const useAddressInput = (
  clipboardEnabled: boolean,
  onContent: (text: string) => void
) => {
  const [lastClipboardContent, setLastClipboardContent] = useState('');
  const [lastTabUrl, setLastTabUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);
  const onContentRef = useRef(onContent);
  const processedContentRef = useRef<string>('');

  // Keep the callback reference updated
  useEffect(() => {
    onContentRef.current = onContent;
  }, [onContent]);

  useEffect(() => {
    const checkSources = async () => {
      try {
        // When autoread is enabled, only check clipboard
        if (clipboardEnabled) {
          console.log('Checking clipboard (autoread ON)');
          const clipboardText = await navigator.clipboard.readText();
          if (clipboardText && 
              clipboardText !== lastClipboardContent && 
              clipboardText !== processedContentRef.current) {
            console.log('New clipboard content:', clipboardText);
            setLastClipboardContent(clipboardText);
            processedContentRef.current = clipboardText;
            onContentRef.current(clipboardText);
          }
        } 
        // When autoread is disabled, only check tab URL
        else {
          console.log('Checking tab URL (autoread OFF)');
          const tabs = await browser.tabs.query({ active: true, currentWindow: true });
          const currentUrl = tabs[0]?.url || '';

          if (currentUrl && 
              currentUrl !== lastTabUrl && 
              currentUrl !== processedContentRef.current) {
            console.log('New tab URL:', currentUrl);
            setLastTabUrl(currentUrl);
            processedContentRef.current = currentUrl;
            onContentRef.current(currentUrl);
          }
        }

        // Only set loading false after initial check
        if (isInitialMount.current) {
          isInitialMount.current = false;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to read content:', err);
        setIsLoading(false);
      }
    };

    // Clear previous state when switching modes
    if (clipboardEnabled) {
      setLastTabUrl('');
      processedContentRef.current = '';
    } else {
      setLastClipboardContent('');
      processedContentRef.current = '';
    }

    // Run initial check immediately
    checkSources();

    // Set up interval for subsequent checks
    const interval = setInterval(checkSources, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [clipboardEnabled, lastClipboardContent, lastTabUrl]);

  return { isLoading };
}; 
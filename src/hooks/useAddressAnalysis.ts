import { useState, useCallback, useRef } from 'react';
import type { TokenInfo } from '@/entrypoints/popup/types';
import { detectChainFromRegex, extractAddress, getTokenInfo } from '@/lib/utils';

export const useAddressAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TokenInfo>({ tokenAddress: '' });
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const currentAnalysis = useRef<string>('');
  const timeoutRef = useRef<number | undefined>(undefined);

  const analyzeAddress = useCallback(async (input: string) => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!input.trim()) {
      setIsAnalyzing(false);
      setAnalysis({ tokenAddress: '' });
      setIsValid(undefined);
      return;
    }

    const extracted = extractAddress(input);
    console.log('Extracted address:', extracted);

    const analysisId = Date.now().toString();
    currentAnalysis.current = analysisId;
    setIsAnalyzing(true);
    setAnalysis({ tokenAddress: input }); // Keep track of current input

    try {
      if (currentAnalysis.current !== analysisId) return;
      // Try getTokenInfo even if extraction failed (might be a ticker)
      const dexInfo = await getTokenInfo(extracted.address || input);

      if (currentAnalysis.current !== analysisId) return;
      setAnalysis(dexInfo);

      // Update this condition to match our success criteria
      if (dexInfo.chain || dexInfo.name || dexInfo.currency || dexInfo.symbol) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }

      if (!dexInfo.chain) {
        const regexChain = detectChainFromRegex(extracted.address || input);
        if (regexChain) {
          setAnalysis({ ...dexInfo, chain: regexChain });
          setIsValid(true);
        }
      }
    } catch (err) {
      if (currentAnalysis.current !== analysisId) return;
      console.error('Failed to analyze address:', err);
      const regexChain = detectChainFromRegex(extracted.address || input);
      if (regexChain) {
        setAnalysis({ tokenAddress: extracted.address || input, chain: regexChain });
        setIsValid(true);
      } else {
        setAnalysis({ tokenAddress: extracted.address || input });
        setIsValid(false);
      }
    } finally {
      if (currentAnalysis.current === analysisId) {
        setIsAnalyzing(false);
      }
    }
  }, []);

  return { isAnalyzing, analysis, analyzeAddress, isValid };
};

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ADDRESS_REGEX, ChainNames, CHAINS, PATH_TO_CHAIN, ServiceType } from '@/entrypoints/popup/constants';
import type {
  TokenInfo,
  Chain,
  ServicePreferences,
  DexScreenerResponse,
  JupiterResponse,
  CoinGeckoResponse,
  ServiceLink,
} from '@/entrypoints/popup/types';
import { SERVICES, SOCIAL_SERVICES } from '@/entrypoints/popup/services';
import { Globe } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ExtractedAddress = {
  address: string;
  chain?: Chain;
  issuer?: string;
  currencyId?: string;
  invalid?: boolean;
};

export const extractAddress = (input: string): ExtractedAddress => {
  // Strip leading and trailing whitespace
  const trimmedInput = input.trim();

  // If input is empty, return invalid
  if (!trimmedInput) {
    return { address: '', invalid: true };
  }

  // Check for cashtags
  const cashtagMatch = trimmedInput.match(/^\$(\w+)/i);
  if (cashtagMatch) {
    return { address: cashtagMatch[1], invalid: false };
  }

  // Check for XRPL addresses (both formats)
  const xrplMatch = trimmedInput.match(ADDRESS_REGEX.XRPL);
  if (xrplMatch) {
    // Check if it's a currency ID format
    const currencyIdMatch = xrplMatch[0].match(ADDRESS_REGEX.XRPL_CURRENCY_ID);
    if (currencyIdMatch) {
      return {
        address: trimmedInput,
        chain: ChainNames.xrpl,
        issuer: currencyIdMatch[2],
        currencyId: currencyIdMatch[1],
      };
    }
    // Regular XRPL address
    return {
      address: trimmedInput,
      chain: ChainNames.xrpl,
    };
  }

  // Check if input matches any chain's address format directly
  for (const [_chain, info] of Object.entries(CHAINS)) {
    if (info.addressRegex?.test(trimmedInput)) {
      return { address: trimmedInput, chain: info.name as Chain };
    }
  }

  // Check if input looks like a URL
  const isValidUrl = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(trimmedInput);
  if (!isValidUrl) {
    // If not a URL and not a valid address format, mark as invalid
    return { address: trimmedInput, invalid: true };
  }

  // Extract domain from input URL
  const urlDomain = input.match(/^https?:\/\/([^\/]+)/i)?.[1]?.toLowerCase();
  if (!urlDomain) {
    return { address: trimmedInput, invalid: true };
  }

  // Create list of valid service domains
  const serviceDomains = Object.values(SERVICES)
    .map((service) => {
      const urlExample = service.url({ tokenAddress: 'example', chain: ChainNames.ethereum });
      if (typeof urlExample === 'string') {
        const domain = urlExample.match(/^https?:\/\/([^\/]+)/i)?.[1]?.toLowerCase();
        return domain?.replace('www.', '');
      }
      return undefined;
    })
    .filter((domain): domain is string => !!domain);

  // Strip www. from input domain for comparison
  const normalizedDomain = urlDomain.replace('www.', '');

  // Only proceed if URL is from a known service domain
  if (!serviceDomains.includes(normalizedDomain)) {
    return { address: trimmedInput, invalid: true };
  }

  // Check URL patterns for matching service
  for (const service of Object.values(SERVICES)) {
    if (service.urlPattern) {
      const match = trimmedInput.match(service.urlPattern);
      if (match) {
        // Extract chain info if available (e.g. from GMGN URLs)
        const chainPath = match[1]?.toLowerCase();
        let chain: Chain | undefined;

        // Map service-specific chain paths to our Chain enum
        if (chainPath) {
          chain = PATH_TO_CHAIN[chainPath];
        }

        return {
          address: match[2] || match[1],
          chain,
        };
      }
    }
  }

  return { address: trimmedInput, invalid: true };
};

export const isPumpFunAddress = (addr?: string) => Boolean(addr?.toLowerCase().endsWith('pump'));

export const isEVM = (chain: string): boolean => {
  const evmChains = [
    ChainNames.ethereum,
    ChainNames.arbitrum,
    ChainNames.avalanche,
    ChainNames.base,
    ChainNames.blast,
    ChainNames.bsc,
    ChainNames.optimism,
    ChainNames.polygon,
    ChainNames.zksync,
  ];
  return evmChains.includes(ChainNames[chain as keyof typeof ChainNames]);
};

export const detectChainFromRegex = (cleanAddress: string): Chain | undefined => {
  // Group chains by address pattern to avoid duplicate regex tests
  const chainsByPattern: Record<keyof typeof ADDRESS_REGEX, Chain[]> = {
    EVM: [
      ChainNames.ethereum,
      ChainNames.arbitrum,
      ChainNames.avalanche,
      ChainNames.base,
      ChainNames.bsc,
      ChainNames.optimism,
      ChainNames.polygon,
      ChainNames.zksync,
    ],
    SOLANA: [ChainNames.solana],
    XRPL: [ChainNames.xrpl],
    XRPL_CURRENCY_ID: [ChainNames.xrpl],
    TRON: [ChainNames.tron],
    SUI: [ChainNames.sui],
    BLAST: [ChainNames.blast],
  };

  // Check each pattern and its associated chains
  for (const [pattern, chains] of Object.entries(chainsByPattern)) {
    if (ADDRESS_REGEX[pattern as keyof typeof ADDRESS_REGEX].test(cleanAddress)) {
      return chains[0];
    }
  }

  return undefined;
};

// Add a simple cache for token info
const tokenInfoCache = new Map<string, TokenInfo & { timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const getJupiterInfo = async (address: string): Promise<{ currency?: string; baseToken?: string } | undefined> => {
  try {
    const response = await fetch(`https://tokens.jup.ag/token/${address}`);
    const token = (await response.json()) as JupiterResponse;

    if (token) {
      return {
        currency: token.content[0].symbol,
        baseToken: token.content[0].address,
      };
    }
  } catch (err) {
    console.error('Failed to fetch from Jupiter:', err);
  }
  return undefined;
};

const getCoingeckoInfo = async (address: string): Promise<Partial<TokenInfo> | undefined> => {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${address}`);
    const data = (await response.json()) as CoinGeckoResponse;

    if (data) {
      return {
        name: data.name,
        symbol: data.symbol?.toUpperCase(),
        description: data.description?.en,
        priceUsd: data.market_data?.current_price?.usd,
        priceChange24h: data.market_data?.price_change_percentage_24h,
        website: data.links?.homepage?.[0]
          ? {
              url: data.links.homepage[0],
              name: data.name,
            }
          : undefined,
        socials: {
          twitter: data.links?.twitter_screen_name ? `https://x.com/${data.links.twitter_screen_name}` : undefined,
          telegram: data.links?.telegram_channel_identifier
            ? `https://t.me/${data.links.telegram_channel_identifier}`
            : undefined,
          discord: data.links?.chat_url?.find((url: string) => url.includes('discord')),
        },
      };
    }
  } catch (err) {
    console.error('Failed to fetch from CoinGecko:', err);
  }
  return undefined;
};

export const getTokenInfo = async (address: string): Promise<TokenInfo> => {
  console.log('Getting token info for:', address);

  // Check cache and verify it's not expired
  if (tokenInfoCache.has(address)) {
    const cached = tokenInfoCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const { timestamp, ...result } = cached;
      return result;
    }
    // Remove expired cache entry
    tokenInfoCache.delete(address);
  }

  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${address}`);
    const data = (await response.json()) as DexScreenerResponse;

    if (!data.pairs?.length) {
      console.log('No dexscreener pairs found for:', address);

      // Try Jupiter API for Solana tokens
      if (ADDRESS_REGEX.SOLANA.test(address)) {
        const jupiterInfo = await getJupiterInfo(address);
        if (jupiterInfo) {
          const result: TokenInfo = {
            tokenAddress: address,
            chain: ChainNames.solana,
            ...jupiterInfo,
          };
          tokenInfoCache.set(address, { ...result, timestamp: Date.now() });
          return result;
        }
      }

      // Try CoinGecko API as fallback for non-Solana tokens
      const coingeckoInfo = await getCoingeckoInfo(address);
      if (coingeckoInfo) {
        const result: TokenInfo = {
          tokenAddress: address,
          ...coingeckoInfo,
        };
        tokenInfoCache.set(address, { ...result, timestamp: Date.now() });
        return result;
      }

      const result: TokenInfo = { tokenAddress: address };
      tokenInfoCache.set(address, { ...result, timestamp: Date.now() });
      return result;
    }

    const pair = data.pairs[0];
    const chainId = pair.chainId;

    // Map DexScreener chain IDs to our chains
    const chainIdToChain: Record<string, Chain> = {
      ethereum: ChainNames.ethereum,
      bsc: ChainNames.bsc,
      polygon: ChainNames.polygon,
      arbitrum: ChainNames.arbitrum,
      optimism: ChainNames.optimism,
      base: ChainNames.base,
      avalanche: ChainNames.avalanche,
      solana: ChainNames.solana,
    };

    const socials = pair.info?.socials.reduce((acc: Record<string, string>, curr: { type: string; url: string }) => {
      acc[curr.type] = curr.url;
      return acc;
    }, {});

    const result: TokenInfo = {
      tokenAddress: address,
      chain: chainIdToChain[chainId],
      name: pair.baseToken.name,
      symbol: pair.baseToken.symbol,
      description: pair.info?.description || pair.baseToken?.description,
      priceUsd: Number(pair.priceUsd),
      priceChange24h: Number(pair.priceChange.h24),
      currency: pair.baseToken?.symbol,
      baseToken: pair.baseToken?.address,
      website: pair.info?.websites?.[0],
      socials,
    };

    // Update cache with timestamp
    tokenInfoCache.set(address, { ...result, timestamp: Date.now() });
    console.log('DexScreener response:', data);
    console.log('Parsed result:', result);
    return result;
  } catch (err) {
    console.error('Failed to fetch from DexScreener:', err);
    const result: TokenInfo = { tokenAddress: address };
    tokenInfoCache.set(address, { ...result, timestamp: Date.now() });
    console.log('Parsed result:', result);
    return result;
  }
};

export const detectChainFromAddress = async (address: string): Promise<Chain | undefined> => {
  // First try to get chain from address pattern
  const { chain, address: extractedAddress } = extractAddress(address);
  if (chain) {
    return chain;
  }

  // Fallback to API calls if no chain detected
  const { chain: apiChain } = await getTokenInfo(extractedAddress || address);

  return apiChain;
};

export const getSocialLinks = (tokenInfo: TokenInfo): ServiceLink[] => {
  const links: ServiceLink[] = [];

  // Add social links if available
  if (tokenInfo.socials) {
    for (const [serviceId, service] of Object.entries(SOCIAL_SERVICES)) {
      console.log('serviceId', serviceId);
      console.log('tokenInfo', tokenInfo);
      const url = service.url(tokenInfo);
      console.log('url', url);
      if (url) {
        links.push({
          serviceId,
          ...service,
          type: ServiceType.SOCIAL,
          url,
        });
      }
    }
  }

  return links;
};

export const getServiceLinks = async (
  address: string,
  prefs: ServicePreferences,
  tokenInfo: TokenInfo,
): Promise<ServiceLink[]> => {
  if (!tokenInfo.chain) return [];

  // Add service links
  const chainPrefs = tokenInfo.chain ? prefs[tokenInfo.chain] : {};
  const promises = Object.entries(chainPrefs)
    .filter(([_serviceId, enabled]) => enabled)
    .map(async ([serviceId]) => {
      const service = SERVICES[serviceId as keyof typeof SERVICES];
      const isSupported = service?.isSupported || (() => Promise.resolve(true));
      if (!service || !(await isSupported(tokenInfo))) return undefined;

      return {
        serviceId,
        name: service.name,
        type: service.type,
        description: service.description,
        url: service.url({
          chain: tokenInfo.chain,
          tokenAddress: address,
          currency: tokenInfo.currency,
        }),
      } as ServiceLink;
    });

  return (await Promise.all(promises)).filter((link): link is ServiceLink => link !== undefined);
};

export const formatAddress = (addr: string): string => {
  if (!addr || addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
};

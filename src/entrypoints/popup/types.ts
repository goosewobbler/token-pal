import type { ReactNode } from 'react';
import type { ChainNames, ServiceNames, ServiceType } from './constants';

export type Chain = ChainNames;

export interface Explorer {
  name: string;
  baseUrl: string;
}

export interface ChainInfo {
  name: string;
  icon: ReactNode;
  explorers: ServiceNames[];
  addressRegex?: RegExp;
  chainId?: string;
}

export interface TokenInfo {
  tokenAddress: string;
  chain?: Chain;
  name?: string;
  symbol?: string;
  description?: string;
  priceUsd?: number;
  priceChange24h?: number;
  currency?: string;
  baseToken?: string;
  currencyId?: string;
  issuer?: string;
  socials?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  website?: {
    url: string;
    name: string;
  };
}

export interface ServiceInfo {
  name: string;
  type: ServiceType;
  icon: ReactNode;
  description: string;
  supportedChains: Chain[];
  url: (params: TokenInfo) => string | undefined;
  urlPattern?: RegExp;
  isSupported?: (tokenInfo: TokenInfo) => Promise<boolean>;
}

export interface ServicePreferences {
  [chain: string]: {
    [service: string]: boolean;
  };
}

export interface ServiceLink {
  serviceId: string;
  name: string;
  type: ServiceType;
  description: string;
  icon: ReactNode;
  url?: string;
}

interface DexScreenerTokenInfo {
  address: string;
  name: string;
  description: string;
  symbol: string;
}

interface DexScreenerPairInfo {
  name?: string;
  description?: string;
  logo?: string;
  websites?: {
    name: string;
    url: string;
  }[];
  socials: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: DexScreenerTokenInfo;
  quoteToken: DexScreenerTokenInfo;
  priceNative: string;
  priceUsd: string;
  txns: {
    h24: {
      buys: number;
      sells: number;
    };
    h6: {
      buys: number;
      sells: number;
    };
    h1: {
      buys: number;
      sells: number;
    };
    m5: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    h24: string;
    h6: string;
    h1: string;
    m5: string;
  };
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  pairCreatedAt?: number;
  info?: DexScreenerPairInfo;
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs?: DexScreenerPair[];
}

interface JupiterTokenExtensions {
  address: string;
  assetContract: string;
  bridgeContract: string;
  coingeckoId: string;
  currency: string;
  description: string;
  discord: string;
  github: string;
  imageUrl: string;
  medium: string;
  serumV3Usdc: string;
  telegram: string;
  twitter: string;
  website: string;
  waterfallbot: string;
}

interface JupiterToken {
  address: string;
  chainId: number;
  decimals: number;
  extensions?: JupiterTokenExtensions;
  logoURI?: string;
  name: string;
  symbol: string;
  tags?: string[];
}

export interface JupiterResponse {
  content: JupiterToken[];
  count: number;
  timestamp: string;
}

export interface CoinGeckoResponse {
  name: string;
  symbol: string;
  description: { en: string };
  market_data?: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
  };
  links?: {
    homepage: string[];
    twitter_screen_name: string;
    telegram_channel_identifier: string;
    chat_url: string[];
  };
}

export interface CoinMarketCapResponse {
  status: {
    error_code: number;
    error_message: string | null;
  };
  data: {
    [key: string]: {
      id: number;
      name: string;
      symbol: string;
      slug: string;
      contract_address: string;
      platform: {
        id: number;
        name: string;
        symbol: string;
        slug: string;
      };
      description: string;
      urls: {
        website: string[];
        twitter: string[];
        telegram: string[];
        discord: string[];
      };
    };
  };
}

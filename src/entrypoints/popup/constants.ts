import type { ChainInfo } from './types';
import ArbitrumIcon from '@/components/icons/ArbitrumIcon';
import BscIcon from '@/components/icons/BscIcon';
import EthereumIcon from '@/components/icons/EthereumIcon';
import PolygonIcon from '@/components/icons/PolygonIcon';
import SolanaIcon from '@/components/icons/SolanaIcon';
import BaseIcon from '@/components/icons/BaseIcon';
import XrplIcon from '@/components/icons/XrplIcon';
import BlastIcon from '@/components/icons/BlastIcon';
import TronIcon from '@/components/icons/TronIcon';
import AvalancheIcon from '@/components/icons/AvalancheIcon';
import OptimismIcon from '@/components/icons/OptimismIcon';
import SuiIcon from '@/components/icons/SuiIcon';
import ZksyncIcon from '@/components/icons/ZksyncIcon';

export enum ChainNames {
  ethereum = 'ethereum',
  arbitrum = 'arbitrum',
  avalanche = 'avalanche',
  base = 'base',
  blast = 'blast',
  bsc = 'bsc',
  optimism = 'optimism',
  polygon = 'polygon',
  solana = 'solana',
  sui = 'sui',
  tron = 'tron',
  xrpl = 'xrpl',
  zksync = 'zksync',
}

export enum ServiceNames {
  dextools = 'dextools',
  dexscreener = 'dexscreener',
  honeypot = 'honeypot',
  trenchradar = 'trenchradar',
  etherscan = 'etherscan',
  bscscan = 'bscscan',
  polygonscan = 'polygonscan',
  arbiscan = 'arbiscan',
  solscan = 'solscan',
  birdeye = 'birdeye',
  solanabeach = 'solanabeach',
  basescan = 'basescan',
  xrpscan = 'xrpscan',
  bithomp = 'bithomp',
  gmgn = 'gmgn',
  xpmarket = 'xpmarket',
  xmagnetic = 'xmagnetic',
  pumpfun = 'pumpfun',
  bullx = 'bullx',
  bullxneo = 'bullxneo',
  snowtrace = 'snowtrace',
  blastscan = 'blastscan',
  optimismscan = 'optimismscan',
  zkscan = 'zkscan',
  oklink = 'oklink',
  basescout = 'basescout',
  solanaexplorer = 'solanaexplorer',
  suiexplorer = 'suiexplorer',
  tronscan = 'tronscan',
  zkscout = 'zkscout',
  ethplorer = 'ethplorer',
  bsctrace = 'bsctrace',
  polygontrace = 'polygontrace',
  solanacompass = 'solanacompass',
  xrpledgerexplorer = 'xrpledgerexplorer',
  xrplpm = 'xrplpm',
  photon = 'photon',
  photonSol = 'photonSol',
  x = 'x',
  telegram = 'telegram',
  discord = 'discord',
  antiRugAgent = 'antiRugAgent',
  coingecko = 'coingecko',
  coinmarketcap = 'coinmarketcap',
}

export enum ServiceType {
  SOCIAL = 'social',
  EXPLORER = 'explorer',
  DEX = 'dex',
  ANALYTICS = 'analytics',
  WEBSITE = 'website',
}

const XRPL_CURRENCY_ID_PATTERN = '([0-9A-Fa-f]{40})\\.?(r[1-9A-Za-z]{8,})?';

export const ADDRESS_PATTERNS = {
  EVM: '0x[a-fA-F0-9]{40}',
  SOLANA: '[1-9A-HJ-NP-Za-km-z]{32,44}',
  XRPL: `(?:r[1-9A-HJ-NP-Za-km-z]{24,34}|${XRPL_CURRENCY_ID_PATTERN})`,
  XRPL_CURRENCY_ID: XRPL_CURRENCY_ID_PATTERN,
  TRON: 'T[A-Za-z0-9]{33}',
  SUI: '0x[a-fA-F0-9]{64}',
  BLAST: '0x[a-fA-F0-9]{40}',
} as const;

// Create RegExp objects for chain validation
export const ADDRESS_REGEX = {
  EVM: new RegExp(`^${ADDRESS_PATTERNS.EVM}$`),
  SOLANA: new RegExp(`^${ADDRESS_PATTERNS.SOLANA}$`),
  XRPL: new RegExp(`^${ADDRESS_PATTERNS.XRPL}$`),
  XRPL_CURRENCY_ID: new RegExp(`^${ADDRESS_PATTERNS.XRPL_CURRENCY_ID}$`),
  TRON: new RegExp(`^${ADDRESS_PATTERNS.TRON}$`),
  SUI: new RegExp(`^${ADDRESS_PATTERNS.SUI}$`),
  BLAST: new RegExp(`^${ADDRESS_PATTERNS.BLAST}$`),
} as const;

export const CHAINS: Record<string, ChainInfo> = {
  [ChainNames.arbitrum]: {
    name: 'Arbitrum',
    icon: ArbitrumIcon(),
    explorers: [ServiceNames.arbiscan, ServiceNames.oklink],
    addressRegex: ADDRESS_REGEX.EVM,
    chainId: '42161',
  },
  [ChainNames.avalanche]: {
    name: 'Avalanche',
    icon: AvalancheIcon(),
    explorers: [ServiceNames.snowtrace],
    addressRegex: ADDRESS_REGEX.EVM,
    chainId: '43114',
  },
  [ChainNames.base]: {
    name: 'Base',
    icon: BaseIcon(),
    explorers: [ServiceNames.basescan, ServiceNames.basescout],
    addressRegex: ADDRESS_REGEX.EVM,
    chainId: '8453',
  },
  [ChainNames.blast]: {
    name: 'Blast',
    icon: BlastIcon(),
    explorers: [ServiceNames.blastscan],
    addressRegex: ADDRESS_REGEX.BLAST,
    chainId: '81457',
  },
  [ChainNames.bsc]: {
    name: 'BSC',
    icon: BscIcon(),
    explorers: [ServiceNames.bscscan, ServiceNames.bsctrace],
    addressRegex: ADDRESS_REGEX.EVM,
    chainId: '56',
  },
  [ChainNames.ethereum]: {
    name: 'Ethereum',
    icon: EthereumIcon(),
    explorers: [ServiceNames.etherscan, ServiceNames.ethplorer],
    addressRegex: ADDRESS_REGEX.EVM,
    chainId: '1',
  },
  [ChainNames.optimism]: {
    name: 'Optimism',
    icon: OptimismIcon(),
    explorers: [ServiceNames.optimismscan],
    addressRegex: ADDRESS_REGEX.EVM,
    chainId: '10',
  },
  [ChainNames.polygon]: {
    name: 'Polygon',
    icon: PolygonIcon(),
    explorers: [ServiceNames.polygonscan, ServiceNames.polygontrace],
    addressRegex: ADDRESS_REGEX.EVM,
    chainId: '137',
  },
  [ChainNames.solana]: {
    name: 'Solana',
    icon: SolanaIcon(),
    explorers: [
      ServiceNames.solscan,
      ServiceNames.solanabeach,
      ServiceNames.solanaexplorer,
      ServiceNames.solanacompass,
    ],
    addressRegex: ADDRESS_REGEX.SOLANA,
    chainId: '1399811149',
  },
  [ChainNames.sui]: {
    name: 'Sui',
    icon: SuiIcon(),
    explorers: [ServiceNames.suiexplorer],
    addressRegex: ADDRESS_REGEX.SUI,
    chainId: '784',
  },
  [ChainNames.tron]: {
    name: 'Tron',
    icon: TronIcon(),
    explorers: [ServiceNames.tronscan],
    addressRegex: ADDRESS_REGEX.TRON,
    chainId: '728126428',
  },
  [ChainNames.xrpl]: {
    name: 'XRPL',
    icon: XrplIcon(),
    explorers: [ServiceNames.xrpscan, ServiceNames.bithomp, ServiceNames.xrpledgerexplorer, ServiceNames.xrplpm],
    addressRegex: ADDRESS_REGEX.XRPL,
    chainId: '1',
  },
  [ChainNames.zksync]: {
    name: 'zkSync',
    icon: ZksyncIcon(),
    explorers: [ServiceNames.zkscan, ServiceNames.zkscout],
    addressRegex: ADDRESS_REGEX.EVM,
    chainId: '324',
  },
};

export const defaultExplorers = {
  [ChainNames.solana]: ServiceNames.solscan,
  [ChainNames.ethereum]: ServiceNames.etherscan,
  [ChainNames.arbitrum]: ServiceNames.arbiscan,
  [ChainNames.polygon]: ServiceNames.polygonscan,
  [ChainNames.optimism]: ServiceNames.optimismscan,
  [ChainNames.base]: ServiceNames.basescan,
  [ChainNames.zksync]: ServiceNames.zkscan,
  [ChainNames.bsc]: ServiceNames.bscscan,
  [ChainNames.avalanche]: ServiceNames.snowtrace,
  [ChainNames.blast]: ServiceNames.blastscan,
  [ChainNames.sui]: ServiceNames.suiexplorer,
  [ChainNames.tron]: ServiceNames.tronscan,
  [ChainNames.xrpl]: ServiceNames.xrpscan,
};

// Chain path mappings for different services
export const CHAIN_PATHS = {
  [ChainNames.ethereum]: ['eth', 'ether', 'ethereum'],
  [ChainNames.solana]: ['sol', 'solana'],
  [ChainNames.bsc]: ['bsc', 'binance', 'bnb'],
  [ChainNames.polygon]: ['polygon', 'matic'],
  [ChainNames.arbitrum]: ['arb', 'arbitrum'],
  [ChainNames.optimism]: ['op', 'optimism'],
  [ChainNames.avalanche]: ['avax', 'avalanche'],
  [ChainNames.base]: ['base'],
  [ChainNames.blast]: ['blast'],
  [ChainNames.zksync]: ['zksync', 'zks'],
  [ChainNames.xrpl]: ['xrpl', 'ripple'],
  [ChainNames.tron]: ['tron', 'trx'],
  [ChainNames.sui]: ['sui'],
} as const;

// Create reverse lookup map for path -> chain
export const PATH_TO_CHAIN = Object.entries(CHAIN_PATHS).reduce(
  (acc, [chain, paths]) => {
    for (const path of paths) {
      acc[path] = chain as ChainNames;
    }
    return acc;
  },
  {} as Record<string, ChainNames>,
);

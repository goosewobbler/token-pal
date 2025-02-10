import { ADDRESS_PATTERNS, CHAINS } from './constants';
import { ServiceNames } from './constants';
import { ServiceType } from './constants';
import { ChainNames } from './constants';
import type { CoinGeckoResponse, CoinMarketCapResponse, ServiceInfo, TokenInfo } from './types';
import ArbitrumIcon from '@/components/icons/ArbitrumIcon';
import BscIcon from '@/components/icons/BscIcon';
import DextoolsIcon from '@/components/icons/DextoolsIcon';
import EthereumIcon from '@/components/icons/EthereumIcon';
import PolygonIcon from '@/components/icons/PolygonIcon';
import SolanaIcon from '@/components/icons/SolanaIcon';
import DexscreenerIcon from '@/components/icons/DexscreenerIcon';
import HoneypotIcon from '@/components/icons/HoneypotIcon';
import TrenchradarIcon from '@/components/icons/TrenchradarIcon';
import BirdeyeIcon from '@/components/icons/BirdeyeIcon';
import XrplIcon from '@/components/icons/XrplIcon';
import GmgnIcon from '@/components/icons/GmgnIcon';
import BlastIcon from '@/components/icons/BlastIcon';
import TronIcon from '@/components/icons/TronIcon';
import AvalancheIcon from '@/components/icons/AvalancheIcon';
import OptimismIcon from '@/components/icons/OptimismIcon';
import SuiIcon from '@/components/icons/SuiIcon';
import ZksyncIcon from '@/components/icons/ZksyncIcon';
import XpmarketIcon from '@/components/icons/XpmarketIcon';
import XmagneticIcon from '@/components/icons/XmagneticIcon';
import PumpfunIcon from '@/components/icons/PumpfunIcon';
import BullxIcon from '@/components/icons/BullxIcon';
import BullxNeoIcon from '@/components/icons/BullxNeoIcon';
import BasescanIcon from '@/components/icons/BasescanIcon';
import BasescoutIcon from '@/components/icons/BasescoutIcon';
import PhotonIcon from '@/components/icons/PhotonIcon';
import XIcon from '@/components/icons/XIcon';
import TelegramIcon from '@/components/icons/TelegramIcon';
import DiscordIcon from '@/components/icons/DiscordIcon';
import AntiRugAgentIcon from '@/components/icons/AntiRugAgentIcon';
import { CHAIN_PATHS } from './constants';
import CoinGeckoIcon from '@/components/icons/CoinGeckoIcon';
import CoinMarketCapIcon from '@/components/icons/CoinMarketCapIcon';
import { isPumpFunAddress } from '@/lib/utils';
import { apiCache } from '@/lib/cache';

const fetchWithCache = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const cacheKey = url;
  const cached = apiCache.get<T>(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await fetch(url, {
    ...options,
    mode: options?.mode || 'cors',
  });
  const data = await response.json();
  apiCache.set(cacheKey, data);
  return data;
};

export const SERVICES: Record<string, ServiceInfo> = {
  [ServiceNames.dextools]: {
    name: 'Dextools',
    type: ServiceType.ANALYTICS,
    icon: DextoolsIcon(),
    description: 'Real-time price charts and trading history',
    supportedChains: [
      ChainNames.arbitrum,
      ChainNames.avalanche,
      ChainNames.base,
      ChainNames.blast,
      ChainNames.bsc,
      ChainNames.ethereum,
      ChainNames.optimism,
      ChainNames.polygon,
      ChainNames.solana,
      ChainNames.tron,
      ChainNames.xrpl,
      ChainNames.zksync,
    ],
    url: ({ chain, baseToken, tokenAddress, currencyId, issuer }: TokenInfo) => {
      if (!chain) return '';

      if (chain === ChainNames.xrpl && currencyId && issuer) {
        return `https://www.dextools.io/app/en/xrpl/pair-explorer/${currencyId}.${issuer}_XRP`;
      }
      const chainPath = CHAIN_PATHS[chain]?.[0];

      return chainPath ? `https://www.dextools.io/app/en/${chainPath}/pair-explorer/${baseToken || tokenAddress}` : '';
    },
    urlPattern: new RegExp(
      `dextools\\.io\\/app\\/\\w+\\/\\w+\\/pair-explorer\\/(${[
        ADDRESS_PATTERNS.EVM,
        ADDRESS_PATTERNS.SOLANA,
        ADDRESS_PATTERNS.TRON,
        `${ADDRESS_PATTERNS.XRPL_CURRENCY_ID}_XRP`,
      ].join('|')})`,
      'i',
    ),
  },
  [ServiceNames.dexscreener]: {
    name: 'Dexscreener',
    icon: DexscreenerIcon(),
    description: 'DEX trading pair explorer and analytics',
    supportedChains: [
      ChainNames.base,
      ChainNames.bsc,
      ChainNames.ethereum,
      ChainNames.solana,
      ChainNames.polygon,
      ChainNames.arbitrum,
      ChainNames.avalanche,
      ChainNames.blast,
      ChainNames.optimism,
      ChainNames.zksync,
      ChainNames.tron,
      ChainNames.xrpl,
      ChainNames.sui,
    ],
    type: ServiceType.DEX,
    url: ({ chain, baseToken, tokenAddress, currencyId, issuer }: TokenInfo) => {
      if (chain === ChainNames.xrpl && currencyId && issuer) {
        return `https://dexscreener.com/xrpl/${currencyId}.${issuer}_xrp`;
      }
      return `https://dexscreener.com/${chain}/${baseToken || tokenAddress}`;
    },
    urlPattern: new RegExp(
      `dexscreener\\.com/[\\w-]+/(${[
        ADDRESS_PATTERNS.EVM,
        ADDRESS_PATTERNS.SOLANA,
        ADDRESS_PATTERNS.TRON,
        ADDRESS_PATTERNS.SUI,
        ADDRESS_PATTERNS.BLAST,
        `${ADDRESS_PATTERNS.XRPL_CURRENCY_ID}_xrp`,
      ].join('|')})(?:[/?#]|$)`,
      'i',
    ),
  },
  [ServiceNames.honeypot]: {
    name: 'Honeypot',
    type: ServiceType.ANALYTICS,
    icon: HoneypotIcon(),
    description: 'Smart contract security checker',
    supportedChains: [ChainNames.ethereum, ChainNames.bsc, ChainNames.base],
    url: ({ chain, baseToken, tokenAddress }: TokenInfo) =>
      `https://honeypot.is/${chain}?address=${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`honeypot\\.is/[\\w-]+\\?address=(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.trenchradar]: {
    name: 'Trench Radar',
    type: ServiceType.ANALYTICS,
    icon: TrenchradarIcon(),
    description: 'Bundle analysis and MEV tracking',
    supportedChains: [ChainNames.solana],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://trench.bot/bundles/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`trenchradar\\.com/token/(${ADDRESS_PATTERNS.SOLANA})`),
    isSupported: (tokenInfo: TokenInfo) => Promise.resolve(isPumpFunAddress(tokenInfo.baseToken)),
  },
  [ServiceNames.etherscan]: {
    name: 'Etherscan',
    type: ServiceType.EXPLORER,
    icon: EthereumIcon(),
    description: 'Block explorer and analytics platform for Ethereum',
    supportedChains: [ChainNames.ethereum],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://etherscan.io/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`etherscan\\.io/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.bscscan]: {
    name: 'BscScan',
    type: ServiceType.EXPLORER,
    icon: BscIcon(),
    description: 'Block explorer for BNB Smart Chain',
    supportedChains: [ChainNames.bsc],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://bscscan.com/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`bscscan\\.com/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.polygonscan]: {
    name: 'PolygonScan',
    type: ServiceType.EXPLORER,
    icon: PolygonIcon(),
    description: 'Block explorer for Polygon chain',
    supportedChains: [ChainNames.polygon],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://polygonscan.com/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`polygonscan\\.com/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.arbiscan]: {
    name: 'ArbiScan',
    type: ServiceType.EXPLORER,
    icon: ArbitrumIcon(),
    description: 'Block explorer and analytics platform for Arbitrum',
    supportedChains: [ChainNames.arbitrum],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://arbiscan.io/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`arbiscan\\.io/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.solscan]: {
    name: 'SolScan',
    type: ServiceType.EXPLORER,
    icon: SolanaIcon(),
    description: 'Solana blockchain explorer',
    supportedChains: [ChainNames.solana],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://solscan.io/token/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`solscan\\.io/token/(${ADDRESS_PATTERNS.SOLANA})`),
  },
  [ServiceNames.birdeye]: {
    name: 'Birdeye',
    type: ServiceType.ANALYTICS,
    icon: BirdeyeIcon(),
    description: 'View token on Birdeye',
    supportedChains: [ChainNames.solana],
    url: ({ chain, baseToken, tokenAddress }: TokenInfo) =>
      `https://birdeye.so/token/${baseToken || tokenAddress}?chain=${chain}`,
    urlPattern: new RegExp(`birdeye\\.so/token/(${ADDRESS_PATTERNS.SOLANA})`),
  },
  [ServiceNames.solanabeach]: {
    name: 'Solana Beach',
    type: ServiceType.EXPLORER,
    icon: SolanaIcon(),
    description: 'Solana blockchain explorer',
    supportedChains: [ChainNames.solana],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://solanabeach.io/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`solanabeach\\.io/address/(${ADDRESS_PATTERNS.SOLANA})`),
  },
  [ServiceNames.xrpscan]: {
    name: 'XRPScan',
    type: ServiceType.EXPLORER,
    icon: XrplIcon(),
    description: 'XRP Ledger block explorer',
    supportedChains: [ChainNames.xrpl],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://xrpscan.com/account/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`xrpscan\\.com/account/(${ADDRESS_PATTERNS.XRPL})`),
  },
  [ServiceNames.bithomp]: {
    name: 'Bithomp',
    type: ServiceType.EXPLORER,
    icon: XrplIcon(),
    description: 'User-friendly XRP explorer',
    supportedChains: [ChainNames.xrpl],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://bithomp.com/explorer/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`bithomp\\.com/explorer/(${ADDRESS_PATTERNS.XRPL})`),
  },
  [ServiceNames.gmgn]: {
    name: 'GMGN',
    type: ServiceType.DEX,
    icon: GmgnIcon(),
    description: 'Multi-chain token analytics platform',
    supportedChains: [
      ChainNames.avalanche,
      ChainNames.base,
      ChainNames.blast,
      ChainNames.bsc,
      ChainNames.ethereum,
      ChainNames.optimism,
      ChainNames.solana,
      ChainNames.sui,
      ChainNames.tron,
      ChainNames.zksync,
    ],
    url: ({ chain, baseToken, tokenAddress }: TokenInfo) => {
      if (!chain) return '';
      const chainPath = CHAIN_PATHS[chain]?.[0]; // Use first path as canonical
      return chainPath ? `https://gmgn.ai/${chainPath}/token/${baseToken || tokenAddress}` : '';
    },
    urlPattern: new RegExp(`gmgn\\.ai/([^/]+)/token/(${ADDRESS_PATTERNS.EVM}|${ADDRESS_PATTERNS.SOLANA})`),
  },
  [ServiceNames.xpmarket]: {
    name: 'XPMarket',
    type: ServiceType.DEX,
    description: 'XRPL DEX and NFT marketplace',
    icon: XpmarketIcon(),
    supportedChains: [ChainNames.xrpl],
    url: ({ baseToken, currency, issuer, tokenAddress }: TokenInfo) => {
      if (currency && issuer) {
        return `https://xpmarket.com/dex/${currency}-${issuer}/XRP`;
      }
      return `https://xpmarket.com/dex/${baseToken || tokenAddress}/XRP`;
    },
    urlPattern: new RegExp(`xpmarket\\.com/(dex|token)/(${ADDRESS_PATTERNS.XRPL})`),
  },
  [ServiceNames.xmagnetic]: {
    name: 'XMagnetic',
    type: ServiceType.DEX,
    description: 'XRPL DEX trading platform',
    icon: XmagneticIcon(),
    supportedChains: [ChainNames.xrpl],
    url: ({ baseToken, currency, issuer, tokenAddress }: TokenInfo) => {
      if (currency && issuer) {
        return `https://xmagnetic.org/dex/${currency}+${issuer}?network=mainnet`;
      }
      return `https://xmagnetic.org/dex/${baseToken || tokenAddress}?network=mainnet`;
    },
    urlPattern: new RegExp(`xmagnetic\\.org/(dex|tokens)/(${ADDRESS_PATTERNS.XRPL})`),
  },
  [ServiceNames.pumpfun]: {
    name: 'PumpFun',
    type: ServiceType.DEX,
    description: 'Solana token analytics platform',
    icon: PumpfunIcon(),
    supportedChains: [ChainNames.solana],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://pump.fun/coin/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`pump\\.fun/coin/(${ADDRESS_PATTERNS.SOLANA})`),
    isSupported: (tokenInfo: TokenInfo) => Promise.resolve(isPumpFunAddress(tokenInfo.baseToken)),
  },
  [ServiceNames.bullx]: {
    name: 'BullX',
    type: ServiceType.DEX,
    description: 'Multi-chain token analytics platform',
    icon: BullxIcon(),
    supportedChains: [
      ChainNames.ethereum,
      ChainNames.base,
      ChainNames.bsc,
      ChainNames.arbitrum,
      ChainNames.blast,
      ChainNames.solana,
    ],
    url: ({ chain, baseToken, tokenAddress }: TokenInfo) => {
      if (!chain) return '';
      return `https://bullx.io/terminal?chainId=${CHAINS[chain].chainId}&address=${baseToken || tokenAddress}`;
    },
    urlPattern: new RegExp(
      `bullx\\.io/terminal\\?chainId=\\d+&address=(${ADDRESS_PATTERNS.EVM}|${ADDRESS_PATTERNS.SOLANA})`,
    ),
  },
  [ServiceNames.bullxneo]: {
    name: 'BullX NEO',
    type: ServiceType.DEX,
    description: 'Next-gen token analytics platform',
    icon: BullxNeoIcon(),
    supportedChains: [ChainNames.tron, ChainNames.solana],
    url: ({ chain, baseToken, tokenAddress }: TokenInfo) => {
      if (!chain) return '';
      return `https://neo.bullx.io/terminal?chainId=${CHAINS[chain].chainId}&address=${baseToken || tokenAddress}`;
    },
    urlPattern: new RegExp(
      `neo\\.bullx\\.io/terminal\\?chainId=\\d+&address=(${ADDRESS_PATTERNS.TRON}|${ADDRESS_PATTERNS.SOLANA})`,
    ),
  },
  [ServiceNames.snowtrace]: {
    name: 'Snowtrace',
    type: ServiceType.EXPLORER,
    icon: AvalancheIcon(),
    description: 'Avalanche block explorer',
    supportedChains: [ChainNames.avalanche],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://snowtrace.io/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`snowtrace\\.io/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.blastscan]: {
    name: 'Blastscan',
    type: ServiceType.EXPLORER,
    icon: BlastIcon(),
    description: 'Blast block explorer',
    supportedChains: [ChainNames.blast],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://blastscan.io/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`blastscan\\.io/address/(${ADDRESS_PATTERNS.BLAST})`),
  },
  [ServiceNames.optimismscan]: {
    name: 'Optimism Explorer',
    type: ServiceType.EXPLORER,
    icon: OptimismIcon(),
    description: 'Optimism block explorer',
    supportedChains: [ChainNames.optimism],
    url: ({ baseToken, tokenAddress }: TokenInfo) =>
      `https://optimistic.etherscan.io/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`optimistic\\.etherscan\\.io/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.zkscan]: {
    name: 'zkSync Explorer',
    type: ServiceType.EXPLORER,
    icon: ZksyncIcon(),
    description: 'zkSync block explorer',
    supportedChains: [ChainNames.zksync],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://explorer.zksync.io/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`explorer\\.zksync\\.io/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.oklink]: {
    name: 'OKLink',
    type: ServiceType.EXPLORER,
    icon: ArbitrumIcon(),
    description: 'Alternative Arbitrum block explorer',
    supportedChains: [ChainNames.arbitrum],
    url: ({ baseToken, tokenAddress }: TokenInfo) =>
      `https://www.oklink.com/arbitrum/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`oklink\\.com/arbitrum/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.basescan]: {
    name: 'Basescan',
    type: ServiceType.EXPLORER,
    icon: BasescanIcon(),
    description: 'Base block explorer',
    supportedChains: [ChainNames.base],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://basescan.org/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`basescan\\.org/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.basescout]: {
    name: 'Base Scout',
    type: ServiceType.EXPLORER,
    icon: BasescoutIcon(),
    description: 'Alternative Base block explorer',
    supportedChains: [ChainNames.base],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://basescout.com/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`basescout\\.com/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.solanaexplorer]: {
    name: 'Solana Explorer',
    type: ServiceType.EXPLORER,
    icon: SolanaIcon(),
    description: 'Official Solana block explorer',
    supportedChains: [ChainNames.solana],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://explorer.solana.com/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`explorer\\.solana\\.com/address/(${ADDRESS_PATTERNS.SOLANA})`),
  },
  [ServiceNames.suiexplorer]: {
    name: 'Sui Explorer',
    type: ServiceType.EXPLORER,
    icon: SuiIcon(),
    description: 'Official Sui block explorer',
    supportedChains: [ChainNames.sui],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://suiexplorer.com/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`suiexplorer\\.com/address/(${ADDRESS_PATTERNS.SUI})`),
  },
  [ServiceNames.tronscan]: {
    name: 'Tronscan',
    type: ServiceType.EXPLORER,
    icon: TronIcon(),
    description: 'Official Tron block explorer',
    supportedChains: [ChainNames.tron],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://tronscan.org/#/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`tronscan\\.org/#/address/(${ADDRESS_PATTERNS.TRON})`),
  },
  [ServiceNames.zkscout]: {
    name: 'zkScout',
    type: ServiceType.EXPLORER,
    icon: ZksyncIcon(),
    description: 'Alternative zkSync block explorer',
    supportedChains: [ChainNames.zksync],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://zkscout.com/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`zkscout\\.com/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.ethplorer]: {
    name: 'Ethplorer',
    type: ServiceType.EXPLORER,
    icon: EthereumIcon(),
    description: 'Alternative Ethereum block explorer with token analytics',
    supportedChains: [ChainNames.ethereum],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://ethplorer.io/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`ethplorer\\.io/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.bsctrace]: {
    name: 'BscTrace',
    type: ServiceType.EXPLORER,
    icon: BscIcon(),
    description: 'Alternative BSC block explorer',
    supportedChains: [ChainNames.bsc],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://bsctrace.com/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`bsctrace\\.com/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.polygontrace]: {
    name: 'PolygonTrace',
    type: ServiceType.EXPLORER,
    icon: PolygonIcon(),
    description: 'Alternative Polygon block explorer',
    supportedChains: [ChainNames.polygon],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://polygontrace.com/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`polygontrace\\.com/address/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.solanacompass]: {
    name: 'Solana Compass',
    type: ServiceType.EXPLORER,
    icon: SolanaIcon(),
    description: 'Alternative Solana block explorer',
    supportedChains: [ChainNames.solana],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://solanacompass.com/address/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`solanacompass\\.com/address/(${ADDRESS_PATTERNS.SOLANA})`),
  },
  [ServiceNames.xrpledgerexplorer]: {
    name: 'XRPL Explorer',
    type: ServiceType.EXPLORER,
    icon: XrplIcon(),
    description: 'Official XRPL block explorer',
    supportedChains: [ChainNames.xrpl],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://livenet.xrpl.org/accounts/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`livenet\\.xrpl\\.org/accounts/(${ADDRESS_PATTERNS.XRPL})`),
  },
  [ServiceNames.xrplpm]: {
    name: 'XRPL PM',
    type: ServiceType.EXPLORER,
    icon: XrplIcon(),
    description: 'Alternative XRPL block explorer',
    supportedChains: [ChainNames.xrpl],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://xrpl.pm/account/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`xrpl\\.pm/account/(${ADDRESS_PATTERNS.XRPL})`),
  },
  [ServiceNames.photon]: {
    name: 'Photon',
    type: ServiceType.DEX,
    icon: PhotonIcon(),
    description: 'View token analytics on Photon',
    supportedChains: [ChainNames.ethereum],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://photon.tinyastro.io/en/lp/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`photon\\.tinyastro\\.io\\/\\w+\\/lp\\/(${ADDRESS_PATTERNS.EVM})`),
  },
  [ServiceNames.photonSol]: {
    name: 'Photon',
    type: ServiceType.DEX,
    icon: PhotonIcon(),
    description: 'View Solana token analytics on Photon',
    supportedChains: [ChainNames.solana],
    url: ({ baseToken, tokenAddress }: TokenInfo) =>
      `https://photon-sol.tinyastro.io/en/lp/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`photon-sol\\.tinyastro\\.io\\/\\w+\\/lp\\/(${ADDRESS_PATTERNS.SOLANA})`),
  },
  [ServiceNames.antiRugAgent]: {
    name: 'Anti Rug Agent',
    description: 'Token analysis and rug detection',
    icon: AntiRugAgentIcon(),
    type: ServiceType.ANALYTICS,
    supportedChains: [ChainNames.solana],
    url: ({ baseToken, tokenAddress }: TokenInfo) => `https://antirugagent.com/ca/${baseToken || tokenAddress}`,
    urlPattern: new RegExp(`antirugagent\\.com\\/ca\\/(${ADDRESS_PATTERNS.SOLANA})`),
    isSupported: async (tokenInfo: TokenInfo) => Promise.resolve(isPumpFunAddress(tokenInfo.baseToken)),
  },
  [ServiceNames.coingecko]: {
    name: 'CoinGecko',
    type: ServiceType.ANALYTICS,
    icon: CoinGeckoIcon(),
    description: 'View token on CoinGecko',
    supportedChains: Object.values(ChainNames),
    url: ({ baseToken, chain }) => {
      if (!baseToken || !chain) return undefined;
      return `https://www.coingecko.com/en/coins/${chain}/${baseToken}`;
    },
    urlPattern: /coingecko\.com\/en\/coins\/([^\/]+)\/([^\/]+)/,
    isSupported: async (tokenInfo: TokenInfo) => {
      try {
        const data = await fetchWithCache<CoinGeckoResponse>(
          `https://api.coingecko.com/api/v3/coins/${tokenInfo.baseToken}`,
        );
        return Boolean(data);
      } catch (err) {
        console.error('CoinGecko API error:', err);
        return false;
      }
    },
  },
  [ServiceNames.coinmarketcap]: {
    name: 'CoinMarketCap',
    type: ServiceType.ANALYTICS,
    icon: CoinMarketCapIcon(),
    description: 'View token on CoinMarketCap',
    supportedChains: Object.values(ChainNames),
    url: ({ baseToken, chain }) => {
      if (!baseToken || !chain) return undefined;
      return `https://coinmarketcap.com/currencies/${chain}/${baseToken}`;
    },
    urlPattern: /coinmarketcap\.com\/currencies\/([^\/]+)\/([^\/]+)/,
    isSupported: async (tokenInfo: TokenInfo) => {
      try {
        const data = await fetchWithCache<CoinMarketCapResponse>(
          `https://api.coinmarketcap.com/v2/cryptocurrency/info?address=${tokenInfo.baseToken}`,
          { mode: 'no-cors' },
        );
        return Boolean(data);
      } catch (err) {
        console.error('CoinMarketCap API error:', err);
        return false;
      }
    },
  },
};

export const SOCIAL_SERVICES = {
  x: {
    name: 'X',
    icon: XIcon(),
    description: 'X (formerly Twitter)',
    url: ({ socials }: TokenInfo) => socials?.twitter,
  },
  telegram: {
    name: 'Telegram',
    icon: TelegramIcon(),
    description: 'Telegram',
    url: ({ socials }: TokenInfo) => socials?.telegram,
  },
  discord: {
    name: 'Discord',
    icon: DiscordIcon(),
    description: 'Discord',
    url: ({ socials }: TokenInfo) => socials?.discord,
  },
};

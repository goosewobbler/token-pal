import { AlertCircle, CheckCircle2, Loader2, Copy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import type { ServicePreferences, TokenInfo } from '@/entrypoints/popup/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { formatAddress } from '@/lib/utils';
import { CHAINS } from '@/entrypoints/popup/constants';
import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

interface AddressStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  tokenInfo: TokenInfo;
  address: string;
  onExplorerClick: () => void;
  explorerName: string;
  isFastClickMode: boolean;
  fastClickPrefs: ServicePreferences;
}

const AddressStatus = ({ status, tokenInfo, address, onExplorerClick, explorerName }: AddressStatusProps) => {
  const { toast } = useToast();
  const isValid = (tokenInfo.chain || tokenInfo.name || tokenInfo.currency) && status === 'success';
  const { name, chain, baseToken, currency } = tokenInfo;

  console.log('tokenInfo', tokenInfo);

  const handleExplorerClick = useCallback(() => {
    if (!chain) return;

    onExplorerClick();
  }, [chain, onExplorerClick]);

  const handleCopyAddress = useCallback(async () => {
    const addressToCopy = baseToken || address;
    try {
      await navigator.clipboard.writeText(addressToCopy);
      toast({
        description: 'Address copied',
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  }, [baseToken, address, toast]);

  if (!address.trim() && status !== 'loading') return undefined;

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className='w-4 h-4 animate-spin text-foreground' />;
      case 'success':
        return <CheckCircle2 className='w-4 h-4 text-green-500' />;
      case 'error':
        return <AlertCircle className='w-4 h-4 text-red-500' />;
      default:
        return undefined;
    }
  };

  const chainInfo = chain ? CHAINS[chain] : undefined;

  return (
    <Alert variant={status === 'loading' ? 'default' : isValid ? 'default' : 'destructive'} className='min-h-[72px]'>
      <div className='flex items-center gap-2 mt-1'>
        {getStatusIcon()}
        <AlertDescription className='flex-1'>
          {status === 'loading' ? (
            <div className='flex flex-col gap-0.5'>
              <div className='text-sm font-medium text-foreground'>Analyzing address...</div>
              <div className='text-xs text-foreground/80 flex items-center gap-1'>
                <span>CA:</span>
                {formatAddress(address)}
              </div>
            </div>
          ) : status === 'error' ? (
            <div className='flex flex-col gap-0.5'>
              <div className='text-sm font-semibold text-red-500'>Invalid address or chain not supported</div>
              <div className='text-xs text-red-500/90 flex items-center gap-1'>
                <span>CA:</span>
                {formatAddress(address)}
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-0.5 min-w-0 flex-1'>
                <div className='flex items-baseline gap-1.5'>
                  {currency && (
                    <span className='font-semibold text-white drop-shadow-[0_0_2rem_#ffd700ee] flex-shrink-0'>
                      {currency}
                    </span>
                  )}
                  {name && (
                    <span className='text-foreground/90 flex-shrink'>
                      (<span className='truncate min-w-0 max-w-[200px]'>{name}</span>)
                    </span>
                  )}
                </div>
                <div className='flex items-center gap-1 text-xs text-muted-foreground/70'>
                  <span>CA:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='link'
                          className='h-auto p-0 text-xs text-muted-foreground/70 hover:text-muted-foreground/70 hover:underline'
                          onClick={handleCopyAddress}
                        >
                          <span className='flex items-center gap-1'>
                            <span>{formatAddress(baseToken || address)}</span>
                            <Copy className='w-3 h-3 opacity-70' />
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy Address</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {chainInfo && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='link'
                        className='px-1 h-auto font-medium text-foreground/90'
                        onClick={handleExplorerClick}
                      >
                        <span className='flex items-center gap-1'>
                          <span className='w-4 h-4'>{chainInfo.icon}</span>
                          <span>{chainInfo.name}</span>
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View contract address on {explorerName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default AddressStatus;

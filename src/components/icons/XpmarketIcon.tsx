import { cn } from '@/lib/utils';

interface XpmarketIconProps {
  className?: string;
}

const XpmarketIcon = ({ className }: XpmarketIconProps = {}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      className={cn('w-4 h-4', className)}
    >
      <title>XPMarket</title>
      {/* X */}
      <path d='M6 4l12 16M18 4L6 20' strokeWidth='2' stroke='currentColor' fill='none' />
      {/* P */}
      <path d='M11 4v16M11 4h5a4 4 0 0 1 0 8h-5' strokeWidth='2' stroke='currentColor' fill='none' />
    </svg>
  );
};

export default XpmarketIcon;

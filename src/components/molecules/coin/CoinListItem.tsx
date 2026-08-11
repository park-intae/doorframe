import { memo } from 'react';
import { CoinData } from '@/type/coin';

interface CoinListItemProps {
    coin: CoinData;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
};

const formatChange = (amount: number) => {
    const sign = amount > 0 ? '+' : '';
    return `${sign}${new Intl.NumberFormat('ko-KR').format(amount)}`;
};

const formatRate = (rate: number) => {
    const sign = rate > 0 ? '+' : '';
    return `${sign}${rate.toFixed(2)}%`;
};

const getChangeColor = (change: 'RISE' | 'FALL' | 'EVEN') => {
    if (change === 'RISE') return 'text-red-500';
    if (change === 'FALL') return 'text-blue-500';
    return 'text-context';
};

const CoinListItem = memo(({ coin }: CoinListItemProps) => {
    return (
        <div className="grid grid-cols-5 gap-2 py-3 border-b border-black/50 dark:border-white/5 hover:bg-white/5 transition-colors items-center">
            <div className="col-span-2 flex flex-col">
                <span className="text-title font-bold text-base leading-tight">
                    {coin.name}
                </span>
                <span className="text-xs text-context/60">
                    {coin.symbol}/KRW
                </span>
            </div>
            <div className="text-right font-bold text-title whitespace-nowrap">
                {formatPrice(coin.price)}
            </div>
            <div className={`text-right font-bold whitespace-nowrap ${getChangeColor(coin.change)}`}>
                {formatRate(coin.changeRate)}
            </div>
            <div className={`text-right text-xs whitespace-nowrap ${getChangeColor(coin.change)}`}>
                {formatChange(coin.changeAmount)}
            </div>
        </div>
    );
});

CoinListItem.displayName = 'CoinListItem';

export default CoinListItem;

import { memo } from 'react';
import { StockData } from '@/type/stock';

interface StockListItemProps {
    stock: StockData;
}

const formatStockPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
        return new Intl.NumberFormat('ko-KR').format(Math.round(price));
    }
    return `$${price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatStockChange = (amount: number, currency: string) => {
    const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
    const abs = Math.abs(amount);
    if (currency === 'KRW') {
        return `${sign}${new Intl.NumberFormat('ko-KR').format(Math.round(abs))}`;
    }
    return `${sign}$${abs.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
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

const StockListItem = memo(({ stock }: StockListItemProps) => {
    const displaySymbol = stock.symbol.replace(/\.(KS|KQ)$/, '');

    return (
        <div className="grid grid-cols-5 gap-2 py-3 border-b border-black/50 dark:border-white/5 hover:bg-white/5 transition-colors items-center">
            <div className="col-span-2 flex flex-col min-w-0">
                <span className="text-title font-bold text-base leading-tight truncate">
                    {stock.name}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-context/80">
                        {stock.market === 'KR' ? '국장' : '미장'}
                    </span>
                    <span className="text-xs text-context/60 truncate">
                        {displaySymbol}
                    </span>
                </div>
            </div>
            <div className="text-right font-bold text-title whitespace-nowrap">
                {formatStockPrice(stock.price, stock.currency)}
            </div>
            <div className={`text-right font-bold whitespace-nowrap ${getChangeColor(stock.change)}`}>
                {formatRate(stock.changeRate)}
            </div>
            <div className={`text-right text-xs whitespace-nowrap ${getChangeColor(stock.change)}`}>
                {formatStockChange(stock.changeAmount, stock.currency)}
            </div>
        </div>
    );
});

StockListItem.displayName = 'StockListItem';

export default StockListItem;

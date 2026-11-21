import 'supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

interface CachedQuote {
  data: StockQuoteResult;
  timestamp: number;
}

interface StockQuoteResult {
  symbol: string;
  name: string;
  market: 'KR' | 'US';
  currency: string;
  price: number;
  previousClose: number;
  changeAmount: number;
  changeRate: number;
  change: 'RISE' | 'FALL' | 'EVEN';
  marketState: string;
}

const quoteCache = new Map<string, CachedQuote>();
const QUOTE_CACHE_TTL_MS = 15 * 1000;

function detectMarket(symbol: string): 'KR' | 'US' {
  const upper = symbol.toUpperCase();
  if (upper.endsWith('.KS') || upper.endsWith('.KQ')) {
    return 'KR';
  }
  return 'US';
}

async function fetchSingleQuote(symbol: string): Promise<StockQuoteResult | null> {
  const normalized = symbol.trim().toUpperCase();
  if (!normalized) return null;

  const cached = quoteCache.get(normalized);
  if (cached && Date.now() - cached.timestamp < QUOTE_CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    normalized
  )}?interval=1d&range=1d`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Yahoo Finance quote failed for ${normalized}: ${response.status}`);
    return null;
  }

  const json = await response.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta || typeof meta.regularMarketPrice !== 'number') {
    return null;
  }

  const price = meta.regularMarketPrice as number;
  const previousClose =
    typeof meta.chartPreviousClose === 'number'
      ? meta.chartPreviousClose
      : typeof meta.previousClose === 'number'
        ? meta.previousClose
        : price;

  const changeAmount = price - previousClose;
  const changeRate = previousClose > 0 ? (changeAmount / previousClose) * 100 : 0;
  const change: 'RISE' | 'FALL' | 'EVEN' =
    changeAmount > 0 ? 'RISE' : changeAmount < 0 ? 'FALL' : 'EVEN';

  const result: StockQuoteResult = {
    symbol: normalized,
    name: (meta.shortName || meta.longName || normalized) as string,
    market: detectMarket(normalized),
    currency: (meta.currency || (detectMarket(normalized) === 'KR' ? 'KRW' : 'USD')) as string,
    price,
    previousClose,
    changeAmount,
    changeRate,
    change,
    marketState: (meta.marketState || 'CLOSED') as string,
  };

  quoteCache.set(normalized, { data: result, timestamp: Date.now() });
  return result;
}

async function searchStocks(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
    trimmed
  )}&quotesCount=12&newsCount=0`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance search failed: ${response.status}`);
  }

  const json = await response.json();
  const quotes = Array.isArray(json?.quotes) ? json.quotes : [];

  return quotes
    .filter((q: Record<string, unknown>) => {
      const symbol = typeof q.symbol === 'string' ? q.symbol : '';
      const quoteType = typeof q.quoteType === 'string' ? q.quoteType : '';
      if (!symbol) return false;
      if (quoteType !== 'EQUITY' && quoteType !== 'ETF') return false;
      // 한국(.KS, .KQ) 및 미국 주요 거래소 위주로 필터링
      const isKr = symbol.endsWith('.KS') || symbol.endsWith('.KQ');
      const isUs = !symbol.includes('.');
      return isKr || isUs;
    })
    .slice(0, 10)
    .map((q: Record<string, unknown>) => {
      const symbol = (q.symbol as string).toUpperCase();
      return {
        symbol,
        name: (q.shortname || q.longname || symbol) as string,
        market: detectMarket(symbol),
        exchange: (q.exchDisp || q.exchange || '') as string,
      };
    });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action ?? 'quotes';

    if (action === 'search') {
      const query = typeof body?.query === 'string' ? body.query : '';
      const results = await searchStocks(query);
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const symbols: string[] = Array.isArray(body?.symbols)
      ? body.symbols.filter((s: unknown): s is string => typeof s === 'string').slice(0, 30)
      : [];

    if (symbols.length === 0) {
      return new Response(JSON.stringify({ quotes: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const settled = await Promise.allSettled(symbols.map((s) => fetchSingleQuote(s)));
    const quotes = settled
      .filter((r): r is PromiseFulfilledResult<StockQuoteResult | null> => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((q): q is StockQuoteResult => q !== null);

    return new Response(JSON.stringify({ quotes, updatedAt: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stock service error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

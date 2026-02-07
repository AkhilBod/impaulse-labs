const ALPHA_VANTAGE_API_KEY = (import.meta as any).env.VITE_ALPHA_VANTAGE_API_KEY || 'PS7F4XE2SWBQJQVY';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: string;
  logo: string;
}

// Stock logos using public folder
const stockLogos: Record<string, { logo: string; color: string }> = {
  'AAPL': { logo: '/image.png', color: '#000000' },
  'MSFT': { logo: '/image-copy-2.png', color: '#00A4EF' },
  'NVDA': { logo: '/image-copy.png', color: '#76B900' },
  'GOOGL': { logo: 'G', color: '#4285F4' },
  'AMZN': { logo: 'A', color: '#FF9900' },
  'META': { logo: 'M', color: '#0081FB' },
  'TSLA': { logo: 'T', color: '#CC0000' },
};

const stockNames: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft',
  'GOOGL': 'Alphabet',
  'AMZN': 'Amazon',
  'NVDA': 'NVIDIA',
  'META': 'Meta',
  'TSLA': 'Tesla',
};

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      const price = parseFloat(quote['05. price']) || 0;
      const change = parseFloat(quote['09. change']) || 0;
      let changePercent = quote['10. change percent'] || '0%';
      // Remove % and + signs, keep only the number (we'll add + in the UI if positive)
      changePercent = changePercent.replace('%', '').replace('+', '');
      
      return {
        symbol,
        name: stockNames[symbol] || symbol,
        price,
        change,
        changePercent,
        logo: stockLogos[symbol]?.logo || symbol[0],
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

export async function getPopularStocks(): Promise<StockQuote[]> {
  const symbols = ['AAPL', 'MSFT', 'NVDA'];
  const stocks: StockQuote[] = [];
  
  for (const symbol of symbols) {
    const quote = await getStockQuote(symbol);
    if (quote) {
      stocks.push(quote);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // If API fails, return fallback data with image paths
  if (stocks.length === 0) {
    return [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 2.34, changePercent: '1.27', logo: '/image.png' },
      { symbol: 'MSFT', name: 'Microsoft', price: 415.50, change: 5.20, changePercent: '1.26', logo: '/image-copy-2.png' },
      { symbol: 'NVDA', name: 'NVIDIA', price: 875.28, change: 15.43, changePercent: '1.79', logo: '/image-copy.png' },
    ];
  }
  
  return stocks;
}

export function getStockColor(symbol: string): string {
  return stockLogos[symbol]?.color || '#10B981';
}

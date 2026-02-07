import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { UserSettings } from '../types';

interface Props {
  settings: UserSettings;
  savings: {
    moneySaved: number;
    workTimeSaved: { hours: number; minutes: number };
    investmentPotential: number;
  };
  onAddSavings?: (amount: number, hours: number, minutes: number) => void;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const API_KEY = 'FR5KWVIN9QH9Y1A2';

const Dashboard: React.FC<Props> = ({ settings, savings, onAddSavings }) => {
  const [stocks, setStocks] = useState<Stock[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 0, change: 0, changePercent: 0 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 0, change: 0, changePercent: 0 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 0, change: 0, changePercent: 0 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 0, change: 0, changePercent: 0 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 0, change: 0, changePercent: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const stockSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL'];
        const updatedStocks: Stock[] = [];

        for (const symbol of stockSymbols) {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
          );
          const data = await response.json();
          console.log(`${symbol} API Response:`, data);

          if (data['Global Quote'] && data['Global Quote']['05. price']) {
            const quote = data['Global Quote'];
            const price = parseFloat(quote['05. price']) || 0;
            const changePercent = parseFloat(quote['10. change percent']?.replace('%', '')) || 0;
            
            let name = symbol;
            if (symbol === 'AAPL') name = 'Apple Inc.';
            else if (symbol === 'MSFT') name = 'Microsoft Corp.';
            else if (symbol === 'NVDA') name = 'NVIDIA Corp.';
            else if (symbol === 'TSLA') name = 'Tesla Inc.';
            else if (symbol === 'GOOGL') name = 'Alphabet Inc.';
            
            updatedStocks.push({
              symbol,
              name,
              price,
              change: (price * changePercent) / 100,
              changePercent,
            });
          } else {
            // Fallback with mock data if API fails
            let mockData: Stock;
            if (symbol === 'AAPL') mockData = { symbol: 'AAPL', name: 'Apple Inc.', price: 238.50, change: 3.25, changePercent: 1.38 };
            else if (symbol === 'MSFT') mockData = { symbol: 'MSFT', name: 'Microsoft Corp.', price: 427.80, change: 5.20, changePercent: 1.23 };
            else if (symbol === 'NVDA') mockData = { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 1045.00, change: 28.50, changePercent: 2.80 };
            else if (symbol === 'TSLA') mockData = { symbol: 'TSLA', name: 'Tesla Inc.', price: 234.60, change: -8.40, changePercent: -3.46 };
            else mockData = { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 193.75, change: 2.10, changePercent: 1.10 };
            
            updatedStocks.push(mockData);
          }
        }

        setStocks(updatedStocks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        // Set fallback stocks if API fails completely
        setStocks([
          { symbol: 'AAPL', name: 'Apple Inc.', price: 238.50, change: 3.25, changePercent: 1.38 },
          { symbol: 'MSFT', name: 'Microsoft Corp.', price: 427.80, change: 5.20, changePercent: 1.23 },
          { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 1045.00, change: 28.50, changePercent: 2.80 },
          { symbol: 'TSLA', name: 'Tesla Inc.', price: 234.60, change: -8.40, changePercent: -3.46 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 193.75, change: 2.10, changePercent: 1.10 },
        ]);
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div className="w-full h-full bg-[#F2F9F6] pb-24 flex flex-col">
      <div className="px-6 pt-6 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Icons.Clock className="text-gray-500" size={24} />
        </div>

        {/* Money Saved Card */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-soft flex justify-between items-center border border-emerald-100">
          <div>
            <h2 className="text-gray-400 font-bold text-sm tracking-wide mb-1 uppercase">MONEY SAVED</h2>
            <div className="text-4xl font-extrabold text-gray-900">{settings.currency}{savings.moneySaved}</div>
          </div>
          <div className="text-emerald-400">
             <div className="w-12 h-8 border-2 border-emerald-300 rounded flex items-center justify-center bg-emerald-50">
               <div className="w-5 h-5 rounded-full border border-emerald-300"></div>
             </div>
          </div>
        </div>

        {/* Work Time Saved Card */}
        <div className="bg-white rounded-3xl p-6 mb-8 shadow-soft flex justify-between items-center border border-blue-100">
          <div>
            <h2 className="text-gray-400 font-bold text-sm tracking-wide mb-1 uppercase">WORK TIME SAVED</h2>
            <div className="text-3xl font-extrabold text-gray-900">{savings.workTimeSaved.hours}h {savings.workTimeSaved.minutes}m</div>
          </div>
          <div className="text-blue-400">
             <Icons.Clock className="text-blue-300" size={32} />
          </div>
        </div>

        {/* Investment Growth Card */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-soft border border-gray-100">
          <div className="relative z-10">
            <h2 className="text-gray-400 font-bold text-sm tracking-wide mb-2 uppercase">Potential in 5 years</h2>
            <div className="text-4xl font-extrabold text-gray-900">{settings.currency}{savings.investmentPotential.toFixed(0)}</div>
            <p className="text-gray-500 text-xs mt-2">At 10% annual return</p>
          </div>
        </div>

        {/* Top Stocks Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top stocks to invest in</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading stock data...</div>
          ) : (
            <div className="space-y-3">
              {stocks.map((stock) => (
                <div key={stock.symbol} className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 hover:border-emerald-200 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{stock.symbol}</h3>
                      <p className="text-sm text-gray-500">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${stock.price.toFixed(2)}</div>
                      <div className={`text-sm font-semibold ${stock.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Simple chart indicator */}
                  <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${stock.changePercent >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(stock.changePercent) * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

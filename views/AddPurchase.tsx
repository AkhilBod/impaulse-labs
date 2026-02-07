import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { UserSettings, Goal } from '../types';
import { analyzeProductImage, getImpulseAdvice, calculateWorkHours, calculateInvestmentValue } from '../services/geminiService';
import { getPopularStocks, StockQuote, getStockColor } from '../services/stockService';

interface Props {
  settings: UserSettings;
  goals?: Goal[];
  onAddSavings?: (amount: number, hours: number, minutes: number, investment: number, category: string) => void;
}

interface AnalysisResult {
  productName: string;
  estimatedPrice: number;
  category: string;
  advice: string;
  workHours: { hours: number; minutes: number };
  investmentValue: number;
}

// Success Modal Component with real stock data
const SuccessModal: React.FC<{
  analysisResult: AnalysisResult;
  settings: UserSettings;
  stocks: StockQuote[];
  stocksLoading: boolean;
  onClose: () => void;
}> = ({ analysisResult, settings, stocks, stocksLoading, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center">
          <h1 className="text-4xl font-black text-white mb-2">GREAT CHOICE!</h1>
          <p className="text-emerald-100 font-semibold text-lg">You saved money today</p>
        </div>

        <div className="p-8 space-y-4">
          {/* Savings Stats */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 text-center border border-emerald-200">
            <p className="text-black font-bold text-xs tracking-widest uppercase mb-2">Money Saved</p>
            <p className="text-5xl font-black text-black">{settings.currency}{analysisResult.estimatedPrice}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 text-center border border-blue-200">
              <p className="text-black font-bold text-xs tracking-widest uppercase mb-1">Work Time</p>
              <p className="text-2xl font-black text-black">{analysisResult.workHours.hours}h {analysisResult.workHours.minutes}m</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center border border-purple-200">
              <p className="text-black font-bold text-xs tracking-widest uppercase mb-1">In 5 Years</p>
              <p className="text-2xl font-black text-black">{settings.currency}{analysisResult.investmentValue.toFixed(0)}</p>
            </div>
          </div>

          {/* Invest This Instead - Real Stock Data */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-black font-bold text-sm mb-3">Invest this instead 📈</p>
            {stocksLoading ? (
              <div className="flex items-center justify-center py-4">
                <span className="text-2xl animate-spin">⏳</span>
                <span className="ml-2 text-black text-sm">Loading stocks...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {stocks.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getStockColor(stock.symbol) }}
                      >
                        {stock.symbol === 'AAPL' ? (
                          <span className="text-xl">🍎</span>
                        ) : (
                          <span className="text-sm font-bold text-white">{stock.logo}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-black">{stock.symbol}</p>
                        <p className="text-xs text-gray-600">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-black">${stock.price.toFixed(2)}</p>
                      <p className={`text-sm font-black ${parseFloat(stock.changePercent) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {parseFloat(stock.changePercent) >= 0 ? '+' : ''}{stock.changePercent}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-100 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white border-t border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">Powered by Impaulse Labs</p>
        </div>
      </div>
    </div>
  );
};

const AddPurchase: React.FC<Props> = ({ settings, goals = [], onAddSavings }) => {
  const [loading, setLoading] = useState(false);
  const [sliderProgress, setSliderProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showUnsureModal, setShowUnsureModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [unsureData, setUnsureData] = useState({
    name: '',
    category: 'Electronics',
    reminderTime: 24
  });

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setShowCamera(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const constraints = {
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setShowCamera(false);
      setAlertModal({ show: true, message: `Camera error: ${errMsg}` });
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setShowCamera(false);
        
        await analyzeImage(imageData);
      }
    }
  };

  const analyzeImage = async (base64Data: string) => {
    try {
      setLoading(true);
      setSliderProgress(0);
      
      const interval = setInterval(() => {
        setSliderProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 30;
        });
      }, 200);
      
      const result = await analyzeProductImage(base64Data);
      if (!result) {
        throw new Error("Could not analyze image");
      }

      const hourlyRate = settings.incomeMode === 'salary' 
        ? settings.yearlySalary / 2080 
        : settings.hourlyRate;

      const workHours = calculateWorkHours(result.estimatedPrice, hourlyRate);
      const investmentValue = calculateInvestmentValue(result.estimatedPrice);
      const advice = await getImpulseAdvice(result.productName, result.estimatedPrice, hourlyRate);

      clearInterval(interval);
      setSliderProgress(100);

      setAnalysisResult({
        productName: result.productName,
        estimatedPrice: result.estimatedPrice,
        category: result.category,
        advice,
        workHours,
        investmentValue
      });
      
      setShowModal(true);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      setAlertModal({ show: true, message: `Error analyzing image: ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        await analyzeImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col items-center justify-center p-6 pb-20">
      
      <div className="absolute top-20 left-10 text-6xl opacity-80 animate-bounce delay-100">
         <div className="bg-blue-200 p-2 rounded-full w-16 h-16 flex items-center justify-center border-4 border-blue-100 shadow-lg">
             <Icons.Clock className="text-blue-500" />
         </div>
      </div>
      <div className="absolute top-16 right-16 text-6xl opacity-80 animate-pulse">
         <div className="bg-green-200 p-2 rounded-lg transform rotate-12 w-20 h-10 flex items-center justify-center border-2 border-green-300 shadow-lg">
             <span className="text-2xl">💵</span>
         </div>
      </div>
      <div className="absolute bottom-40 left-12 text-6xl opacity-80">
          <div className="bg-yellow-200 p-4 rounded-full w-24 h-24 flex items-center justify-center border-4 border-yellow-100 shadow-xl">
             <span className="text-4xl text-yellow-600 font-bold">$</span>
          </div>
      </div>
      <div className="absolute bottom-32 right-10 text-6xl opacity-80 animate-bounce">
          <div className="text-6xl transform -rotate-12">🐖</div>
      </div>

      <h1 className="text-3xl font-extrabold mb-8 z-10 text-center uppercase tracking-wide">SNAP & ANALYZE</h1>
      
      <div className="w-full max-w-xs z-10">
         <div className="relative w-48 h-48 mx-auto mb-8">
           {showCamera ? (
             <>
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline
                 className="w-48 h-48 rounded-full shadow-2xl object-cover border-4 border-emerald-600 absolute inset-0"
                 style={{ transform: 'scaleX(-1)' }}
               />
               <canvas ref={canvasRef} className="hidden" />
             </>
           ) : (
             <button 
                onClick={() => startCamera()}
                disabled={loading}
                className="w-48 h-48 bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white rounded-full shadow-2xl active:scale-95 transition-transform flex items-center justify-center"
             >
                {loading ? (
                  <span className="text-4xl animate-spin">⏳</span>
                ) : (
                  <Icons.Camera size={80} />
                )}
             </button>
           )}
         </div>

         {showCamera && (
           <div className="flex gap-4 justify-center mb-8">
             <button
               onClick={capturePhoto}
               className="flex-1 max-w-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold py-4 shadow-lg active:scale-95 transition-transform text-lg"
             >
               Capture
             </button>
             <button
               onClick={() => {
                 if (streamRef.current) {
                   streamRef.current.getTracks().forEach(track => track.stop());
                   streamRef.current = null;
                 }
                 setShowCamera(false);
               }}
               className="flex-1 max-w-xs bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-xl font-bold py-4 shadow-lg active:scale-95 transition-transform text-lg"
             >
               Cancel
             </button>
           </div>
         )}
         
         <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
            disabled={loading}
         />

         {/* WORTH IT Modal */}
         {showModal && analysisResult && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
               <div className="bg-white border-b border-gray-200 p-8 text-center">
                 <h1 className="text-4xl font-black text-black mb-2">WORTH IT?</h1>
                 <p className="text-black font-semibold text-lg">{analysisResult.productName}</p>
                 <p className="text-black text-3xl font-bold mt-2">{settings.currency}{analysisResult.estimatedPrice}</p>
               </div>

               <div className="p-8 space-y-6">
                 <div className="bg-gray-50 rounded-2xl p-6">
                   <p className="font-bold text-black text-lg mb-3">Time at Work</p>
                   <p className="text-3xl font-bold text-black">
                     {analysisResult.workHours.hours}h {analysisResult.workHours.minutes}m
                   </p>
                   <p className="text-sm text-gray-600 mt-2">That's how long you'd need to work to afford this</p>
                 </div>

                 <div className="bg-gray-50 rounded-2xl p-6">
                   <p className="font-bold text-black text-lg mb-3">Invested Instead</p>
                   <p className="text-3xl font-bold text-black">
                     {settings.currency}{analysisResult.investmentValue.toFixed(2)}
                   </p>
                   <p className="text-sm text-gray-600 mt-2">Value in 5 years at 10% annual return</p>
                 </div>

                 <div className="bg-gray-50 rounded-2xl p-4">
                   <p className="text-sm text-black italic">{analysisResult.advice}</p>
                 </div>
               </div>

               <div className="bg-gray-50 p-6 space-y-3">
                 <button
                   onClick={() => {
                     setShowModal(false);
                     setAnalysisResult(null);
                   }}
                   className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-bold py-4 rounded-xl transition-colors"
                 >
                   Buy
                 </button>
                 <button
                   onClick={() => {
                     setShowUnsureModal(true);
                   }}
                   className="w-full bg-gray-200 hover:bg-gray-300 text-black font-bold py-4 rounded-xl transition-colors"
                 >
                   Unsure
                 </button>
                 <button
                   onClick={async () => {
                     if (analysisResult) {
                       // Start loading stocks
                       setStocksLoading(true);
                       setShowSuccessModal(true);
                       setShowModal(false);
                       
                       // Add savings
                       onAddSavings?.(
                         analysisResult.estimatedPrice,
                         analysisResult.workHours.hours,
                         analysisResult.workHours.minutes,
                         analysisResult.investmentValue,
                         analysisResult.category
                       );
                       
                       // Fetch real stock data
                       try {
                         const stockData = await getPopularStocks();
                         setStocks(stockData);
                       } catch (error) {
                         console.error('Error fetching stocks:', error);
                       } finally {
                         setStocksLoading(false);
                       }
                     }
                   }}
                   className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-colors"
                 >
                   Don't Buy
                 </button>
               </div>

               <div className="bg-white border-t border-gray-200 p-4 text-center">
                 <p className="text-xs text-gray-500">Powered by Impaulse Labs</p>
               </div>
             </div>
           </div>
         )}

         {/* Unsure Modal */}
         {showUnsureModal && analysisResult && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-[#F2F9F6] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
               <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-center relative">
                 <button
                   onClick={() => setShowUnsureModal(false)}
                   className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold transition-colors"
                 >
                   ✕
                 </button>
                 <h1 className="text-2xl font-black text-white mb-1">Still want it?</h1>
                 <p className="text-gray-400 font-medium text-sm">Set a reminder to think it over</p>
               </div>

               <div className="p-6 space-y-5">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Item Name (optional)</label>
                   <input
                     type="text"
                     value={unsureData.name}
                     onChange={(e) => setUnsureData({ ...unsureData, name: e.target.value })}
                     placeholder={analysisResult.productName}
                     className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                   />
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Category</label>
                   <div className="grid grid-cols-2 gap-2">
                     {[
                       { key: 'Clothes', label: '👕 Clothes' },
                       { key: 'Decor', label: '🏠 Home' },
                       { key: 'Travel', label: '✈️ Travel' },
                       { key: 'Electronics', label: '📱 Tech' }
                     ].map(cat => (
                       <button
                         key={cat.key}
                         onClick={() => setUnsureData({ ...unsureData, category: cat.key })}
                         className={`p-4 rounded-xl transition-all font-bold text-sm ${
                           unsureData.category === cat.key
                             ? 'bg-black text-white shadow-md'
                             : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                         }`}
                       >
                         {cat.label}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Remind me in</label>
                   <div className="flex gap-2">
                     {[
                       { time: 1, label: '1 hour' },
                       { time: 24, label: '24 hours' },
                       { time: 48, label: '48 hours' }
                     ].map(({ time, label }) => (
                       <button
                         key={time}
                         onClick={() => setUnsureData({ ...unsureData, reminderTime: time })}
                         className={`flex-1 p-3 rounded-xl font-bold transition-all text-sm ${
                           unsureData.reminderTime === time
                             ? 'bg-black text-white shadow-md'
                             : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                         }`}
                       >
                         {label}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>

               <div className="p-6 pt-0">
                 <button
                   onClick={() => {
                     setAlertModal({ show: true, message: `We'll remind you in ${unsureData.reminderTime === 1 ? '1 hour' : unsureData.reminderTime + ' hours'}!` });
                     setShowUnsureModal(false);
                     setShowModal(false);
                     setAnalysisResult(null);
                   }}
                   className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
                 >
                   Set Reminder
                 </button>
               </div>
             </div>
           </div>
         )}

         {/* Success Modal */}
         {showSuccessModal && analysisResult && (
           <SuccessModal 
             analysisResult={analysisResult}
             settings={settings}
             stocks={stocks}
             stocksLoading={stocksLoading}
             onClose={() => {
               setShowSuccessModal(false);
               setAnalysisResult(null);
             }}
           />
         )}

         {/* Progress Slider */}
         {sliderProgress > 0 && (
           <div className="w-full mt-8 pt-6 border-t border-gray-200">
             <div className="relative h-32 bg-gradient-to-r from-gray-100 to-emerald-50 rounded-2xl p-6 flex items-center">
               <div className="absolute left-6 -top-8 text-xs font-bold text-gray-500 uppercase tracking-wide">START</div>
               <div className="absolute right-6 -top-8 text-xs font-bold text-emerald-600 uppercase tracking-wide">FINISH</div>
               
               <div className="absolute inset-0 flex items-center rounded-2xl">
                 <div className="w-full h-1 bg-gray-300 rounded-full relative">
                   <div 
                     className="absolute h-full bg-emerald-500 rounded-full transition-all duration-300"
                     style={{ width: `${sliderProgress}%` }}
                   ></div>
                 </div>
               </div>
               
               <div 
                 className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 z-10"
                 style={{ left: `${Math.max(4, Math.min(sliderProgress - 8, 88))}%` }}
               >
                 <div className="w-12 h-12 bg-black rounded-lg shadow-lg flex items-center justify-center">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                     <polyline points="5 12 19 12"></polyline>
                     <polyline points="12 5 19 12 12 19"></polyline>
                   </svg>
                 </div>
               </div>
             </div>
             
             <p className="text-center text-sm text-gray-600 mt-4 font-semibold">
               {sliderProgress < 50 && '🔍 Analyzing...'}
               {sliderProgress >= 50 && sliderProgress < 100 && '💡 Processing...'}
               {sliderProgress >= 100 && '✅ Complete!'}
             </p>
           </div>
         )}

         {/* Custom Alert Modal */}
         {alertModal.show && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
               <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-8 text-center">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                   <Icons.AlertTriangle className="text-amber-500" size={36} />
                 </div>
               </div>
               <div className="p-6 text-center">
                 <p className="text-gray-900 font-semibold text-base leading-relaxed">{alertModal.message}</p>
               </div>
               <div className="bg-gray-50 p-4 border-t border-gray-200">
                 <button
                   onClick={() => setAlertModal({ show: false, message: '' })}
                   className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3 rounded-xl transition-colors"
                 >
                   Got it
                 </button>
               </div>
             </div>
           </div>
         )}

      </div>
    </div>
  );
};

export default AddPurchase;

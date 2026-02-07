import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Goal } from '../types';

interface Props {
  onNext: (goals: Goal[]) => void;
  onBack: () => void;
}

interface GoalWithSavings extends Goal {
  targetAmount?: number;
  savedAmount?: number;
}

const OnboardingGoals: React.FC<Props> = ({ onNext, onBack }) => {
  const [step, setStep] = useState<'select' | 'amounts'>('select');
  const [goals, setGoals] = useState<GoalWithSavings[]>([
    { id: '1', title: 'Travel & Experiences', icon: '🏝️', selected: false },
    { id: '2', title: 'Car / Big Purchase', icon: '🚙', selected: false },
    { id: '3', title: 'House / Down Payment', icon: '🏠', selected: false },
    { id: '4', title: 'Emergency Fund', icon: '🐖', selected: false },
    { id: '5', title: 'Retirement', icon: '💵', selected: false },
    { id: '6', title: 'Family & Life Events', icon: '💍', selected: false },
    { id: '7', title: 'Utilities', icon: '💡', selected: false },
    { id: '8', title: 'Miscellaneous', icon: '📦', selected: false },
  ]);

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, selected: !g.selected } : g));
  };

  const updateGoalAmount = (id: string, field: 'targetAmount' | 'savedAmount', value: number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const selectedGoals = goals.filter(g => g.selected);
  const hasSelectedGoals = selectedGoals.length > 0;

  const progressWidth = step === 'select' ? '50%' : '100%';

  const handleNext = () => {
    if (step === 'select' && hasSelectedGoals) {
      setStep('amounts');
    } else if (step === 'amounts') {
      onNext(goals);
    }
  };

  const handleBack = () => {
    if (step === 'amounts') {
      setStep('select');
    } else {
      onBack();
    }
  };

  return (
    <div className="p-6 h-full flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6 pt-2">
        <button 
          className="p-2 -ml-2 text-gray-800"
          onClick={handleBack}
        >
           <Icons.ArrowLeft size={24} />
        </button>
        <div className="flex-1 h-1 bg-gray-200 rounded-full mx-4 relative overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: progressWidth }}
          ></div>
        </div>
      </div>

      {step === 'select' ? (
        <>
          <h1 className="text-3xl font-bold leading-tight mb-8">
            What are you saving for?
          </h1>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto no-scrollbar pb-8">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`
                  relative flex flex-col items-center justify-between p-4 rounded-[20px] aspect-square transition-all
                  ${goal.selected ? 'bg-emerald-100 border-2 border-emerald-400' : 'bg-white border border-gray-200'}
                `}
              >
                {/* Checkmark */}
                {goal.selected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Icons.Check size={14} className="text-white" />
                  </div>
                )}
                
                {/* Text Top Left aligned */}
                <span className="text-left w-full font-bold text-base leading-tight text-gray-900">
                  {goal.title}
                </span>
                
                {/* Icon Centered/Bottom */}
                <div className="text-5xl mt-2 drop-shadow-md transform transition-transform hover:scale-110">
                  {goal.icon}
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold leading-tight mb-2">
            Set your savings goals
          </h1>
          <p className="text-gray-500 mb-6">
            How much do you want to save for each?
          </p>

          {/* Goal amounts list */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-8">
            {selectedGoals.map((goal) => {
              const targetAmount = goal.targetAmount || 0;
              const savedAmount = goal.savedAmount || 0;
              const savedPercentage = targetAmount > 0 ? Math.min((savedAmount / targetAmount) * 100, 100) : 0;
              
              return (
                <div key={goal.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{goal.icon}</span>
                    <span className="font-bold text-lg">{goal.title}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 block mb-1">Goal amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="text"
                          className="w-full p-3 pl-7 rounded-xl border border-gray-300 bg-white font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                          value={goal.targetAmount || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
                            updateGoalAmount(goal.id, 'targetAmount', val || 0);
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-gray-500">Already saved</label>
                        <span className="text-sm font-bold text-emerald-600">${savedAmount.toLocaleString()}</span>
                      </div>
                      
                      {/* Slider container */}
                      <div className="relative pt-2 pb-1">
                        <div className="relative h-3 rounded-full overflow-hidden" style={{
                          background: `linear-gradient(to right, #10b981 0%, #10b981 ${savedPercentage}%, #fecaca ${savedPercentage}%, #fecaca 100%)`
                        }}>
                        </div>
                        
                        {/* Range slider - styled via CSS */}
                        <input
                          type="range"
                          min="0"
                          max={targetAmount || 10000}
                          value={savedAmount}
                          onChange={(e) => {
                            updateGoalAmount(goal.id, 'savedAmount', parseInt(e.target.value));
                          }}
                          className="absolute top-0 left-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>$0</span>
                        <span>${(targetAmount || 10000).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <button 
        onClick={handleNext}
        disabled={!hasSelectedGoals}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg mt-4 transition-colors mb-4 shadow-lg"
      >
        {step === 'select' ? 'Continue' : 'Finish'}
      </button>

      <button 
        onClick={() => onNext(goals)}
        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        Skip (Dev)
      </button>
    </div>
  );
};

export default OnboardingGoals;

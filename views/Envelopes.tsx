import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { UserSettings, Goal } from '../types';

interface Props {
  settings: UserSettings;
  goals: Goal[];
}

const Envelopes: React.FC<Props> = ({ settings, goals }) => {
  const [selectedTimeline, setSelectedTimeline] = useState<'1year' | '2year' | '3year'>('1year');

  // Calculate savings breakdown for each timeline
  const timelineLabels = {
    '1year': '1-Year Goal',
    '2year': '2-Year Goal',
    '3year': '3-Year Goal'
  };

  const getTimelineAmount = (targetAmount: number | undefined, savedAmount: number | undefined): number => {
    const saved = savedAmount || 0;
    if (!targetAmount) return saved;
    
    if (selectedTimeline === '1year') {
      return saved; // Full amount in 1 year
    } else if (selectedTimeline === '2year') {
      return Math.round((saved / 2) || saved); // Half per year (spread over 2 years)
    } else {
      return Math.round((saved / 3) || saved); // Third per year (spread over 3 years)
    }
  };

  const selectedGoals = goals.filter(g => g.selected);
  const totalTarget = selectedGoals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalSaved = selectedGoals.reduce((sum, g) => sum + (g.savedAmount || 0), 0);
  const timelineTotal = getTimelineAmount(totalTarget, totalSaved);

  return (
    <div className="p-6 max-w-md mx-auto pt-10 pb-20 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
        <Icons.Clock className="text-gray-400" size={24} />
      </div>

      {/* Timeline Selector */}
      <div className="flex bg-white rounded-full p-1 shadow-sm mb-6 gap-1">
        <button 
          onClick={() => setSelectedTimeline('1year')}
          className={`flex-1 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            selectedTimeline === '1year' 
              ? 'bg-emerald-600 text-white' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          1-Year
        </button>
        <button 
          onClick={() => setSelectedTimeline('2year')}
          className={`flex-1 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            selectedTimeline === '2year' 
              ? 'bg-emerald-600 text-white' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          2-Year
        </button>
        <button 
          onClick={() => setSelectedTimeline('3year')}
          className={`flex-1 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            selectedTimeline === '3year' 
              ? 'bg-emerald-600 text-white' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          3-Year
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 mb-6 shadow-soft border border-emerald-200">
        <h2 className="text-gray-500 font-bold text-xs tracking-wide uppercase mb-2">Save per year ({timelineLabels[selectedTimeline]})</h2>
        <div className="flex items-baseline mb-4">
          <span className="text-4xl font-extrabold text-emerald-600 mr-2">${timelineTotal.toLocaleString()}</span>
          <span className="text-lg font-semibold text-gray-400">/ ${totalTarget.toLocaleString()}</span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full bg-white rounded-full mb-4 overflow-hidden shadow-sm">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: totalTarget > 0 ? `${Math.min((0 / totalTarget) * 100, 100)}%` : '0%' }}
          ></div>
        </div>

        <p className="text-sm text-gray-600">
          {selectedTimeline === '1year' && 'Save the full amount within 1 year'}
          {selectedTimeline === '2year' && 'Save this amount per year over 2 years'}
          {selectedTimeline === '3year' && 'Save this amount per year over 3 years'}
        </p>
      </div>

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto">
        {selectedGoals.length > 0 ? (
          <div className="space-y-3">
            {selectedGoals.map((goal) => {
              const goalTimeline = getTimelineAmount(goal.targetAmount, goal.savedAmount);
              const progressPercent = goal.targetAmount ? Math.min(((goal.savedAmount || 0) / goal.targetAmount) * 100, 100) : 0;
              
              return (
                <div key={goal.id} className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 hover:border-emerald-200 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{goal.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{goal.title}</h3>
                        <p className="text-xs text-gray-500">Total: ${(goal.targetAmount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-emerald-600">${goalTimeline.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{timelineLabels[selectedTimeline]}</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-bold text-gray-900 mb-2">No goals selected</h3>
            <p className="text-sm text-gray-500">Complete the onboarding to set your savings goals</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Envelopes;

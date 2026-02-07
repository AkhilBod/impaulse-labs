import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { UserSettings, Goal } from '../types';

interface Props {
  settings: UserSettings;
  goals: Goal[];
}

const Envelopes: React.FC<Props> = ({ settings, goals }) => {
  const [selectedTimeline, setSelectedTimeline] = useState<'1year' | '2year' | '3year'>('1year');

  const timelineYears = {
    '1year': 1,
    '2year': 2,
    '3year': 3
  };

  const timelineLabels = {
    '1year': '1-Year Goal',
    '2year': '2-Year Goal',
    '3year': '3-Year Goal'
  };

  const selectedGoals = goals.filter(g => g.selected);
  const totalTarget = selectedGoals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalSaved = selectedGoals.reduce((sum, g) => sum + (g.savedAmount || 0), 0);
  
  // Calculate yearly amount needed based on timeline
  // For "save per year" - we divide the TARGET by years (not saved)
  // The display shows: how much you've saved / how much you NEED to save per year
  const years = timelineYears[selectedTimeline];
  const yearlyTarget = Math.round(totalTarget / years); // What you need to save each year
  
  // Progress is total saved vs total target (not yearly)
  const progressPercent = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

  // Calculate retirement info
  const currentYear = new Date().getFullYear();
  const birthYear = settings.birthday ? new Date(settings.birthday).getFullYear() : 2000;
  const currentAge = currentYear - birthYear;
  const yearsToRetirement = Math.max(0, (settings.retirementAge || 65) - currentAge);
  
  // Compound interest calculation for retirement
  const monthlyContribution = totalSaved > 0 ? totalSaved / 12 : 0;
  const annualReturn = (settings.investmentReturnRate || 10) / 100;
  const retirementValue = monthlyContribution > 0 
    ? monthlyContribution * 12 * (Math.pow(1 + annualReturn, yearsToRetirement) - 1) / annualReturn * (1 + annualReturn)
    : 0;

  return (
    <div className="p-6 max-w-md mx-auto pt-10 pb-20 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Savings Goals</h1>
      </div>

      {/* Timeline Selector */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-sm mb-6 border border-gray-100">
        {(['1year', '2year', '3year'] as const).map((timeline) => (
          <button 
            key={timeline}
            onClick={() => setSelectedTimeline(timeline)}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              selectedTimeline === timeline 
                ? 'bg-black text-white shadow-md' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {timeline === '1year' ? '1-Year' : timeline === '2year' ? '2-Year' : '3-Year'}
          </button>
        ))}
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 mb-6 shadow-soft border border-emerald-200">
        <h2 className="text-black font-bold text-xs tracking-wide uppercase mb-2">
          Save per year ({timelineLabels[selectedTimeline]})
        </h2>
        <div className="flex items-baseline mb-4">
          <span className="text-4xl font-extrabold text-black mr-2">
            {settings.currency}{totalSaved.toLocaleString()}
          </span>
          <span className="text-lg font-semibold text-gray-500">
            / {settings.currency}{yearlyTarget.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full bg-white rounded-full mb-4 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <p className="text-sm text-black">
          {selectedTimeline === '1year' && `Save ${settings.currency}${yearlyTarget.toLocaleString()} this year to hit your goal`}
          {selectedTimeline === '2year' && `Save ${settings.currency}${yearlyTarget.toLocaleString()} per year for 2 years`}
          {selectedTimeline === '3year' && `Save ${settings.currency}${yearlyTarget.toLocaleString()} per year for 3 years`}
        </p>
      </div>

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto mb-4">
        {selectedGoals.length > 0 ? (
          <div className="space-y-3">
            {selectedGoals.map((goal) => {
              const goalYearlyTarget = Math.round((goal.targetAmount || 0) / years);
              const goalProgressPercent = goal.targetAmount 
                ? Math.min(((goal.savedAmount || 0) / goal.targetAmount) * 100, 100) 
                : 0;
              
              return (
                <div key={goal.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-emerald-200 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{goal.icon}</span>
                      <div>
                        <h3 className="font-bold text-black text-sm">{goal.title}</h3>
                        <p className="text-xs text-gray-500">Total: {settings.currency}{(goal.targetAmount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-black">{settings.currency}{goalYearlyTarget.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">per year</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                      style={{ width: `${goalProgressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {settings.currency}{(goal.savedAmount || 0).toLocaleString()} saved of {settings.currency}{(goal.targetAmount || 0).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-5xl mb-4">💰</span>
            <h3 className="font-bold text-black mb-2">No goals selected</h3>
            <p className="text-sm text-gray-500">Complete the onboarding to set your savings goals</p>
          </div>
        )}
      </div>

      {/* Retirement Section */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-5 border border-purple-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📈</span>
          <div>
            <h3 className="font-bold text-black text-sm">Retirement Projection</h3>
            <p className="text-xs text-gray-500">{yearsToRetirement} years until age {settings.retirementAge || 65}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-purple-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">If you keep saving at this rate</p>
          <p className="text-2xl font-black text-black">
            {settings.currency}{Math.round(retirementValue).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            at {settings.investmentReturnRate || 10}% annual return
          </p>
        </div>
      </div>
    </div>
  );
};

export default Envelopes;

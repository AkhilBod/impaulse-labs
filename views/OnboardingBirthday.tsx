import React, { useState } from 'react';
import { UserSettings } from '../types';

interface Props {
  settings: UserSettings;
  updateSettings: (s: UserSettings) => void;
  onNext: () => void;
}

const OnboardingBirthday: React.FC<Props> = ({ settings, updateSettings, onNext }) => {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');

  const handleDateChange = () => {
    if (month && day && year) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      updateSettings({ ...settings, birthday: dateStr });
      onNext();
    }
  };

  const handleSkip = () => {
    // Skip without updating birthday, just go to next
    onNext();
  };

  const isValid = month && day && year && 
    parseInt(month) >= 1 && parseInt(month) <= 12 &&
    parseInt(day) >= 1 && parseInt(day) <= 31 &&
    parseInt(year) >= 1930 && parseInt(year) <= new Date().getFullYear() - 13;

  return (
    <div className="p-6 h-full flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6 pt-2">
        <div className="p-2 -ml-2 w-10"></div>
        <div className="flex-1 h-1 bg-gray-200 rounded-full mx-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-[0%] bg-emerald-500 rounded-full transition-all duration-300"></div>
        </div>
      </div>

      <h1 className="text-3xl font-bold leading-tight mb-2">
        When's your birthday?
      </h1>
      
      <p className="text-gray-500 mb-8">
        We use this to personalize your experience
      </p>

      {/* Date inputs */}
      <div className="space-y-4 flex-1">
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Month (1-12)</label>
          <input
            type="text"
            placeholder="MM"
            className="w-full p-4 rounded-xl border border-gray-300 bg-white text-lg font-semibold text-center focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={month}
            onChange={(e) => setMonth(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
            maxLength={2}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Day (1-31)</label>
          <input
            type="text"
            placeholder="DD"
            className="w-full p-4 rounded-xl border border-gray-300 bg-white text-lg font-semibold text-center focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={day}
            onChange={(e) => setDay(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
            maxLength={2}
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Year (1930 or later)</label>
          <input
            type="text"
            placeholder="YYYY"
            className="w-full p-4 rounded-xl border border-gray-300 bg-white text-lg font-semibold text-center focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            maxLength={4}
          />
        </div>
      </div>

      {/* Summary card */}
      {month && day && year && (
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <p className="text-center text-gray-600 text-sm mb-1">Your birthday</p>
          <p className="text-center text-xl font-bold text-emerald-600">
            {month}/{day}/{year}
          </p>
        </div>
      )}

      <button 
        onClick={handleDateChange}
        disabled={!isValid}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg mb-4 transition-colors shadow-lg"
      >
        Continue
      </button>

      <button 
        onClick={handleSkip}
        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        Skip (Dev)
      </button>
    </div>
  );
};

export default OnboardingBirthday;

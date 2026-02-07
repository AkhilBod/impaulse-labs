import React from 'react';
import { Icons } from '../components/Icons';
import { UserSettings } from '../types';

interface Props {
  settings: UserSettings;
  updateSettings: (s: UserSettings) => void;
  onNext: () => void;
  onBack: () => void;
}

const OnboardingIncome: React.FC<Props> = ({ settings, updateSettings, onNext, onBack }) => {
  // Calculate hourly rate from salary or vice versa
  const calculateHourlyFromSalary = (salary: number) => {
    // Assuming 40 hours/week, 52 weeks/year = 2080 hours
    return Math.round((salary / 2080) * 100) / 100;
  };

  const calculateSalaryFromHourly = (hourly: number) => {
    // Assuming 40 hours/week, 52 weeks/year = 2080 hours
    return Math.round(hourly * 2080);
  };

  const displayValue = () => {
    if (settings.incomeMode === 'hourly') {
      return settings.hourlyRate > 0 ? `$${settings.hourlyRate}` : '';
    } else {
      return settings.yearlySalary > 0 ? `$${settings.yearlySalary.toLocaleString()}` : '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
    if (settings.incomeMode === 'hourly') {
      updateSettings({
        ...settings, 
        hourlyRate: val || 0,
        yearlySalary: calculateSalaryFromHourly(val || 0)
      });
    } else {
      updateSettings({
        ...settings, 
        yearlySalary: val || 0,
        hourlyRate: calculateHourlyFromSalary(val || 0)
      });
    }
  };

  const getInputLabel = () => {
    return settings.incomeMode === 'hourly' ? 'per hour' : 'per year';
  };

  return (
    <div className="p-6 h-full flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6 pt-2">
        <button className="p-2 -ml-2 text-gray-800" onClick={onBack}>
           <Icons.ArrowLeft size={24} />
        </button>
        <div className="flex-1 h-1 bg-gray-200 rounded-full mx-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-[25%] bg-emerald-500 rounded-full transition-all duration-300"></div>
        </div>
      </div>

      <h1 className="text-3xl font-bold leading-tight mb-8">
        How much do you make?
      </h1>

      {/* Toggle */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => updateSettings({...settings, incomeMode: 'salary'})}
          className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
            settings.incomeMode === 'salary' ? 'bg-[#A7F3D0] text-teal-900' : 'bg-gray-100 text-gray-500'
          }`}
        >
          Salary
        </button>
        <button
          onClick={() => updateSettings({...settings, incomeMode: 'hourly'})}
          className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
            settings.incomeMode === 'hourly' ? 'bg-[#99F6E4] text-teal-900' : 'bg-gray-100 text-gray-500'
          }`}
        >
          Hourly
        </button>
      </div>

      {/* Input */}
      <div className="mb-8">
        <input
          type="text"
          className="w-full p-4 text-center rounded-xl border border-gray-300 bg-white text-xl font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          value={displayValue()}
          onChange={handleInputChange}
        />
        <p className="text-center text-gray-500 mt-2">{getInputLabel()}</p>
      </div>

      {/* Summary card */}
      {(settings.hourlyRate > 0 || settings.yearlySalary > 0) && (
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm mb-1">That's equivalent to:</p>
          <p className="font-bold text-lg">
            {settings.incomeMode === 'hourly' 
              ? `$${settings.yearlySalary.toLocaleString()} per year`
              : `$${settings.hourlyRate}/hr`
            }
          </p>
        </div>
      )}

      <p className="text-center text-gray-400 text-sm mb-4">
        You can change this later in settings
      </p>

      <div className="flex-1"></div>

      <button 
        onClick={onNext}
        disabled={settings.hourlyRate === 0 && settings.yearlySalary === 0}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg mb-4 transition-colors shadow-lg"
      >
        Continue
      </button>

      <button 
        onClick={onNext}
        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        Skip (Dev)
      </button>
    </div>
  );
};

export default OnboardingIncome;

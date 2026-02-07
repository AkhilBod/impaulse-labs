import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { UserSettings } from '../types';
import { dbService } from '../services/dbService';

interface Props {
  settings: UserSettings;
  updateSettings: (s: UserSettings) => void;
  userId: string | null;
  onLogout: () => void;
}

const Settings: React.FC<Props> = ({ settings, updateSettings, userId, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [saved, setSaved] = useState(false);
  const [alertModal, setAlertModal] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const handleSaveSettings = async () => {
    updateSettings(settings);
    
    // Save to database if user ID exists
    if (userId) {
      try {
        await dbService.updateSettings(userId, settings);
      } catch (err) {
        console.error('Failed to save settings:', err);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    setShowMenu(false);
    onLogout();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (userId) {
        try {
          console.log('Deleting user:', userId);
          await dbService.deleteUser(userId);
          console.log('User deleted successfully');
          setAlertModal({ show: true, message: 'Account deleted successfully' });
          setTimeout(() => {
            setShowMenu(false);
            onLogout();
          }, 1000);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          console.error('Failed to delete user:', err);
          setAlertModal({ show: true, message: `Error deleting account: ${errorMsg}` });
        }
      } else {
        setAlertModal({ show: true, message: 'No user ID found' });
      }
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto pt-10 pb-24 overflow-y-auto no-scrollbar">
      {/* Header with Menu */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.Settings className="text-gray-600" size={24} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-900 font-semibold text-sm border-b border-gray-100 transition-colors"
              >
                Logout
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-semibold text-sm transition-colors"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Currency Selection */}
      <div className="mb-8">
        <p className="text-gray-500 text-xs font-bold mb-3 tracking-wide">CURRENCY</p>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
          {['$', '€', '£', '¥', '₹', '₽', '₩', '₪', '₦', '₱', 'C$', 'A$', 'NZ$', 'CHF', 'kr', '₺', 'R$', 'ZAR', '₨', '฿'].map((currency) => (
            <button
              key={currency}
              onClick={() => updateSettings({...settings, currency})}
              className={`px-4 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 transition-all text-sm ${
                settings.currency === currency
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'border border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      {/* Income Mode Toggle Slider */}
      <div className="mb-8">
        <p className="text-gray-500 text-xs font-bold mb-3 tracking-wide">INCOME MODE</p>
        <div className="flex gap-4 items-center">
          <span className={`text-sm font-bold ${settings.incomeMode === 'salary' ? 'text-gray-900' : 'text-gray-400'}`}>
            Yearly
          </span>
          <div 
            onClick={() => updateSettings({...settings, incomeMode: settings.incomeMode === 'salary' ? 'hourly' : 'salary'})}
            className="relative w-16 h-8 bg-gray-200 rounded-full cursor-pointer transition-colors"
            style={{
              backgroundColor: settings.incomeMode === 'hourly' ? '#1f2937' : '#e5e7eb'
            }}
          >
            <div 
              className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300"
              style={{
                transform: settings.incomeMode === 'hourly' ? 'translateX(32px)' : 'translateX(0)'
              }}
            ></div>
          </div>
          <span className={`text-sm font-bold ${settings.incomeMode === 'hourly' ? 'text-gray-900' : 'text-gray-400'}`}>
            Hourly
          </span>
        </div>
      </div>

      {/* Yearly Salary / Hourly Rate */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-xs tracking-wider uppercase">
            {settings.incomeMode === 'salary' ? 'YEARLY SALARY' : 'HOURLY RATE'}
          </span>
          <Icons.Info size={16} className="text-gray-400" />
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center">
            <span className="text-gray-400 font-bold mr-2">{settings.currency}</span>
            <input 
              type="number" 
              value={settings.incomeMode === 'salary' ? settings.yearlySalary : settings.hourlyRate}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                if (settings.incomeMode === 'salary') {
                  updateSettings({...settings, yearlySalary: value, hourlyRate: Math.round((value / 2080) * 100) / 100});
                } else {
                  updateSettings({...settings, hourlyRate: value, yearlySalary: Math.round(value * 2080)});
                }
              }}
              className="w-full text-lg font-bold outline-none bg-transparent"
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'textfield',
              } as React.CSSProperties}
            />
          </div>
          {(settings.incomeMode === 'salary' && settings.yearlySalary > 0) || (settings.incomeMode === 'hourly' && settings.hourlyRate > 0) ? (
            <p className="text-xs text-gray-500 mt-2">
              {settings.incomeMode === 'salary' 
                ? `${Math.round((settings.yearlySalary / 2080) * 100) / 100}/hr`
                : `${Math.round(settings.hourlyRate * 2080)}/year`
              }
            </p>
          ) : null}
        </div>
      </div>

      {/* Investment Return */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-xs tracking-wider uppercase">INVESTMENT RETURN RATE %</span>
          <Icons.Info size={16} className="text-gray-400" />
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <input 
            type="number" 
            value={settings.investmentReturnRate}
            onChange={(e) => updateSettings({...settings, investmentReturnRate: parseFloat(e.target.value) || 0})}
            className="w-full text-lg font-bold outline-none bg-transparent"
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Retirement Age */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-xs tracking-wider uppercase">RETIREMENT AGE</span>
          <Icons.Info size={16} className="text-gray-400" />
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <input 
            type="number" 
            value={settings.retirementAge}
            onChange={(e) => updateSettings({...settings, retirementAge: parseFloat(e.target.value) || 0})}
            className="w-full text-lg font-bold outline-none bg-transparent"
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Birthday */}
      <div className="text-center mb-8">
        <span className="font-bold text-xs tracking-wider uppercase block mb-2">BIRTHDAY</span>
        <span className="text-gray-400 underline decoration-gray-300 underline-offset-4">
          {settings.birthday}
        </span>
      </div>

      {/* Save Button */}
      <button 
        onClick={handleSaveSettings}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
      >
        {saved ? '✓ Saved' : 'Save Settings'}
      </button>

      {/* Custom Alert Modal */}
      {alertModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-center">
              <p className="text-white font-bold">⚠️</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-900 font-semibold text-sm leading-relaxed">{alertModal.message}</p>
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
  );
};

export default Settings;

import React from 'react';
import { Icons } from './Icons';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItemClass = (isActive: boolean) => 
    `flex items-center justify-center p-2 rounded-full transition-colors ${isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`;

  // Hide nav on onboarding and auth screens
  if (
    currentView === View.ONBOARDING_GOALS || 
    currentView === View.ONBOARDING_INCOME || 
    currentView === View.ONBOARDING_BIRTHDAY ||
    currentView === View.LOGIN ||
    currentView === View.SIGNUP
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-20 px-4">
        <button 
          onClick={() => setView(View.ENVELOPES)}
          className={navItemClass(currentView === View.ENVELOPES)}
        >
          <Icons.DollarSign size={28} strokeWidth={2} />
        </button>

        <button 
          onClick={() => setView(View.HOME)}
          className={navItemClass(currentView === View.HOME)}
        >
          <Icons.Home size={28} strokeWidth={2} />
        </button>

        <button 
          onClick={() => setView(View.ADD_PURCHASE)}
          className={navItemClass(currentView === View.ADD_PURCHASE)}
        >
          <Icons.Plus size={28} strokeWidth={2} />
        </button>

        <button 
          onClick={() => setView(View.SETTINGS)}
          className={navItemClass(currentView === View.SETTINGS)}
        >
          <Icons.User size={28} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default BottomNav;

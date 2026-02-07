import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import { View, UserSettings, Goal } from './types';
import { dbService } from './services/dbService';
import Login from './views/Login';
import Signup from './views/Signup';
import OnboardingBirthday from './views/OnboardingBirthday';
import OnboardingGoals from './views/OnboardingGoals';
import OnboardingIncome from './views/OnboardingIncome';
import Dashboard from './views/Dashboard';
import Envelopes from './views/Envelopes';
import AddPurchase from './views/AddPurchase';
import Settings from './views/Settings';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  
  // User ID for database
  const [userId, setUserId] = useState<string | null>(null);
  
  // User Data State
  const [userSettings, setUserSettings] = useState<UserSettings>({
    currency: '$',
    hourlyMode: false,
    hourlyRate: 25,
    yearlySalary: 52000,
    investmentReturnRate: 10,
    retirementAge: 65,
    birthday: '2004-01-01',
    incomeMode: 'salary'
  });

  // Goals State
  const [userGoals, setUserGoals] = useState<Goal[]>([]);

  // Savings State
  const [savings, setSavings] = useState({
    moneySaved: 0,
    workTimeSaved: { hours: 0, minutes: 0 },
    investmentPotential: 0
  });

  // Load user data from database when userId changes
  useEffect(() => {
    const loadUserData = async () => {
      if (userId) {
        try {
          console.log('[App] Loading data for userId:', userId);
          const [settings, goals] = await Promise.all([
            dbService.getSettings(userId),
            dbService.getGoals(userId)
          ]);
          
          console.log('[App] Loaded settings:', settings);
          console.log('[App] Loaded goals:', goals);
          
          if (settings) {
            setUserSettings(settings);
          }
          if (goals) {
            setUserGoals(goals);
          }
        } catch (err) {
          console.error('[App] Failed to load user data:', err);
          // Continue with default settings if loading fails
        }
      }
    };

    loadUserData();
  }, [userId]);

  const renderView = () => {
    switch (currentView) {
      case View.LOGIN:
        return <Login 
          onLogin={(id) => {
            setUserId(id);
            setCurrentView(View.HOME);
          }} 
          onSignup={() => setCurrentView(View.SIGNUP)}
        />;
      case View.SIGNUP:
        return <Signup 
          onSignup={(id) => {
            setUserId(id);
            setCurrentView(View.ONBOARDING_BIRTHDAY);
          }}
          onBack={() => setCurrentView(View.LOGIN)}
        />;
      case View.ONBOARDING_BIRTHDAY:
        return <OnboardingBirthday 
          settings={userSettings} 
          updateSettings={setUserSettings}
          onNext={() => setCurrentView(View.ONBOARDING_INCOME)}
        />;
      case View.ONBOARDING_INCOME:
        return <OnboardingIncome 
          settings={userSettings} 
          updateSettings={setUserSettings}
          onNext={() => setCurrentView(View.ONBOARDING_GOALS)}
          onBack={() => setCurrentView(View.ONBOARDING_BIRTHDAY)}
        />;
      case View.ONBOARDING_GOALS:
        return <OnboardingGoals 
          onNext={(goals) => {
            setUserGoals(goals);
            // Save to database if user ID exists
            if (userId) {
              dbService.saveGoals(userId, goals);
              dbService.updateSettings(userId, userSettings);
            }
            setCurrentView(View.HOME);
          }} 
          onBack={() => setCurrentView(View.ONBOARDING_INCOME)}
        />;
      case View.HOME:
        return <Dashboard 
          settings={userSettings} 
          savings={savings}
          onAddSavings={(amount, hours, minutes) => {
            setSavings(prev => ({
              moneySaved: prev.moneySaved + amount,
              workTimeSaved: {
                hours: prev.workTimeSaved.hours + hours,
                minutes: (prev.workTimeSaved.minutes + minutes) % 60
              },
              investmentPotential: prev.investmentPotential + (amount * Math.pow(1.1, 5))
            }));
          }}
        />;
      case View.ENVELOPES:
        return <Envelopes settings={userSettings} goals={userGoals} />;
      case View.ADD_PURCHASE:
        return <AddPurchase 
          settings={userSettings}
          goals={userGoals}
          onAddSavings={(amount, hours, minutes, investment, category) => {
            console.log('[App] Adding savings:', { amount, hours, minutes, investment, category });
            
            setSavings(prev => ({
              moneySaved: prev.moneySaved + amount,
              workTimeSaved: {
                hours: prev.workTimeSaved.hours + hours + Math.floor((prev.workTimeSaved.minutes + minutes) / 60),
                minutes: (prev.workTimeSaved.minutes + minutes) % 60
              },
              investmentPotential: prev.investmentPotential + investment
            }));
            
            // Update goals savings
            const updatedGoals = userGoals.map(goal => {
              if (goal.title.includes(category) || category.includes(goal.title)) {
                console.log('[App] Updating goal:', goal.title, 'with amount:', amount);
                return {
                  ...goal,
                  savedAmount: (goal.savedAmount || 0) + amount
                };
              }
              return goal;
            });
            
            console.log('[App] Updated goals:', updatedGoals);
            setUserGoals(updatedGoals);
            
            // Save to database
            if (userId) {
              dbService.saveGoals(userId, updatedGoals);
            }
          }}
        />;
      case View.SETTINGS:
        return <Settings 
          settings={userSettings} 
          updateSettings={setUserSettings}
          userId={userId}
          onLogout={() => {
            setUserId(null);
            setCurrentView(View.LOGIN);
          }}
        />;
      default:
        return <Dashboard settings={userSettings} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F9F6] text-gray-900 flex flex-col items-center justify-center safe-area-top safe-area-bottom">
      {/* iPhone Container */}
      <div className="w-full max-w-md h-screen max-h-screen flex flex-col bg-[#F2F9F6]">
        {/* Content Area */}
        <main className="w-full flex-1 overflow-y-auto">
          {renderView()}
        </main>

        {/* Navigation */}
        <BottomNav currentView={currentView} setView={setCurrentView} />
      </div>
    </div>
  );
};

export default App;

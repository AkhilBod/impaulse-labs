export enum View {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  ONBOARDING_BIRTHDAY = 'ONBOARDING_BIRTHDAY',
  ONBOARDING_INCOME = 'ONBOARDING_INCOME',
  ONBOARDING_GOALS = 'ONBOARDING_GOALS',
  HOME = 'HOME',
  ENVELOPES = 'ENVELOPES',
  ADD_PURCHASE = 'ADD_PURCHASE',
  SETTINGS = 'SETTINGS',
}

export interface UserSettings {
  currency: string;
  hourlyMode: boolean;
  hourlyRate: number;
  yearlySalary: number;
  investmentReturnRate: number;
  retirementAge: number;
  birthday: string;
  incomeMode: 'salary' | 'hourly';
}

export interface Goal {
  id: string;
  title: string;
  icon: string; // Emoji or icon name
  selected: boolean;
  targetAmount?: number;
  savedAmount?: number;
}

export interface GoalWithTimeline extends Goal {
  timeline3Month: number;
  timeline6Month: number;
  timeline1Year: number;
}

export interface SavingsStat {
  moneySaved: number;
  workTimeSaved: string; // e.g., "1 hour, 7 minutes"
  investmentPotential: number;
}

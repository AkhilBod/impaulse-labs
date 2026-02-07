import { UserSettings, Goal } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

console.log('[dbService] Using API_BASE_URL:', API_BASE_URL);

export interface UserData {
  id: string;
  email: string;
  full_name: string;
  settings?: UserSettings;
  goals?: Goal[];
}

class DatabaseService {
  // Auth
  async signup(email: string, fullName: string, password: string): Promise<UserData> {
    const url = `${API_BASE_URL}/auth/signup`;
    console.log('[dbService] Signing up to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, password }),
    });

    console.log('[dbService] Response status:', response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.error('[dbService] Error response:', text);
      try {
        const error = JSON.parse(text);
        throw new Error(error.error || 'Signup failed');
      } catch (e) {
        throw new Error(`Signup failed: ${response.status} - ${text}`);
      }
    }

    const data = await response.json();
    return data.user;
  }

  async login(email: string, password: string): Promise<UserData> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    return data.user;
  }

  // Settings
  async getSettings(userId: string): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/settings`);

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    return response.json();
  }

  async updateSettings(userId: string, settings: UserSettings): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to update settings');
    }
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/goals`);

    if (!response.ok) {
      throw new Error('Failed to fetch goals');
    }

    return response.json();
  }

  async saveGoals(userId: string, goals: Goal[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goals }),
    });

    if (!response.ok) {
      throw new Error('Failed to save goals');
    }
  }

  // User
  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }
}

export const dbService = new DatabaseService();

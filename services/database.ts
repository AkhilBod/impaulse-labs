import { UserSettings, Goal } from '../types';

export interface UserData {
  id: string;
  email: string;
  fullName: string;
  settings: UserSettings;
  goals: Goal[];
  createdAt: string;
  updatedAt: string;
}

class Database {
  private dbKey = 'impaulse_users';

  // Get all users
  getAllUsers(): UserData[] {
    try {
      const data = localStorage.getItem(this.dbKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from database:', error);
      return [];
    }
  }

  // Get user by email
  getUserByEmail(email: string): UserData | null {
    const users = this.getAllUsers();
    return users.find(u => u.email === email) || null;
  }

  // Get user by ID
  getUserById(id: string): UserData | null {
    const users = this.getAllUsers();
    return users.find(u => u.id === id) || null;
  }

  // Create new user
  createUser(email: string, fullName: string, settings: UserSettings, goals: Goal[] = []): UserData {
    const users = this.getAllUsers();
    const newUser: UserData = {
      id: Date.now().toString(),
      email,
      fullName,
      settings,
      goals,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(this.dbKey, JSON.stringify(users));
    return newUser;
  }

  // Update user
  updateUser(id: string, updates: Partial<UserData>): UserData | null {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      id: users[userIndex].id, // Prevent ID change
      createdAt: users[userIndex].createdAt, // Prevent creation date change
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(this.dbKey, JSON.stringify(users));
    return users[userIndex];
  }

  // Update user settings
  updateUserSettings(id: string, settings: UserSettings): UserData | null {
    return this.updateUser(id, { settings });
  }

  // Update user goals
  updateUserGoals(id: string, goals: Goal[]): UserData | null {
    return this.updateUser(id, { goals });
  }

  // Delete user
  deleteUser(id: string): boolean {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(u => u.id !== id);

    if (filteredUsers.length === users.length) return false;

    localStorage.setItem(this.dbKey, JSON.stringify(filteredUsers));
    return true;
  }

  // Check if email exists
  emailExists(email: string): boolean {
    return this.getUserByEmail(email) !== null;
  }

  // Clear all data (for testing)
  clearDatabase(): void {
    localStorage.removeItem(this.dbKey);
  }
}

export const db = new Database();

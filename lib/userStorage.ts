// Shared in-memory storage for development
// In production, this should be replaced with a proper database

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  experienceLevel: string;
  isVerified: boolean;
  verificationCode: string;
  verificationExpiry: number;
  createdAt: number;
  lastLogin: number | null;
  sessionToken: string;
}

// Global storage that persists across API calls
const globalUsers: User[] = [];

export const UserStorage = {
  // Get all users
  getAll(): User[] {
    return globalUsers;
  },

  // Find user by username
  findByUsername(username: string): User | undefined {
    return globalUsers.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );
  },

  // Find user by email
  findByEmail(email: string): User | undefined {
    return globalUsers.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );
  },

  // Find user by ID
  findById(id: string): User | undefined {
    return globalUsers.find(user => user.id === id);
  },

  // Find user by verification code
  findByVerificationCode(code: string): User | undefined {
    return globalUsers.find(user => user.verificationCode === code);
  },

  // Add new user
  addUser(user: User): void {
    globalUsers.push(user);
  },

  // Update user
  updateUser(id: string, updates: Partial<User>): boolean {
    const userIndex = globalUsers.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      globalUsers[userIndex] = { ...globalUsers[userIndex], ...updates };
      return true;
    }
    return false;
  },

  // Delete user
  deleteUser(id: string): boolean {
    const userIndex = globalUsers.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      globalUsers.splice(userIndex, 1);
      return true;
    }
    return false;
  },

  // Get total count
  count(): number {
    return globalUsers.length;
  },

  // Get users for debugging (without sensitive data)
  getPublicUsers(): Array<Omit<User, 'passwordHash' | 'sessionToken' | 'verificationCode'>> {
    return globalUsers.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      experienceLevel: user.experienceLevel,
      isVerified: user.isVerified,
      verificationExpiry: user.verificationExpiry,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
  }
};

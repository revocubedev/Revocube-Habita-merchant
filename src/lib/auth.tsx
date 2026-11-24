import { createContext, useContext, useState } from 'react';
import type { AuthContextType, User } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readStoredUser = (): User | null => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  if (!token || !storedUser) return null;
  try {
    const parsed = JSON.parse(storedUser);
    const name =
      parsed.name ||
      [parsed.firstName, parsed.lastName].filter(Boolean).join(" ") ||
      parsed.email ||
      "Estate Manager";
    return {
      id: parsed.id || "",
      name,
      email: parsed.email || "",
      role: parsed.role ?? parsed.accountType ?? "",
      avatar: parsed.avatar,
    };
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Read the saved session synchronously so a page reload doesn't
  // render signed-out (and redirect to /login) before it's restored.
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!readStoredUser());

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('est_code');
    localStorage.removeItem('estates');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchMe, login as apiLogin, logout as apiLogout, User } from '../api/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sub_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, []);

  function clearSession() {
    apiLogout();
    setUser(null);
  }

  async function login(username: string, password: string) {
    const { user } = await apiLogin(username, password);
    setUser(user);
  }

  function logout() {
    clearSession();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}

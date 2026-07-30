import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../lib/api.js';

const AUTH_STORAGE_KEY = 'expenses-tracker-auth-token';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const persistToken = useCallback((nextToken) => {
    setToken(nextToken);

    if (nextToken) {
      localStorage.setItem(AUTH_STORAGE_KEY, nextToken);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const hydrateUser = useCallback(async (activeToken) => {
    const currentUser = await authApi.me(activeToken);
    setUser(currentUser);
    return currentUser;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      if (!token) {
        setIsAuthReady(true);
        return;
      }

      try {
        const currentUser = await authApi.me(token);

        if (isMounted) {
          setUser(currentUser);
        }
      } catch (_error) {
        if (isMounted) {
          persistToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    }

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [persistToken, token]);

  const login = useCallback(
    async (payload) => {
      setIsLoading(true);

      try {
        const result = await authApi.login(payload);
        persistToken(result.token);
        setUser(result.user);
        return result.user;
      } finally {
        setIsLoading(false);
      }
    },
    [persistToken]
  );

  const signup = useCallback(
    async (payload) => {
      setIsLoading(true);

      try {
        const result = await authApi.signup(payload);
        persistToken(result.token);
        setUser(result.user);
        return result.user;
      } finally {
        setIsLoading(false);
      }
    },
    [persistToken]
  );

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, [persistToken]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return null;
    }

    return hydrateUser(token);
  }, [hydrateUser, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isAuthReady,
      isLoading,
      login,
      signup,
      logout,
      refreshUser
    }),
    [isAuthReady, isLoading, login, logout, refreshUser, signup, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}

export { AuthProvider, useAuth };


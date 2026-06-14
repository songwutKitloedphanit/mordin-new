import { isAxiosError } from 'axios';
import {
  createContext,
  useState,
  ReactNode,
  use,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { env } from '@/configs/env';
import { localstorageKey } from '@/constants/localstorageKey';
import { login as authLogin } from '@/services/api/AuthApi';
import { getUserProfile } from '@/services/api/UserApi';
import { AuthRequest, AuthResponse } from '@/types/Auth';
import { BaseResponse } from '@/types/response';
import { User } from '@/types/User';
import { RoleToURL } from '@/utils/RoleToURL';

type AuthContextType = {
  user: User | null;
  login: (payload: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigator = useNavigate();

  const getProfile = useCallback(async () => {
    try {
      setIsUserLoading(true);
      const user = await getUserProfile();
      if (user) {
        setUser(user.data);
        setError(null);
        return user.data;
      }
    } catch (error) {
      if (isAxiosError<BaseResponse>(error)) {
        console.error('Failed to fetch user profile:', error);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const accessToken = localStorage.getItem(localstorageKey.accessToken);
      if (accessToken) {
        await getProfile();
      } else {
        navigator('/login');
      }
      setIsInitialized(true);
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProfile]);

  const login = useCallback(
    async (payload: AuthRequest) => {
      try {
        setIsLoginLoading(true);
        const response = await authLogin(payload);

        if (response.data) {
          localStorage.setItem(
            localstorageKey.accessToken,
            response.data.access_token
          );

          const profile = await getProfile();
          if (profile) {
            window.location.href = `${env.BASE_URL}${RoleToURL[profile.role]}`;
          } else {
            window.location.href = `${env.BASE_URL}`;
          }
        }
      } catch (error) {
        if (isAxiosError<AuthResponse>(error)) {
          console.error('Login error:', error);
          switch (error.response?.status) {
            case 401:
              setError('Invalid username or password');
              break;
            default:
              setError('Please try again later');
          }
        }
      } finally {
        setIsLoginLoading(false);
      }
    },
    [getProfile]
  );

  const logout = useCallback(async () => {
    localStorage.removeItem(localstorageKey.accessToken);
    setUser(null);
    navigator('/login');
  }, [navigator]);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoggedIn: !!localStorage.getItem(localstorageKey.accessToken),
      isLoading: isLoginLoading || isUserLoading || !isInitialized,
      error,
    }),
    [user, login, logout, isLoginLoading, isUserLoading, isInitialized, error]
  );

  return <AuthContext value={contextValue}>{children}</AuthContext>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

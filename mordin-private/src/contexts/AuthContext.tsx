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

import { localstorageKey } from '@/constants/localstorageKey';
import { login as authLogin } from '@/services/api/AuthApi';
import { getUserProfile } from '@/services/api/UserApi';
import { AuthRequest, AuthResponse } from '@/types/Auth';
import { BaseResponse } from '@/types/response';
import { User } from '@/types/User';
import { buildPrivatePath } from '@/utils/privateBaseUrl';
import { DASHBOARD_URL } from '@/utils/RoleToURL';

type AuthContextType = {
  user: User | null;
  login: (payload: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | undefined>;
  isLoggedIn: boolean;
  isLoading: boolean;
  /**
   * True only during the very first auth resolution after the app mounts
   * (before the profile has been fetched once). Use this for the full-page
   * loading skeleton. Unlike `isLoading`, it does NOT go back to true for
   * later profile refreshes, so it won't cover an already-rendered layout.
   */
  isInitializing: boolean;
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

  const clearAuthState = useCallback(
    (redirectToLogin = true) => {
      localStorage.removeItem(localstorageKey.accessToken);
      setUser(null);
      if (redirectToLogin) {
        navigator('/login', { replace: true });
      }
    },
    [navigator]
  );

  const getProfile = useCallback(async () => {
    try {
      setIsUserLoading(true);
      const response = await getUserProfile();
      if (response.data) {
        setUser(response.data);
        setError(null);
        return response.data;
      }
      clearAuthState();
    } catch (error) {
      if (isAxiosError<BaseResponse>(error)) {
        console.error('Failed to fetch user profile:', error);
      } else {
        console.error('An unexpected error occurred:', error);
      }
      clearAuthState();
    } finally {
      setIsUserLoading(false);
    }
  }, [clearAuthState]);

  useEffect(() => {
    const initialize = async () => {
      const accessToken = localStorage.getItem(localstorageKey.accessToken);
      if (accessToken) {
        await getProfile();
      } else {
        clearAuthState(false);
      }
      setIsInitialized(true);
    };
    initialize();
  }, [clearAuthState, getProfile]);

  const login = useCallback(
    async (payload: AuthRequest) => {
      try {
        setIsLoginLoading(true);
        setError(null);
        const response = await authLogin(payload);

        if (response.data) {
          localStorage.setItem(
            localstorageKey.accessToken,
            response.data.access_token
          );

          const profile = await getProfile();
          if (profile) {
            window.location.href = buildPrivatePath(DASHBOARD_URL);
          } else {
            clearAuthState();
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
    [clearAuthState, getProfile]
  );

  const logout = useCallback(async () => {
    clearAuthState();
  }, [clearAuthState]);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      refreshProfile: getProfile,
      isLoggedIn: !!user,
      isLoading: isLoginLoading || isUserLoading || !isInitialized,
      isInitializing: !isInitialized,
      error,
    }),
    [
      user,
      login,
      logout,
      getProfile,
      isLoginLoading,
      isUserLoading,
      isInitialized,
      error,
    ]
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

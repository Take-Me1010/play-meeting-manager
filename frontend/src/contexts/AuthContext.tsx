import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { gasApi } from "../api/gasApi";

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (name: string, role: "player" | "observer", style: "環境" | "カジュアル") => Promise<void>;
  updateUser: (updates: Partial<Pick<User, "name" | "role" | "style">>) => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 現在のユーザー情報を取得
  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentUser = await gasApi.getCurrentUser();
      setUser(currentUser);

      // 管理者権限の確認（開発環境のみ）
      if (import.meta.env.DEV) {
        const adminStatus = await gasApi.checkIsAdmin!();
        setIsAdmin(adminStatus);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ユーザー情報の取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回ロード時にユーザー情報を取得
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // ログイン（新規ユーザー登録）
  const login = useCallback(
    async (name: string, role: "player" | "observer", style: "環境" | "カジュアル") => {
      setIsLoading(true);
      setError(null);
      try {
        const newUser = await gasApi.registerUser(name, role, style);
        setUser(newUser);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "ユーザー登録に失敗しました",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // ユーザー情報更新
  const updateUser = useCallback(
    async (updates: Partial<Pick<User, "name" | "role" | "style">>) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedUser = await gasApi.updateUser(updates);
        setUser(updatedUser);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "ユーザー情報の更新に失敗しました",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        error,
        login,
        updateUser,
        refresh: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

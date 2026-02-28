import {
  createContext,
} from "react";
import type { User } from "../../types";

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (name: string, role: "player" | "observer", style: "環境" | "カジュアル") => Promise<void>;
  updateUser: (updates: Partial<Pick<User, "name" | "role" | "style">>) => Promise<void>;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

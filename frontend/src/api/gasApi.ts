import type { User, Match } from "../types";

interface GasApiInterface {
  initializeSpreadsheet(): Promise<void>;
  registerUser(name: string, role: "player" | "observer", style: "環境" | "カジュアル"): Promise<User>;
  getCurrentUser(): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  updateUser(
    updates: Partial<Pick<User, "name" | "role" | "style">>,
  ): Promise<User | null>;
  getUserById(id: number): Promise<User | null>;
  getAllMatches(): Promise<Match[]>;
  createMatch(round: number, playerIds: number[]): Promise<number>;
  updateMatchPlayers(matchId: number, playerIds: number[]): Promise<boolean>;
  deleteMatch(matchId: number): Promise<boolean>;
  reportMatchResult(matchId: number, winnerId: number): Promise<boolean>;
  getCurrentUserMatches(): Promise<Match[]>;
}

class ProductionGasApi implements GasApiInterface {
  private callGas<T, S extends keyof google.script.IRun>(funcName: S, ...args: Parameters<google.script.IRun[S]>): Promise<T> {
    return new Promise((resolve, reject) => {
      google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      // @ts-expect-error TS2556
        [funcName](...args);
    });
  }

  async initializeSpreadsheet(): Promise<void> {
    return this.callGas("initializeSpreadsheet");
  }

  async registerUser(name: string, role: "player" | "observer", style: "環境" | "カジュアル"): Promise<User> {
    return this.callGas("registerUser", name, role, style);
  }

  async getCurrentUser(): Promise<User | null> {
    return this.callGas("getCurrentUser");
  }

  async getAllUsers(): Promise<User[]> {
    return this.callGas("getAllUsers");
  }

  async updateUser(
    updates: Partial<Pick<User, "name" | "role" | "style">>,
  ): Promise<User | null> {
    return this.callGas("updateUser", updates);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.callGas("getUserById", id);
  }

  async getAllMatches(): Promise<Match[]> {
    return this.callGas("getAllMatches");
  }

  async createMatch(round: number, playerIds: number[]): Promise<number> {
    return this.callGas("createMatch", round, playerIds);
  }

  async updateMatchPlayers(matchId: number, playerIds: number[]): Promise<boolean> {
    return this.callGas("updateMatchPlayers", matchId, playerIds);
  }

  async deleteMatch(matchId: number): Promise<boolean> {
    return this.callGas("deleteMatch", matchId);
  }

  async reportMatchResult(matchId: number, winnerId: number): Promise<boolean> {
    return this.callGas("reportMatchResult", matchId, winnerId);
  }

  async getCurrentUserMatches(): Promise<Match[]> {
    return this.callGas("getCurrentUserMatches");
  }
}

class MockGasApi implements GasApiInterface {
  private baseUrl = "http://127.0.0.1:3001/api";

  private async fetchApi<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(error.error || "API Error");
    }

    return response.json();
  }

  async initializeSpreadsheet(): Promise<void> {
    await this.fetchApi("/initializeSpreadsheet", { method: "POST" });
  }

  async registerUser(name: string, role: "player" | "observer", style: "環境" | "カジュアル"): Promise<User> {
    return this.fetchApi("/registerUser", {
      method: "POST",
      body: JSON.stringify({ name, role, style }),
    });
  }

  async getCurrentUser(): Promise<User | null> {
    return this.fetchApi("/getCurrentUser");
  }

  async getAllUsers(): Promise<User[]> {
    return this.fetchApi("/getAllUsers");
  }

  async updateUser(
    updates: Partial<Pick<User, "name" | "role" | "style">>,
  ): Promise<User | null> {
    return this.fetchApi("/updateUser", {
      method: "POST",
      body: JSON.stringify(updates),
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return this.fetchApi(`/getUserById?id=${id}`);
  }

  async getAllMatches(): Promise<Match[]> {
    return this.fetchApi("/getAllMatches");
  }

  async createMatch(round: number, playerIds: number[]): Promise<number> {
    return this.fetchApi("/createMatch", {
      method: "POST",
      body: JSON.stringify({ round, playerIds }),
    });
  }

  async updateMatchPlayers(matchId: number, playerIds: number[]): Promise<boolean> {
    return this.fetchApi("/updateMatchPlayers", {
      method: "POST",
      body: JSON.stringify({ matchId, playerIds }),
    });
  }

  async deleteMatch(matchId: number): Promise<boolean> {
    return this.fetchApi("/deleteMatch", {
      method: "POST",
      body: JSON.stringify({ matchId }),
    });
  }

  async reportMatchResult(matchId: number, winnerId: number): Promise<boolean> {
    return this.fetchApi("/reportMatchResult", {
      method: "POST",
      body: JSON.stringify({ matchId, winnerId }),
    });
  }

  async getCurrentUserMatches(): Promise<Match[]> {
    return this.fetchApi("/getCurrentUserMatches");
  }

  async checkIsAdmin(): Promise<boolean> {
    return this.fetchApi("/checkIsAdmin");
  }

  async getPlayersForMatch(): Promise<User[]> {
    return this.fetchApi("/getPlayersForMatch");
  }

  async getAssignedPlayerIds(round: number): Promise<number[]> {
    return this.fetchApi("/getAssignedPlayerIds", {
      method: "POST",
      body: JSON.stringify({ round }),
    });
  }

  // 開発用メソッド
  async switchUser(userId: number): Promise<User> {
    return this.fetchApi("/dev/switchUser", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async setAdminMode(isAdmin: boolean): Promise<{ isAdminMode: boolean }> {
    return this.fetchApi("/dev/setAdminMode", {
      method: "POST",
      body: JSON.stringify({ isAdmin }),
    });
  }
}

// 開発環境かどうかを判定
const isDevelopment = import.meta.env.DEV;

export const gasApi: GasApiInterface & {
  checkIsAdmin?: () => Promise<boolean>;
  switchUser?: (userId: number) => Promise<User>;
  setAdminMode?: (isAdmin: boolean) => Promise<{ isAdminMode: boolean }>;
} = isDevelopment ? new MockGasApi() : new ProductionGasApi();

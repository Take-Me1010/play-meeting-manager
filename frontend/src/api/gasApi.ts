import type { User, Match } from '../types';

interface GasApiInterface {
    initializeSpreadsheet(): Promise<void>;
    registerUser(name: string, role: 'player' | 'observer'): Promise<User>;
    getCurrentUser(): Promise<User | null>;
    getAllUsers(): Promise<User[]>;
    updateUser(updates: Partial<Pick<User, 'name' | 'role'>>): Promise<User | null>;
    getUserById(id: number): Promise<User | null>;
    getMatchesByRound(round: number): Promise<Match[]>;
    getAllMatches(): Promise<Match[]>;
    getMatch(id: number): Promise<Match | null>;
    createMatch(round: number, playerIds: number[]): Promise<number>;
    reportMatchResult(matchId: number, winnerId: number): Promise<boolean>;
    getCurrentUserMatches(): Promise<Match[]>;
}

class ProductionGasApi implements GasApiInterface {
    private callGas<T>(funcName: string, ...args: any[]): Promise<T> {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            google.script.run
                .withSuccessHandler(resolve)
                .withFailureHandler(reject)
                [funcName](...args);
        });
    }

    async initializeSpreadsheet(): Promise<void> {
        return this.callGas('initializeSpreadsheet');
    }

    async registerUser(name: string, role: 'player' | 'observer'): Promise<User> {
        return this.callGas('registerUser', name, role);
    }

    async getCurrentUser(): Promise<User | null> {
        return this.callGas('getCurrentUser');
    }

    async getAllUsers(): Promise<User[]> {
        return this.callGas('getAllUsers');
    }

    async updateUser(updates: Partial<Pick<User, 'name' | 'role'>>): Promise<User | null> {
        return this.callGas('updateUser', updates);
    }

    async getUserById(id: number): Promise<User | null> {
        return this.callGas('getUserById', id);
    }

    async getMatchesByRound(round: number): Promise<Match[]> {
        return this.callGas('getMatchesByRound', round);
    }

    async getAllMatches(): Promise<Match[]> {
        return this.callGas('getAllMatches');
    }

    async getMatch(id: number): Promise<Match | null> {
        return this.callGas('getMatch', id);
    }

    async createMatch(round: number, playerIds: number[]): Promise<number> {
        return this.callGas('createMatch', round, playerIds);
    }

    async reportMatchResult(matchId: number, winnerId: number): Promise<boolean> {
        return this.callGas('reportMatchResult', matchId, winnerId);
    }

    async getCurrentUserMatches(): Promise<Match[]> {
        return this.callGas('getCurrentUserMatches');
    }
}

class MockGasApi implements GasApiInterface {
    private baseUrl = 'http://127.0.0.1:3001/api';

    private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Network error' }));
            throw new Error(error.error || 'API Error');
        }

        return response.json();
    }

    async initializeSpreadsheet(): Promise<void> {
        await this.fetchApi('/initializeSpreadsheet', { method: 'POST' });
    }

    async registerUser(name: string, role: 'player' | 'observer'): Promise<User> {
        return this.fetchApi('/registerUser', {
            method: 'POST',
            body: JSON.stringify({ name, role }),
        });
    }

    async getCurrentUser(): Promise<User | null> {
        return this.fetchApi('/getCurrentUser');
    }

    async getAllUsers(): Promise<User[]> {
        return this.fetchApi('/getAllUsers');
    }

    async updateUser(updates: Partial<Pick<User, 'name' | 'role'>>): Promise<User | null> {
        return this.fetchApi('/updateUser', {
            method: 'POST',
            body: JSON.stringify(updates),
        });
    }

    async getUserById(id: number): Promise<User | null> {
        return this.fetchApi(`/getUserById?id=${id}`);
    }

    async getMatchesByRound(round: number): Promise<Match[]> {
        return this.fetchApi('/getMatchesByRound', {
            method: 'POST',
            body: JSON.stringify({ round }),
        });
    }

    async getAllMatches(): Promise<Match[]> {
        return this.fetchApi('/getAllMatches');
    }

    async getMatch(id: number): Promise<Match | null> {
        return this.fetchApi(`/getMatch?id=${id}`);
    }

    async createMatch(round: number, playerIds: number[]): Promise<number> {
        return this.fetchApi('/createMatch', {
            method: 'POST',
            body: JSON.stringify({ round, playerIds }),
        });
    }

    async reportMatchResult(matchId: number, winnerId: number): Promise<boolean> {
        return this.fetchApi('/reportMatchResult', {
            method: 'POST',
            body: JSON.stringify({ matchId, winnerId }),
        });
    }

    async getCurrentUserMatches(): Promise<Match[]> {
        return this.fetchApi('/getCurrentUserMatches');
    }

    // 開発用メソッド
    async switchUser(userId: number): Promise<User> {
        return this.fetchApi('/dev/switchUser', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
    }
}

// 開発環境かどうかを判定
const isDevelopment = import.meta.env.DEV;

export const gasApi: GasApiInterface & { switchUser?: (userId: number) => Promise<User> } =
    isDevelopment ? new MockGasApi() : new ProductionGasApi();
import { MatchRepository } from '../repogitory/matches';
import { UserRepository } from '../repogitory/users';
import { type Match } from '../entity';

export class MatchController {
    private matchRepo = new MatchRepository();
    private userRepo = new UserRepository();

    getMatchesByRound(round: number): Match[] {
        const matches = this.matchRepo.findByRound(round);

        return matches.map(match => this.enrichMatchWithUserData(match));
    }

    getAllMatches(): Match[] {
        const matches = this.matchRepo.findAll();

        return matches.map(match => this.enrichMatchWithUserData(match));
    }

    getMatch(id: number): Match | null {
        const match = this.matchRepo.findById(id);

        if (!match) {
            return null;
        }

        return this.enrichMatchWithUserData(match);
    }

    createMatch(round: number, playerIds: number[]): number {
        if (playerIds.length !== 2) {
            throw new Error('対戦は2人のプレイヤーで行われる必要があります');
        }

        for (const playerId of playerIds) {
            const user = this.userRepo.findById(playerId);
            if (!user) {
                throw new Error(`ユーザーID ${playerId} が見つかりません`);
            }
            if (user.role !== 'player') {
                throw new Error(`ユーザーID ${playerId} は対戦者ではありません`);
            }
        }

        return this.matchRepo.createMatch(round, playerIds);
    }

    reportMatchResult(matchId: number, winnerId: number): boolean {
        const match = this.matchRepo.findById(matchId);
        if (!match) {
            throw new Error(`試合ID ${matchId} が見つかりません`);
        }

        if (match.isFinished) {
            throw new Error('この試合は既に終了しています');
        }

        const isPlayerInMatch = match.players.some(player => player.id === winnerId);
        if (!isPlayerInMatch) {
            throw new Error('勝者は試合参加者である必要があります');
        }

        return this.matchRepo.setMatchResult(matchId, winnerId);
    }

    getCurrentUserMatches(): Match[] {
        const email = Session.getActiveUser().getEmail();
        if (!email) {
            throw new Error('ユーザーが認証されていません');
        }

        const currentUser = this.userRepo.findByEmail(email);
        if (!currentUser) {
            throw new Error('ユーザーが見つかりません');
        }

        const allMatches = this.getAllMatches();
        return allMatches.filter(match =>
            match.players.some(player => player.id === currentUser.id)
        );
    }

    private enrichMatchWithUserData(match: Match): Match {
        const enrichedPlayers = match.players.map(player => {
            const userData = this.userRepo.findById(player.id);
            return userData || player;
        });

        if (match.isFinished && match.winner) {
            const winnerData = this.userRepo.findById(match.winner.id);
            return {
                ...match,
                players: enrichedPlayers,
                winner: winnerData || match.winner
            };
        }

        return {
            ...match,
            players: enrichedPlayers
        };
    }
}

// GAS用のグローバル関数をエクスポート
export function getMatchesByRound(round: number) {
    const controller = new MatchController();
    return controller.getMatchesByRound(round);
}

export function getAllMatches() {
    const controller = new MatchController();
    return controller.getAllMatches();
}

export function getMatch(id: number) {
    const controller = new MatchController();
    return controller.getMatch(id);
}

export function createMatch(round: number, playerIds: number[]) {
    const controller = new MatchController();
    return controller.createMatch(round, playerIds);
}

export function reportMatchResult(matchId: number, winnerId: number) {
    const controller = new MatchController();
    return controller.reportMatchResult(matchId, winnerId);
}

export function getCurrentUserMatches() {
    const controller = new MatchController();
    return controller.getCurrentUserMatches();
}
import { UserRepository } from '../repogitory/users';
import { MatchRepository } from '../repogitory/matches';
import { type User } from '../entity';

type MatchInput = {
    round: number;
    player1Id: number;
    player2Id: number;
};

type CreateMatchesResult = {
    success: boolean;
    createdMatchIds: number[];
    errors: string[];
};

export class AdminController {
    private userRepo = new UserRepository();
    private matchRepo = new MatchRepository();

    getPlayersForMatch(): User[] {
        return this.userRepo.findAll().filter(user => user.role === 'player');
    }

    getAssignedPlayerIds(round: number): number[] {
        return this.matchRepo.getAssignedPlayerIds(round);
    }

    createMatchesAsAdmin(matches: MatchInput[]): CreateMatchesResult {

        const createdMatchIds: number[] = [];
        const errors: string[] = [];

        for (const match of matches) {
            try {
                // プレイヤーの存在確認
                const player1 = this.userRepo.findById(match.player1Id);
                const player2 = this.userRepo.findById(match.player2Id);

                if (!player1) {
                    errors.push(`プレイヤーID ${match.player1Id} が見つかりません`);
                    continue;
                }
                if (!player2) {
                    errors.push(`プレイヤーID ${match.player2Id} が見つかりません`);
                    continue;
                }

                // プレイヤーロールの確認
                if (player1.role !== 'player') {
                    errors.push(`${player1.name} は対戦者ではありません`);
                    continue;
                }
                if (player2.role !== 'player') {
                    errors.push(`${player2.name} は対戦者ではありません`);
                    continue;
                }

                // 同じプレイヤー同士の対戦チェック
                if (match.player1Id === match.player2Id) {
                    errors.push(`同じプレイヤー同士の対戦は作成できません`);
                    continue;
                }

                // 重複チェック（このラウンドで既に対戦が組まれているか）
                const assignedIds = this.matchRepo.getAssignedPlayerIds(match.round);
                if (assignedIds.includes(match.player1Id)) {
                    errors.push(`${player1.name} は既にラウンド${match.round}に参加しています`);
                    continue;
                }
                if (assignedIds.includes(match.player2Id)) {
                    errors.push(`${player2.name} は既にラウンド${match.round}に参加しています`);
                    continue;
                }

                // 対戦作成
                const matchId = this.matchRepo.createMatch(match.round, [match.player1Id, match.player2Id]);
                createdMatchIds.push(matchId);
            } catch (err) {
                errors.push(err instanceof Error ? err.message : '不明なエラー');
            }
        }

        return {
            success: errors.length === 0,
            createdMatchIds,
            errors
        };
    }
}

// GAS用のグローバル関数をエクスポート
export function getPlayersForMatch(): User[] {
    const controller = new AdminController();
    return controller.getPlayersForMatch();
}

export function getAssignedPlayerIds(round: number): number[] {
    const controller = new AdminController();
    return controller.getAssignedPlayerIds(round);
}

export function createMatchesAsAdmin(matches: MatchInput[]): CreateMatchesResult {
    const controller = new AdminController();
    return controller.createMatchesAsAdmin(matches);
}

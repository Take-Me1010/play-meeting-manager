import { getSheet } from '../../spreadsheet';
import { type Match, type User } from '../../entity';

export class MatchRepository {
    private matchesSheet = getSheet('matches');
    private opponentsSheet = getSheet('match_opponents');
    private resultsSheet = getSheet('match_results');

    generateId(): number {
        const lastRow = this.matchesSheet.getLastRow();
        if (lastRow <= 1) {
            return 1;
        }

        const idColumn = this.matchesSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        const ids = idColumn.map(row => Number(row[0])).filter(id => !isNaN(id));
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }

    findByRound(round: number): Match[] {
        const matchesData = this.matchesSheet.getDataRange().getValues();
        const opponentsData = this.opponentsSheet.getDataRange().getValues();
        const resultsData = this.resultsSheet.getDataRange().getValues();

        const matches: Match[] = [];

        for (let i = 1; i < matchesData.length; i++) {
            const row = matchesData[i];
            const matchId = Number(row[0]);
            const matchRound = Number(row[1]);

            if (matchRound === round) {
                const players = this.getMatchPlayers(matchId, opponentsData);
                const result = this.getMatchResult(matchId, resultsData);

                if (result && result.finished) {
                    matches.push({
                        id: matchId,
                        round: matchRound,
                        players: players,
                        winner: result.winner,
                        isFinished: true
                    });
                } else {
                    matches.push({
                        id: matchId,
                        round: matchRound,
                        players: players,
                        winner: null,
                        isFinished: false
                    });
                }
            }
        }

        return matches;
    }

    findById(id: number): Match | null {
        const matchesData = this.matchesSheet.getDataRange().getValues();
        const opponentsData = this.opponentsSheet.getDataRange().getValues();
        const resultsData = this.resultsSheet.getDataRange().getValues();

        for (let i = 1; i < matchesData.length; i++) {
            const row = matchesData[i];
            const matchId = Number(row[0]);

            if (matchId === id) {
                const round = Number(row[1]);
                const players = this.getMatchPlayers(matchId, opponentsData);
                const result = this.getMatchResult(matchId, resultsData);

                if (result && result.finished) {
                    return {
                        id: matchId,
                        round: round,
                        players: players,
                        winner: result.winner,
                        isFinished: true
                    };
                } else {
                    return {
                        id: matchId,
                        round: round,
                        players: players,
                        winner: null,
                        isFinished: false
                    };
                }
            }
        }

        return null;
    }

    findAll(): Match[] {
        const matchesData = this.matchesSheet.getDataRange().getValues();
        const opponentsData = this.opponentsSheet.getDataRange().getValues();
        const resultsData = this.resultsSheet.getDataRange().getValues();

        const matches: Match[] = [];

        for (let i = 1; i < matchesData.length; i++) {
            const row = matchesData[i];
            const matchId = Number(row[0]);
            const round = Number(row[1]);

            if (row[0] && row[1]) {
                const players = this.getMatchPlayers(matchId, opponentsData);
                const result = this.getMatchResult(matchId, resultsData);

                if (result && result.finished) {
                    matches.push({
                        id: matchId,
                        round: round,
                        players: players,
                        winner: result.winner,
                        isFinished: true
                    });
                } else {
                    matches.push({
                        id: matchId,
                        round: round,
                        players: players,
                        winner: null,
                        isFinished: false
                    });
                }
            }
        }

        return matches;
    }

    createMatch(round: number, playerIds: number[]): number {
        const matchId = this.generateId();

        this.matchesSheet.appendRow([matchId, round, false]);

        for (const playerId of playerIds) {
            this.opponentsSheet.appendRow([matchId, playerId]);
        }

        // match_resultsには何も追加しない（結果登録時にINSERTする）

        return matchId;
    }

    setMatchResult(matchId: number, winnerId: number): boolean {
        const resultsData = this.resultsSheet.getDataRange().getValues();

        // 既存の結果データがあるかチェック
        for (let i = 1; i < resultsData.length; i++) {
            const row = resultsData[i];
            if (Number(row[0]) === matchId) {
                // 既に結果が存在する場合はエラー（上書き不可）
                throw new Error(`試合ID ${matchId} の結果は既に登録されています`);
            }
        }

        // 新しく結果を追加（INSERT のみ）
        this.resultsSheet.appendRow([matchId, winnerId, true]);
        this.updateMatchFinishedStatus(matchId, true);
        return true;
    }

    private updateMatchFinishedStatus(matchId: number, finished: boolean): void {
        const matchesData = this.matchesSheet.getDataRange().getValues();

        for (let i = 1; i < matchesData.length; i++) {
            const row = matchesData[i];
            if (Number(row[0]) === matchId) {
                // 行データを3列分確保（id, round, finished）
                const updatedRow = [
                    row[0] || matchId,
                    row[1] || 1, // roundが未設定の場合は1
                    finished
                ];

                const rowRange = this.matchesSheet.getRange(i + 1, 1, 1, 3);
                rowRange.setValues([updatedRow]);
                break;
            }
        }
    }

    private getMatchPlayers(matchId: number, opponentsData: any[][]): User[] {
        const players: User[] = [];

        for (let i = 1; i < opponentsData.length; i++) {
            const row = opponentsData[i];
            if (Number(row[0]) === matchId) {
                const userId = Number(row[1]);
                players.push({ id: userId, name: '', role: 'player' });
            }
        }

        return players;
    }

    private getMatchResult(matchId: number, resultsData: any[][]): { winner: User, finished: boolean } | null {
        for (let i = 1; i < resultsData.length; i++) {
            const row = resultsData[i];
            if (Number(row[0]) === matchId) {
                const winnerId = row[1] ? Number(row[1]) : null;
                const finished = Boolean(row[2]);

                if (winnerId && finished) {
                    return {
                        winner: { id: winnerId, name: '', role: 'player' },
                        finished: true
                    };
                }

                return { winner: null as any, finished: false };
            }
        }

        return null;
    }

    /**
     * 指定ラウンドで既に対戦が組まれているプレイヤーIDのリストを取得
     */
    getAssignedPlayerIds(round: number): number[] {
        const matchesData = this.matchesSheet.getDataRange().getValues();
        const opponentsData = this.opponentsSheet.getDataRange().getValues();

        const matchIdsInRound: number[] = [];

        // 指定ラウンドの試合IDを取得
        for (let i = 1; i < matchesData.length; i++) {
            const row = matchesData[i];
            const matchId = Number(row[0]);
            const matchRound = Number(row[1]);

            if (matchRound === round) {
                matchIdsInRound.push(matchId);
            }
        }

        // そのラウンドの試合に参加しているプレイヤーIDを取得
        const playerIds: number[] = [];
        for (let i = 1; i < opponentsData.length; i++) {
            const row = opponentsData[i];
            const matchId = Number(row[0]);
            const playerId = Number(row[1]);

            if (matchIdsInRound.includes(matchId)) {
                playerIds.push(playerId);
            }
        }

        return playerIds;
    }
}
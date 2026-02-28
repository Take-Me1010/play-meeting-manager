import { getSheet } from "../../spreadsheet";
import { type Match, type User } from "../../entity";
import type { UserRepository } from "../users";

export class MatchRepository {
  private matchesSheet = getSheet("matches");
  /**[id, round, finished] */
  private getRawMatches() {
    // 1行目はヘッダーなのでスキップ
    return this.matchesSheet.getDataRange().getValues().slice(1) as [
      number,
      number,
      boolean | null,
    ][];
  }
  private opponentsSheet = getSheet("match_opponents");
  /**[match_id, user_id] */
  private getRawOpponents() {
    // 1行目はヘッダーなのでスキップ
    return this.opponentsSheet.getDataRange().getValues().slice(1) as [number, number][];
  }
  private resultsSheet = getSheet("match_results");
  /**[match_id, winner_id, finished] */
  private getRawResults() {
    // 1行目はヘッダーなのでスキップ
    return this.resultsSheet.getDataRange().getValues().slice(1) as [
      number,
      number | null,
      boolean,
    ][];
  }

  private joinUsers(
    /**[id, round, finished] */
    matchesRawData: [number, number, boolean | null][],
  ): Match[] {
    const rawOpponents = this.getRawOpponents();
    const winnerByRoundId = this.getRawResults().reduce(
      (acc, row) => {
        const matchId = row[0];
        const winnerId = row[1];
        if (winnerId !== null) {
          acc[matchId] = winnerId;
        }
        return acc;
      },
      {} as Record<number, number | undefined>,
    );

    const users = this.userRepo.findAll().reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {} as Record<number, User>,
    );

    return matchesRawData.map(([matchId, round, _]): Match => {
      const players = rawOpponents
        .filter(([mId]) => mId === matchId)
        .map(([, userId]) => users[userId]);
      const winner_id = winnerByRoundId[matchId];
      const winnerInfo = winner_id
        ? ({ winner: users[winner_id], isFinished: true } as const)
        : ({ winner: null, isFinished: false } as const);
      return {
        id: matchId,
        round,
        players,
        ...winnerInfo,
      };
    });
  }

  constructor(private userRepo: UserRepository) {}

  generateId(): number {
    const lastRow = this.matchesSheet.getLastRow();
    if (lastRow <= 1) {
      return 1;
    }

    const idColumn = this.matchesSheet
      .getRange(2, 1, lastRow - 1, 1)
      .getValues();
    const ids = idColumn
      .map((row) => Number(row[0]))
      .filter((id) => !isNaN(id));
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }

  findByRound(round: number): Match[] {
    const raw = this.getRawMatches().filter(([, r]) => r === round);
    return this.joinUsers(raw);
  }

  findById(id: number): Match | null {
    const raw = this.getRawMatches().find(([matchId]) => matchId === id);
    if (!raw) {
      return null;
    }
    return this.joinUsers([raw])[0];
  }

  findAll(): Match[] {
    const raw = this.getRawMatches();
    return this.joinUsers(raw);
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

  private deleteRowById(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    id: number,
  ): void {
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (Number(data[i][0]) === id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  }

  private deleteRowsByMatchId(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    matchId: number,
  ): void {
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (Number(data[i][0]) === matchId) {
        sheet.deleteRow(i + 1);
      }
    }
  }

  deleteMatch(matchId: number): boolean {
    const match = this.findById(matchId);
    if (!match) {
      throw new Error(`試合ID ${matchId} が見つかりません`);
    }
    if (match.isFinished) {
      throw new Error("終了済みの試合は削除できません");
    }

    this.deleteRowById(this.matchesSheet, matchId);
    this.deleteRowsByMatchId(this.opponentsSheet, matchId);
    this.deleteRowsByMatchId(this.resultsSheet, matchId);

    return true;
  }

  updateMatchPlayers(matchId: number, playerIds: number[]): boolean {
    if (playerIds.length !== 2) {
      throw new Error("対戦は2人のプレイヤーで行われる必要があります");
    }

    const match = this.findById(matchId);
    if (!match) {
      throw new Error(`試合ID ${matchId} が見つかりません`);
    }
    if (match.isFinished) {
      throw new Error("終了済みの試合のプレイヤーは変更できません");
    }

    this.deleteRowsByMatchId(this.opponentsSheet, matchId);

    for (const playerId of playerIds) {
      this.opponentsSheet.appendRow([matchId, playerId]);
    }

    return true;
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
          finished,
        ];

        const rowRange = this.matchesSheet.getRange(i + 1, 1, 1, 3);
        rowRange.setValues([updatedRow]);
        break;
      }
    }
  }
}

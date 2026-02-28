import { MatchRepository } from "../../repogitory/matches";
import { UserRepository } from "../../repogitory/users";

export class AdminMatchController {
  private userRepo = new UserRepository();
  private matchRepo = new MatchRepository(this.userRepo);

  syncMatches(round: number, matches: { playerIds: number[] }[]): number[] {
    if (matches.length === 0) {
      throw new Error("少なくとも1試合は必要です");
    }
    let response: number[] = [];

    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(3000);
      const currentMatches = this.matchRepo.findByRound(round);
      if (currentMatches.some((match) => match.isFinished)) {
        throw new Error("終了した試合があるため、このラウンドは同期できません");
      }
      this.matchRepo.deleteBulkMatch(currentMatches.map((match) => match.id));
      response = this.matchRepo.createBulkMatches(round, matches);
    } catch (e) {
      throw new Error("試合の同期に失敗しました。もう一度お試しください。");
    } finally {
      lock.releaseLock();
    }
    return response;
  }

  createMatch(round: number, playerIds: number[]): number {
    if (playerIds.length !== 2) {
      throw new Error("対戦は2人のプレイヤーで行われる必要があります");
    }

    for (const playerId of playerIds) {
      const user = this.userRepo.findById(playerId);
      if (!user) {
        throw new Error(`ユーザーID ${playerId} が見つかりません`);
      }
      if (user.role !== "player") {
        throw new Error(`ユーザーID ${playerId} は対戦者ではありません`);
      }
    }

    return this.matchRepo.createMatch(round, playerIds);
  }

  updateMatchPlayers(matchId: number, playerIds: number[]): boolean {
    if (playerIds.length !== 2) {
      throw new Error("対戦は2人のプレイヤーで行われる必要があります");
    }

    for (const playerId of playerIds) {
      const user = this.userRepo.findById(playerId);
      if (!user) {
        throw new Error(`ユーザーID ${playerId} が見つかりません`);
      }
      if (user.role !== "player") {
        throw new Error(`ユーザーID ${playerId} は対戦者ではありません`);
      }
    }

    return this.matchRepo.updateMatchPlayers(matchId, playerIds);
  }

  deleteMatch(matchId: number): boolean {
    return this.matchRepo.deleteMatch(matchId);
  }
}

// GAS用のグローバル関数をエクスポート
export function syncMatches(round: number, matches: { playerIds: number[] }[]) {
  const controller = new AdminMatchController();
  return controller.syncMatches(round, matches);
}

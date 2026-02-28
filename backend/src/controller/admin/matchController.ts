import { MatchRepository } from "../../repogitory/matches";
import { UserRepository } from "../../repogitory/users";

export class AdminMatchController {
  private userRepo = new UserRepository();
  private matchRepo = new MatchRepository(this.userRepo);

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
export function createMatch(round: number, playerIds: number[]) {
  const controller = new AdminMatchController();
  return controller.createMatch(round, playerIds);
}

export function updateMatchPlayers(matchId: number, playerIds: number[]) {
  const controller = new AdminMatchController();
  return controller.updateMatchPlayers(matchId, playerIds);
}

export function deleteMatch(matchId: number) {
  const controller = new AdminMatchController();
  return controller.deleteMatch(matchId);
}

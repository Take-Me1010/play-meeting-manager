import { MatchRepository } from "../repogitory/matches";
import { UserRepository } from "../repogitory/users";
import { type Match } from "../entity";

export class MatchController {
  private userRepo = new UserRepository();
  private matchRepo = new MatchRepository(this.userRepo);

  getAllMatches(): Match[] {
    const matches = this.matchRepo.findAll();
    return matches;
  }

  reportMatchResult(matchId: number, winnerId: number): boolean {
    let response: boolean;

    const match = this.matchRepo.findById(matchId);
    if (!match) {
      throw new Error(`試合ID ${matchId} が見つかりません`);
    }

    if (match.isFinished) {
      throw new Error("この試合は既に終了しています");
    }

    const isPlayerInMatch = match.players.some(
      (player) => player.id === winnerId,
    );
    if (!isPlayerInMatch) {
      throw new Error("勝者は試合参加者である必要があります");
    }
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(3000);
      response = this.matchRepo.setMatchResult(matchId, winnerId);
    } catch (e) {
      throw new Error("試合結果の報告に失敗しました。もう一度お試しください。");
    } finally {
      lock.releaseLock();
    }
    return response;
  }

  getCurrentUserMatches(): Match[] {
    const email = Session.getActiveUser().getEmail();
    if (!email) {
      throw new Error("ユーザーが認証されていません");
    }

    const currentUser = this.userRepo.findByEmail(email);
    if (!currentUser) {
      throw new Error("ユーザーが見つかりません");
    }

    const allMatches = this.getAllMatches();
    return allMatches.filter((match) =>
      match.players.some((player) => player.id === currentUser.id),
    );
  }
}

// GAS用のグローバル関数をエクスポート
export function getAllMatches() {
  const controller = new MatchController();
  return controller.getAllMatches();
}

export function reportMatchResult(matchId: number, winnerId: number) {
  const controller = new MatchController();
  return controller.reportMatchResult(matchId, winnerId);
}

export function getCurrentUserMatches() {
  const controller = new MatchController();
  return controller.getCurrentUserMatches();
}

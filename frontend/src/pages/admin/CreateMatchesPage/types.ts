import type { User } from "../../../types";

/**
 * 編集中の試合ドラフト。
 * id: 既存の Match は String(match.id)、新規追加は "new-{timestamp}"
 * slots: 2人分のスロット。未割当は null
 */
export type MatchDraft = {
  id: string;
  slots: [User | null, User | null];
};

/** 1回戦分の編集状態 */
export type RoundData = {
  drafts: MatchDraft[];
  unassigned: User[]; // どの試合にも割り当てられていないプレイヤー
};

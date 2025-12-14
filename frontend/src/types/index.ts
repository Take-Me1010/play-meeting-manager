// ユーザー型定義
export type User = {
  id: number;
  name: string;
  role: "player" | "observer";
};

// 試合型定義
export type Match = {
  id: number;
  round: number;
  players: User[];
} & (
  | {
      winner: null;
      isFinished: false;
    }
  | {
      winner: User;
      isFinished: true;
    }
);

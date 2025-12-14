
export type User = {
    id: number;
    name: string;
    role: 'player' | 'observer';
    style: '環境' | 'カジュアル';
}

export type Match = {
    id: number;
    round: number;
    players: User[];
} & ({
    winner: null;
    isFinished: false;
} | {
    winner: User;
    isFinished: true;
})

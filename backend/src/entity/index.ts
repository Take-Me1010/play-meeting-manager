
export type User = {
    id: number;
    name: string;
    role: 'player' | 'observer';
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

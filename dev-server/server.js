import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// モックデータ
let users = [
    { id: 1, name: "テストユーザー1", role: "player", style: "環境" },
    { id: 2, name: "テストユーザー2", role: "player", style: "カジュアル" },
    { id: 3, name: "観戦者", role: "observer" }
];

let matches = [
    {
        id: 1,
        round: 1,
        players: [users[0], users[1]],
        winner: null,
        isFinished: false
    }
];

let currentUser = users[0]; // 開発用の現在ユーザー
let isAdminMode = true; // 開発用：管理者モードフラグ

// ユーザー管理API
app.post('/api/registerUser', (req, res) => {
    const { name, role } = req.body;
    const newUser = {
        id: users.length + 1,
        name,
        role
    };
    users.push(newUser);
    currentUser = newUser;
    res.json(newUser);
});

app.get('/api/getCurrentUser', (req, res) => {
    res.json(currentUser);
});

app.get('/api/getAllUsers', (req, res) => {
    res.json(users);
});

app.post('/api/updateUser', (req, res) => {
    const updates = req.body;
    Object.assign(currentUser, updates);
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
    }
    res.json(currentUser);
});

// 試合管理API
app.get('/api/getAllMatches', (req, res) => {
    res.json(matches);
});

app.post('/api/getMatchesByRound', (req, res) => {
    const { round } = req.body;
    const roundMatches = matches.filter(m => m.round === round);
    res.json(roundMatches);
});

app.post('/api/createMatch', (req, res) => {
    const { round, playerIds } = req.body;
    const players = users.filter(u => playerIds.includes(u.id));

    const newMatch = {
        id: matches.length + 1,
        round,
        players,
        winner: null,
        isFinished: false
    };

    matches.push(newMatch);
    res.json(newMatch.id);
});

app.post('/api/updateMatchPlayers', (req, res) => {
    const { matchId, playerIds } = req.body;
    const match = matches.find(m => m.id === matchId);

    if (!match) {
        return res.status(404).json({ error: '試合が見つかりません' });
    }
    if (match.isFinished) {
        return res.status(400).json({ error: '終了済みの試合のプレイヤーは変更できません' });
    }

    match.players = users.filter(u => playerIds.includes(u.id));
    res.json(true);
});

app.post('/api/deleteMatch', (req, res) => {
    const { matchId } = req.body;
    const index = matches.findIndex(m => m.id === matchId);

    if (index === -1) {
        return res.status(404).json({ error: '試合が見つかりません' });
    }
    if (matches[index].isFinished) {
        return res.status(400).json({ error: '終了済みの試合は削除できません' });
    }

    matches.splice(index, 1);
    res.json(true);
});

app.post('/api/reportMatchResult', (req, res) => {
    const { matchId, winnerId } = req.body;
    const match = matches.find(m => m.id === matchId);

    if (!match) {
        return res.status(404).json({ error: '試合が見つかりません' });
    }

    if (match.isFinished) {
        return res.status(400).json({ error: '試合は既に終了しています' });
    }

    const winner = match.players.find(p => p.id === winnerId);
    if (!winner) {
        return res.status(400).json({ error: '勝者が試合参加者ではありません' });
    }

    match.winner = winner;
    match.isFinished = true;

    res.json(true);
});

app.get('/api/getCurrentUserMatches', (req, res) => {
    const userMatches = matches.filter(m =>
        m.players.some(p => p.id === currentUser.id)
    );
    res.json(userMatches);
});

// 開発用: 現在ユーザー切り替え
app.post('/api/dev/switchUser', (req, res) => {
    const { userId } = req.body;
    const user = users.find(u => u.id === userId);
    if (user) {
        currentUser = user;
        res.json(currentUser);
    } else {
        res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
});

// スプレッドシート初期化（開発用）
app.post('/api/initializeSpreadsheet', (req, res) => {
    console.log('スプレッドシート初期化（モック）');
    res.json({ success: true });
});

// 管理者API
app.get('/api/checkIsAdmin', (req, res) => {
    res.json(isAdminMode);
});

app.get('/api/getPlayersForMatch', (req, res) => {
    const players = users.filter(u => u.role === 'player');
    res.json(players);
});

app.post('/api/getAssignedPlayerIds', (req, res) => {
    const { round } = req.body;
    const roundMatches = matches.filter(m => m.round === round);
    const playerIds = roundMatches.flatMap(m => m.players.map(p => p.id));
    res.json(playerIds);
});

app.post('/api/createMatchesAsAdmin', (req, res) => {
    const { matches: matchInputs } = req.body;
    const createdMatchIds = [];
    const errors = [];

    for (const input of matchInputs) {
        const player1 = users.find(u => u.id === input.player1Id);
        const player2 = users.find(u => u.id === input.player2Id);

        if (!player1) {
            errors.push(`プレイヤーID ${input.player1Id} が見つかりません`);
            continue;
        }
        if (!player2) {
            errors.push(`プレイヤーID ${input.player2Id} が見つかりません`);
            continue;
        }

        // 重複チェック
        const roundMatches = matches.filter(m => m.round === input.round);
        const assignedIds = roundMatches.flatMap(m => m.players.map(p => p.id));

        if (assignedIds.includes(input.player1Id)) {
            errors.push(`${player1.name} は既にラウンド${input.round}に参加しています`);
            continue;
        }
        if (assignedIds.includes(input.player2Id)) {
            errors.push(`${player2.name} は既にラウンド${input.round}に参加しています`);
            continue;
        }

        const newMatch = {
            id: matches.length + 1,
            round: input.round,
            players: [player1, player2],
            winner: null,
            isFinished: false
        };

        matches.push(newMatch);
        createdMatchIds.push(newMatch.id);
    }

    res.json({
        success: errors.length === 0,
        createdMatchIds,
        errors
    });
});

app.post('/api/syncMatches', (req, res) => {
    const { round, matches: matchInputs } = req.body;

    const roundMatches = matches.filter(m => m.round === round);
    if (roundMatches.some(m => m.isFinished)) {
        return res.status(400).json({ error: '終了した試合があるため、このラウンドは同期できません' });
    }

    matches = matches.filter(m => m.round !== round);

    const createdIds = [];
    for (const input of matchInputs) {
        const players = users.filter(u => input.playerIds.includes(u.id));
        const newMatch = {
            id: matches.length + 1,
            round,
            players,
            winner: null,
            isFinished: false
        };
        matches.push(newMatch);
        createdIds.push(newMatch.id);
    }

    res.json(createdIds);
});

// 開発用：管理者モード切り替え
app.post('/api/dev/setAdminMode', (req, res) => {
    const { isAdmin } = req.body;
    isAdminMode = isAdmin;
    res.json({ isAdminMode });
});

app.listen(PORT, () => {
    console.log(`開発サーバーが http://127.0.0.1:${PORT} で起動しました`);
    console.log('現在のユーザー:', currentUser);
});
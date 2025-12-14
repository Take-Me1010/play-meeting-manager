import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Refresh as RefreshIcon,
    EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import type { Match } from '../types';
import { gasApi } from '../api/gasApi';
import { Layout } from '../components/Layout';

export default function MatchesPage() {
    const navigate = useNavigate();
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMatches = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await gasApi.getAllMatches();
            setMatches(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '対戦表の取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMatches();
    }, [fetchMatches]);

    // ラウンドごとにグループ化
    const matchesByRound = matches.reduce(
        (acc, match) => {
            const round = match.round;
            if (!acc[round]) {
                acc[round] = [];
            }
            acc[round].push(match);
            return acc;
        },
        {} as Record<number, Match[]>
    );

    return (
        <Layout>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <IconButton onClick={() => navigate('/')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h2" component="h1" sx={{ flexGrow: 1 }}>
                    対戦表
                </Typography>
                <IconButton onClick={fetchMatches} disabled={isLoading}>
                    <RefreshIcon />
                </IconButton>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : matches.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" textAlign="center">
                            現在登録されている対戦はありません
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                Object.entries(matchesByRound).map(([round, roundMatches]) => (
                    <Box key={round} sx={{ mb: 3 }}>
                        <Typography variant="h3" sx={{ mb: 2 }}>
                            第{round}回戦
                        </Typography>
                        <Stack spacing={2}>
                            {roundMatches.map((match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </Stack>
                    </Box>
                ))
            )}
        </Layout>
    );
}

function MatchCard({ match }: { match: Match }) {
    const [player1, player2] = match.players;

    return (
        <Card>
            <CardContent>
                <Stack spacing={1}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight:
                                    match.isFinished && match.winner?.id === player1.id
                                        ? 'bold'
                                        : 'normal',
                            }}
                        >
                            {player1.name}
                        </Typography>
                        {match.isFinished && match.winner?.id === player1.id && (
                            <TrophyIcon sx={{ color: 'warning.main' }} />
                        )}
                    </Stack>

                    <Divider>
                        <Typography variant="caption" color="text.secondary">
                            VS
                        </Typography>
                    </Divider>

                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight:
                                    match.isFinished && match.winner?.id === player2.id
                                        ? 'bold'
                                        : 'normal',
                            }}
                        >
                            {player2.name}
                        </Typography>
                        {match.isFinished && match.winner?.id === player2.id && (
                            <TrophyIcon sx={{ color: 'warning.main' }} />
                        )}
                    </Stack>

                    <Box sx={{ mt: 1, textAlign: 'right' }}>
                        <Chip
                            label={match.isFinished ? '終了' : '対戦中'}
                            color={match.isFinished ? 'default' : 'primary'}
                            size="small"
                        />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

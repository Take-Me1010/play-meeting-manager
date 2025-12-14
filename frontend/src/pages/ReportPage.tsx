import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    IconButton,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import type { Match, User } from '../types';
import { gasApi } from '../api/gasApi';
import { Layout } from '../components/Layout';

export default function ReportPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [myMatch, setMyMatch] = useState<Match | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        winner: User | null;
    }>({ open: false, winner: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMyMatch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const matches = await gasApi.getCurrentUserMatches();
            // 未終了の試合を取得
            const currentMatch = matches.find((m) => !m.isFinished);
            setMyMatch(currentMatch || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : '試合情報の取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchMyMatch();
        }
    }, [user, fetchMyMatch]);

    const handleWinnerSelect = (winner: User) => {
        setConfirmDialog({ open: true, winner });
    };

    const handleConfirmSubmit = async () => {
        if (!confirmDialog.winner || !myMatch) return;

        setIsSubmitting(true);
        try {
            await gasApi.reportMatchResult(myMatch.id, confirmDialog.winner.id);
            setConfirmDialog({ open: false, winner: null });
            // 成功後、試合情報を再取得
            await fetchMyMatch();
        } catch (err) {
            setError(err instanceof Error ? err.message : '勝敗報告に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    const opponent = myMatch?.players.find((p) => p.id !== user?.id);

    return (
        <Layout>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <IconButton onClick={() => navigate('/')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h2" component="h1" sx={{ flexGrow: 1 }}>
                    勝敗報告
                </Typography>
                <IconButton onClick={fetchMyMatch} disabled={isLoading}>
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
            ) : !myMatch ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" textAlign="center">
                            現在あなたの対戦はありません
                        </Typography>
                    </CardContent>
                </Card>
            ) : myMatch.isFinished ? (
                <Card>
                    <CardContent>
                        <Typography variant="h3" gutterBottom textAlign="center">
                            試合終了
                        </Typography>
                        <Typography textAlign="center" color="text.secondary">
                            勝者: {myMatch.winner?.name}
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent>
                        <Typography variant="h3" gutterBottom textAlign="center">
                            第{myMatch.round}回戦
                        </Typography>

                        <Stack spacing={1} sx={{ mb: 3 }}>
                            <Typography textAlign="center">{user?.name}</Typography>
                            <Divider>
                                <Typography variant="caption" color="text.secondary">
                                    VS
                                </Typography>
                            </Divider>
                            <Typography textAlign="center">{opponent?.name}</Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                            sx={{ mb: 2 }}
                        >
                            勝者を選択してください
                        </Typography>

                        <Stack spacing={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={() => user && handleWinnerSelect(user)}
                            >
                                {user?.name} が勝ち
                            </Button>
                            <Button
                                variant="outlined"
                                fullWidth
                                size="large"
                                onClick={() => opponent && handleWinnerSelect(opponent)}
                            >
                                {opponent?.name} が勝ち
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, winner: null })}
            >
                <DialogTitle>勝敗報告の確認</DialogTitle>
                <DialogContent>
                    <Typography>
                        <strong>{confirmDialog.winner?.name}</strong> の勝利で報告しますか？
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        この操作は取り消せません。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmDialog({ open: false, winner: null })}
                        disabled={isSubmitting}
                    >
                        キャンセル
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : '報告する'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

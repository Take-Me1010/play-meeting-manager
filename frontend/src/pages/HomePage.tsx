import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Stack,
    Divider,
    Box,
} from '@mui/material';
import {
    Person as PersonIcon,
    SportsMma as BattleIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';

export default function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const isPlayer = user.role === 'player';

    return (
        <Layout>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h2" component="h1">
                                {user.name}
                            </Typography>
                            <Chip
                                label={isPlayer ? '対戦者' : '観戦者'}
                                color={isPlayer ? 'primary' : 'secondary'}
                                size="small"
                            />
                        </Box>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => navigate('/profile')}
                        >
                            編集
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            <Typography variant="h3" sx={{ mb: 2 }}>
                メニュー
            </Typography>

            <Stack spacing={2}>
                <Card>
                    <CardContent
                        sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => navigate('/matches')}
                    >
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <BattleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="h3">対戦表</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    現在の対戦組み合わせを確認
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                {isPlayer && (
                    <Card>
                        <CardContent
                            sx={{
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                            onClick={() => navigate('/report')}
                        >
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <EditIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
                                <Box>
                                    <Typography variant="h3">勝敗報告</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        試合結果を報告する
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardContent
                        sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => navigate('/results')}
                    >
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <ViewIcon sx={{ fontSize: 32, color: 'success.main' }} />
                            <Box>
                                <Typography variant="h3">試合結果</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    これまでの試合結果を確認
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary" textAlign="center">
                交流会対戦管理アプリ
            </Typography>
        </Layout>
    );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Paper,
    Typography,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Alert
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { gasApi } from '../api/gasApi';
import { useAuth } from '../contexts/AuthContext';
import { type User } from '../types';

export function DevPanel() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number>(1);
    const { user: currentUser, refresh } = useAuth();

    // ドラッグ用のstate
    const [position, setPosition] = useState({ x: 16, y: 16 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - (window.innerWidth - position.x - 250),
            y: e.clientY - position.y
        };
        e.preventDefault();
    }, [position]);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newX = window.innerWidth - e.clientX + dragOffset.current.x - 250;
            const newY = e.clientY - dragOffset.current.y;
            setPosition({
                x: Math.max(0, Math.min(newX, window.innerWidth - 250)),
                y: Math.max(0, Math.min(newY, window.innerHeight - 100))
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    
    const loadUsers = async () => {
        try {
            const userList = await gasApi.getAllUsers();
            setUsers(userList);
        } catch (error) {
            console.error('ユーザー一覧取得エラー:', error);
        }
    };
    
    useEffect(() => {
        loadUsers();
    }, []);

    const handleSwitchUser = async () => {
        if ('switchUser' in gasApi) {
            try {
                await gasApi.switchUser!(selectedUserId);
                await refresh(); // AuthContextを更新
            } catch (error) {
                console.error('ユーザー切り替えエラー:', error);
            }
        }
    };

    // 本番環境では何も表示しない
    if (!import.meta.env.DEV) {
        return null;
    }

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'fixed',
                top: position.y,
                right: position.x,
                p: 2,
                minWidth: 250,
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                userSelect: isDragging ? 'none' : 'auto'
            }}
        >
            <Box
                onMouseDown={handleMouseDown}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'grab',
                    mb: 1,
                    '&:active': { cursor: 'grabbing' }
                }}
            >
                <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6">
                    開発パネル
                </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
                開発環境用のユーザー切り替えパネル
            </Alert>

            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                    現在のユーザー:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                    {currentUser?.name || '未ログイン'}
                    ({currentUser?.role || 'なし'})
                </Typography>
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>ユーザー切り替え</InputLabel>
                <Select
                    value={selectedUserId}
                    label="ユーザー切り替え"
                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                >
                    {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                            {user.name} ({user.role})
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={handleSwitchUser}
                disabled={!('switchUser' in gasApi)}
            >
                ユーザー切り替え
            </Button>
        </Paper>
    );
}
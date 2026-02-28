import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/useAuth";
import type { User } from "../types";
import { Layout } from "../components/Layout";
import { useOwnMatch } from "../hooks/useOwnMatches";

export default function ReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ownMatch, isLoading, fetchOwnMatch, fetchError, isReporting, reportError, reportMatchResult } = useOwnMatch();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    winner: User | null;
  }>({ open: false, winner: null });

  const handleWinnerSelect = (winner: User) => {
    setConfirmDialog({ open: true, winner });
  };

  const handleConfirmSubmit = async () => {
    if (!confirmDialog.winner || !ownMatch) return;
    await reportMatchResult(confirmDialog.winner.id);
    setConfirmDialog({ open: false, winner: null });
  };

  const opponent = ownMatch?.players.find((p) => p.id !== user?.id);

  return (
    <Layout>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" component="h1" sx={{ flexGrow: 1 }}>
          勝敗報告
        </Typography>
        <IconButton onClick={fetchOwnMatch} disabled={isLoading}>
          <RefreshIcon />
        </IconButton>
      </Stack>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError.message}
        </Alert>
      )}
      {reportError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {reportError.message}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : !ownMatch ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" textAlign="center">
              現在あなたの対戦はありません
            </Typography>
          </CardContent>
        </Card>
      ) : ownMatch.isFinished ? (
        <Card>
          <CardContent>
            <Typography variant="h3" gutterBottom textAlign="center">
              試合終了
            </Typography>
            <Typography textAlign="center" color="text.secondary">
              勝者: {ownMatch.winner?.name}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h3" gutterBottom textAlign="center">
              第{ownMatch.round}回戦
            </Typography>

            <Stack spacing={1} sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <Typography textAlign="center">{user?.name}</Typography>
                {user?.style && (
                  <Chip
                    label={user.style}
                    variant="outlined"
                    size="small"
                    color={user.style === "環境" ? "primary" : "secondary"}
                  />
                )}
              </Stack>
              <Divider>
                <Typography variant="caption" color="text.secondary">
                  VS
                </Typography>
              </Divider>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <Typography textAlign="center">{opponent?.name}</Typography>
                {opponent?.style && (
                  <Chip
                    label={opponent.style}
                    variant="outlined"
                    size="small"
                    color={opponent.style === "環境" ? "primary" : "secondary"}
                  />
                )}
              </Stack>
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
            disabled={isReporting}
          >
            キャンセル
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSubmit}
            disabled={isReporting}
          >
            {isReporting ? <CircularProgress size={24} /> : "報告する"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

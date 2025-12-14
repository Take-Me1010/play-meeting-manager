import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import type { Match } from "../types";
import { gasApi } from "../api/gasApi";
import { Layout } from "../components/Layout";

export default function ResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allMatches = await gasApi.getAllMatches();
      // 終了した試合のみフィルタリング
      const finishedMatches = allMatches.filter((m) => m.isFinished);
      setResults(finishedMatches);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "試合結果の取得に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // ラウンドごとにグループ化
  const resultsByRound = results.reduce(
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

  // ラウンドを降順でソート（新しい順）
  const sortedRounds = Object.keys(resultsByRound)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <Layout>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" component="h1" sx={{ flexGrow: 1 }}>
          試合結果
        </Typography>
        <IconButton onClick={fetchResults} disabled={isLoading}>
          <RefreshIcon />
        </IconButton>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : results.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" textAlign="center">
              まだ試合結果がありません
            </Typography>
          </CardContent>
        </Card>
      ) : (
        sortedRounds.map((round) => (
          <Box key={round} sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              第{round}回戦
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>対戦</TableCell>
                    <TableCell align="center">勝者</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultsByRound[round].map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  match.isFinished &&
                                  match.winner?.id === match.players[0].id
                                    ? "bold"
                                    : "normal",
                              }}
                            >
                              {match.players[0].name}
                            </Typography>
                            <Chip
                              label={match.players[0].style}
                              variant="outlined"
                              size="small"
                              color={match.players[0].style === "環境" ? "primary" : "secondary"}
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                          </Stack>
                          <Divider />
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  match.isFinished &&
                                  match.winner?.id === match.players[1].id
                                    ? "bold"
                                    : "normal",
                              }}
                            >
                              {match.players[1].name}
                            </Typography>
                            <Chip
                              label={match.players[1].style}
                              variant="outlined"
                              size="small"
                              color={match.players[1].style === "環境" ? "primary" : "secondary"}
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        {match.isFinished && match.winner && (
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            spacing={0.5}
                          >
                            <TrophyIcon
                              sx={{ color: "warning.main", fontSize: 18 }}
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {match.winner.name}
                            </Typography>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      )}
    </Layout>
  );
}

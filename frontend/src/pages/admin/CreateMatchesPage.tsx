import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  IconButton,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { Layout } from "../../components/Layout";
import { gasApi } from "../../api/gasApi";
import type { User } from "../../types";

type MatchCard = {
  id: number;
  player1Id: number | "";
  player2Id: number | "";
};

export default function CreateMatchesPage() {
  const navigate = useNavigate();
  const [round, setRound] = useState<number>(1);
  const [players, setPlayers] = useState<User[]>([]);
  const [assignedPlayerIds, setAssignedPlayerIds] = useState<number[]>([]);
  const [matchCards, setMatchCards] = useState<MatchCard[]>([
    { id: 1, player1Id: "", player2Id: "" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPlayers = useCallback(async () => {
    try {
      const playerList = await gasApi.getPlayersForMatch();
      setPlayers(playerList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "プレイヤー一覧の取得に失敗しました",
      );
    }
  }, []);

  const fetchAssignedPlayers = useCallback(async (roundNum: number) => {
    try {
      const assigned = await gasApi.getAssignedPlayerIds(roundNum);
      setAssignedPlayerIds(assigned);
    } catch (err) {
      console.error("割り当て済みプレイヤーの取得に失敗:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await fetchPlayers();
      await fetchAssignedPlayers(round);
      setIsLoading(false);
    }
    init();
  }, [fetchPlayers, fetchAssignedPlayers, round]);

  const handleRoundChange = (newRound: number) => {
    setRound(newRound);
    setError(null);
    setSuccess(null);
  };

  const addMatchCard = () => {
    const newId = Math.max(...matchCards.map((m) => m.id), 0) + 1;
    setMatchCards([...matchCards, { id: newId, player1Id: "", player2Id: "" }]);
  };

  const removeMatchCard = (id: number) => {
    if (matchCards.length <= 1) return;
    setMatchCards(matchCards.filter((m) => m.id !== id));
  };

  const updateMatchCard = (
    id: number,
    field: "player1Id" | "player2Id",
    value: number | "",
  ) => {
    setMatchCards(
      matchCards.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  // プレイヤーが選択可能かどうか判定
  const isPlayerAvailable = (
    playerId: number,
    currentCardId: number,
    currentField: "player1Id" | "player2Id",
  ) => {
    // DBで既に割り当て済み
    if (assignedPlayerIds.includes(playerId)) {
      return false;
    }

    // 現在のカードの別フィールドで選択されている場合
    const currentCard = matchCards.find((m) => m.id === currentCardId);
    if (currentCard) {
      if (currentField === "player1Id" && currentCard.player2Id === playerId) {
        return false;
      }
      if (currentField === "player2Id" && currentCard.player1Id === playerId) {
        return false;
      }
    }

    // 他のカードで選択されている場合
    const otherCards = matchCards.filter((m) => m.id !== currentCardId);
    for (const card of otherCards) {
      if (card.player1Id === playerId || card.player2Id === playerId) {
        return false;
      }
    }

    return true;
  };

  // バリデーション
  const validateMatchCards = (): string[] => {
    const errors: string[] = [];

    for (const card of matchCards) {
      if (card.player1Id === "" || card.player2Id === "") {
        errors.push("全ての対戦でプレイヤーを選択してください");
        break;
      }
    }

    return errors;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    const validationErrors = validateMatchCards();
    if (validationErrors.length > 0) {
      setError(validationErrors.join("\n"));
      return;
    }

    setIsSubmitting(true);

    try {
      const matches = matchCards.map((card) => ({
        round,
        player1Id: card.player1Id as number,
        player2Id: card.player2Id as number,
      }));

      const result = await gasApi.createMatchesAsAdmin(matches);

      if (result.success) {
        setSuccess(`${result.createdMatchIds.length}件の対戦を作成しました`);
        setMatchCards([{ id: 1, player1Id: "", player2Id: "" }]);
        await fetchAssignedPlayers(round);
      } else {
        setError(result.errors.join("\n"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "対戦の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate("/")} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" component="h1">
          対戦表作成
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-line" }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            label="ラウンド"
            type="number"
            value={round}
            onChange={(e) =>
              handleRoundChange(Math.max(1, parseInt(e.target.value) || 1))
            }
            inputProps={{ min: 1 }}
            fullWidth
            sx={{ mb: 2 }}
          />

          {assignedPlayerIds.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              このラウンドには既に{assignedPlayerIds.length}
              人のプレイヤーが割り当てられています
            </Alert>
          )}
        </CardContent>
      </Card>

      <Typography variant="h3" sx={{ mb: 2 }}>
        対戦カード
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {matchCards.map((card, index) => (
          <Card key={card.id}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  対戦 {index + 1}
                </Typography>
                {matchCards.length > 1 && (
                  <IconButton
                    onClick={() => removeMatchCard(card.id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl fullWidth size="small">
                  <InputLabel>プレイヤー1</InputLabel>
                  <Select
                    value={card.player1Id}
                    label="プレイヤー1"
                    onChange={(e) =>
                      updateMatchCard(
                        card.id,
                        "player1Id",
                        e.target.value as number | "",
                      )
                    }
                  >
                    <MenuItem value="">
                      <em>選択してください</em>
                    </MenuItem>
                    {players.map((player) => (
                      <MenuItem
                        key={player.id}
                        value={player.id}
                        disabled={
                          !isPlayerAvailable(player.id, card.id, "player1Id") &&
                          card.player1Id !== player.id
                        }
                      >
                        {player.name}
                        {assignedPlayerIds.includes(player.id) && " (割当済)"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="body1" sx={{ flexShrink: 0 }}>
                  vs
                </Typography>

                <FormControl fullWidth size="small">
                  <InputLabel>プレイヤー2</InputLabel>
                  <Select
                    value={card.player2Id}
                    label="プレイヤー2"
                    onChange={(e) =>
                      updateMatchCard(
                        card.id,
                        "player2Id",
                        e.target.value as number | "",
                      )
                    }
                  >
                    <MenuItem value="">
                      <em>選択してください</em>
                    </MenuItem>
                    {players.map((player) => (
                      <MenuItem
                        key={player.id}
                        value={player.id}
                        disabled={
                          !isPlayerAvailable(player.id, card.id, "player2Id") &&
                          card.player2Id !== player.id
                        }
                      >
                        {player.name}
                        {assignedPlayerIds.includes(player.id) && " (割当済)"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addMatchCard}
        fullWidth
        sx={{ mb: 3 }}
      >
        対戦を追加
      </Button>

      <Divider sx={{ mb: 3 }} />

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={() => navigate("/")} fullWidth>
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            matchCards.some((m) => m.player1Id === "" || m.player2Id === "")
          }
          fullWidth
        >
          {isSubmitting ? "作成中..." : "対戦を作成"}
        </Button>
      </Stack>
    </Layout>
  );
}

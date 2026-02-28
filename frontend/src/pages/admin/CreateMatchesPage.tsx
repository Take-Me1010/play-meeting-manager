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
  Select,
  MenuItem,
  Paper,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import type { DropResult } from "react-smooth-dnd";
import type { User } from "../../types";
import { Layout } from "../../components/Layout";
import { DNDContainer, DNDDraggable } from "../../components/dnd";

const mockUsers: User[] = [
  { id: 1, name: "プレイヤーA", role: "player", style: "環境" },
  { id: 2, name: "プレイヤーB", role: "player", style: "カジュアル" },
  { id: 3, name: "プレイヤーC", role: "player", style: "環境" },
  { id: 4, name: "プレイヤーD", role: "player", style: "カジュアル" },
  { id: 5, name: "プレイヤーE", role: "player", style: "環境" },
  { id: 6, name: "プレイヤーF", role: "player", style: "カジュアル" },
];

type MatchDraft = {
  id: string;
  slots: [string, string];
};

type ContainerMap = Record<string, User[]>;

type RoundData = {
  matches: MatchDraft[];
  containers: ContainerMap;
};

function createInitialRoundData(): RoundData {
  return {
    matches: [],
    containers: { unassigned: [...mockUsers] },
  };
}

function PlayerItem({ user }: { user: User }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        p: 1,
        bgcolor: "background.paper",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
        userSelect: "none",
      }}
    >
      <PersonIcon fontSize="small" color="action" />
      <Typography variant="body2" sx={{ flexGrow: 1 }}>
        {user.name}
      </Typography>
      <Chip
        label={user.style}
        size="small"
        color={user.style === "環境" ? "primary" : "secondary"}
        variant="outlined"
      />
    </Stack>
  );
}

function SlotContainer({
  users,
  isEditing,
  onDrop,
}: {
  users: User[];
  isEditing: boolean;
  onDrop: (dr: DropResult) => void;
}) {
  if (!isEditing) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          minHeight: 48,
          display: "flex",
          alignItems: "center",
        }}
      >
        {users.length > 0 ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ width: "100%" }}
          >
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {users[0].name}
            </Typography>
            <Chip
              label={users[0].style}
              size="small"
              color={users[0].style === "環境" ? "primary" : "secondary"}
              variant="outlined"
            />
          </Stack>
        ) : (
          <Typography variant="caption" color="text.disabled">
            未割当
          </Typography>
        )}
      </Paper>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          border: "1px dashed",
          borderColor: users.length > 0 ? "primary.main" : "divider",
          borderRadius: 1,
          minHeight: 52,
          transition: "border-color 0.2s",
        }}
      >
        <DNDContainer
          groupName="players"
          onDrop={onDrop}
          getChildPayload={(i) => users[i]}
          style={{ minHeight: 52, padding: "4px" }}
        >
          {users.map((user) => (
            <DNDDraggable key={user.id}>
              <Box sx={{ p: "2px" }}>
                <PlayerItem user={user} />
              </Box>
            </DNDDraggable>
          ))}
        </DNDContainer>
      </Box>
      {users.length === 0 && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Typography variant="caption" color="text.disabled">
            ここにドロップ
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function UnassignedContainer({
  users,
  isEditing,
  onDrop,
}: {
  users: User[];
  isEditing: boolean;
  onDrop: (dr: DropResult) => void;
}) {
  if (!isEditing) {
    return (
      <Stack spacing={1}>
        {users.length === 0 ? (
          <Typography variant="caption" color="text.disabled">
            未割当の参加者はいません
          </Typography>
        ) : (
          users.map((user) => <PlayerItem key={user.id} user={user} />)
        )}
      </Stack>
    );
  }

  return (
    <Box sx={{ position: "relative", minHeight: 200 }}>
      <DNDContainer
        groupName="players"
        onDrop={onDrop}
        getChildPayload={(i) => users[i]}
        style={{ minHeight: 200, padding: "4px" }}
      >
        {users.map((user) => (
          <DNDDraggable key={user.id}>
            <Box sx={{ pb: "4px" }}>
              <PlayerItem user={user} />
            </Box>
          </DNDDraggable>
        ))}
      </DNDContainer>
      {users.length === 0 && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Typography variant="caption" color="text.disabled">
            全員割当済み
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default function CreateMatchesPage() {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<Record<number, RoundData>>({
    1: createInitialRoundData(),
  });
  const [currentRound, setCurrentRound] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const roundData = rounds[currentRound];

  function switchRound(round: number) {
    setCurrentRound(round);
    if (!rounds[round]) {
      setRounds((prev) => ({
        ...prev,
        [round]: createInitialRoundData(),
      }));
    }
  }

  function handleDrop(containerId: string, dropResult: DropResult) {
    const { removedIndex, addedIndex, payload } = dropResult;
    if (removedIndex === null && addedIndex === null) return;

    setRounds((prev) => {
      const currentData = prev[currentRound];
      const containers = { ...currentData.containers };

      // source側: 削除
      if (removedIndex !== null) {
        const arr = [...containers[containerId]];
        arr.splice(removedIndex, 1);
        containers[containerId] = arr;
      }

      // dest側: 追加（試合スロットに既存ユーザーがいれば unassigned に退避）
      if (addedIndex !== null) {
        const user = payload as User;
        if (containerId !== "unassigned" && containers[containerId].length > 0) {
          containers["unassigned"] = [
            ...containers["unassigned"],
            containers[containerId][0],
          ];
          containers[containerId] = [user];
        } else {
          const arr = [...containers[containerId]];
          arr.splice(addedIndex, 0, user);
          containers[containerId] = arr;
        }
      }

      return {
        ...prev,
        [currentRound]: {
          ...currentData,
          containers,
        },
      };
    });
  }

  function addMatch() {
    const matchId = `match-${Date.now()}`;
    const slot0Id = `${matchId}-slot-0`;
    const slot1Id = `${matchId}-slot-1`;

    setRounds((prev) => {
      const currentData = prev[currentRound];
      return {
        ...prev,
        [currentRound]: {
          matches: [
            ...currentData.matches,
            { id: matchId, slots: [slot0Id, slot1Id] as [string, string] },
          ],
          containers: {
            ...currentData.containers,
            [slot0Id]: [],
            [slot1Id]: [],
          },
        },
      };
    });
  }

  function removeMatch(matchId: string) {
    setRounds((prev) => {
      const currentData = prev[currentRound];
      const match = currentData.matches.find((m) => m.id === matchId);
      if (!match) return prev;

      const containers = { ...currentData.containers };
      const displaced: User[] = [];

      for (const slotId of match.slots) {
        if (containers[slotId]?.length > 0) {
          displaced.push(...containers[slotId]);
        }
        delete containers[slotId];
      }

      containers["unassigned"] = [...containers["unassigned"], ...displaced];

      return {
        ...prev,
        [currentRound]: {
          matches: currentData.matches.filter((m) => m.id !== matchId),
          containers,
        },
      };
    });
  }

  function handleSave() {
    console.log("保存:", rounds[currentRound]);
  }

  const maxRound = Math.max(...Object.keys(rounds).map(Number));
  const availableRounds = Object.keys(rounds).map(Number).sort((a, b) => a - b);

  return (
    <Layout maxWidth="lg">
      {/* ヘッダー */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" component="h1" sx={{ flexGrow: 1 }}>
          対戦表作成
        </Typography>
        <Select
          value={currentRound}
          onChange={(e) => switchRound(Number(e.target.value))}
          size="small"
          sx={{ minWidth: 130 }}
        >
          {availableRounds.map((r) => (
            <MenuItem key={r} value={r}>
              第{r}回戦
            </MenuItem>
          ))}
          <MenuItem value={maxRound + 1}>+ 新しい回戦</MenuItem>
        </Select>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? "完了" : "編集する"}
        </Button>
        <Button variant="contained" size="small" onClick={handleSave}>
          保存
        </Button>
      </Stack>

      {/* メインコンテンツ: 2カラム */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        {/* 左: 試合カード一覧 */}
        <Box sx={{ flex: "1 1 60%", minWidth: 0 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            試合カード一覧
          </Typography>

          {roundData.matches.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isEditing
                ? "「試合を追加」ボタンで試合を作成してください"
                : "試合が登録されていません"}
            </Typography>
          )}

          <Stack spacing={2}>
            {roundData.matches.map((match, matchIndex) => (
              <Card key={match.id}>
                <CardContent>
                  <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ flexGrow: 1, fontWeight: "bold" }}
                    >
                      試合 {matchIndex + 1}
                    </Typography>
                    {isEditing && (
                      <IconButton
                        size="small"
                        onClick={() => removeMatch(match.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>

                  <SlotContainer
                    users={roundData.containers[match.slots[0]] ?? []}
                    isEditing={isEditing}
                    onDrop={(dr) => handleDrop(match.slots[0], dr)}
                  />

                  <Box sx={{ textAlign: "center", my: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="bold"
                    >
                      VS
                    </Typography>
                  </Box>

                  <SlotContainer
                    users={roundData.containers[match.slots[1]] ?? []}
                    isEditing={isEditing}
                    onDrop={(dr) => handleDrop(match.slots[1], dr)}
                  />
                </CardContent>
              </Card>
            ))}
          </Stack>

          {isEditing && (
            <Button
              startIcon={<AddIcon />}
              onClick={addMatch}
              variant="outlined"
              sx={{ mt: 2 }}
              fullWidth
            >
              試合を追加
            </Button>
          )}
        </Box>

        {/* 右: 未割当参加者 */}
        <Box sx={{ flex: "0 0 35%", minWidth: 0 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            未割当参加者
          </Typography>
          <Paper variant="outlined" sx={{ p: 1, minHeight: 200 }}>
            <UnassignedContainer
              users={roundData.containers["unassigned"] ?? []}
              isEditing={isEditing}
              onDrop={(dr) => handleDrop("unassigned", dr)}
            />
          </Paper>
        </Box>
      </Box>
    </Layout>
  );
}

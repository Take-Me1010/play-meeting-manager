import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import type { DropResult } from "react-smooth-dnd";
import type { User } from "../../../types";
import { DNDContainer, DNDDraggable } from "../../../components/dnd";
import { PlayerItem } from "./PlayerItem";
import type { MatchDraft } from "./types";

function SlotContainer({
  user,
  isEditing,
  onDrop,
}: {
  user: User | null;
  isEditing: boolean;
  onDrop: (dr: DropResult) => void;
}) {
  if (!isEditing) {
    return (
      <Box
        sx={{
          p: 1,
          minHeight: 48,
          display: "flex",
          alignItems: "center",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        {user ? (
          <PlayerItem user={user} />
        ) : (
          <Typography variant="caption" color="text.disabled">
            未割当
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          border: "1px dashed",
          borderColor: user ? "primary.main" : "divider",
          borderRadius: 1,
          minHeight: 52,
          transition: "border-color 0.2s",
        }}
      >
        <DNDContainer
          groupName="players"
          onDrop={onDrop}
          getChildPayload={() => user}
          style={{ minHeight: 52, padding: "4px" }}
        >
          {user && (
            <DNDDraggable>
              <Box sx={{ p: "2px" }}>
                <PlayerItem user={user} />
              </Box>
            </DNDDraggable>
          )}
        </DNDContainer>
      </Box>
      {!user && (
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

type Props = {
  drafts: MatchDraft[];
  isEditing: boolean;
  onSlotDrop: (matchId: string, slotIndex: 0 | 1, dr: DropResult) => void;
  onAddMatch: () => void;
  onRemoveMatch: (matchId: string) => void;
};

export function MatchEditArea({
  drafts,
  isEditing,
  onSlotDrop,
  onAddMatch,
  onRemoveMatch,
}: Props) {
  return (
    <Box sx={{ flex: "1 1 60%", minWidth: 0 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        試合カード一覧
      </Typography>

      {drafts.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isEditing
            ? "「試合を追加」ボタンで試合を作成してください"
            : "試合が登録されていません"}
        </Typography>
      )}

      <Stack spacing={2}>
        {drafts.map((draft, index) => (
          <Card key={draft.id}>
            <CardContent>
              <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ flexGrow: 1, fontWeight: "bold" }}
                >
                  試合 {index + 1}
                </Typography>
                {isEditing && (
                  <IconButton
                    size="small"
                    onClick={() => onRemoveMatch(draft.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>

              <SlotContainer
                user={draft.slots[0]}
                isEditing={isEditing}
                onDrop={(dr) => onSlotDrop(draft.id, 0, dr)}
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
                user={draft.slots[1]}
                isEditing={isEditing}
                onDrop={(dr) => onSlotDrop(draft.id, 1, dr)}
              />
            </CardContent>
          </Card>
        ))}
      </Stack>

      {isEditing && (
        <Button
          startIcon={<AddIcon />}
          onClick={onAddMatch}
          variant="outlined"
          sx={{ mt: 2 }}
          fullWidth
        >
          試合を追加
        </Button>
      )}
    </Box>
  );
}

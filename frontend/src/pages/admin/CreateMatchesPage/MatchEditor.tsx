import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import type { DropResult } from "react-smooth-dnd";
import type { User } from "../../../types";
import { MatchEditArea } from "./MatchEditArea";
import { PlayerPanel } from "./PlayerPanel";
import type { RoundData } from "./types";

export const MatchEditor: React.FC<{
  initialData: RoundData;
  onSave: (data: RoundData) => void;
  finishedPairs?: Set<`${number}-${number}`>;
}> = ({ initialData, onSave, finishedPairs }) => {
  const [isEditing, setIsEditing] = useState(false);
  // 確定済みの表示データ。保存時に更新される。
  const [viewData, setViewData] = useState<RoundData>(initialData);
  // 編集中の draft。キャンセル時は破棄され viewData に戻る。
  const [draftData, setDraftData] = useState<RoundData>(initialData);

  const currentData = isEditing ? draftData : viewData;

  const startEditing = () => {
    setDraftData(viewData); // 現在の確定状態から編集開始
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false); // draftData を破棄し viewData の表示に戻る
  };

  const handleSave = () => {
    setViewData(draftData);
    onSave(draftData);
    setIsEditing(false);
  };

  const handleSlotDrop = (
    matchId: string,
    slotIndex: 0 | 1,
    dr: DropResult,
  ) => {
    setDraftData((prev) => {
      let unassigned = [...prev.unassigned];
      const drafts = prev.drafts.map((draft) => {
        if (draft.id !== matchId) return draft;
        const slots: [User | null, User | null] = [...draft.slots];
        if (dr.removedIndex !== null) {
          slots[slotIndex] = null;
        }
        if (dr.addedIndex !== null) {
          const incoming = dr.payload as User;
          const displaced = slots[slotIndex];
          if (displaced) unassigned = [...unassigned, displaced];
          slots[slotIndex] = incoming;
        }
        return { ...draft, slots };
      });
      return { drafts, unassigned };
    });
  };

  const handleUnassignedDrop = (dr: DropResult) => {
    setDraftData((prev) => {
      const unassigned = [...prev.unassigned];
      if (dr.removedIndex !== null) unassigned.splice(dr.removedIndex, 1);
      if (dr.addedIndex !== null)
        unassigned.splice(dr.addedIndex, 0, dr.payload as User);
      return { ...prev, unassigned };
    });
  };

  const addMatch = () => {
    const matchId = `new-${Date.now()}`;
    setDraftData((prev) => ({
      ...prev,
      drafts: [...prev.drafts, { id: matchId, slots: [null, null] }],
    }));
  };

  const removeMatch = (matchId: string) => {
    setDraftData((prev) => {
      const draft = prev.drafts.find((d) => d.id === matchId);
      if (!draft) return prev;
      const displaced = draft.slots.filter((u): u is User => u !== null);
      return {
        drafts: prev.drafts.filter((d) => d.id !== matchId),
        unassigned: [...prev.unassigned, ...displaced],
      };
    });
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{ mb: 2 }}
      >
        {isEditing ? (
          <>
            <Button variant="outlined" size="small" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button variant="contained" size="small" onClick={handleSave}>
              保存
            </Button>
          </>
        ) : (
          <Button variant="outlined" size="small" onClick={startEditing}>
            編集
          </Button>
        )}
      </Stack>

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        <MatchEditArea
          drafts={currentData.drafts}
          isEditing={isEditing}
          finishedPairs={finishedPairs}
          onSlotDrop={handleSlotDrop}
          onAddMatch={addMatch}
          onRemoveMatch={removeMatch}
        />
        <PlayerPanel
          users={currentData.unassigned}
          isEditing={isEditing}
          onDrop={handleUnassignedDrop}
        />
      </Box>
    </Box>
  );
};

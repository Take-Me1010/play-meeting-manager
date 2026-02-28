import { Box, Paper, Stack, Typography } from "@mui/material";
import type { DropResult } from "react-smooth-dnd";
import type { User } from "../../../types";
import { DNDContainer, DNDDraggable } from "../../../components/dnd";
import { PlayerItem } from "./PlayerItem";

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

export function PlayerPanel({
  users,
  isEditing,
  onDrop,
}: {
  users: User[];
  isEditing: boolean;
  onDrop: (dr: DropResult) => void;
}) {
  return (
    <Box sx={{ flex: "0 0 35%", minWidth: 0 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        未割当参加者
      </Typography>
      <Paper variant="outlined" sx={{ p: 1, minHeight: 200 }}>
        <UnassignedContainer
          users={users}
          isEditing={isEditing}
          onDrop={onDrop}
        />
      </Paper>
    </Box>
  );
}

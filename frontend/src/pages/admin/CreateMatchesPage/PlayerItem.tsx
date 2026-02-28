import { Chip, Stack, Typography } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import type { User } from "../../../types";

export function PlayerItem({ user }: { user: User }) {
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

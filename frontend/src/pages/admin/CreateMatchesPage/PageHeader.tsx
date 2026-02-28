import {
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

type Props = {
  currentRound: number;
  availableRounds: number[];
  maxRound: number;
  onRoundChange: (round: number) => void;
  onBack: () => void;
};

export function PageHeader({
  currentRound,
  availableRounds,
  maxRound,
  onRoundChange,
  onBack,
}: Props) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
      <IconButton onClick={onBack}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h2" component="h1" sx={{ flexGrow: 1 }}>
        対戦表作成
      </Typography>
      <Select
        value={currentRound}
        onChange={(e) => onRoundChange(Number(e.target.value))}
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
    </Stack>
  );
}

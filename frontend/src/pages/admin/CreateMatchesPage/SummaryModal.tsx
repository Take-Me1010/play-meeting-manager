import { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { User } from "../../../types";
import type { RoundData } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  players: User[];
  rounds: Record<number, RoundData>;
};

export function SummaryModal({ open, onClose, players, rounds }: Props) {
  // player id ペア -> "round-matchIndex" のマップを構築
  const matchMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const [roundStr, roundData] of Object.entries(rounds)) {
      const round = Number(roundStr);
      roundData.drafts.forEach((draft, index) => {
        const [playerA, playerB] = draft.slots;
        if (playerA && playerB) {
          const label = `${round}-${index + 1}`;
          map.set(`${playerA.id}-${playerB.id}`, label);
          map.set(`${playerB.id}-${playerA.id}`, label);
        }
      });
    }

    return map;
  }, [rounds]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        対戦表サマリ
        <IconButton onClick={onClose} sx={{ ml: "auto" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {players.map((p) => (
                <TableCell key={p.id} align="center">
                  {p.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((rowPlayer, rowIndex) => (
              <TableRow key={rowPlayer.id}>
                <TableCell>{rowPlayer.name}</TableCell>
                {players.map((colPlayer, colIndex) => {
                  if (rowPlayer.id === colPlayer.id || colIndex > rowIndex) {
                    return (
                      <TableCell
                        key={colPlayer.id}
                        align="center"
                        sx={{ bgcolor: "action.hover" }}
                      >
                        {rowPlayer.id === colPlayer.id ? "—" : ""}
                      </TableCell>
                    );
                  }
                  const label = matchMap.get(
                    `${rowPlayer.id}-${colPlayer.id}`,
                  );
                  return (
                    <TableCell key={colPlayer.id} align="center">
                      {label ?? ""}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}

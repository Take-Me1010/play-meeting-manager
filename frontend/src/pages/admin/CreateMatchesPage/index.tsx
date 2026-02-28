import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, CircularProgress } from "@mui/material";
import type { Match, User } from "../../../types";
import { Layout } from "../../../components/Layout";
import { useAllUsers } from "../../../hooks/admin/useAllUsers";
import { useAllMatches } from "../../../hooks/useAllMatches";
import { PageHeader } from "./PageHeader";
import { MatchEditor } from "./MatchEditor";
import type { MatchDraft, RoundData } from "./types";

/** API から取得した matches と players を元に回戦別の編集状態を構築する */
function buildRoundsFromMatches(
  allMatches: Match[],
  allPlayers: User[],
): Record<number, RoundData> {
  const matchesByRound = allMatches.reduce(
    (acc, match) => {
      (acc[match.round] ??= []).push(match);
      return acc;
    },
    {} as Record<number, Match[]>,
  );

  const rounds: Record<number, RoundData> = {};

  for (const [roundStr, roundMatches] of Object.entries(matchesByRound)) {
    const round = Number(roundStr);
    const drafts: MatchDraft[] = roundMatches.map((match) => ({
      id: String(match.id),
      slots: [match.players[0] ?? null, match.players[1] ?? null],
    }));
    const assignedIds = new Set(
      roundMatches.flatMap((m) => m.players.map((p) => p.id)),
    );
    rounds[round] = {
      drafts,
      unassigned: allPlayers.filter((p) => !assignedIds.has(p.id)),
    };
  }

  // 既存の試合がない場合は第1回戦を空で初期化
  if (Object.keys(rounds).length === 0) {
    rounds[1] = { drafts: [], unassigned: [...allPlayers] };
  }

  return rounds;
}

const Content: React.FC<{
  users: User[];
  matches: Match[];
}> = ({ users, matches }) => {
  const navigate = useNavigate();

  const initialRounds = buildRoundsFromMatches(matches, users);
  const initialRoundKeys = Object.keys(initialRounds).map(Number);

  const [rounds, setRounds] =
    useState<Record<number, RoundData>>(initialRounds);
  const [currentRound, setCurrentRound] = useState(
    Math.min(...initialRoundKeys),
  );

  function switchRound(round: number) {
    setCurrentRound(round);
    if (!rounds[round]) {
      setRounds((prev) => ({
        ...prev,
        [round]: { drafts: [], unassigned: [...users] },
      }));
    }
  }

  function handleSave(data: RoundData) {
    setRounds((prev) => ({ ...prev, [currentRound]: data }));
    console.log("保存:", data);
  }

  const maxRound = Math.max(...Object.keys(rounds).map(Number));
  const availableRounds = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <>
      <PageHeader
        currentRound={currentRound}
        availableRounds={availableRounds}
        maxRound={maxRound}
        onRoundChange={switchRound}
        onBack={() => navigate("/")}
      />
      <MatchEditor
        key={currentRound}
        initialData={rounds[currentRound]}
        onSave={handleSave}
      />
    </>
  );
};

// ---- Page -------------------------------------------------------------------

export const CreateMatchesPage = () => {
  const { users, isLoading: usersLoading, error: usersError } = useAllUsers();
  const players = useMemo(
    () => users.filter((u) => u.role === "player"),
    [users],
  );

  const {
    matches,
    isLoading: matchesLoading,
    error: matchesError,
  } = useAllMatches();

  const isLoading = usersLoading || matchesLoading;

  return (
    <Layout maxWidth="lg">
      {usersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {usersError.message}
        </Alert>
      )}
      {matchesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {matchesError.message}
        </Alert>
      )}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Content
          key={
            // users と matches のどちらかが変化したら Content を完全にリセットする
            users.map((u) => u.id).join(",") +
            matches.map((m) => m.id).join(",")
          }
          users={players}
          matches={matches}
        />
      )}
    </Layout>
  );
};

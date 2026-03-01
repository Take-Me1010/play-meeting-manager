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
import { useAdminMatch } from "../../../hooks/admin/useMatch";
import { SummaryModal } from "./SummaryModal";

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
  onSave: (round: number, data: RoundData) => void;
}> = ({ users, matches, onSave }) => {
  const navigate = useNavigate();

  const [rounds, setRounds] = useState<Record<number, RoundData>>(() =>
    buildRoundsFromMatches(matches, users),
  );
  const [currentRound, setCurrentRound] = useState(() => {
    const initial = buildRoundsFromMatches(matches, users);
    return Math.min(...Object.keys(initial).map(Number));
  });
  const [summaryOpen, setSummaryOpen] = useState(false);

  const finishedPairs = useMemo(() => {
    const pairs = new Set<`${number}-${number}`>();
    for (const match of matches) {
      // 過去の試合のみ参照する
      if (match.round >= currentRound) {
        continue;
      }
      if (match.isFinished) {
        const [a, b] = match.players;
        if (a && b) {
          pairs.add(`${a.id}-${b.id}`);
          pairs.add(`${b.id}-${a.id}`);
        }
      }
    }
    return pairs;
  }, [matches, currentRound]);

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
    onSave(currentRound, data);
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
        onSummary={() => setSummaryOpen(true)}
      />
      <MatchEditor
        key={currentRound}
        initialData={rounds[currentRound]}
        onSave={handleSave}
        finishedPairs={finishedPairs}
      />
      <SummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        players={users}
        rounds={rounds}
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
    refresh,
    isLoading: matchesLoading,
    error: matchesError,
  } = useAllMatches();

  const {
    syncMatches,
    isLoading: syncLoading,
    error: syncError,
  } = useAdminMatch();

  const onSave = async (round: number, data: RoundData) => {
    try {
      await syncMatches(
        round,
        data.drafts.map((d) => ({ playerIds: d.slots.map((s) => s?.id ?? 0) })),
      );
      await refresh();
    } catch {
      // エラーは useAdminMatch 内で state にセットされるのでここでは何もしない
    }
  };

  const isLoading = usersLoading || matchesLoading || syncLoading;
  const error = usersError ?? matchesError ?? syncError;

  return (
    <Layout maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
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
          onSave={onSave}
        />
      )}
    </Layout>
  );
};

import { useCallback, useEffect, useState } from "react";
import type { Match } from "../types";
import { gasApi } from "../api/gasApi";
import { useAuth } from "../contexts/useAuth";

export const useOwnMatch = () => {
  const { user } = useAuth();
  const [ownMatch, setOwnMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fetchError, setFetchError] = useState<Error | null>(null);
  const fetchOwnMatch = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const matches = await gasApi.getCurrentUserMatches();
      // 未終了の試合を取得
      const currentMatch = matches.find((m) => !m.isFinished);
      setOwnMatch(currentMatch || null);
    } catch (err) {
      setFetchError(
        err instanceof Error ? err : new Error("試合情報の取得に失敗しました"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchOwnMatch();
    }
  }, [user, fetchOwnMatch]);

  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState<Error | null>(null);
  const reportMatchResult = useCallback(async (winnerId: number) => {
    if (!ownMatch) return;
    setIsReporting(true);
    setReportError(null);
    try {
      await gasApi.reportMatchResult(ownMatch.id, winnerId);
      // 成功後、試合情報を再取得
      await fetchOwnMatch();
    } catch (e) {
      setReportError(e instanceof Error ? e : new Error("試合結果の報告に失敗しました"));
    } finally {
      setIsReporting(false);
    }
  }, [ownMatch, fetchOwnMatch]);

  return {
    ownMatch,
    isLoading,
    fetchError,
    fetchOwnMatch,
    isReporting,
    reportError,
    reportMatchResult,
  }
};

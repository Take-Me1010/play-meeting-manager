import { useCallback, useEffect, useState } from "react";
import { gasApi } from "../api/gasApi";
import type { Match } from "../types";

export const useAllMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gasApi.getAllMatches();
      setMatches(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("対戦表の取得に失敗しました"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, isLoading, error, refresh: fetchMatches };
};

import { useCallback, useState } from "react";
import { gasApi } from "../../api/gasApi";

export const useAdminMatch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const syncMatches = useCallback(
    async (round: number, matches: { playerIds: number[] }[]) => {
      setIsLoading(true);
      setError(null);
      try {
        await gasApi.syncMatches(round, matches);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "試合の同期に失敗しました";
        setError(new Error(message));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    syncMatches,
    isLoading,
    error,
  };
};

import { useCallback, useState } from "react";
import { gasApi } from "../../api/gasApi";

export const useAdminMatch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMatch = useCallback(
    async (round: number, playerIds: number[]): Promise<number> => {
      setIsLoading(true);
      setError(null);
      try {
        return await gasApi.createMatch(round, playerIds);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "試合の作成に失敗しました";
        setError(new Error(message));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateMatchPlayers = useCallback(
    async (matchId: number, playerIds: number[]): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        return await gasApi.updateMatchPlayers(matchId, playerIds);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "試合の更新に失敗しました";
        setError(new Error(message));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteMatch = useCallback(async (matchId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      return await gasApi.deleteMatch(matchId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "試合の削除に失敗しました";
      setError(new Error(message));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createMatch,
    updateMatchPlayers,
    deleteMatch,
    isLoading,
    error,
  };
};

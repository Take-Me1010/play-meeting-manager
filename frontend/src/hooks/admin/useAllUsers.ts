import { useCallback, useEffect, useState } from "react";
import { gasApi } from "../../api/gasApi";
import type { User } from "../../types";

export const useAllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gasApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("ユーザーの取得に失敗しました"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refresh: fetchUsers };
};

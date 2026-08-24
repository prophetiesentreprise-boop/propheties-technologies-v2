import { supabase } from "@/lib/supabaseClient";
import { trpc } from "@/lib/trpc";
import { useCallback, useMemo } from "react";

export function hasAdminAccess(role?: string | null) {
  return role === "admin" || role === "owner";
}

export function useAuth() {
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();
  }, [utils]);

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading,
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
      isOwner: meQuery.data?.role === "owner",
      isAdmin: hasAdminAccess(meQuery.data?.role),
    };
  }, [meQuery.data, meQuery.error, meQuery.isLoading]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}

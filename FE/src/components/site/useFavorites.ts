"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { FavoriteType, favoriteApi } from "@/lib/api";

export const favoriteKey = (type: FavoriteType, id: string) => `${type}:${id}`;

/** Yêu thích của người dùng đang đăng nhập; cập nhật tức thì trên giao diện rồi mới đồng bộ với máy chủ. */
export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const keysKey = ["favorites", "keys", user?.id ?? "guest"];

  const keysQ = useQuery({ queryKey: keysKey, queryFn: favoriteApi.keys, enabled: !!user, staleTime: 60_000 });
  const keys = useMemo(() => new Set(keysQ.data ?? []), [keysQ.data]);

  const toggle = useMutation({
    mutationFn: ({ type, id, on }: { type: FavoriteType; id: string; on: boolean }) => (on ? favoriteApi.add(type, id) : favoriteApi.remove(type, id)),
    onMutate: async ({ type, id, on }) => {
      await qc.cancelQueries({ queryKey: keysKey });
      const before = qc.getQueryData<string[]>(keysKey) ?? [];
      const k = favoriteKey(type, id);
      qc.setQueryData<string[]>(keysKey, on ? [...before.filter((x) => x !== k), k] : before.filter((x) => x !== k));
      return { before };
    },
    onError: (e: Error, _v, ctx) => {
      if (ctx) qc.setQueryData(keysKey, ctx.before);
      toast.error(e.message);
    },
    onSuccess: (_d, { on }) => toast.success(on ? "Đã thêm vào yêu thích" : "Đã bỏ khỏi yêu thích"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return {
    loggedIn: !!user,
    isFavorite: (type: FavoriteType, id: string) => keys.has(favoriteKey(type, id)),
    set: (type: FavoriteType, id: string, on: boolean) => toggle.mutate({ type, id, on }),
  };
}

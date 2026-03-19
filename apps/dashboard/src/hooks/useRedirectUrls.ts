import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface RedirectUrl {
  id: string;
  url: string;
  type: "web" | "native";
  createdAt: string;
}

export function useRedirectUrls() {
  return useQuery<RedirectUrl[]>({
    queryKey: ["redirect-urls"],
    queryFn: async () => {
      const response = await fetch("/v1/redirect-urls", { credentials: "include" });
      const json = await response.json();
      return json.data ?? [];
    },
  });
}

export function useCreateRedirectUrl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { url: string; type?: "web" | "native" }) => {
      const response = await fetch("/v1/redirect-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message ?? "Failed to create redirect URL");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirect-urls"] });
    },
  });
}

export function useDeleteRedirectUrl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/v1/redirect-urls/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok && response.status !== 204) {
        const err = await response.json();
        throw new Error(err.error?.message ?? "Failed to delete redirect URL");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirect-urls"] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, getSessionUserId } from "../lib/api";
import type { components } from "@blerp/shared";

type EmailAddress = components["schemas"]["EmailAddress"];

export function useEmails() {
  const userId = getSessionUserId();
  return useQuery({
    queryKey: ["emails", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await client.GET("/v1/users/{user_id}/email_addresses", {
        params: { path: { user_id: userId } },
      });
      if (error) throw error;
      return (data?.data || []) as EmailAddress[];
    },
    enabled: !!userId,
  });
}

export function useAddEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await client.POST("/v1/users/{user_id}/email_addresses", {
        params: { path: { user_id: userId } },
        body: { email },
      });
      if (error) throw error;
      return data as EmailAddress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}

export function useDeleteEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (emailId: string) => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await client.DELETE(
        "/v1/users/{user_id}/email_addresses/{email_address_id}",
        {
          params: { path: { user_id: userId, email_address_id: emailId } },
        },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}

export function useSetPrimaryEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (emailId: string) => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await client.POST(
        "/v1/users/{user_id}/email_addresses/{email_address_id}/set_primary",
        {
          params: { path: { user_id: userId, email_address_id: emailId } },
        },
      );
      if (error) throw error;
      return data as EmailAddress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
  });
}

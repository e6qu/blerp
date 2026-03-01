import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, DEMO_USER_ID } from "../lib/api";
import type { components } from "@blerp/shared";

type EmailAddress = components["schemas"]["EmailAddress"];

export function useEmails() {
  return useQuery({
    queryKey: ["emails", DEMO_USER_ID],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/users/{user_id}/email_addresses", {
        params: { path: { user_id: DEMO_USER_ID } },
      });
      if (error) throw error;
      return (data?.data || []) as EmailAddress[];
    },
  });
}

export function useAddEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await client.POST("/v1/users/{user_id}/email_addresses", {
        params: { path: { user_id: DEMO_USER_ID } },
        body: { email },
      });
      if (error) throw error;
      return data as EmailAddress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", DEMO_USER_ID] });
    },
  });
}

export function useDeleteEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (emailId: string) => {
      const { error } = await client.DELETE(
        "/v1/users/{user_id}/email_addresses/{email_address_id}",
        {
          params: { path: { user_id: DEMO_USER_ID, email_address_id: emailId } },
        },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", DEMO_USER_ID] });
    },
  });
}

export function useSetPrimaryEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (emailId: string) => {
      const { data, error } = await client.POST(
        "/v1/users/{user_id}/email_addresses/{email_address_id}/set_primary",
        {
          params: { path: { user_id: DEMO_USER_ID, email_address_id: emailId } },
        },
      );
      if (error) throw error;
      return data as EmailAddress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", DEMO_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
  });
}

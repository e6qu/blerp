import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCsrfToken, getAuthHeaders, getSessionUserId } from "../lib/api";

interface PhoneNumber {
  id: string;
  phone_number: string;
  verification_status: "verified" | "unverified";
  created_at: string;
}

function authedHeaders(): Record<string, string> {
  return {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };
}

async function withCsrf(h: Record<string, string>): Promise<Record<string, string>> {
  const token = await getCsrfToken();
  if (token) h["x-csrf-token"] = token;
  return h;
}

export function usePhoneNumbers() {
  const userId = getSessionUserId();
  return useQuery({
    queryKey: ["phoneNumbers", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      const response = await fetch(`/v1/users/${userId}/phone_numbers`, {
        headers: authedHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch phone numbers");
      const data = await response.json();
      return (data.data || []) as PhoneNumber[];
    },
    enabled: !!userId,
  });
}

export function useAddPhoneNumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const h = await withCsrf(authedHeaders());
      const response = await fetch(`/v1/users/${userId}/phone_numbers`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ phone_number: phoneNumber }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to add phone number");
      }
      return response.json() as Promise<PhoneNumber>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phoneNumbers"] });
    },
  });
}

export function useDeletePhoneNumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phoneNumberId: string) => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const h = await withCsrf(authedHeaders());
      const response = await fetch(`/v1/users/${userId}/phone_numbers/${phoneNumberId}`, {
        method: "DELETE",
        headers: h,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to delete phone number");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phoneNumbers"] });
    },
  });
}

export function useSetPrimaryPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phoneNumberId: string) => {
      const userId = getSessionUserId();
      if (!userId) throw new Error("Not authenticated");
      const h = await withCsrf(authedHeaders());
      const response = await fetch(
        `/v1/users/${userId}/phone_numbers/${phoneNumberId}/set_primary`,
        {
          method: "POST",
          headers: h,
        },
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to set primary phone");
      }
      return response.json() as Promise<PhoneNumber>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phoneNumbers"] });
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
  });
}

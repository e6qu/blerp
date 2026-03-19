import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCsrfToken, DEMO_USER_ID } from "../lib/api";

interface PhoneNumber {
  id: string;
  phone_number: string;
  verification_status: "verified" | "unverified";
  created_at: string;
}

const headers = (): Record<string, string> => ({
  "X-Tenant-Id": "demo-tenant",
  "X-User-Id": DEMO_USER_ID,
  "Content-Type": "application/json",
});

async function withCsrf(h: Record<string, string>): Promise<Record<string, string>> {
  const token = await getCsrfToken();
  if (token) h["x-csrf-token"] = token;
  return h;
}

export function usePhoneNumbers() {
  return useQuery({
    queryKey: ["phoneNumbers", DEMO_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/v1/users/${DEMO_USER_ID}/phone_numbers`, {
        headers: headers(),
      });
      if (!response.ok) throw new Error("Failed to fetch phone numbers");
      const data = await response.json();
      return (data.data || []) as PhoneNumber[];
    },
  });
}

export function useAddPhoneNumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      const h = await withCsrf(headers());
      const response = await fetch(`/v1/users/${DEMO_USER_ID}/phone_numbers`, {
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
      queryClient.invalidateQueries({ queryKey: ["phoneNumbers", DEMO_USER_ID] });
    },
  });
}

export function useDeletePhoneNumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phoneNumberId: string) => {
      const h = await withCsrf(headers());
      const response = await fetch(`/v1/users/${DEMO_USER_ID}/phone_numbers/${phoneNumberId}`, {
        method: "DELETE",
        headers: h,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to delete phone number");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phoneNumbers", DEMO_USER_ID] });
    },
  });
}

export function useSetPrimaryPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phoneNumberId: string) => {
      const h = await withCsrf(headers());
      const response = await fetch(
        `/v1/users/${DEMO_USER_ID}/phone_numbers/${phoneNumberId}/set_primary`,
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
      queryClient.invalidateQueries({ queryKey: ["phoneNumbers", DEMO_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
    },
  });
}

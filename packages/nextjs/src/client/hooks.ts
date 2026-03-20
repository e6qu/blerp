"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBlerpClient } from "./BlerpProvider";
import { useAuth } from "./BlerpProvider";
import type { components, paths } from "@blerp/shared";

type Organization = components["schemas"]["Organization"];
type Membership = components["schemas"]["Membership"];
type Invitation = components["schemas"]["Invitation"];
type OrganizationDomain = components["schemas"]["OrganizationDomain"];
type User = components["schemas"]["User"];
type Session = components["schemas"]["Session"];

export function useOrganizations(query?: { domain?: string }) {
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["organizations", query],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/organizations", {
        params: { query: query as paths["/v1/organizations"]["get"]["parameters"]["query"] },
      });
      if (error) throw error;
      return (data as { data: Organization[] }).data || [];
    },
  });
}

export function useCreateOrganization() {
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; slug?: string; project_id: string }) => {
      const { data, error } = await client.POST("/v1/organizations", { body });
      if (error) throw error;
      return data as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useMemberships(organizationId: string) {
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["memberships", organizationId],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/organizations/{organization_id}/memberships", {
        params: { path: { organization_id: organizationId } },
      });
      if (error) throw error;
      return (data as { data: Membership[] }).data;
    },
    enabled: !!organizationId,
  });
}

export function useInvitations(organizationId: string) {
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["invitations", organizationId],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/invitations", {
        params: { query: { organization_id: organizationId } },
      });
      if (error) throw error;
      return (data as { data: Invitation[] }).data;
    },
    enabled: !!organizationId,
  });
}

export function useDomains(organizationId: string) {
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["domains", organizationId],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/organizations/{organization_id}/domains", {
        params: { path: { organization_id: organizationId } },
      });
      if (error) throw error;
      return (data as { data: OrganizationDomain[] }).data;
    },
    enabled: !!organizationId,
  });
}

export function useAddDomain(organizationId: string) {
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (domain: string) => {
      const { data, error } = await client.POST("/v1/organizations/{organization_id}/domains", {
        params: { path: { organization_id: organizationId } },
        body: { domain },
      });
      if (error) throw error;
      return data as OrganizationDomain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains", organizationId] });
    },
  });
}

export function useDeleteDomain(organizationId: string) {
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (domainId: string) => {
      const { error } = await client.DELETE(
        "/v1/organizations/{organization_id}/domains/{domain_id}",
        {
          params: { path: { organization_id: organizationId, domain_id: domainId } },
        },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains", organizationId] });
    },
  });
}

export function useVerifyDomain(organizationId: string) {
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (domainId: string) => {
      const { data, error } = await client.POST(
        "/v1/organizations/{organization_id}/domains/{domain_id}/verify",
        {
          params: { path: { organization_id: organizationId, domain_id: domainId } },
        },
      );
      if (error) throw error;
      return data as OrganizationDomain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains", organizationId] });
    },
  });
}

export function useUser() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const client = useBlerpClient();

  const query = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/userinfo", {});
      if (error) throw error;
      return data as { sub: string; name: string; email: string };
    },
    enabled: isSignedIn,
  });

  return {
    isLoaded: authLoaded && !query.isLoading,
    isSignedIn,
    user: query.data
      ? {
          id: query.data.sub,
          fullName: query.data.name,
          primaryEmailAddress: { emailAddress: query.data.email },
          primaryPhoneNumber: null,
          username: null,
          imageUrl: null,
          hasImage: false,
        }
      : null,
  };
}

export function useCurrentUser() {
  const { userId } = useAuth();
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["currentUser", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await client.GET("/v1/users/{user_id}", {
        params: { path: { user_id: userId } },
      });
      if (error) throw error;
      return data as User;
    },
    enabled: !!userId,
  });
}

export function useFullUser() {
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const client = useBlerpClient();

  const query = useQuery({
    queryKey: ["fullUser", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await client.GET("/v1/users/{user_id}", {
        params: { path: { user_id: userId } },
      });
      if (error) throw error;
      return data as User;
    },
    enabled: !!userId,
  });

  return {
    isLoaded: authLoaded && !query.isLoading,
    isSignedIn,
    user: query.data ?? null,
  };
}

export function useSessions() {
  const client = useBlerpClient();
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/sessions", {});
      if (error) throw error;
      return (data as { data: Session[] }).data || [];
    },
  });
}

export function useSession() {
  const client = useBlerpClient();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  const query = useQuery({
    queryKey: ["session", "current"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/sessions", {});
      if (error) throw error;
      const sessions = (data as { data: Session[] }).data || [];
      return sessions[0] ?? null;
    },
    enabled: isSignedIn,
  });

  return {
    isLoaded: authLoaded && !query.isLoading,
    isSignedIn,
    session: query.data,
  };
}

export function useDeleteSession() {
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await client.DELETE("/v1/sessions/{session_id}", {
        params: { path: { session_id: sessionId } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useUpdateUser() {
  const { userId } = useAuth();
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { first_name?: string; last_name?: string; username?: string }) => {
      if (!userId) throw new Error("No user ID");
      const { data, error } = await client.PATCH("/v1/users/{user_id}", {
        params: { path: { user_id: userId } },
        body,
      });
      if (error) throw error;
      return data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export interface SignInStatus {
  id: string | null;
  status: "needs_identifier" | "needs_first_factor" | "needs_second_factor" | "complete" | "failed";
  identifier: string | null;
  supportedFirstFactors: string[];
  supportedSecondFactors: string[];
}

export interface SignUpStatus {
  id: string | null;
  status: "needs_identifier" | "missing_requirements" | "complete" | "failed";
  identifier: string | null;
  missingFields: string[];
}

export function useSignIn() {
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SignInStatus>({
    id: null,
    status: "needs_identifier",
    identifier: null,
    supportedFirstFactors: ["email_code", "password"],
    supportedSecondFactors: ["totp", "backup_code"],
  });
  const [isLoading, setIsLoading] = useState(false);

  const create = async (params: { identifier: string; strategy?: string }) => {
    setIsLoading(true);
    try {
      const strategy = (params.strategy ?? "password") as
        | "password"
        | "magic_link"
        | "otp"
        | "passkey"
        | "oauth";
      const { data, error } = await client.POST("/v1/auth/signins", {
        body: { identifier: params.identifier, strategy },
      });
      if (error) {
        setStatus((prev) => ({ ...prev, status: "failed" }));
        throw error;
      }
      const result = data as { id: string };
      setStatus({
        id: result.id,
        status: "needs_first_factor",
        identifier: params.identifier,
        supportedFirstFactors: ["email_code", "password"],
        supportedSecondFactors: ["totp", "backup_code"],
      });
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const attemptFirstFactor = async (params: {
    strategy: string;
    code?: string;
    password?: string;
  }) => {
    if (!status.id) throw new Error("No sign-in attempt in progress");
    setIsLoading(true);
    try {
      const { data, error } = await client.POST("/v1/auth/signins/{signin_id}/attempt", {
        params: { path: { signin_id: status.id } },
        body: { password: params.password, code: params.code },
      });
      if (error) {
        setStatus((prev) => ({ ...prev, status: "failed" }));
        throw error;
      }
      const response = data as {
        session?: { id: string };
        tokens?: { access_token: string };
        status?: string;
        signin_id?: string;
      };

      // If the server says 2FA is needed, transition to needs_second_factor
      if (response.status === "needs_second_factor" || !response.session) {
        setStatus((prev: SignInStatus) => ({ ...prev, status: "needs_second_factor" }));
        return { status: "needs_second_factor" as const };
      }

      const result = { status: "complete" as const, session_id: response.session.id };
      setStatus((prev: SignInStatus) => ({ ...prev, status: "complete" }));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const attemptSecondFactor = async (params: { strategy: string; code: string }) => {
    if (!status.id) throw new Error("No sign-in attempt in progress");
    setIsLoading(true);
    try {
      const { data, error } = await client.POST("/v1/auth/signins/{signin_id}/attempt", {
        params: { path: { signin_id: status.id } },
        body: { code: params.code },
      });
      if (error) {
        setStatus((prev) => ({ ...prev, status: "failed" }));
        throw error;
      }
      const response = data as { session: { id: string }; tokens: { access_token: string } };
      const result = { status: "complete" as const, session_id: response.session.id };
      setStatus((prev: SignInStatus) => ({ ...prev, status: "complete" }));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStatus({
      id: null,
      status: "needs_identifier",
      identifier: null,
      supportedFirstFactors: ["email_code", "password"],
      supportedSecondFactors: ["totp", "backup_code"],
    });
  };

  return {
    ...status,
    isLoading,
    create,
    attemptFirstFactor,
    attemptSecondFactor,
    reset,
  };
}

export function useSignUp() {
  const client = useBlerpClient();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SignUpStatus>({
    id: null,
    status: "needs_identifier",
    identifier: null,
    missingFields: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const create = async (params: { identifier: string; password?: string }) => {
    setIsLoading(true);
    try {
      const { data, error } = await client.POST("/v1/auth/signups", {
        body: { email: params.identifier, password: params.password, strategy: "password" },
      });
      if (error) {
        setStatus((prev) => ({ ...prev, status: "failed" }));
        throw error;
      }
      const result = data as { id: string; missing_fields?: string[] };
      setStatus({
        id: result.id,
        status: "missing_requirements",
        identifier: params.identifier,
        missingFields: result.missing_fields ?? ["verification"],
      });
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const prepareVerification = async (params: { strategy: string }) => {
    if (!status.id) throw new Error("No sign-up attempt in progress");
    setIsLoading(true);
    try {
      return { status: "prepared", strategy: params.strategy };
    } finally {
      setIsLoading(false);
    }
  };

  const attemptVerification = async (params: { strategy: string; code: string }) => {
    if (!status.id) throw new Error("No sign-up attempt in progress");
    setIsLoading(true);
    try {
      const { data, error } = await client.POST("/v1/auth/signups/{signup_id}/attempt", {
        params: { path: { signup_id: status.id } },
        body: { code: params.code, strategy: params.strategy },
      });
      if (error) {
        setStatus((prev) => ({ ...prev, status: "failed" }));
        throw error;
      }
      const result = data as { status: string };
      setStatus((prev: SignUpStatus) => ({ ...prev, status: "complete" }));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (_params: Record<string, unknown>) => {
    throw new Error("signUp.update() is not yet supported. Use create() with all fields instead.");
  };

  const reset = () => {
    setStatus({
      id: null,
      status: "needs_identifier",
      identifier: null,
      missingFields: [],
    });
  };

  return {
    ...status,
    isLoading,
    create,
    prepareVerification,
    attemptVerification,
    update,
    reset,
  };
}

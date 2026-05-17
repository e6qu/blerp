import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/api";

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: sessions } = await client.GET("/v1/sessions", {});
      const currentSession = sessions?.data?.[0];

      if (currentSession) {
        await client.DELETE("/v1/sessions/{session_id}", {
          params: { path: { session_id: currentSession.id } },
        });
      }

      // BUG-51: clear both cookie names — Clerk-compat consumers may read `__session`.
      const expired = "; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = `__blerp_session=${expired}`;
      document.cookie = `__session=${expired}`;

      return true;
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.assign("/sign-in");
    },
  });
}

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

      document.cookie = "__blerp_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      return true;
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/sign-in";
    },
  });
}

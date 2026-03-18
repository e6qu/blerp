import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/api";

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const { error } = await client.DELETE("/v1/organizations/{organization_id}", {
        params: { path: { organization_id: organizationId } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

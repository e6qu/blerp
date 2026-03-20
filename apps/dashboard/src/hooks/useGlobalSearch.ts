import { useQuery } from "@tanstack/react-query";

interface SearchUser {
  id: string;
  first_name?: string;
  last_name?: string;
  email_addresses?: { email: string }[];
  image_url?: string;
}

interface SearchOrg {
  id: string;
  name: string;
  slug: string;
}

interface SearchResults {
  users: SearchUser[];
  organizations: SearchOrg[];
  isLoading: boolean;
}

async function fetchSearchResults(query: string) {
  const encoded = encodeURIComponent(query);
  const [usersRes, orgsRes] = await Promise.allSettled([
    fetch(`/v1/users?query=${encoded}&limit=5`, { credentials: "include" }).then((r) => r.json()),
    fetch(`/v1/organizations?query=${encoded}&limit=5`, { credentials: "include" }).then((r) =>
      r.json(),
    ),
  ]);

  return {
    users: (usersRes.status === "fulfilled" ? usersRes.value.data : []) as SearchUser[],
    organizations: (orgsRes.status === "fulfilled" ? orgsRes.value.data : []) as SearchOrg[],
  };
}

export function useGlobalSearch(query: string, enabled: boolean): SearchResults {
  const trimmed = query.trim();
  const shouldSearch = enabled && trimmed.length >= 2;

  const { data, isLoading } = useQuery({
    queryKey: ["global-search", trimmed],
    queryFn: () => fetchSearchResults(trimmed),
    enabled: shouldSearch,
    staleTime: 30_000,
    gcTime: 60_000,
  });

  if (!shouldSearch) {
    return { users: [], organizations: [], isLoading: false };
  }

  return {
    users: data?.users ?? [],
    organizations: data?.organizations ?? [],
    isLoading,
  };
}

import { useUserIdentities, useUnlinkIdentity } from "../../hooks/useUserIdentities";
import { useToast } from "../ui/Toast";
import { client, getSessionUserId } from "../../lib/api";
import { GitBranch, Mail, Unlink, Link } from "lucide-react";

const PROVIDERS = [
  { id: "github", name: "GitHub", icon: GitBranch },
  { id: "google", name: "Google", icon: Mail },
] as const;

export function ConnectedAccounts() {
  const userId = getSessionUserId() ?? "";
  const { data: identities, isLoading } = useUserIdentities(userId);
  const unlinkIdentity = useUnlinkIdentity(userId);
  const { toast } = useToast();

  if (isLoading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="h-14 rounded-lg border animate-pulse bg-gray-100 dark:bg-gray-700 dark:border-gray-700"
          />
        ))}
      </div>
    );

  const linkedProviders =
    (identities as { data?: Array<{ id: string; provider: string; provider_user_id: string }> })
      ?.data ?? [];

  const handleDisconnect = async (oauthAccountId: string, providerName: string) => {
    try {
      await unlinkIdentity.mutateAsync(oauthAccountId);
      toast(`Disconnected from ${providerName}`, "success");
    } catch {
      toast("Failed to disconnect account", "error");
    }
  };

  const handleConnect = async (provider: "github" | "google" | "discord") => {
    const { data, error } = await client.GET("/v1/auth/oauth/{provider}", {
      params: {
        path: { provider },
        query: { redirect_uri: window.location.origin + "/callback" },
      },
    });

    if (error) {
      toast("Failed to initiate connection", "error");
    } else if (data.url) {
      window.location.assign(data.url);
    }
  };

  return (
    <div className="space-y-3">
      {PROVIDERS.map((provider) => {
        const linked = linkedProviders.find((id) => id.provider === provider.id);
        const Icon = provider.icon;

        return (
          <div
            key={provider.id}
            className="flex items-center justify-between rounded-lg border dark:border-gray-700 p-3"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {provider.name}
                </div>
                {linked ? (
                  <div className="text-xs text-green-600">Connected</div>
                ) : (
                  <div className="text-xs text-gray-400 dark:text-gray-500">Not connected</div>
                )}
              </div>
            </div>

            {linked ? (
              <button
                onClick={() => handleDisconnect(linked.id, provider.name)}
                disabled={unlinkIdentity.isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <Unlink className="h-3.5 w-3.5" />
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleConnect(provider.id)}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                <Link className="h-3.5 w-3.5" />
                Connect
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

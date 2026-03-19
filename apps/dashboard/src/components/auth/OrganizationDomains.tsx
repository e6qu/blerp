import { useState } from "react";
import { Globe, Trash2, CheckCircle, XCircle, RefreshCw, Plus, Copy, Check } from "lucide-react";
import { useDomains, useVerifyDomain, useDeleteDomain } from "../../hooks/useDomains";
import { AddDomainModal } from "./AddDomainModal";
import type { components } from "@blerp/shared";

type OrganizationDomain = components["schemas"]["OrganizationDomain"];

export function OrganizationDomains({ organizationId }: { organizationId: string }) {
  const { data: domains, isLoading } = useDomains(organizationId);
  const verifyDomain = useVerifyDomain();
  const deleteDomain = useDeleteDomain();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleVerify = (domainId: string) => {
    verifyDomain.mutate({ organizationId, domainId });
  };

  const handleDelete = (domain: OrganizationDomain) => {
    if (confirm(`Are you sure you want to delete "${domain.domain}"?`)) {
      deleteDomain.mutate({ organizationId, domainId: domain.id });
    }
  };

  const handleCopyToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (isLoading)
    return <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading domains...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add domain
        </button>
      </div>

      {domains && domains.length > 0 ? (
        <div className="overflow-hidden rounded-lg border bg-white dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Verification
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {domains.map((domain: OrganizationDomain) => (
                <tr key={domain.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        {domain.domain}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 text-xs font-semibold leading-5 ${
                        domain.verification_status === "verified"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                      }`}
                    >
                      {domain.verification_status === "verified" ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Unverified
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {domain.verification_status !== "verified" && domain.verification_token && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Add this TXT record to your DNS:
                        </p>
                        <div className="flex items-center gap-2 rounded bg-gray-50 dark:bg-gray-800 p-2">
                          <code className="flex-1 text-xs text-gray-700 dark:text-gray-200 break-all">
                            _blerp-challenge.{domain.domain} TXT &quot;{domain.verification_token}
                            &quot;
                          </code>
                          <button
                            onClick={() => handleCopyToken(domain.verification_token!)}
                            className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
                            title="Copy token"
                          >
                            {copiedToken === domain.verification_token ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {domain.verification_status !== "verified" && (
                        <button
                          onClick={() => handleVerify(domain.id)}
                          disabled={verifyDomain.isPending}
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 disabled:opacity-50"
                          title="Verify domain"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${verifyDomain.isPending ? "animate-spin" : ""}`}
                          />
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(domain)}
                        disabled={deleteDomain.isPending}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 disabled:opacity-50"
                        title="Delete domain"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
          <p>No domains configured.</p>
          <p className="text-sm">Add a domain to enable verified email matching.</p>
        </div>
      )}

      <AddDomainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organizationId={organizationId}
      />
    </div>
  );
}

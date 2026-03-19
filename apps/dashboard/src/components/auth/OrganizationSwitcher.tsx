import { useState } from "react";
import { useOrganizations } from "../../hooks/useOrganizations";
import { CreateOrganizationModal } from "./CreateOrganizationModal";
import { ChevronDown, Plus, Check, RefreshCw } from "lucide-react";
import type { components } from "@blerp/shared";

type Organization = components["schemas"]["Organization"];

export function OrganizationSwitcher() {
  const { data: organizations, isLoading, isError, refetch } = useOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedOrg = organizations?.find((o: Organization) => o.id === selectedOrgId);

  if (isLoading)
    return <div className="h-10 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-700"></div>;

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
        <span>Failed to load</span>
        <button
          onClick={() => refetch()}
          className="text-red-600 dark:text-red-400 hover:text-red-800"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const handleCreateClick = () => {
    setIsOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = (orgId: string) => {
    setSelectedOrgId(orgId);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="truncate">{selectedOrg ? selectedOrg.name : "Select Organization"}</span>
          <ChevronDown className="ml-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
            <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-md border bg-white dark:bg-gray-800 shadow-lg">
              <div className="py-1">
                {organizations && organizations.length > 0 ? (
                  organizations.map((org: Organization) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        setSelectedOrgId(org.id);
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="flex-1 truncate">{org.name}</span>
                      {org.id === selectedOrgId && (
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No organizations yet
                  </div>
                )}
                <button
                  onClick={handleCreateClick}
                  className="flex w-full items-center border-t px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Organization
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

import { Plus } from "lucide-react";
import type { components } from "@blerp/shared";

type Organization = components["schemas"]["Organization"];

interface OrganizationListProps {
  organizations: Organization[];
  selectedOrgId: string | null;
  onSelectOrganization: (id: string) => void;
  onCreateOrganization: () => void;
}

export function OrganizationList({
  organizations,
  selectedOrgId,
  onSelectOrganization,
  onCreateOrganization,
}: OrganizationListProps) {
  return (
    <div className="space-y-2">
      {organizations.map((org) => (
        <button
          key={org.id}
          onClick={() => onSelectOrganization(org.id)}
          className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
            selectedOrgId === org.id
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {org.name}
        </button>
      ))}
      {organizations.length === 0 && (
        <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No organizations yet.</p>
      )}
      <button
        onClick={onCreateOrganization}
        className="flex w-full items-center rounded-lg px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Plus className="mr-2 h-4 w-4" />
        New organization
      </button>
    </div>
  );
}

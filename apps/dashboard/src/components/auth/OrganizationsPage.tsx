import { useOrganizations } from "../../hooks/useOrganizations";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { OrganizationMembers } from "./OrganizationMembers";
import { OrganizationInvitations } from "./OrganizationInvitations";
import { OrganizationDomains } from "./OrganizationDomains";
import { WebhookList } from "./WebhookList";
import { CreateOrganizationModal } from "./CreateOrganizationModal";
import { DeleteOrganizationModal } from "./DeleteOrganizationModal";
import type { components } from "@blerp/shared";

type Organization = components["schemas"]["Organization"];

export function OrganizationsPage() {
  const { data: organizations, isLoading } = useOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "invitations" | "domains" | "webhooks">(
    "members",
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (isLoading)
    return (
      <div className="p-8 space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-10 rounded bg-gray-200 animate-pulse" />
        ))}
      </div>
    );

  const selectedOrg = organizations?.find((org: Organization) => org.id === selectedOrgId);

  const handleCreateSuccess = (orgId: string) => {
    setSelectedOrgId(orgId);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-1">
          {organizations?.map((org: Organization) => (
            <button
              key={org.id}
              onClick={() => setSelectedOrgId(org.id)}
              className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                selectedOrgId === org.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {selectedOrgId ? (
            <div className="space-y-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("members")}
                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                      activeTab === "members"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Members
                  </button>
                  <button
                    onClick={() => setActiveTab("invitations")}
                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                      activeTab === "invitations"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Invitations
                  </button>
                  <button
                    onClick={() => setActiveTab("domains")}
                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                      activeTab === "domains"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Domains
                  </button>
                  <button
                    onClick={() => setActiveTab("webhooks")}
                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                      activeTab === "webhooks"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Webhooks
                  </button>
                </nav>
              </div>

              {activeTab === "members" && <OrganizationMembers organizationId={selectedOrgId} />}
              {activeTab === "invitations" && (
                <OrganizationInvitations organizationId={selectedOrgId} />
              )}
              {activeTab === "domains" && <OrganizationDomains organizationId={selectedOrgId} />}
              {activeTab === "webhooks" && <WebhookList />}

              <div className="mt-8 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-900">Danger Zone</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Permanently delete this organization and all of its data.
                </p>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete organization
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500">
              Select an organization to manage its members, invitations, domains, and webhooks.
            </div>
          )}
        </div>
      </div>

      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedOrg && (
        <DeleteOrganizationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          organizationName={selectedOrg.name}
          organizationId={selectedOrg.id}
          onSuccess={() => setSelectedOrgId(null)}
        />
      )}
    </div>
  );
}

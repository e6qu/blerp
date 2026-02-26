import { useOrganizations } from "../../hooks/useOrganizations";
import { Plus } from "lucide-react";
import { useState } from "react";
import { OrganizationMembers } from "./OrganizationMembers";
import { OrganizationInvitations } from "./OrganizationInvitations";
import { WebhookList } from "./WebhookList";
import type { components } from "@blerp/shared";

type Organization = components["schemas"]["Organization"];

export function OrganizationsPage() {
  const { data: organizations, isLoading } = useOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "invitations" | "webhooks">("members");

  if (isLoading) return <div className="p-8">Loading organizations...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <button className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Org List */}
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

        {/* Org Details */}
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
              {activeTab === "webhooks" && <WebhookList />}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500">
              Select an organization to manage its members, invitations, and webhooks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

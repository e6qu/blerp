"use client";

import React, { useState } from "react";
import {
  useMemberships,
  useInvitations,
  useDomains,
  useAddDomain,
  useDeleteDomain,
  useVerifyDomain,
} from "../hooks";

export function OrganizationProfile({ organizationId }: { organizationId: string }) {
  const [activeTab, setActiveTab] = useState<"general" | "members" | "invitations" | "domains">(
    "general",
  );
  const [newDomain, setNewDomain] = useState("");

  const { data: memberships, isLoading: loadingMembers } = useMemberships(organizationId);
  const { data: invitations, isLoading: loadingInvites } = useInvitations(organizationId);
  const { data: domains, isLoading: loadingDomains } = useDomains(organizationId);

  const addDomainMutation = useAddDomain(organizationId);
  const deleteDomainMutation = useDeleteDomain(organizationId);
  const verifyDomainMutation = useVerifyDomain(organizationId);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    await addDomainMutation.mutateAsync(newDomain);
    setNewDomain("");
  };

  return (
    <div className="mx-auto max-w-4xl rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-50 border-b px-8 py-4">
        <h2 className="text-xl font-bold text-gray-900">Organization Profile</h2>
      </div>

      <div className="flex border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "general" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "members" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab("invitations")}
          className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "invitations" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Invitations
        </button>
        <button
          onClick={() => setActiveTab("domains")}
          className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "domains" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Domains
        </button>
      </div>

      <div className="p-8">
        {activeTab === "general" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Manage organization details and metadata.</p>
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-4">
            {loadingMembers ? (
              <p>Loading members...</p>
            ) : (
              <ul className="divide-y">
                {memberships?.map((m) => (
                  <li key={m.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.user_id}</p>
                      <p className="text-xs text-gray-500">{m.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "invitations" && (
          <div className="space-y-4">
            {loadingInvites ? (
              <p>Loading invitations...</p>
            ) : (
              <ul className="divide-y">
                {invitations?.map((i) => (
                  <li key={i.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{i.email}</p>
                      <p className="text-xs text-gray-500">{i.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "domains" && (
          <div className="space-y-6">
            <form onSubmit={handleAddDomain} className="flex gap-2">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={addDomainMutation.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add Domain
              </button>
            </form>

            {loadingDomains ? (
              <p>Loading domains...</p>
            ) : (
              <ul className="divide-y border-t">
                {domains?.map((d) => (
                  <li key={d.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.domain}</p>
                      <div className="flex gap-2 items-center">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${d.verification_status === "verified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {d.verification_status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {d.verification_status !== "verified" && (
                        <button
                          onClick={() => verifyDomainMutation.mutate(d.id)}
                          disabled={verifyDomainMutation.isPending}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => deleteDomainMutation.mutate(d.id)}
                        disabled={deleteDomainMutation.isPending}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

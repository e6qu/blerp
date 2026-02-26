"use client";

import React, { useState } from "react";
import { useMemberships, useInvitations } from "../hooks";

export function OrganizationProfile({ organizationId }: { organizationId: string }) {
  const [activeTab, setActiveTab] = useState<"general" | "members" | "invitations">("general");
  const { data: memberships, isLoading: loadingMembers } = useMemberships(organizationId);
  const { data: invitations, isLoading: loadingInvites } = useInvitations(organizationId);

  return (
    <div className="mx-auto max-w-4xl rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-50 border-b px-8 py-4">
        <h2 className="text-xl font-bold text-gray-900">Organization Profile</h2>
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-8 py-3 text-sm font-medium ${activeTab === "general" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-8 py-3 text-sm font-medium ${activeTab === "members" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab("invitations")}
          className={`px-8 py-3 text-sm font-medium ${activeTab === "invitations" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Invitations
        </button>
      </div>

      <div className="p-8">
        {activeTab === "general" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Manage organization details and metadata.</p>
            {/* Metadata fields would go here */}
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
      </div>
    </div>
  );
}

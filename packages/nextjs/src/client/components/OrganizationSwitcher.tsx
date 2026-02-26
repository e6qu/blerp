"use client";

import React, { useState } from "react";
import { useOrganizations } from "../hooks";
import { ChevronDown, Plus, Check } from "lucide-react";
import type { components } from "@blerp/shared";

type Organization = components["schemas"]["Organization"];

export function OrganizationSwitcher() {
  const { data: organizations, isLoading } = useOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOrg = organizations?.find((o: Organization) => o.id === selectedOrgId);

  if (isLoading) return <div className="h-10 w-full animate-pulse rounded bg-gray-100"></div>;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate">{selectedOrg ? selectedOrg.name : "Select Organization"}</span>
        <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
          <div className="py-1">
            {organizations?.map((org: Organization) => (
              <button
                key={org.id}
                onClick={() => {
                  setSelectedOrgId(org.id);
                  setIsOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span className="flex-1 truncate">{org.name}</span>
                {org.id === selectedOrgId && <Check className="h-4 w-4 text-blue-600" />}
              </button>
            ))}
            <button className="flex w-full items-center border-t px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

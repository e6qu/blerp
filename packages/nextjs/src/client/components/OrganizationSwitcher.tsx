"use client";

import React, { useState } from "react";
import { useOrganizations } from "../hooks";
import { useAuth } from "../BlerpProvider";
import { ChevronDown, Plus, Check, User, Building2 } from "lucide-react";
import type { components } from "@blerp/shared";

type Organization = components["schemas"]["Organization"];

export interface OrganizationSwitcherProps {
  hidePersonal?: boolean;
  afterCreateOrganizationUrl?: string;
  appearance?: Record<string, unknown>;
}

export function OrganizationSwitcher({ hidePersonal = false }: OrganizationSwitcherProps) {
  const { data: organizations, isLoading } = useOrganizations();
  const { orgId: selectedOrgId, setActive } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOrg = organizations?.find((o: Organization) => o.id === selectedOrgId);

  if (isLoading) {
    return (
      <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-100 border border-gray-200"></div>
    );
  }

  return (
    <div className="relative inline-block w-full max-w-[240px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-500">
            {selectedOrg ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <span className="truncate">{selectedOrg ? selectedOrg.name : "Personal Account"}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-0 top-full z-20 mt-2 w-full min-w-[200px] rounded-xl border border-gray-200 bg-white p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
            <div className="mb-1 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Switch Organization
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {!hidePersonal && (
                <button
                  onClick={() => {
                    setActive({ organization: null });
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    !selectedOrgId ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded ${!selectedOrgId ? "bg-blue-100" : "bg-gray-100 text-gray-500"}`}
                  >
                    <User className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left font-medium">Personal Account</span>
                  {!selectedOrgId && <Check className="h-4 w-4" />}
                </button>
              )}

              {organizations?.map((org: Organization) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setActive({ organization: org.id });
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    org.id === selectedOrgId
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded ${org.id === selectedOrgId ? "bg-blue-100" : "bg-gray-100 text-gray-500"}`}
                  >
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="truncate font-medium">{org.name}</p>
                    {!!org.public_metadata?.entity_id && (
                      <p className="truncate text-[10px] text-gray-400 uppercase tracking-tight">
                        Entity: {String(org.public_metadata.entity_id)}
                      </p>
                    )}
                  </div>
                  {org.id === selectedOrgId && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>

            <div className="mt-1 border-t border-gray-100 pt-1">
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
                  <Plus className="h-4 w-4" />
                </div>
                <span>Create Organization</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

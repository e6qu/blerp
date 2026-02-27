"use client";

import React, { useState, useEffect } from "react";
import { useCreateOrganization, useUser, useOrganizations } from "../hooks";

export function CreateOrganization() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const { data: user } = useUser();
  const createOrg = useCreateOrganization();

  const userEmail = (user as { email?: string })?.email;
  const userDomain = userEmail?.split("@")[1];
  const { data: suggestedOrgs, isLoading: loadingSuggestions } = useOrganizations(
    userDomain ? { domain: userDomain } : undefined,
  );

  useEffect(() => {
    if (name && !slug) {
      setSlug(name.toLowerCase().replace(/\s+/g, "-"));
    }
  }, [name, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrg.mutateAsync({ name, slug, project_id: "default" });
      alert("Organization created successfully!");
      setName("");
      setSlug("");
    } catch {
      alert("Failed to create organization");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Create organization</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Organization name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Organization slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={createOrg.isPending}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {createOrg.isPending ? "Creating..." : "Create organization"}
          </button>
        </form>
      </div>

      {userDomain && !loadingSuggestions && suggestedOrgs && suggestedOrgs.length > 0 && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-blue-900">
            Found existing organizations for {userDomain}
          </h3>
          <p className="mb-4 text-xs text-blue-700">
            You might want to join one of these instead of creating a new one.
          </p>
          <ul className="space-y-2">
            {suggestedOrgs.map((org: { id: string; name: string }) => (
              <li
                key={org.id}
                className="flex items-center justify-between rounded-lg bg-white p-3 shadow-xs"
              >
                <span className="text-sm font-medium text-gray-900">{org.name}</span>
                <button
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  onClick={() => alert("Request to join sent!")}
                >
                  Request to join
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

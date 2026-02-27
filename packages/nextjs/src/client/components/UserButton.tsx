"use client";

import React, { useState } from "react";
import { useCurrentUser } from "../hooks";
import { useAuth } from "../BlerpProvider";
import { ChevronDown, User, Settings, LogOut, Building2 } from "lucide-react";
import { OrganizationSwitcher } from "./OrganizationSwitcher";

export interface UserButtonProps {
  showName?: boolean;
  appearance?: Record<string, unknown>;
  afterSignOutUrl?: string;
  userProfileUrl?: string;
  userProfileMode?: "navigation" | "modal";
  showOrganizations?: boolean;
}

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName[0].toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "U";
}

export function UserButton({
  showName = false,
  afterSignOutUrl = "/",
  userProfileUrl = "/user-profile",
  showOrganizations = true,
}: UserButtonProps) {
  const { data: user, isLoading } = useCurrentUser();
  const { isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      window.location.href = afterSignOutUrl;
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100 border border-gray-200"></div>
    );
  }

  const initials = getInitials(
    user?.first_name,
    user?.last_name,
    user?.email_addresses?.[0]?.email,
  );

  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || user?.email_addresses?.[0]?.email || "User";

  const primaryEmail = user?.email_addresses?.[0]?.email;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium text-sm">
          {user?.image_url ? (
            <img
              src={user.image_url}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        {showName && (
          <div className="flex items-center gap-1 pr-2">
            <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
              {displayName}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-full z-20 mt-2 w-[280px] rounded-xl border border-gray-200 bg-white p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
            <div className="px-3 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              {primaryEmail && <p className="text-xs text-gray-500 truncate">{primaryEmail}</p>}
            </div>

            <div className="py-1">
              <a
                href={userProfileUrl}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <span>Profile</span>
              </a>

              <a
                href={`${userProfileUrl}?tab=security`}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100">
                  <Settings className="h-4 w-4 text-gray-500" />
                </div>
                <span>Account Settings</span>
              </a>
            </div>

            {showOrganizations && (
              <>
                <div className="border-t border-gray-100 py-1 px-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <Building2 className="h-3 w-3" />
                    Organizations
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    <OrganizationSwitcher hidePersonal={false} />
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100">
                  <LogOut className="h-4 w-4" />
                </div>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

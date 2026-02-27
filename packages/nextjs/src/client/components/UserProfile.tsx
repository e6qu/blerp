"use client";

import React, { useState } from "react";
import { useCurrentUser, useSessions, useDeleteSession, useUpdateUser } from "../hooks";

type TabKey = "account" | "security" | "sessions";

export function UserProfile() {
  const [activeTab, setActiveTab] = useState<TabKey>("account");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: sessions, isLoading: loadingSessions } = useSessions();
  const deleteSessionMutation = useDeleteSession();
  const updateUserMutation = useUpdateUser();

  React.useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setUsername(user.username || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserMutation.mutateAsync({
      first_name: firstName,
      last_name: lastName,
      username: username || undefined,
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm("Are you sure you want to revoke this session?")) {
      await deleteSessionMutation.mutateAsync(sessionId);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-50 border-b px-8 py-4">
        <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
      </div>

      <div className="flex border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("account")}
          className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
            activeTab === "account"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Account
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
            activeTab === "security"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
            activeTab === "sessions"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Sessions
        </button>
      </div>

      <div className="p-8">
        {activeTab === "account" && (
          <div className="space-y-6">
            {loadingUser ? (
              <p className="text-gray-500">Loading profile...</p>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                {user?.email_addresses && user.email_addresses.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="text-sm text-gray-600">{user.email_addresses[0].email}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-500 mt-1">
                Change your password to keep your account secure.
              </p>
              <button className="mt-3 text-sm text-blue-600 hover:underline">
                Change password
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 mt-1">
                Add an extra layer of security to your account.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  Not enabled
                </span>
                <button className="text-sm text-blue-600 hover:underline">Enable 2FA</button>
              </div>
            </div>

            <div className="border rounded-lg p-4 border-red-200 bg-red-50">
              <h3 className="text-sm font-medium text-red-900">Danger Zone</h3>
              <p className="text-sm text-red-700 mt-1">
                Permanently delete your account and all associated data.
              </p>
              <button className="mt-3 text-sm text-red-600 hover:underline">Delete account</button>
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Manage your active sessions across all devices.</p>
            {loadingSessions ? (
              <p className="text-gray-500">Loading sessions...</p>
            ) : sessions && sessions.length > 0 ? (
              <ul className="divide-y border rounded-lg">
                {sessions.map((session) => (
                  <li key={session.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Session {session.id.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(session.created_at).toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          session.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={deleteSessionMutation.isPending}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No active sessions found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

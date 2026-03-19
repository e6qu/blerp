import { useState } from "react";
import {
  usePasskeys,
  useRegisterPasskey,
  useDeletePasskey,
  useRenamePasskey,
} from "../../hooks/usePasskeys";
import { useCurrentUser } from "../../hooks/useUser";
import { SessionsViewer } from "./SessionsViewer";
import { ProfileEditForm } from "./ProfileEditForm";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { TwoFactorEnrollmentModal } from "./TwoFactorEnrollmentModal";
import { BackupCodesModal } from "./BackupCodesModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { ConnectedAccounts } from "./ConnectedAccounts";
import { EmailList } from "./EmailList";
import { PhoneNumberList } from "./PhoneNumberList";
import { useToast } from "../ui/Toast";
import { Key, ShieldCheck, Trash2, Pencil, Check, X } from "lucide-react";
import type { components } from "@blerp/shared";

type PasskeyCredential = components["schemas"]["PasskeyCredential"];
type TabKey = "account" | "security" | "sessions";

export function UserProfile() {
  const [activeTab, setActiveTab] = useState<TabKey>("account");

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 px-8 py-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Account Settings</h2>
        </div>

        <div className="flex border-b dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab("account")}
            className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "account"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "security"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "sessions"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Sessions
          </button>
        </div>

        <div className="p-8">
          {activeTab === "account" && <AccountTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "sessions" && <SessionsTab />}
        </div>
      </div>
    </div>
  );
}

function AccountTab() {
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">
          Profile Information
        </h3>
        <ProfileEditForm />
      </div>

      <div className="border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">
          Email Addresses
        </h3>
        <EmailList />
      </div>

      <div className="border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">Phone Numbers</h3>
        <PhoneNumberList />
      </div>

      <div className="border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">
          Connected Accounts
        </h3>
        <ConnectedAccounts />
      </div>

      <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-red-900 dark:text-red-200">Danger Zone</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Permanently delete your account and all associated data.
        </p>
        <button
          onClick={() => setIsDeleteAccountOpen(true)}
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-300 dark:border-red-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
          Delete account
        </button>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
      />
    </div>
  );
}

function SecurityTab() {
  const { data: passkeys, isLoading } = usePasskeys();
  const { data: user } = useCurrentUser();
  const registerPasskey = useRegisterPasskey();
  const deletePasskey = useDeletePasskey();
  const renamePasskey = useRenamePasskey();
  const { toast } = useToast();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isBackupCodesOpen, setIsBackupCodesOpen] = useState(false);
  const [editingPasskeyId, setEditingPasskeyId] = useState<string | null>(null);
  const [editingPasskeyName, setEditingPasskeyName] = useState("");

  if (isLoading)
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );

  const handleDeletePasskey = async (passkeyId: string) => {
    try {
      await deletePasskey.mutateAsync(passkeyId);
      toast("Passkey deleted", "success");
    } catch {
      toast("Failed to delete passkey", "error");
    }
  };

  const handleStartRename = (pk: PasskeyCredential) => {
    setEditingPasskeyId(pk.id);
    setEditingPasskeyName(pk.friendly_name || "");
  };

  const handleSaveRename = async () => {
    if (!editingPasskeyId || !editingPasskeyName.trim()) return;
    try {
      await renamePasskey.mutateAsync({
        passkeyId: editingPasskeyId,
        name: editingPasskeyName.trim(),
      });
      toast("Passkey renamed", "success");
      setEditingPasskeyId(null);
    } catch {
      toast("Failed to rename passkey", "error");
    }
  };

  const handleCancelRename = () => {
    setEditingPasskeyId(null);
    setEditingPasskeyName("");
  };

  return (
    <div className="space-y-6">
      <div className="border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Password</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Change your password to keep your account secure.
        </p>
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Change password
        </button>
      </div>

      <div className="border dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Passkeys</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Phishing-resistant authentication methods.
            </p>
          </div>
          <button
            onClick={() => registerPasskey.mutate("My New Passkey")}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Add Passkey
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {passkeys?.map((pk: PasskeyCredential) => (
            <div
              key={pk.id}
              className="flex items-center justify-between rounded-lg border dark:border-gray-700 p-3"
            >
              <div className="flex items-center">
                <Key className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <div>
                  {editingPasskeyId === pk.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingPasskeyName}
                        onChange={(e) => setEditingPasskeyName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename();
                          if (e.key === "Escape") handleCancelRename();
                        }}
                        className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveRename}
                        disabled={renamePasskey.isPending}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        {pk.friendly_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: {pk.id}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                {editingPasskeyId !== pk.id && (
                  <button
                    onClick={() => handleStartRename(pk)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Rename"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeletePasskey(pk.id)}
                  disabled={deletePasskey.isPending}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {passkeys?.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-2">
              No passkeys registered yet.
            </p>
          )}
        </div>
      </div>

      <div className="border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Two-Factor Authentication
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Add an extra layer of security to your account.
        </p>
        <div className="mt-3 flex items-center gap-3">
          {user?.totp_enabled ? (
            <>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                Enabled
              </span>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Manage 2FA
              </button>
            </>
          ) : (
            <>
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                Not enabled
              </span>
              <button
                onClick={() => setIs2FAModalOpen(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Enable 2FA
              </button>
            </>
          )}
        </div>
      </div>

      <div className="border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Backup Codes</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Generate backup codes for account recovery when 2FA is unavailable.
        </p>
        <button
          onClick={() => setIsBackupCodesOpen(true)}
          className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          View backup codes
        </button>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      <TwoFactorEnrollmentModal isOpen={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} />
      <BackupCodesModal isOpen={isBackupCodesOpen} onClose={() => setIsBackupCodesOpen(false)} />
    </div>
  );
}

function SessionsTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Manage your active sessions across all devices.
      </p>
      <SessionsViewer />
    </div>
  );
}

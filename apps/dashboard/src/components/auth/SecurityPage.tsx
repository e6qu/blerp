import { usePasskeys, useRegisterPasskey } from "../../hooks/usePasskeys";
import { Key, ShieldCheck } from "lucide-react";
import type { components } from "@blerp/shared";

type PasskeyCredential = components["schemas"]["PasskeyCredential"];

export function SecurityPage() {
  const { data: passkeys, isLoading } = usePasskeys();
  const registerPasskey = useRegisterPasskey();

  if (isLoading) return <div className="p-8">Loading security settings...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Security</h1>

      <div className="max-w-2xl space-y-8">
        <div className="rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Passkeys</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Phishing-resistant authentication methods.
              </p>
            </div>
            <button
              onClick={() => registerPasskey.mutate("My New Passkey")}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Passkey
            </button>
          </div>

          <div className="space-y-4">
            {passkeys?.map((pk: PasskeyCredential) => (
              <div
                key={pk.id}
                className="flex items-center justify-between rounded-lg border dark:border-gray-700 p-4"
              >
                <div className="flex items-center">
                  <Key className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {pk.friendly_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {pk.id}</div>
                  </div>
                </div>
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
            ))}
            {passkeys?.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
                No passkeys registered yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

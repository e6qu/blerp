import { useState } from "react";
import { Plus, Trash2, CheckCircle, XCircle, Phone } from "lucide-react";
import {
  usePhoneNumbers,
  useAddPhoneNumber,
  useDeletePhoneNumber,
} from "../../hooks/usePhoneNumbers";
import { useToast } from "../ui/Toast";

export function PhoneNumberList() {
  const { data: phones, isLoading } = usePhoneNumbers();
  const addPhone = useAddPhoneNumber();
  const deletePhone = useDeletePhoneNumber();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;
    try {
      await addPhone.mutateAsync(newPhone.trim());
      toast("Phone number added", "success");
      setNewPhone("");
      setIsAdding(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add phone number", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePhone.mutateAsync(id);
      toast("Phone number deleted", "success");
      setConfirmingDeleteId(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete phone number", "error");
    }
  };

  if (isLoading)
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading phone numbers...</div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add phone number
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
            placeholder="+1 (555) 123-4567"
            autoFocus
          />
          <button
            type="submit"
            disabled={addPhone.isPending}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {addPhone.isPending ? "Adding..." : "Add"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewPhone("");
            }}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </form>
      )}

      {phones && phones.length > 0 ? (
        <div className="overflow-hidden rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {phones.map((phone) => (
                <tr key={phone.id}>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-gray-50">
                      {phone.phone_number}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 text-xs font-semibold leading-5 ${
                        phone.verification_status === "verified"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {phone.verification_status === "verified" ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Unverified
                        </>
                      )}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    {confirmingDeleteId === phone.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Delete?</span>
                        <button
                          onClick={() => handleDelete(phone.id)}
                          className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingDeleteId(phone.id)}
                        disabled={deletePhone.isPending}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isAdding && (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
            <Phone className="mb-2 h-6 w-6" />
            <p>No phone numbers yet.</p>
            <p className="text-sm">Add a phone number to get started.</p>
          </div>
        )
      )}
    </div>
  );
}

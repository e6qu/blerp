import { useState } from "react";
import { Link2, Trash2, Plus } from "lucide-react";
import {
  useRedirectUrls,
  useCreateRedirectUrl,
  useDeleteRedirectUrl,
} from "../../hooks/useRedirectUrls";
import { useFormValidation, required } from "../../hooks/useFormValidation";

export function RedirectUrlsList() {
  const { data: urls, isLoading } = useRedirectUrls();
  const createUrl = useCreateRedirectUrl();
  const deleteUrl = useDeleteRedirectUrl();
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<"web" | "native">("web");
  const { errors, validate, clearErrors } = useFormValidation({
    url: [required("URL is required")],
  });

  const handleAdd = () => {
    clearErrors();
    const valid = validate({ url: newUrl });
    if (!valid) return;

    createUrl.mutate(
      { url: newUrl.trim(), type: newType },
      {
        onSuccess: () => {
          setNewUrl("");
          setIsAdding(false);
        },
      },
    );
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading redirect URLs...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Allowed redirect URLs for OAuth callbacks and native apps.
        </p>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add URL
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                URL
              </label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/callback"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
              />
              {errors.url && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.url}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as "web" | "native")}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="web">Web</option>
                <option value="native">Native</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={createUrl.isPending}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createUrl.isPending ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  clearErrors();
                }}
                className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
            {createUrl.isError && (
              <p className="text-xs text-red-600 dark:text-red-400">{createUrl.error.message}</p>
            )}
          </div>
        </div>
      )}

      {(urls ?? []).length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          No redirect URLs configured. All redirect URIs will be allowed.
        </p>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {(urls ?? []).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <Link2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <div>
                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    {item.url}
                  </span>
                  <span
                    className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.type === "native"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteUrl.mutate(item.id)}
                disabled={deleteUrl.isPending}
                className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Save, Loader2, Pencil, Plus, X } from "lucide-react";
import { useProject, useUpdateProject } from "../../hooks/useProject";

export function ProjectSettingsForm() {
  const { data: project, isLoading } = useProject();
  const updateProject = useUpdateProject();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [allowedOrigins, setAllowedOrigins] = useState<string[]>([]);
  const [newOrigin, setNewOrigin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    if (project) {
      setName(project.name || "");
      setAllowedOrigins(project.allowed_origins || []);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setNewOrigin("");
  };

  const handleAddOrigin = () => {
    if (newOrigin && !allowedOrigins.includes(newOrigin)) {
      setAllowedOrigins([...allowedOrigins, newOrigin]);
      setNewOrigin("");
    }
  };

  const handleRemoveOrigin = (index: number) => {
    setAllowedOrigins(allowedOrigins.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await updateProject.mutateAsync({ name, allowed_origins: allowedOrigins });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    }
  };

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">Loading project settings...</div>
    );
  }

  if (!project) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Project not found</div>;
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Project Name
          </label>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-50">{project.name}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Project ID
          </label>
          <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-300">{project.id}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Allowed Origins
          </label>
          {project.allowed_origins && project.allowed_origins.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {project.allowed_origins.map((origin, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200"
                >
                  {origin}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
              No origins configured
            </p>
          )}
        </div>
        <button
          onClick={handleEdit}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Pencil className="h-4 w-4" />
          Edit settings
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Project Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
          Project ID
        </label>
        <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-300">{project.id}</p>
      </div>

      <div>
        <label
          htmlFor="origins"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Allowed Origins
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Configure allowed domains for CORS and callback URLs
        </p>
        <div className="mt-2 flex gap-2">
          <input
            id="origins"
            type="text"
            value={newOrigin}
            onChange={(e) => setNewOrigin(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="button"
            onClick={handleAddOrigin}
            disabled={!newOrigin}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        {allowedOrigins.length > 0 && (
          <div className="mt-2 space-y-2">
            {allowedOrigins.map((origin, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2"
              >
                <span className="text-sm text-gray-700 dark:text-gray-200">{origin}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveOrigin(idx)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-2">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updateProject.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {updateProject.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </button>
      </div>
    </form>
  );
}

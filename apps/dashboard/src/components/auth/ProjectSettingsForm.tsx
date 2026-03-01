import { useState } from "react";
import { Save, Loader2, Pencil } from "lucide-react";
import { useProject, useUpdateProject } from "../../hooks/useProject";

export function ProjectSettingsForm() {
  const { data: project, isLoading } = useProject();
  const updateProject = useUpdateProject();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    if (project) {
      setName(project.name || "");
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await updateProject.mutateAsync({ name });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading project settings...</div>;
  }

  if (!project) {
    return <div className="text-sm text-gray-500">Project not found</div>;
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500">Project Name</label>
          <p className="mt-1 text-sm text-gray-900">{project.name}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Project ID</label>
          <p className="mt-1 font-mono text-sm text-gray-600">{project.id}</p>
        </div>
        <button
          onClick={handleEdit}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500">Project ID</label>
        <p className="mt-1 font-mono text-sm text-gray-600">{project.id}</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
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

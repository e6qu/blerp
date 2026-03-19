import { useState, useMemo } from "react";
import { Save, Loader2, Pencil } from "lucide-react";
import { useCurrentUser, useUpdateCurrentUser } from "../../hooks/useUser";
import { useToast } from "../ui/Toast";
import { ProfileSkeleton } from "../ui/Skeleton";
import { AvatarUpload } from "./AvatarUpload";
import { useFormValidation, maxLength } from "../../hooks/useFormValidation";

export function ProfileEditForm() {
  const { data: user, isLoading } = useCurrentUser();
  const updateuser = useUpdateCurrentUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const rules = useMemo(
    () => ({
      firstName: [maxLength(100)],
      lastName: [maxLength(100)],
      username: [maxLength(64)],
    }),
    [],
  );
  const { errors: fieldErrors, validate, clearErrors } = useFormValidation(rules);

  const handleEdit = () => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setUsername(user.username || "");
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    clearErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate({ firstName, lastName, username })) return;

    try {
      await updateuser.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        username: username || undefined,
      });
      toast("Profile updated successfully", "success");
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">User not found</div>;
  }

  const initials = `${(user.first_name ?? "?")[0]}${(user.last_name ?? "")[0] ?? ""}`;

  const handleAvatarUpload = async (_url: string) => {
    // Avatar URL stored server-side. The User schema has an imageUrl field
    // that would be updated via a PATCH /users/:id call if the upload
    // endpoint returned a persisted reference.
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <AvatarUpload
            imageUrl={user.image_url}
            initials={initials}
            onUpload={handleAvatarUpload}
            size="lg"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {user.first_name ?? ""} {user.last_name ?? ""}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.id}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
              First Name
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-50">{user.first_name || "—"}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
              Last Name
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-50">{user.last_name || "—"}</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Username
          </label>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-50">{user.username || "—"}</p>
        </div>
        <button
          onClick={handleEdit}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Pencil className="h-4 w-4" />
          Edit profile
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
          {fieldErrors.firstName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.firstName}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
          {fieldErrors.lastName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="username"
          className="block text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="optional"
        />
        {fieldErrors.username && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.username}</p>
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
          disabled={updateuser.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {updateuser.isPending ? (
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

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Building2, X } from "lucide-react";
import { useGlobalSearch } from "../../hooks/useGlobalSearch";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { users, organizations, isLoading } = useGlobalSearch(query, isOpen);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasResults = users.length > 0 || organizations.length > 0;
  const hasQuery = query.trim().length >= 2;

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  const handleUserClick = (userId: string) => {
    handleClose();
    navigate(`/admin/users?highlight=${userId}`);
  };

  const handleOrgClick = (orgId: string) => {
    handleClose();
    navigate(`/users?highlight=${orgId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl">
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users and organizations..."
            className="flex-1 border-0 bg-transparent px-3 py-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {isLoading && (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Searching...
            </div>
          )}

          {!isLoading && hasQuery && !hasResults && (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found.
            </div>
          )}

          {!isLoading && !hasQuery && (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Type at least 2 characters to search...
            </div>
          )}

          {users.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <Users className="h-3.5 w-3.5" />
                Users
              </div>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {user.image_url ? (
                    <img src={user.image_url} alt="" className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-xs font-medium text-blue-600 dark:text-blue-400">
                      {(user.first_name ?? "?")[0]}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.first_name ?? ""} {user.last_name ?? ""}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email_addresses?.[0]?.email ?? user.id}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {organizations.length > 0 && (
            <div
              className={
                users.length > 0 ? "mt-2 border-t border-gray-100 dark:border-gray-700 pt-2" : ""
              }
            >
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <Building2 className="h-3.5 w-3.5" />
                Organizations
              </div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleOrgClick(org.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50 text-xs font-medium text-purple-600 dark:text-purple-400">
                    {org.name[0]?.toUpperCase() ?? "O"}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {org.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{org.slug}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-400 dark:text-gray-500">
          <kbd className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 font-mono">Esc</kbd> to
          close
        </div>
      </div>
    </div>
  );
}

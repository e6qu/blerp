import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Settings, Users, Shield, LogOut, UserCog, Menu, X, Sun, Moon, Search } from "lucide-react";
import { useSignOut } from "../hooks/useSignOut";
import { useCurrentUser } from "../hooks/useUser";
import { useTheme } from "../hooks/useTheme";
import { GlobalSearch } from "./ui/GlobalSearch";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

export function Layout() {
  const location = useLocation();
  const signOut = useSignOut();
  const { data: user } = useCurrentUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  useKeyboardShortcuts({
    "mod+k": () => setIsSearchOpen((prev) => !prev),
    "mod+shift+d": toggleTheme,
  });

  const navItems = [
    { name: "Organizations", href: "/users", icon: Users },
    { name: "User Management", href: "/admin/users", icon: UserCog },
    { name: "Account", href: "/auth", icon: Shield },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleSignOut = () => {
    signOut.mutate();
  };

  const handleNavClick = () => {
    setIsSidebarOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-700 px-6">
        <span className="text-xl font-bold tracking-tight text-blue-600">Blerp</span>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={handleNavClick}
            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === item.href
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={handleSignOut}
          disabled={signOut.isPending}
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 disabled:opacity-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          {signOut.isPending ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay + sidebar */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 md:hidden">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 md:flex">
        {sidebarContent}
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="flex h-16 items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 md:px-8">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mr-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-auto flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 text-xs font-mono text-gray-500 dark:text-gray-300 sm:inline">
                {navigator.platform?.includes("Mac") ? "\u2318" : "Ctrl"}K
              </kbd>
            </button>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
              aria-label="Toggle dark mode"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            {user?.image_url ? (
              <img src={user.image_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-xs font-medium text-blue-600 dark:text-blue-400">
                {(user?.first_name ?? "A")[0]}
                {(user?.last_name ?? "")[0] ?? ""}
              </div>
            )}
            <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:inline">
              {user?.first_name ?? "Admin"} {user?.last_name ?? "User"}
            </span>
          </div>
        </header>
        <Outlet />
      </main>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

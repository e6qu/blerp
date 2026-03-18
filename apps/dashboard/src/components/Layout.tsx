import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Settings, Users, Shield, LogOut, UserCog } from "lucide-react";
import { OrganizationSwitcher } from "./auth/OrganizationSwitcher";
import { useSignOut } from "../hooks/useSignOut";
import { useCurrentUser } from "../hooks/useUser";

export function Layout() {
  const location = useLocation();
  const signOut = useSignOut();
  const { data: user } = useCurrentUser();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Organizations", href: "/users", icon: Users },
    { name: "User Management", href: "/admin/users", icon: UserCog },
    { name: "Auth", href: "/auth", icon: Shield },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleSignOut = () => {
    signOut.mutate();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 border-r bg-white">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-xl font-bold tracking-tight text-blue-600">Blerp</span>
        </div>

        <div className="border-b p-4">
          <OrganizationSwitcher />
        </div>

        <nav className="mt-2 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 border-t p-4">
          <button
            onClick={handleSignOut}
            disabled={signOut.isPending}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            {signOut.isPending ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="flex h-16 items-center border-b bg-white px-8">
          <div className="ml-auto flex items-center space-x-4">
            {user?.image_url ? (
              <img src={user.image_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                {(user?.first_name ?? "A")[0]}
                {(user?.last_name ?? "")[0] ?? ""}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">
              {user?.first_name ?? "Admin"} {user?.last_name ?? "User"}
            </span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

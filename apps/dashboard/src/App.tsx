import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { SignUp } from "./components/auth/SignUp";
import { SignIn } from "./components/auth/SignIn";
import { OrganizationsPage } from "./components/auth/OrganizationsPage";
import { UserProfile } from "./components/auth/UserProfile";
import { SettingsPage } from "./components/auth/SettingsPage";
import { UsersListPage } from "./components/auth/UsersListPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "./components/ui/Toast";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { ThemeProvider } from "./hooks/useTheme";

const queryClient = new QueryClient();

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold dark:text-gray-50">Dashboard Home</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Welcome to the Blerp Identity Service dashboard.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <SignUp />
        <SignIn />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="sign-in" element={<SignInPage />} />
                <Route path="users" element={<OrganizationsPage />} />
                <Route path="auth" element={<UserProfile />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="admin/users" element={<UsersListPage />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function SignInPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold dark:text-gray-50">Sign In</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Sign in to your Blerp account.</p>
      <div className="mt-8">
        <SignIn />
      </div>
    </div>
  );
}

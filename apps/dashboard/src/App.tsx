import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import { getSessionUserId } from "./lib/api";

const queryClient = new QueryClient();

function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-8">
      <div className="w-full max-w-md">
        {mode === "sign-in" ? <SignIn /> : <SignUp />}
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {mode === "sign-in" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setMode("sign-up")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("sign-in")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Home() {
  const userId = getSessionUserId();

  if (!userId) {
    return <AuthPage />;
  }

  // Authenticated — redirect to Organizations
  return <Navigate to="/users" replace />;
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
                <Route path="sign-in" element={<AuthPage />} />
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

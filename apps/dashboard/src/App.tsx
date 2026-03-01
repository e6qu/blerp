import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { SignUp } from "./components/auth/SignUp";
import { OrganizationsPage } from "./components/auth/OrganizationsPage";
import { UserProfile } from "./components/auth/UserProfile";
import { SettingsPage } from "./components/auth/SettingsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard Home</h1>
      <p className="mt-4 text-gray-600">Welcome to the Blerp Identity Service dashboard.</p>
      <div className="mt-8">
        <SignUp />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="users" element={<OrganizationsPage />} />
          <Route path="auth" element={<UserProfile />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

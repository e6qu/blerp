import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard Home</h1>
      <p className="mt-4 text-gray-600">Welcome to the Blerp Identity Service dashboard.</p>
    </div>
  );
}

function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-4 text-gray-600">Manage your project settings here.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

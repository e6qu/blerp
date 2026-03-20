import { useState } from "react";
import { AuditLogViewer } from "./AuditLogViewer";
import { UsageDashboard } from "./UsageDashboard";
import { ApiKeysList } from "./ApiKeysList";
import { ProjectSettingsForm } from "./ProjectSettingsForm";
import { DeleteProjectModal } from "./DeleteProjectModal";
import { SignupRestrictions } from "./SignupRestrictions";
import { RedirectUrlsList } from "./RedirectUrlsList";
import { useProject } from "../../hooks/useProject";

type TabKey = "general" | "audit" | "usage";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { data: project } = useProject();

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 px-8 py-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Settings</h2>
        </div>

        <div className="flex border-b dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "general"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "audit"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab("usage")}
            className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "usage"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Usage
          </button>
        </div>

        <div className="p-8">
          {activeTab === "general" && (
            <GeneralTab onDeleteClick={() => setIsDeleteModalOpen(true)} />
          )}
          {activeTab === "audit" && <AuditTab />}
          {activeTab === "usage" && <UsageTab />}
        </div>
      </div>

      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        projectName={project?.name || "demo-project"}
      />
    </div>
  );
}

function GeneralTab({ onDeleteClick }: { onDeleteClick: () => void }) {
  return (
    <div className="space-y-6">
      <div className="border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">
          Project Settings
        </h3>
        <ProjectSettingsForm />
      </div>

      <div className="border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">API Keys</h3>
        <ApiKeysList />
      </div>

      <div className="border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">
          Signup Restrictions
        </h3>
        <SignupRestrictions />
      </div>

      <div className="border dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">Redirect URLs</h3>
        <RedirectUrlsList />
      </div>

      <div className="border rounded-lg p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <h3 className="text-sm font-medium text-red-900 dark:text-red-200">Danger Zone</h3>
        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
          Delete this project and all associated data.
        </p>
        <button
          onClick={onDeleteClick}
          className="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
        >
          Delete project
        </button>
      </div>
    </div>
  );
}

function AuditTab() {
  return <AuditLogViewer />;
}

function UsageTab() {
  return <UsageDashboard />;
}

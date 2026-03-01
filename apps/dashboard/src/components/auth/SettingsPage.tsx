import { useState } from "react";
import { AuditLogViewer } from "./AuditLogViewer";
import { UsageDashboard } from "./UsageDashboard";
import { ApiKeysList } from "./ApiKeysList";
import { ProjectSettingsForm } from "./ProjectSettingsForm";
import { DeleteProjectModal } from "./DeleteProjectModal";
import { useProject } from "../../hooks/useProject";

type TabKey = "general" | "audit" | "usage";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { data: project } = useProject();

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b px-8 py-4">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        </div>

        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "general"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "audit"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab("usage")}
            className={`px-8 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "usage"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
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
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Project Settings</h3>
        <ProjectSettingsForm />
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">API Keys</h3>
        <ApiKeysList />
      </div>

      <div className="border rounded-lg p-4 border-red-200 bg-red-50">
        <h3 className="text-sm font-medium text-red-900">Danger Zone</h3>
        <p className="text-sm text-red-700 mt-1">Delete this project and all associated data.</p>
        <button
          onClick={onDeleteClick}
          className="mt-3 text-sm text-red-600 hover:underline font-medium"
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

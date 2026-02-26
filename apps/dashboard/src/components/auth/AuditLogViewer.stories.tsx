import type { Meta, StoryObj } from "@storybook/react";
import { AuditLogViewer } from "./AuditLogViewer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof AuditLogViewer> = {
  title: "Auth/AuditLogViewer",
  component: AuditLogViewer,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-8">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AuditLogViewer>;

export const Default: Story = {};

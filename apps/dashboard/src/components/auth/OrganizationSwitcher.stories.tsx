import type { Meta, StoryObj } from "@storybook/react";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof OrganizationSwitcher> = {
  title: "Auth/OrganizationSwitcher",
  component: OrganizationSwitcher,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="w-64 p-4">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OrganizationSwitcher>;

export const Default: Story = {};

import type { Meta, StoryObj } from "@storybook/react";
import { SessionsViewer } from "./SessionsViewer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof SessionsViewer> = {
  title: "Auth/SessionsViewer",
  component: SessionsViewer,
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
type Story = StoryObj<typeof SessionsViewer>;

export const Default: Story = {};

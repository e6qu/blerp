import type { Meta, StoryObj } from "@storybook/react";
import { WebhookList } from "./WebhookList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof WebhookList> = {
  title: "Auth/WebhookList",
  component: WebhookList,
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
type Story = StoryObj<typeof WebhookList>;

export const Default: Story = {};

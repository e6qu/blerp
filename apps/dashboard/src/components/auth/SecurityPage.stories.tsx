import type { Meta, StoryObj } from "@storybook/react";
import { SecurityPage } from "./SecurityPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof SecurityPage> = {
  title: "Auth/SecurityPage",
  component: SecurityPage,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SecurityPage>;

export const Default: Story = {};

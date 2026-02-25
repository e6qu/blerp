import type { Meta, StoryObj } from "@storybook/react";
import { SignUp } from "./SignUp";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof SignUp> = {
  title: "Auth/SignUp",
  component: SignUp,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SignUp>;

export const Default: Story = {};

import type { Meta, StoryObj } from "@storybook/react";
import { OrganizationsPage } from "./OrganizationsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

const meta: Meta<typeof OrganizationsPage> = {
  title: "Auth/OrganizationsPage",
  component: OrganizationsPage,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OrganizationsPage>;

export const Default: Story = {};

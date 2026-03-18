import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Blerp Documentation",
  description: "Identity and Authentication Service",
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "Tutorials", link: "/tutorials/" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/" },
          { text: "SDK Repointing", link: "/guide/sdk-repointing" },
          { text: "Monite Integration", link: "/guide/monite-integration" },
        ],
      },
      {
        text: "Tutorials",
        items: [
          { text: "Overview", link: "/tutorials/" },
          { text: "Getting Started", link: "/tutorials/getting-started" },
          { text: "API Usage", link: "/tutorials/api-usage" },
          { text: "Data Setup", link: "/tutorials/data-setup" },
          { text: "Next.js Integration", link: "/tutorials/nextjs-integration" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/e6qu/blerp" }],
  },
});

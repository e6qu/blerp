import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Blerp Documentation",
  description: "Identity and Authentication Service",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "Tutorials", link: "/tutorials/" },
      { text: "API", link: "/api/" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Getting Started", link: "/guide/" },
          { text: "Architecture", link: "/guide/architecture" },
        ],
      },
      {
        text: "Development",
        items: [
          { text: "Local Setup", link: "/guide/local-setup" },
          { text: "SDK Repointing", link: "/guide/sdk-repointing" },
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

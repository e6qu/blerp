import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Blerp Documentation",
  description: "Identity and Authentication Service",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
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
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/e6qu/blerp" }],
  },
});

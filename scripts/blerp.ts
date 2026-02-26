import { Command } from "commander";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const program = new Command();

program.name("blerp").description("Blerp CLI for monorepo and tenant management").version("1.0.0");

program
  .command("dev")
  .description("Manage development environment")
  .argument("[action]", "up or down", "up")
  .action((action) => {
    if (action === "up") {
      console.log("🚀 Starting Blerp development stack...");
      spawn("docker-compose", ["up", "-d"], { stdio: "inherit" });
    } else {
      console.log("🛑 Stopping Blerp development stack...");
      spawn("docker-compose", ["down"], { stdio: "inherit" });
    }
  });

program
  .command("tenant:list")
  .description("List all active tenants")
  .action(() => {
    const tenantsDir = path.resolve(process.cwd(), "apps/api/tenants");
    if (!fs.existsSync(tenantsDir)) {
      console.log("No tenants found.");
      return;
    }
    const files = fs.readdirSync(tenantsDir).filter((f) => f.endsWith(".db"));
    console.log("Active Tenants:");
    files.forEach((f) => console.log(`- ${path.basename(f, ".db")}`));
  });

program
  .command("tenant:migrate")
  .description("Run migrations across all tenants")
  .action(() => {
    console.log("🚀 Running migrations for all tenants...");
    spawn("bun", ["run", "--filter", "@blerp/api", "db:migrate-all"], { stdio: "inherit" });
  });

program.parse();

import { spawn } from "node:child_process";

const command = process.argv[2];

if (command === "dev") {
  const subCommand = process.argv[3] || "up";

  if (subCommand === "up") {
    console.log("🚀 Starting Blerp development stack...");
    spawn("docker-compose", ["up", "-d"], { stdio: "inherit" });
  } else if (subCommand === "down") {
    console.log("🛑 Stopping Blerp development stack...");
    spawn("docker-compose", ["down"], { stdio: "inherit" });
  } else {
    console.log("Unknown dev subcommand. Use 'up' or 'down'.");
  }
} else {
  console.log("Blerp CLI");
  console.log("Usage: bun run scripts/blerp.ts dev [up|down]");
}

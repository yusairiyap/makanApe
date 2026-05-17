import { spawn, exec } from "child_process";

const server = spawn("next", ["dev"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

setTimeout(() => {
  const url = "http://localhost:3000";
  const cmd =
    process.platform === "win32"
      ? `start ${url}`
      : process.platform === "darwin"
      ? `open ${url}`
      : `xdg-open ${url}`;
  exec(cmd);
}, 3000);

server.on("close", (code) => process.exit(code ?? 0));

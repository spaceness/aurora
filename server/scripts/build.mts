import esbuild from "esbuild";
import dts from "esbuild-plugin-d.ts";
import ansi from "ansi-colors";
import chokidar from "chokidar";
import { spawn } from "child_process";

// server
let config: esbuild.BuildOptions = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  minify: true,
  external: ["fastify", "dotenv"],
  outdir: "../dist/server",
  platform: "node",
  logLevel: "info",
  plugins: [
    /* dts({}) | no more of this, it breaks for some reason */
  ],
};

async function build() {
  await esbuild.build(config).then(() => {
    console.log(
      `${ansi.bold("AURORA")}\n[${ansi.greenBright("SUCCESS")}] Build complete.`
    );
  });
}

function start() {
  let childProcess = spawn("node", ["../dist/server/main.js"]);

  childProcess.stdout.on("data", (data) => {
    console.log(`${data}`);
  });

  childProcess.stderr.on("error", (data) => {
    console.error(`${data}`);
  });

  return childProcess;
}

if (process.argv.includes("--watch")) {
  console.log(`watch mode`);
  const context = await esbuild.context(config);
  let childProcess = start();

  // Initialize watcher.
  const watcher = chokidar.watch("./src");

  // Add event listeners.
  watcher.on("change", async (path) => {
    console.log(`[DEV] File ${path} has been changed`);

    await context.rebuild();
    childProcess.kill();
    childProcess = start();
  });
} else {
  await build();
}

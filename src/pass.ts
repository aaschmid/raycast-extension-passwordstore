import { spawn } from "child_process";
import { passwordStoreDir, pathExtensions } from "./preferences";
import { walkDirectory } from "./utils";

export const list = async (prefix = undefined): Promise<string[]> => {
  const results: string[] = [];
  for await (const p of walkDirectory(passwordStoreDir)) {
    if (prefix === undefined || p.startsWith(prefix)) {
      results.push(p);
    }
  }

  return results
    .filter((f) => f.endsWith(".gpg"))
    .map((f) => f.replace(`${passwordStoreDir}/`, "").replace(".gpg", ""))
    .sort();
};

export const clip = async (entry: string): Promise<void> => {
  await pass(["show", "--clip", entry]);
};

export const password = async (entry: string): Promise<string> => pass(["show", entry]).then((data) => data.split("\n")[0]);

const pass = (args: string[]): Promise<string> =>
  new Promise((resolve, reject) => {
    const cli = spawn("pass", args, {
      env: {
        PASSWORD_STORE_DIR: passwordStoreDir,
        PATH: ["/bin", "/usr/bin", pathExtensions].filter((p) => p.length > 0).join(":"),
      },
    });

    cli.on("error", reject);

    const stderr: Buffer[] = [];
    cli.stderr.on("data", (chunk: Buffer): number => stderr.push(chunk));
    cli.stderr.on("end", () => stderr.length > 0 && reject(stderr.join("")));

    const stdout: Buffer[] = [];
    cli.stdout.on("data", (chunk: Buffer): number => stdout.push(chunk));
    cli.stdout.on("end", () => resolve(stdout.join("")));
  });

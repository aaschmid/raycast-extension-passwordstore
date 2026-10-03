import { Clipboard, closeMainWindow, showHUD, showToast, Toast } from "@raycast/api";
import * as pass from "./pass";
import fs from "fs";
import path from "path";

export async function loadAllPasswords(): Promise<string[]> {
  return await pass.list();
}

export async function copyPassword(entry: string): Promise<void> {
  try {
    const toast = await showToast({ title: "Copying password...", style: Toast.Style.Animated });
    await pass.clip(entry);
    await toast.hide();
    await closeMainWindow();
    await showHUD("Password copied");
  } catch (error) {
    console.error(error);
    await showToast({ title: "Copy failed: " + error, style: Toast.Style.Failure });
  }
}

export async function pastePassword(entry: string): Promise<void> {
  try {
    const toast = await showToast({ title: "Pasting password...", style: Toast.Style.Animated });
    const password = await pass.password(entry);
    await closeMainWindow();
    await Clipboard.paste(password);
    await toast.hide();
  } catch (error) {
    console.error(error);
    await showToast({ title: "Paste failed: " + error, style: Toast.Style.Failure });
  }
}

export async function* walkDirectory(dir: string): AsyncGenerator<string, void, void> {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) {
      yield* walkDirectory(entry);
    } else if (d.isFile()) {
      yield entry;
    }
  }
}

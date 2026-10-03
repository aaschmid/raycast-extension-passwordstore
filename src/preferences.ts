import { getPreferenceValues } from "@raycast/api";

export const { passwordStoreDir, pathToPass, primaryAction } = getPreferenceValues<{
  passwordStoreDir: string;
  pathToPass: string;
  primaryAction: "copy" | "paste";
}>();

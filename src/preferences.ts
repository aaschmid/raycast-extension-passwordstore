import { getPreferenceValues } from "@raycast/api";

// TODO: pathExtensions -> path?
export const { passwordStoreDir, pathExtensions, primaryAction } = getPreferenceValues<{
  passwordStoreDir: string;
  pathExtensions: string;
  primaryAction: "copy" | "paste";
}>();

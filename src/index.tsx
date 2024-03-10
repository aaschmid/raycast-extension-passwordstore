import { FunctionComponent, ReactElement, useCallback, useEffect, useState } from "react";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { copyPassword, loadAllPasswords, pastePassword } from "./utils";
import { primaryAction } from "./preferences";

const defaultFilter = "*";

type State = {
  entries: string[];
  filter: string;
  isLoading: boolean;
  searchText: string;
};

export default (): ReactElement<unknown> => {
  const [state, setState] = useState<State>({
    entries: [],
    filter: defaultFilter,
    isLoading: true,
    searchText: "",
  });

  useEffect(() => {
    (async () => {
      const entries = await loadAllPasswords();
      setState((s) => ({ ...s, entries, isLoading: false }));
    })();
  }, []);

  const filter = useCallback(() => {
    if (state.filter !== defaultFilter) {
      return state.entries.filter((e) => e.startsWith(state.filter));
    }
    return state.entries;
  }, [state.entries, state.filter]);

  return (
    <List
      filtering={true}
      isLoading={state.isLoading}
      onSearchTextChange={(newValue) => {
        setState((previous) => ({ ...previous, searchText: newValue }));
      }}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select Directory"
          value={state.filter}
          onChange={(newValue) => setState((previous) => ({ ...previous, filter: newValue }))}
        >
          {[defaultFilter, ...new Set(state.entries.map((f) => f.slice(0, f.indexOf("/"))))].map((e) => (
            <List.Dropdown.Item key={e} title={e} value={e} />
          ))}
        </List.Dropdown>
      }
      searchText={state.searchText}
    >
      {filter().map((entry) => (
        <List.Item
          key={entry}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                {primaryAction === "paste" ? (
                  <>
                    <PasteAction entry={entry} />
                    <ClipAction entry={entry} />
                  </>
                ) : (
                  <>
                    <ClipAction entry={entry} />
                    <PasteAction entry={entry} />
                  </>
                )}
              </ActionPanel.Section>
            </ActionPanel>
          }
          icon={Icon.Key}
          subtitle="*****"
          title={entry}
        />
      ))}
    </List>
  );
};

const ClipAction: FunctionComponent<{ entry: string }> = ({ entry }) => (
  <Action icon={Icon.Clipboard} onAction={() => copyPassword(entry)} title="Copy password to clipboard" />
);
const PasteAction: FunctionComponent<{ entry: string }> = ({ entry }) => (
  <Action icon={Icon.Document} onAction={() => pastePassword(entry)} title="Paste password" />
);

Browse your [pass](https://www.passwordstore.org/) password store from Raycast or Tinycast, then paste a password straight into the app you were just using — or copy it to the clipboard.

You need to have [gpg](https://gnupg.org/) and [pass](https://www.passwordstore.org/) installed either in `/usr`, `/usr/bin`, or add its directory to the path extensions in the extension settings. A running `gpg-agent` decrypts your passwords.

In addition, you need to configure the directory of your password store (same as `PASSWORD_STORE_DIR` in your terminal).

## Actions

For each entry choose between two actions (order configurable via the `Primary action` preference):

- **Paste password** — decrypts the entry and pastes it via simulated `⌘V` into the previously active app. The launcher window is closed first so the paste lands in the underlying application.
- **Copy password to clipboard** — uses `pass --clip` (clipboard auto-clear).

## Limitations

- Only the first line of an entry is used as the password; remaining lines (notes, usernames, URLs) are ignored.
- Pasting needs the host app (Raycast or Tinycast) to be allowed to simulate keystrokes (accessibility permissions).
- Both launchers (Raycast and Tinycast) ship with a "pop to root search" behaviour that must be set longer than the time you need to enter your GPG passphrase in the `pinentry` dialog. Otherwise the first paste after unlocking the key fails, because the extension is shut down before it can paste; a second attempt then works, since the key is already unlocked.

Browse your [pass](https://www.passwordstore.org/) password store from Raycast or Tinycast, then paste a password straight into the app you were just using — or copy it to the clipboard.

You need to have [gpg](https://gnupg.org/), [pass](https://www.passwordstore.org/) installed either in
`/usr`, `/usr/bin`, or configure a path extension it within the extension settings accordingly. Also a `gpg-agent`
should run to decrypt your passwords.

In addition, you need to configure the directory of password store (same as `PASSWORD_STORE_DIR` in your terminal).

## Actions

For each entry choose between two actions (order configurable via the `Primary action` preference):

- **Paste password** — decrypts the entry and pastes it via simulated `⌘V` into the previously active app. The Raycast window is closed first so the paste lands in the underlying application; works with apps such as your tinycast installation, where the password is entered into its input field instead of the search bar.
- **Copy password to clipboard** — uses `pass --clip` (clipboard auto-clear).

## Limitations

- Only the first line of an entry is used as the password; remaining lines (notes, usernames, URLs) are ignored.
- Pasting needs the host app (Raycast or Tinycast) to be allowed to simulate keystrokes (accessibility permissions).

## Tinycast setup

One Tinycast setting is required for the pinentry flow: **Set Pop to Root Search to "After 15 seconds" (or later)** instead of the default "Immediately".

Without it, the passphrase dialog steals keyboard focus, the palette immediately pops back to the launcher, and that tears down the running extension — including the in-flight `pass` decryption, so the paste never happens (a second attempt then works because the key is already unlocked). With a non-immediate timeout, the palette stays alive through the passphrase and the paste succeeds on the first try.

# Highlight Row

<p align="center">
    <a href="https://github.com/andrejsharapov/highlight-row">
        <img src="https://github.com/andrejsharapov/highlight-row/blob/main/icon.png?raw=true" alt="VSCode extension: Highlight Row">
    </a>
</p>

VSCode extension: Right-click on a row -> highlight/unhighlight row permanently

## Features

- [x] **Via right-click** — no Ctrl+Shift+P, just a right-click
- [x] **Multiple cursors** — supports `Alt + click` to highlight several rows at once
- [x] **Permanent** — highlight doesn't disappear when moving the cursor
- [x] **Customizable color** — any color of your choice (HEX, RGBA, CSS)
- [x] **Works with any files** — `.mb`, `.txt`, `.js`, `.py`, logs, configs and others

## Quick Start

1. Install the VS Code extension
2. Open any file
3. **Right-click** on the row you want to highlight
4. Select **Highlight row** (the row will be highlighted in blue by default)
5. To remove the highlight — right-click again → **Unhighlight row**

## Multiple Cursors

1. Hold `Alt+Left Click`, `Ctrl+Shift+L` (Windows/Linux) or `Option` (Mac)
2. Click on several rows where you want to place cursors
3. Right-click → **"Highlight row"** — all rows with cursors will be highlighted simultaneously

## How it works

The extension binds the highlight to the **row number**, not to the content. This means:

- The highlight remains on the same row number when inserting/deleting rows ABOVE
- If you press Enter at the end of a highlighted row — the highlight stays on the original row (with the text)
- If you delete a row with a highlight — the highlight disappears
- Highlights are stored in VS Code's memory within the current session (highlights are NOT saved after completely closing VS Code)

This approach is simple and predictable, without any magical shifts.

## Configuration

Row highlight color `highlightRow.backgroundColor`

**Supported formats:**

- HEX with transparency: `#4488ff44`
- RGBA: `rgba(68, 136, 255, 0.27)`
- CSS color names: `lightblue`, `coral`, `gold`

**Default value:** `#4488ff44` (semi-transparent blue)

<details open>
<summary>Useful colors for different tasks</summary>

| Task                      | Color                   | Recommended color          |
| ------------------------- | ----------------------- | -------------------------- |
| General notes             | blue                    | `#4488ff44`                |
| Logs and debugging        | red                     | `#ff444466`                |
| Important rows / TODO     | orange                  | `#ff8800aa`                |
| Temporary notes           | green                   | `#44ff4433`                |
| Minimal highlight         | almost transparent gray | `#88888822`                |
| For heart-related matters | semi-transparent pink   | `rgba(255, 105, 180, 0.3)` |

</details>

## Contributing

Found a bug? Have a feature request? Please open an [issue][i].

## License

This project is licensed under the MIT License - see the [LICENSE][l] file for details.

<!-- links -->

[i]: https://github.com/andrejsharapov/highlight-row/issues/new
[l]: https://github.com/andrejsharapov/highlight-row/blob/main/LICENSE

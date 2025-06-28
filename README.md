# VSCode Co-Edit Extension

An AI academic writing co-edit for VSCode, designed to assist authors in drafting, checking, and citing academic work, deeply integrated with Zotero.

## Features

### Workflow 0: Draft Chapter Plan
Generate a structured `plan.md` for your chapter based on a topic you provide. This helps in outlining your work before you start writing.

### Workflow 1: Plan-Driven Content Checking
Review your LaTeX sections against your `plan.md` and chapter-specific `GEMINI.md` instructions. The AI provides feedback on adherence to the plan, clarity, coherence, and academic rigor.

### Workflow 2: AI-Powered Citation
Extracts key concepts from your current paragraph and searches your local Zotero library for relevant citations. It then allows you to insert formatted citations directly into your LaTeX document.

### Workflow 3: Collaborative Co-Editing
Improve selected paragraphs for clarity, conciseness, and academic rigor. The AI provides suggestions in a diff view, allowing you to accept or reject changes.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sholtomaud/vscode-co-edit.git
    cd vscode-co-edit
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Compile the extension:**
    ```bash
    npm run compile
    ```
4.  **Run in VSCode Development Host:**
    - Open this project in VSCode (`code .`).
    - Press `F5` to open a new VSCode window with the extension loaded.

## Usage

### Prerequisites

-   **Zotero with Better BibTeX:** Ensure Zotero is running and you have the [Better BibTeX for Zotero](https://retorque.re/zotero-better-bibtex/) plugin installed and configured. The extension communicates with its JSON-RPC endpoint (default: `http://localhost:23119/better-bibtex/json-rpc`).
-   **Gemini CLI:** Ensure you have the `gemini-cli` installed and configured on your system, as the extension shells out to it for AI operations.

### Project Structure

Your academic writing project should follow a structure similar to this:

```
/your-writing-project/
├── chapters/
│   ├── 01-introduction/
│   │   ├── introduction.tex
│   │   ├── plan.md
│   │   └── GEMINI.md       (Optional: AI instructions for this chapter)
│   ├── 02-lit-review/
│   │   ├── lit-review.tex
│   │   ├── plan.md
│   │   └── GEMINI.md       (Optional: AI instructions for this chapter)
│   └── main.tex            (Your main LaTeX file that \includes the chapters)
└── ...
```

### Commands

All commands can be accessed via the VSCode Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).

-   **`Co-Edit: Draft Chapter Plan`**
    -   **Usage:** Open any `.tex` file within a chapter directory (e.g., `chapters/01-introduction/introduction.tex`). Run this command.
    -   **Prompt:** You will be asked to enter the main topic of your chapter.
    -   **Output:** A `plan.md` file will be generated in the same directory, outlining a detailed plan for your chapter.

-   **`Co-Edit: Check Section Against Plan`**
    -   **Usage:** Place your cursor within a LaTeX section in your `.tex` file. Run this command.
    -   **Action:** The extension will extract the current section, read its `plan.md` and any `GEMINI.md` in the same directory, and send it to the Gemini CLI for review.
    -   **Output:** Feedback from Gemini will appear in a new VSCode Output Channel named "Co-Edit Gemini Review".

-   **`Co-Edit: Find Relevant Citations`**
    -   **Usage:** Place your cursor within a paragraph in your `.tex` file. Run this command.
    -   **Action:** The extension will extract the current paragraph, send it to the Gemini CLI for keyword extraction, and then search your Zotero library.
    -   **Output:** A Quick Pick list will appear with relevant citations from Zotero. Selecting one will insert its LaTeX citation key (`\cite{key}`) at your cursor.

-   **`Co-Edit: Improve Paragraph`**
    -   **Usage:** Select a paragraph in your `.tex` file. Run this command.
    -   **Action:** The selected text will be sent to the Gemini CLI for improvement.
    -   **Output:** A VSCode Diff view will open, showing your original paragraph and Gemini's improved version. You can then review and apply the changes.

## Configuration

You can configure the extension settings in VSCode (`File > Preferences > Settings` or `Code > Preferences > Settings` on macOS) under `Extensions > Co-Edit Configuration`.

-   `co-edit.zotero.endpoint`: The URL of your Zotero Better BibTeX JSON-RPC endpoint. (Default: `http://localhost:23119/better-bibtex/json-rpc`)
-   `co-edit.zotero.citationStyle`: The default citation style to use for inserting citations (e.g., `apa`, `mla`, `chicago`). (Default: `apa`)

## Development

See `PROJECT_PLAN.md` for the detailed development roadmap and `GEMINI.md` for Gemini-specific development guidelines.
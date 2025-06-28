# Project Plan: AI Academic Writing Co-pilot

This document outlines the development plan for the VSCode extension. It will be used to create GitHub Issues for each task.

## Epics

### Epic 1: Project Setup & Scaffolding
- [x] **Task 1.1:** Initialize a new VSCode extension project using `yo code`.
- [x] **Task 1.2:** Configure `tsconfig.json` for strict mode.
- [x] **Task 1.3:** Set up ESLint and Prettier for code quality.
- [x] **Task 1.4:** Create a `sample-writing-project` directory for local testing, structured according to our plan.

### Epic 2: AI Integration (Gemini SDK)
- [x] **Task 2.1:** Install the Google Gemini SDK for Node.js.
- [x] **Task 2.2:** Implement secure handling of the Gemini API key using `vscode.SecretStorage`.
- [x] **Task 2.3:** Create a `src/gemini.ts` module to encapsulate Gemini API interactions. This module should handle prompt construction and calling the Gemini SDK.

### Epic 3: Workflow 0 - Draft Chapter Plan
- [x] **Task 3.1:** Implement the `co-edit.draftChapterPlan` command and register it in `package.json`.
- [x] **Task 3.2:** The command should correctly identify the active chapter directory.
- [x] **Task 3.3:** The command should show an input box to ask the user for a chapter topic.
- [x] **Task 3.4:** The command should use the Gemini API client (from `src/gemini.ts`) to generate a structured plan based on the topic.
- [x] **Task 3.5:** The command should write the generated Markdown plan to the `plan.md` file within the correct chapter directory.

### Epic 4: Workflow 1 - Plan-Driven Content Checking
- [x] **Task 4.1:** Implement the `co-edit.checkSectionAgainstPlan` command.
- [x] **Task 4.2:** The command should read the content of the active `.tex` file's current section.
- [x] **Task 4.3:** The command should read the corresponding `plan.md` and chapter-specific `GEMINI.md` (if it exists).
- [x] **Task 4.4:** The command should use the Gemini API client to call Gemini with all the context.
- [x] **Task 4.5:** The command should display the AI's feedback to the user (e.g., in the "Problems" panel or as informational messages).

### Epic 5: Workflow 2 - AI-Powered Citation
- [x] **Task 5.1:** Implement the `co-edit.findRelevantCitations` command.
- [x] **Task 5.2:** The command should send the current paragraph to the Gemini API client for keyword extraction.
- [x] **Task 5.3:** Implement a function to connect to the Zotero Better BibTeX JSON-RPC endpoint using the native Node.js `http` module.
- [x] **Task 5.4:** The command should search Zotero based on the keywords from the AI.
- [x] **Task 5.5:** The command should display the search results in a VSCode Quick Pick list.
- [x] **Task 5.6:** Upon selection, the command should insert the formatted citation into the editor at the cursor position.

### Epic 6: Workflow 3 - Collaborative Co-Editing
- [x] **Task 6.1:** Implement the `co-edit.improveParagraph` command.
- [x] **Task 6.2:** The command should get the selected text from the editor.
- [x] **Task 6.3:** The command should send the text to the Gemini API client for improvement.
- [x] **Task 6.4:** The command should display the result in a `Diff` view, allowing the user to accept or reject the changes.

### Epic 7: Configuration & Usability
- [x] **Task 7.1:** Add configuration settings in `package.json` for the Zotero endpoint URL and default citation style.
- [x] **Task 7.2:** Implement robust error handling and user-facing notifications for all commands.
- [x] **Task 7.3:** Write a comprehensive `README.md` explaining how to use the extension.

### Epic 8: Workflow 4 - AI-Powered Commenting Panel
- [x] **Task 8.1:** Implement the `co-edit.generateComments` command.
- [x] **Task 8.2:** Craft a Gemini prompt to generate structured comments (text range, type, content, justification, optional suggested fix) in JSON format, analyzing the whole document.
- [ ] **Task 8.3:** Create a new VS Code Webview panel to display the generated comments, opening to the RHS of the document.
- [ ] **Task 8.4:** Implement communication between the extension backend and the Webview to send comments for display.
- [ ] **Task 8.5:** Design and implement the Webview UI to clearly present comments, including their justifications.
- [ ] **Task 8.6:** Implement visual linking from comments in the panel to their corresponding text ranges in the editor.
- [ ] **Task 8.7:** Integrate error handling for Gemini API calls and Webview interactions.
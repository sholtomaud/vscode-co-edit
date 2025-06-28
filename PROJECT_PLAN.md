# Project Plan: AI Academic Writing Co-pilot

This document outlines the development plan for the VSCode extension. It will be used to create GitHub Issues for each task.

## Epics

### Epic 1: Project Setup & Scaffolding
- [ ] **Task 1.1:** Initialize a new VSCode extension project using `yo code`.
- [ ] **Task 1.2:** Configure `tsconfig.json` for strict mode.
- [ ] **Task 1.3:** Set up ESLint and Prettier for code quality.
- [ ] **Task 1.4:** Create a `sample-writing-project` directory for local testing, structured according to our plan.

### Epic 2: Workflow 0 - Draft Chapter Plan
- [ ] **Task 2.1:** Implement the `co-pilot.draftChapterPlan` command and register it in `package.json`.
- [ ] **Task 2.2:** The command should correctly identify the active chapter directory.
- [ ] **Task 2.3:** The command should show an input box to ask the user for a chapter topic.
- [ ] **Task 2.4:** The command should shell out to the Gemini CLI with a prompt to generate a structured plan based on the topic.
- [ ] **Task 2.5:** The command should write the generated Markdown plan to the `plan.md` file within the correct chapter directory.

### Epic 3: Workflow 1 - Plan-Driven Content Checking
- [ ] **Task 3.1:** Implement the `co-pilot.checkSectionAgainstPlan` command.
- [ ] **Task 3.2:** The command should read the content of the active `.tex` file's current section.
- [ ] **Task 3.3:** The command should read the corresponding `plan.md` and chapter-specific `GEMINI.md` (if it exists).
- [ ] **Task 3.4:** The command should call the Gemini CLI with all the context.
- [ ] **Task 3.5:** The command should display the AI's feedback to the user (e.g., in the "Problems" panel or as informational messages).

### Epic 4: Workflow 2 - AI-Powered Citation
- [ ] **Task 4.1:** Implement the `co-pilot.findRelevantCitations` command.
- [ ] **Task 4.2:** The command should send the current paragraph to the Gemini CLI for keyword extraction.
- [ ] **Task 4.3:** Implement a function to connect to the Zotero Better BibTeX JSON-RPC endpoint using the native Node.js `http` module.
- [ ] **Task 4.4:** The command should search Zotero based on the keywords from the AI.
- [ ] **Task 4.5:** The command should display the search results in a VSCode Quick Pick list.
- [ ] **Task 4.6:** Upon selection, the command should insert the formatted citation into the editor at the cursor position.

### Epic 5: Workflow 3 - Collaborative Co-Editing
- [ ] **Task 5.1:** Implement the `co-pilot.improveParagraph` command.
- [ ] **Task 5.2:** The command should get the selected text from the editor.
- [ ] **Task 5.3:** The command should send the text to the Gemini CLI for improvement.
- [ ] **Task 5.4:** The command should display the result in a `Diff` view, allowing the user to accept or reject the changes.

### Epic 6: Configuration & Usability
- [ ] **Task 6.1:** Add configuration settings in `package.json` for the Zotero endpoint URL and default citation style.
- [ ] **Task 6.2:** Implement robust error handling and user-facing notifications for all commands.
- [ ] **Task 6.3:** Write a comprehensive `README.md` explaining how to use the extension.

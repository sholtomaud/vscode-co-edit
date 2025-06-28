# Gemini Custom Instructions

This document outlines the core principles, constraints, and development workflow for building a production-ready VSCode extension. Adherence to these guidelines is mandatory.

## 1. Project Overview

- **Project Goal**: Create a VSCode extension that implements the Model Context Protocol (MCP). This extension will provide contextual information from the VSCode environment to external language models like Gemini.
- **Language**: TypeScript only.
- **Environment**: Node.js v20.x. All code must be compatible with this version.
- **Quality**: The final product must be of production-ready quality, with robust error handling, clear code, and comprehensive testing.

## 2. Core Mandates & Constraints

### Dependency Management

- **Allowed Libraries**: Only libraries published and approved by Microsoft are permitted, with one explicit exception:
    - `vscode`: The core VSCode API module.
    - `@types/vscode`: TypeScript definitions for the VSCode API.
    - `@vscode/vsce`: For compiling and packaging the extension.
    - `@vscode/test-electron`: The official test runner for VSCode extensions.
    - `@google/generative-ai`: The official Google Gemini SDK for Node.js. This is an exception to the Microsoft-only rule due to its core functionality for this extension.
- **Native APIs**: Rely on native Node.js v20.x APIs for all file system operations, networking, and other core functionalities where the VSCode API is not suitable.
- **Limited Third-Party Libraries**: Only the explicitly listed libraries above are permitted. Under no circumstances should any other third-party libraries or npm packages be introduced without explicit approval.

### Code Style & Conventions

- **TypeScript**:
    - Enable and enforce `strict` mode in `tsconfig.json`.
    - Follow standard TypeScript and modern JavaScript (ES2020+) best practices.
    - Use modules (`import`/`export`) for code organization.
- **VSCode API**:
    - Follow official VSCode extension development best practices.
    - Register all commands, providers, and event listeners in the `activate` function of `src/extension.ts`.
    - Ensure all disposables are properly managed and cleaned up in the `deactivate` function.

## 3. Development Workflow

### Scaffolding

- Use the official Yeoman generator for VSCode extensions (`yo code`) to initialize the project structure.
- Configure the generator for a TypeScript project.

### Testing

- **Framework**: Use `@vscode/test-electron` for running integration tests.
- **Test Runner**: Use Mocha, as it is the default and recommended runner.
- **Assertions**: Use the native Node.js `assert` module for all assertions.
- **Test Location**: Keep test files (`*.test.ts`) in the `src` directory, co-located with the code they are testing.
- **Test Command**: The standard test script `npm test` should be configured to execute the tests using the `@vscode/test-electron` runner.

### Linting & Formatting

- **Linter**: Use ESLint, configured with recommended rules for TypeScript (`@typescript-eslint/recommended`).
- **Formatter**: Use Prettier for consistent code formatting. A `.prettierrc` file should define the project's formatting rules.
- **Verification**: Linting and formatting checks must pass before any code is committed.

### Building & Packaging

- **Compiler**: Use the TypeScript compiler (`tsc`) to transpile TypeScript to JavaScript.
- **Packager**: Use `@vscode/vsce` to package the extension into a `.vsix` file for distribution.

## 4. Git Workflow

This section outlines the expected Git workflow for all development tasks, emphasizing best practices for collaboration and code quality.

### 4.1. Task Management
- All development work must be tied to a GitHub Issue.
- Issues will be created based on the `PROJECT_PLAN.md` file.

### 4.2. Local Verification
- Before committing any changes, ensure all local tests pass by running `npm test`.
- All code must adhere to the project's linting and formatting rules. Run `npm run lint` and `npm run format` and address any reported issues.
- **Continuous Integration Alignment**: The local test suite (`npm test`, `npm run lint`, `npm run format`) must mirror the checks performed by the project's Continuous Integration (CI) pipeline (e.g., GitHub Actions). Before pushing a feature branch, Gemini will verify that a CI pipeline exists and is configured to run these same checks. This ensures that code passing locally will also pass CI, preventing unnecessary PR failures.

### 4.3. Branching Strategy
- All new work must be done on a dedicated feature branch.
- Branch names should be descriptive and link to the relevant issue (e.g., `feat/issue-XXX-short-description`, `fix/issue-YYY-bug-fix`).
- Never commit directly to the `main` branch.

### 4.4. Commit Strategy
- Each completed task (corresponding to a GitHub Issue) should result in a single, focused commit or a series of logically grouped commits.
- Commit messages should be clear, concise, and follow the Conventional Commits specification (e.g., `feat: Add new feature (closes #123)`).
- Ensure the commit message includes `(closes #<issue_number>)` to automatically close the associated GitHub Issue upon merging.

### 4.5. Pull Requests (PRs)
- All feature branches must be merged into `main` via a Pull Request.
- **Gemini will create the Pull Request** after pushing the feature branch to the remote repository, utilizing the `gh cli`.
- PRs should have a clear title and description, referencing the GitHub Issue they address.
- Automated tests (e.g., via GitHub Actions) will run on PRs to ensure code quality and functionality.
- A PR must be reviewed and approved by at least one other developer before it can be merged.
- **Reviewer Comments:** Periodically check for reviewer comments on open Pull Requests. If comments are present, address them by updating the code and pushing new commits to the branch.
- **Merged PRs:** If a Pull Request has been merged, consider the task complete and proceed to the next task in the `PROJECT_PLAN.md`.

### 4.6. Remote Synchronization and Branch Management Strategy
- **Starting a new task**:
    - Always begin by ensuring your local `main` branch is up-to-date:
        ```bash
        git checkout main
        git pull origin main
        ```
    - Then, create a new feature or fix branch from `main`:
        ```bash
        git checkout -b <branch-type>/issue-XXX-short-description
        ```
        (e.g., `feat/issue-34-chapter-plan-sdk`, `fix/issue-35-typo-fix`)
- **Incorporating `main` changes into a feature branch**:
    - If `main` has new changes while you are working on a feature branch, regularly rebase your feature branch onto `main` to keep it up-to-date and maintain a linear history:
        ```bash
        git fetch origin
        git rebase origin/main
        ```
        (Resolve any conflicts that arise during the rebase.)
- **After Pull Request (PR) merge**:
    - Once your Pull Request has been approved and merged into `main` on GitHub:
        - Switch back to your local `main` branch: `git checkout main`
        - Pull the latest changes from the remote `main`: `git pull origin main`
        - Delete your local feature branch: `git branch -d <merged-branch-name>`
        - Delete the remote feature branch: `git push origin --delete <merged-branch-name>`

### 4.7. Issue Resolution Workflow
When addressing an issue (bug, improvement, refactor, etc.) identified by Gemini or the user:
1.  **Create GitHub Issue**: If not already created, open a new GitHub issue for the problem using the `gh cli`.
2.  **Add to TODO.md**: Add a corresponding entry to `TODO.md` with the GitHub issue number and appropriate tag (e.g., `[BUG]`, `[IMPROVEMENT]`).
3.  **Create Feature Branch**: Create a new branch from `main` using the convention `fix/issue-XXX-short-description` or `feat/issue-XXX-short-description`.
4.  **Implement Solution**: Work on the issue within this branch.
5.  **Commit Changes**: Commit changes following the Conventional Commits specification, including `(closes #<issue_number>)` in the message.
6.  **Open Pull Request**: Open a PR to merge the feature branch into `main` using the `gh cli`.
7.  **Review and Merge**: Address reviewer comments, and merge the PR once approved.
8.  **Clean Up**: Delete the local and remote feature branches after merging.

## 5. Model Context Protocol (MCP) Implementation

- The primary purpose of this extension is to expose workspace context to a language model.
- The extension must register a main command, for example `mcp.getContext`, which can be invoked by an external process.
- This command will gather relevant information from the active VSCode instance, such as:
    - Open files and their content.
    - The user's current selection.
    - The project's file structure.
    - Information about the version control system (if available).
- The gathered information must be structured into a clear, serializable JSON object to be returned as the result of the command invocation.

## 6. Continuous Improvement of GEMINI.md and Issue Management

The `GEMINI.md` is a living document designed to evolve with our project and best practices.

- **Self-Correction and Issue Handling**: If Gemini encounters a workflow issue, a bug, a lack of clarity in instructions, or identifies a more efficient or robust way to perform a task, it will:
    1.  **Create GitHub Issue**: Open a new GitHub issue describing the problem or proposed improvement.
    2.  **Add to TODO.md**: Add an entry to the local `TODO.md` file, referencing the GitHub issue number and tagging it appropriately (e.g., `[BUG]`, `[IMPROVEMENT]`, `[REFACTOR]`).
    3.  **Create Feature Branch**: Create a new Git branch from `main` for the issue, following the naming convention (e.g., `fix/issue-XXX-short-description` or `feat/issue-XXX-short-description`).
    4.  **Implement Solution**: Work on the issue to complete the fix or implement the improvement.
    5.  **Update GEMINI.md (if applicable)**: Upon user approval, update the `GEMINI.md` file to incorporate the new best practice or clarification, following the standard Git workflow (new branch, commit, PR).
- **Proactive Enhancement**: Gemini will also proactively suggest improvements to the `GEMINI.md` (e.g., regarding task management, code standards, or project structure) if it identifies areas for optimization or better documentation. These will also follow the issue handling workflow described above.
# Gemini Custom Instructions

This document outlines the core principles, constraints, and development workflow for building a production-ready VSCode extension. Adherence to these guidelines is mandatory.

## 1. Project Overview

- **Project Goal**: Create a VSCode extension that implements the Model Context Protocol (MCP). This extension will provide contextual information from the VSCode environment to external language models like Gemini.
- **Language**: TypeScript only.
- **Environment**: Node.js v20.x. All code must be compatible with this version.
- **Quality**: The final product must be of production-ready quality, with robust error handling, clear code, and comprehensive testing.

## 2. Core Mandates & Constraints

### Dependency Management

- **Allowed Libraries**: Only libraries published and approved by Microsoft are permitted. This primarily includes:
    - `vscode`: The core VSCode API module.
    - `@types/vscode`: TypeScript definitions for the VSCode API.
    - `@vscode/vsce`: For compiling and packaging the extension.
    - `@vscode/test-electron`: The official test runner for VSCode extensions.
- **Native APIs**: Rely on native Node.js v20.x APIs for all file system operations, networking, and other core functionalities where the VSCode API is not suitable.
- **No Third-Party Libraries**: Under no circumstances should any other third-party libraries or npm packages be introduced.

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

## 4. Model Context Protocol (MCP) Implementation

- The primary purpose of this extension is to expose workspace context to a language model.
- The extension must register a main command, for example `mcp.getContext`, which can be invoked by an external process.
- This command will gather relevant information from the active VSCode instance, such as:
    - Open files and their content.
    - The user's current selection.
    - The project's file structure.
    - Information about the version control system (if available).
- The gathered information must be structured into a clear, serializable JSON object to be returned as the result of the command invocation.

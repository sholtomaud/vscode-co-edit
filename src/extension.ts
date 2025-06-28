// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import * as fs from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-co-edit" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('co-pilot.draftChapterPlan', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const directory = path.dirname(document.fileName);
			const chapterTopic = await vscode.window.showInputBox({
				prompt: 'Enter the main topic of this chapter:',
				placeHolder: 'e.g., The impact of the printing press on Renaissance art'
			});

			if (chapterTopic) {
				const prompt = `Generate a detailed chapter plan in Markdown for the topic: "${chapterTopic}". Include sections, subsections, and key points.`;
				
				vscode.window.showInformationMessage('Generating chapter plan...');

				exec(`gemini-cli generate --prompt "${prompt}"`, (error, stdout, stderr) => {
					if (error) {
						vscode.window.showErrorMessage(`Error generating plan: ${error.message}`);
						return;
					}
					if (stderr) {
						console.error(`Gemini CLI stderr: ${stderr}`);
					}
					vscode.window.showInformationMessage(`Generated plan: ${stdout}`);
				});
			} else {
				vscode.window.showInformationMessage('Chapter plan generation cancelled.');
			}
		} else {
			vscode.window.showErrorMessage('No active editor found.');
		}
	});

	context.subscriptions.push(disposable);

	const checkSectionDisposable = vscode.commands.registerCommand('co-pilot.checkSectionAgainstPlan', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found.');
			return;
		}

		const document = editor.document;
		if (document.languageId !== 'latex') {
			vscode.window.showErrorMessage('This command only works for LaTeX files.');
			return;
		}

		let sectionContent = '';
		const selection = editor.selection;

		if (!selection.isEmpty) {
			// If there's a selection, use it
			sectionContent = document.getText(selection);
		} else {
			// If no selection, try to infer the current section
			const cursorLine = editor.selection.active.line;
			let startLine = 0;

			// Find the start of the current section/subsection/chapter
			for (let i = cursorLine; i >= 0; i--) {
				const lineText = document.lineAt(i).text;
				if (lineText.match(/\\(chapter|section|subsection|subsubsection){.*}/)) {
					startLine = i;
					break;
				}
			}

			// Find the end of the current section/subsection/chapter or end of document
			let endLine = document.lineCount - 1;
			for (let i = cursorLine + 1; i < document.lineCount; i++) {
				const lineText = document.lineAt(i).text;
				if (lineText.match(/\\(chapter|section|subsection|subsubsection){.*}/)) {
					endLine = i - 1;
					break;
				}
			}

			const range = new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length);
			sectionContent = document.getText(range);
		}

		vscode.window.showInformationMessage(`Extracted section content (first 100 chars): ${sectionContent.substring(0, 100)}...`);
	});

	context.subscriptions.push(checkSectionDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

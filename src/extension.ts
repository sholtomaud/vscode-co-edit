// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import * as fs from 'fs';
import { callZoteroApi } from './zotero';

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

		        let chapterGeminiContent = '';
        try {
            chapterGeminiContent = await fs.promises.readFile(chapterGeminiFilePath, 'utf8');
            vscode.window.showInformationMessage(`Read chapter GEMINI.md from: ${chapterGeminiFilePath}`);
        } catch (error) {
            vscode.window.showWarningMessage(`Could not read chapter GEMINI.md: ${error.message}`);
        }

        const prompt = `You are an AI academic writing co-pilot. Your task is to review a LaTeX section against a provided plan and specific instructions.\n\nChapter Plan (from plan.md):\n\`\`\`markdown\n${planContent}\n\`\`\`\n\nChapter-Specific Instructions (from GEMINI.md, if any):\n\`\`\`markdown\n${chapterGeminiContent || 'No specific instructions provided.'}\n\`\`\`\n\nLaTeX Section to Review:\n\`\`\`latex\n${sectionContent}\n\`\`\`\n\nBased on the chapter plan and any specific instructions, please provide feedback on the LaTeX section. Focus on:\n- Adherence to the plan's structure and content.\n- Clarity, coherence, and academic rigor.\n- Suggestions for improvement or expansion.\n- Identification of areas where citations might be needed.\n\nProvide your feedback in a clear, concise, and actionable Markdown format.`;

        vscode.window.showInformationMessage('Sending section to Gemini for review...');

        exec(`gemini-cli generate --prompt "${prompt}"`, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error reviewing section: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Gemini CLI stderr: ${stderr}`);
            }
            vscode.window.showInformationMessage(`Gemini review complete. Check output for full feedback.`);
            const outputChannel = vscode.window.createOutputChannel("Co-Pilot Gemini Review");
            outputChannel.appendLine(stdout);
            outputChannel.show();
        });
	});

	context.subscriptions.push(checkSectionDisposable);

	const findCitationsDisposable = vscode.commands.registerCommand('co-pilot.findRelevantCitations', async () => {
		vscode.window.showInformationMessage('Find Relevant Citations command executed!');
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found.');
			return;
		}

		const document = editor.document;
		const cursorLine = editor.selection.active.line;

		let paragraphStartLine = cursorLine;
		while (paragraphStartLine > 0 && document.lineAt(paragraphStartLine - 1).text.trim() !== '') {
			paragraphStartLine--;
		}

		let paragraphEndLine = cursorLine;
		while (paragraphEndLine < document.lineCount - 1 && document.lineAt(paragraphEndLine + 1).text.trim() !== '') {
			paragraphEndLine++;
		}

		const paragraphRange = new vscode.Range(paragraphStartLine, 0, paragraphEndLine, document.lineAt(paragraphEndLine).text.length);
		const paragraphContent = document.getText(paragraphRange);

		if (paragraphContent.trim() === '') {
			vscode.window.showInformationMessage('No paragraph found at cursor position.');
			return;
		}

		const prompt = `Extract key concepts and keywords from the following text, suitable for searching a research paper database. Provide them as a comma-separated list. Do not include any other text or formatting.\n\nText:\n\`\`\`\n${paragraphContent}\n\`\`\``;

		vscode.window.showInformationMessage('Extracting keywords from paragraph...');

		exec(`gemini-cli generate --prompt "${prompt}"`, (error, stdout, stderr) => {
			if (error) {
				vscode.window.showErrorMessage(`Error extracting keywords: ${error.message}`);
				return;
			}
			if (stderr) {
				console.error(`Gemini CLI stderr: ${stderr}`);
			}
			            const keywords = stdout.trim();
            if (!keywords) {
                vscode.window.showInformationMessage('Gemini did not return any keywords.');
                return;
            }

            vscode.window.showInformationMessage(`Searching Zotero for: ${keywords}`);

            try {
                const zoteroResults = await callZoteroApi('item.search', [keywords]);
                if (zoteroResults && zoteroResults.length > 0) {
                    const quickPickItems = zoteroResults.map((item: any) => ({
                        label: item.title || 'No Title',
                        description: item.creators ? item.creators.map((c: any) => `${c.firstName} ${c.lastName}`).join(', ') : '',
                        detail: item.date || '',
                        item: item // Store the full item for later use
                    }));

                    const selectedItem = await vscode.window.showQuickPick(quickPickItems, {
                        placeHolder: 'Select a citation to insert',
                        matchOnDescription: true,
                        matchOnDetail: true
                    });

                    if (selectedItem) {
                        vscode.window.showInformationMessage(`Selected: ${selectedItem.label}`);
                        const citationKey = selectedItem.item.citationKey; // Assuming citationKey exists
                        const citationText = `\cite{${citationKey}}`;

                        editor.edit(editBuilder => {
                            editBuilder.replace(editor.selection, citationText);
                        });

                        vscode.window.showInformationMessage(`Inserted citation: ${citationText}`);
                    } else {
                        vscode.window.showInformationMessage('No citation selected.');
                    }
                } else {
                    vscode.window.showInformationMessage('No relevant citations found in Zotero.');
                }
            } catch (zoteroError: any) {
                vscode.window.showErrorMessage(`Zotero search failed: ${zoteroError.message}`);
            }
		});
	});

	context.subscriptions.push(findCitationsDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

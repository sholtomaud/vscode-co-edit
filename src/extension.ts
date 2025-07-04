// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { generateContent } from './gemini.js';
import { callZoteroApi } from './zotero.js';

interface ZoteroQuickPickItem extends vscode.QuickPickItem {
    item: any; // To store the full Zotero item
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "co-edit" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const draftChapterPlanDisposable = vscode.commands.registerCommand('co-edit.draftChapterPlan', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found.');
			return;
		}

		const document = editor.document;
		const directory = path.dirname(document.fileName);
		const chapterTopic = await vscode.window.showInputBox({
			prompt: 'Enter the main topic of this chapter:',
			placeHolder: 'e.g., The impact of the printing press on Renaissance art'
		});

		if (chapterTopic) {
			const prompt = `Generate a detailed chapter plan in Markdown for the topic: "${chapterTopic}". Include sections, subsections, and key points.`;
			
			vscode.window.showInformationMessage('Generating chapter plan...');

            const generatedPlan = await generateContent(context.secrets, prompt);

            if (generatedPlan) {
                const planFilePath = path.join(directory, 'plan.md');
                try {
                    await fs.promises.writeFile(planFilePath, generatedPlan, 'utf8');
                    vscode.window.showInformationMessage(`Chapter plan generated and saved to ${planFilePath}`);
                } catch (err: any) {
                    vscode.window.showErrorMessage(`Error writing plan.md: ${err.message}`);
                }
            } else {
                vscode.window.showErrorMessage('Failed to generate chapter plan.');
            }
		} else {
			vscode.window.showInformationMessage('Chapter plan generation cancelled.');
		}
	});

	context.subscriptions.push(draftChapterPlanDisposable);

	const checkSectionDisposable = vscode.commands.registerCommand('co-edit.checkSectionAgainstPlan', async () => {
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

		const chapterDirectory = path.dirname(document.fileName);
		const planFilePath = path.join(chapterDirectory, 'plan.md');
		const chapterGeminiFilePath = path.join(chapterDirectory, 'GEMINI.md');

		let planContent = '';
		try {
			planContent = await fs.promises.readFile(planFilePath, 'utf8');
		} catch (error: any) {
			vscode.window.showWarningMessage(`Could not read plan.md: ${error.message}`);
		}

		let chapterGeminiContent = '';
		try {
			chapterGeminiContent = await fs.promises.readFile(chapterGeminiFilePath, 'utf8');
		} catch (error: any) {
			vscode.window.showWarningMessage(`Could not read chapter GEMINI.md: ${error.message}`);
		}

		const prompt = `You are an AI academic writing co-edit. Your task is to review a LaTeX section against a provided plan and specific instructions.\n\nChapter Plan (from plan.md):\n\`\`\`markdown\n${planContent}\n\`\`\`\n\nChapter-Specific Instructions (from GEMINI.md, if any):\n\`\`\`markdown\n${chapterGeminiContent || 'No specific instructions provided.'}\n\`\`\`\n\nLaTeX Section to Review:\n\`\`\`latex\n${sectionContent}\n\`\`\`\n\nBased on the chapter plan and any specific instructions, please provide feedback on the LaTeX section. Focus on:\n- Adherence to the plan's structure and content.\n- Clarity, coherence, and academic rigor.\n- Suggestions for improvement or expansion.\n- Identification of areas where citations might be needed.\n\nProvide your feedback in a clear, concise, and actionable Markdown format.`;

		vscode.window.showInformationMessage('Sending section to Gemini for review...');

        const reviewOutput = await generateContent(context.secrets, prompt);

        if (reviewOutput) {
            vscode.window.showInformationMessage(`Gemini review complete. Check output for full feedback.`);
            const outputChannel = vscode.window.createOutputChannel("Co-Pilot Gemini Review");
            outputChannel.appendLine(reviewOutput);
            outputChannel.show();
        } else {
            vscode.window.showErrorMessage('Failed to get review from Gemini.');
        }
	});

	context.subscriptions.push(checkSectionDisposable);

	const findCitationsDisposable = vscode.commands.registerCommand('co-edit.findRelevantCitations', async () => {
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

        const keywords = await generateContent(context.secrets, prompt);

        if (!keywords) {
            vscode.window.showInformationMessage('Gemini did not return any keywords.');
            return;
        }

        vscode.window.showInformationMessage(`Searching Zotero for: ${keywords}`);

        try {
            const zoteroResults = await callZoteroApi('item.search', [keywords]);
            if (zoteroResults && zoteroResults.length > 0) {
                const quickPickItems: ZoteroQuickPickItem[] = zoteroResults.map((item: any) => ({
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
                    const citationText = `\\cite{${citationKey}}`;

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

	context.subscriptions.push(findCitationsDisposable);

	const improveParagraphDisposable = vscode.commands.registerCommand('co-edit.improveParagraph', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found.');
			return;
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
			vscode.window.showInformationMessage('No text selected. Please select a paragraph to improve.');
			return;
		}

		const selectedText = editor.document.getText(selection);

        const prompt = `Improve the following paragraph for clarity, conciseness, and academic rigor. Provide only the improved paragraph, without any additional text or formatting.\n\nParagraph:\n\`\`\`\n${selectedText}\n\`\`\``;

        vscode.window.showInformationMessage('Sending paragraph to Gemini for improvement...');

        const improvedText = await generateContent(context.secrets, prompt);

        if (!improvedText) {
            vscode.window.showInformationMessage('Gemini did not return an improved paragraph.');
            return;
        }

        // Create temporary files for diff view
        const originalUri = vscode.Uri.file(path.join(os.tmpdir(), 'original.txt'));
        const improvedUri = vscode.Uri.file(path.join(os.tmpdir(), 'improved.txt'));

        await vscode.workspace.fs.writeFile(originalUri, Buffer.from(selectedText, 'utf8'));
        await vscode.workspace.fs.writeFile(improvedUri, Buffer.from(improvedText, 'utf8'));

        await vscode.commands.executeCommand('vscode.diff', originalUri, improvedUri, 'Original vs. Improved Paragraph');

        const choice = await vscode.window.showQuickPick(['Accept', 'Discard'], {
            placeHolder: 'Accept or discard the improved paragraph?',
            ignoreFocusOut: true
        });

        if (choice === 'Accept') {
            editor.edit(editBuilder => {
                editBuilder.replace(selection, improvedText);
            });
            vscode.window.showInformationMessage('Improved paragraph accepted.');
        } else {
            vscode.window.showInformationMessage('Improved paragraph discarded.');
        }
	});

	context.subscriptions.push(improveParagraphDisposable);

	const setApiKeyDisposable = vscode.commands.registerCommand('co-edit.setGeminiApiKey', async () => {
		const apiKey = await vscode.window.showInputBox({
			prompt: 'Enter your Gemini API Key:',
			ignoreFocusOut: true, // Keep the input box open even if focus is lost
			password: true // Mask the input
		});

		if (apiKey) {
			await context.secrets.store('geminiApiKey', apiKey);
			vscode.window.showInformationMessage('Gemini API Key stored securely.');
		} else {
			vscode.window.showInformationMessage('Gemini API Key not set.');
		}
	});

	context.subscriptions.push(setApiKeyDisposable);

	const generateCommentsDisposable = vscode.commands.registerCommand('co-edit.generateComments', async () => {
		vscode.window.showInformationMessage('Generate Comments command executed!');
	});

	context.subscriptions.push(generateCommentsDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
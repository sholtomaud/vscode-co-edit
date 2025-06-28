import { GoogleGenAI } from '@google/genai';
import * as vscode from 'vscode';

export interface Comment {
    text_range: { start: number; end: number; };
    comment_type: string;
    comment_content: string;
    justification: string;
    suggested_fix?: string;
}

export async function generateContent(secretStorage: vscode.SecretStorage, prompt: string): Promise<string | undefined> {
    const apiKey = await secretStorage.get('geminiApiKey');

    if (!apiKey) {
        vscode.window.showErrorMessage('Gemini API Key not found. Please set it using the "Co-Edit: Set Gemini API Key" command.');
        return undefined;
    }

    const ai = new GoogleGenAI({apiKey: apiKey});

    try {
        const response = await ai.models.generateContent({ model: 'gemini-1.5-pro', contents: prompt });
        const text = response.text;
        return text;
    } catch (error: any) {
        vscode.window.showErrorMessage(`Gemini API Error: ${error.message}`);
        return undefined;
    }
}

export async function generateStructuredComments(
    secretStorage: vscode.SecretStorage,
    documentContent: string,
    planContent?: string,
    geminiMdContent?: string
): Promise<Comment[] | undefined> {
    const apiKey = await secretStorage.get('geminiApiKey');

    if (!apiKey) {
        vscode.window.showErrorMessage('Gemini API Key not found. Please set it using the "Co-Edit: Set Gemini API Key" command.');
        return undefined;
    }

    const ai = new GoogleGenAI({apiKey: apiKey});

    const prompt = `You are an AI academic writing co-editor. Your task is to review the provided LaTeX document content and generate structured comments in JSON format. Each comment should identify a specific text range, categorize the comment type, provide detailed feedback, offer a clear justification for the suggestion, and optionally include a suggested fix.

Analyze the entire document for:
- Clarity and conciseness
- Argumentation and logical flow
- Adherence to any provided plan or specific instructions (if applicable)
- Grammar, spelling, and punctuation
- Opportunities for improvement or expansion

The output should be a JSON array of comment objects. Each comment object must have the following properties:
- \`text_range\`: An object with \`start\` and \`end\` properties, representing the character offsets (0-indexed) within the provided document content where the comment applies.
- \`comment_type\`: A string from a predefined list (e.g., "Clarity", "Conciseness", "Grammar", "Argumentation", "Consistency", "Suggestion", "Style").
- \`comment_content\`: A string containing the detailed feedback.
- \`justification\`: A string explaining *why* this comment is relevant or *why* the suggestion is being made, referencing specific aspects of the text or the overall plan.
- \`suggested_fix\`: (Optional) A string containing a proposed textual replacement or addition.

Example of a comment object:
\`\`\`json
{
  "text_range": { "start": 123, "end": 456 },
  "comment_type": "Clarity",
  "comment_content": "This sentence is ambiguous and could be rephrased for better understanding.",
  "justification": "The phrase 'it is believed' lacks a clear subject and makes the statement less authoritative. Your plan emphasizes strong, evidence-based claims.",
  "suggested_fix": "Researchers have demonstrated that..."
}
\`\`\`

Here is the LaTeX document content to review:

\`\`\`latex
${documentContent}
\`\`\`

${planContent ? `Here is the chapter plan (from plan.md):\n\`\`\`markdown\n${planContent}\n\`\`\`\n` : ''}
${geminiMdContent ? `Here are chapter-specific instructions (from GEMINI.md):\n\`\`\`markdown\n${geminiMdContent}\n\`\`\`\n` : ''}

Provide only the JSON array. Do not include any other text or formatting outside the JSON.
`;

    try {
        const response = await ai.models.generateContent({ model: 'gemini-1.5-pro', contents: prompt });
        const text = response.text;
        if (!text) {
            vscode.window.showErrorMessage(`Gemini API Error (Structured Comments): No text returned from API.`);
            return undefined;
        }
        return JSON.parse(text) as Comment[];
    } catch (error: any) {
        vscode.window.showErrorMessage(`Gemini API Error (Structured Comments): ${error.message}`);
        return undefined;
    }
}

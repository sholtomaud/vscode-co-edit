import { GoogleGenAI } from '@google/genai';
import * as vscode from 'vscode';

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

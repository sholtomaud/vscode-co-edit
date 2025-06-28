import { GoogleGenerativeAI } from '@google/generative-ai';
import * as vscode from 'vscode';

export async function generateContent(prompt: string): Promise<string | undefined> {
    const apiKey = await vscode.secrets.get('geminiApiKey');

    if (!apiKey) {
        vscode.window.showErrorMessage('Gemini API Key not found. Please set it using the "Co-Pilot: Set Gemini API Key" command.');
        return undefined;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error: any) {
        vscode.window.showErrorMessage(`Gemini API Error: ${error.message}`);
        return undefined;
    }
}

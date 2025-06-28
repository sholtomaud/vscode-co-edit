import * as http from 'http';

export function callZoteroApi(method: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: 1 // A simple ID, can be made dynamic if needed
        });

        const options = {
            hostname: 'localhost',
            port: 23119, // Default Better BibTeX JSON-RPC port
            path: '/better-bibtex/json-rpc',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    if (parsedData.error) {
                        reject(new Error(parsedData.error.message || 'Zotero API Error'));
                    } else {
                        resolve(parsedData.result);
                    }
                } catch (e: any) {
                    reject(new Error(`Failed to parse Zotero API response: ${e.message}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error(`Problem with Zotero API request: ${e.message}. Is Zotero running with Better BibTeX?`));
        });

        req.write(postData);
        req.end();
    });
}

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);

export async function POST(request) {
    try {
        const body = await request.json();
        const { url, method, vus, duration, headers, queryParams, body: requestBody } = body;

        // Construct URL with query params
        let targetUrl = url;
        if (queryParams && Object.keys(queryParams).length > 0) {
            const queryString = new URLSearchParams(queryParams).toString();
            const separator = targetUrl.includes('?') ? '&' : '?';
            targetUrl = `${targetUrl}${separator}${queryString}`;
        }

        // Prepare headers and body for k6
        const k6Params = {
            headers: headers || {},
        };

        // Generate K6 script
        const scriptContent = `
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: ${vus},
  duration: '${duration}',
};

export default function () {
  const url = '${targetUrl}';
  const payload = ${requestBody ? JSON.stringify(requestBody) : 'null'};
  const params = ${JSON.stringify(k6Params)};

  http.request('${method}', url, payload, params);
  sleep(1);
}
    `;

        // Create a temporary file for the script
        const scriptPath = path.join(process.cwd(), `temp_script_${Date.now()}.js`);
        await writeFileAsync(scriptPath, scriptContent);

        // Run K6
        const { stdout, stderr } = await execAsync(`k6 run ${scriptPath}`);

        // Cleanup
        fs.unlinkSync(scriptPath);

        return NextResponse.json({ output: stdout || stderr });
    } catch (error) {
        console.error('Test execution failed:', error);
        return NextResponse.json(
            { error: 'Failed to execute test', details: error.message },
            { status: 500 }
        );
    }
}

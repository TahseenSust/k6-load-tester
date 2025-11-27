import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

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

    // Create a TransformStream for streaming the output
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Run K6 using spawn
        const k6Process = spawn('k6', ['run', scriptPath]);

        const handleOutput = (data) => {
          controller.enqueue(encoder.encode(data.toString()));
        };

        k6Process.stdout.on('data', handleOutput);
        k6Process.stderr.on('data', handleOutput);

        k6Process.on('close', (code) => {
          // Cleanup
          try {
            fs.unlinkSync(scriptPath);
          } catch (e) {
            console.error('Error deleting temp script:', e);
          }

          if (code !== 0) {
            controller.enqueue(encoder.encode(`\nProcess exited with code ${code}`));
          }
          controller.close();
        });

        k6Process.on('error', (err) => {
          controller.enqueue(encoder.encode(`\nError starting k6: ${err.message}`));
          try {
            fs.unlinkSync(scriptPath);
          } catch (e) {
            console.error('Error deleting temp script:', e);
          }
          controller.close();
        });
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('Test execution failed:', error);
    return NextResponse.json(
      { error: 'Failed to execute test', details: error.message },
      { status: 500 }
    );
  }
}

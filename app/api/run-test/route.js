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

    const testId = Date.now().toString();
    const scriptPath = path.join(process.cwd(), `temp_script_${testId}.js`);
    const summaryPath = path.join(process.cwd(), `temp_summary_${testId}.json`);

    await writeFileAsync(scriptPath, scriptContent);

    // Create a TransformStream for streaming the output
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Run K6 using spawn with summary export
        const k6Process = spawn('k6', ['run', '--summary-export', summaryPath, scriptPath]);

        const handleOutput = (data) => {
          controller.enqueue(encoder.encode(data.toString()));
        };

        k6Process.stdout.on('data', handleOutput);
        k6Process.stderr.on('data', handleOutput);

        k6Process.on('close', async (code) => {
          // Cleanup script
          try {
            fs.unlinkSync(scriptPath);
          } catch (e) {
            console.error('Error deleting temp script:', e);
          }

          if (code !== 0) {
            controller.enqueue(encoder.encode(`\nProcess exited with code ${code}`));
            // Try to cleanup summary if it exists (might not if k6 failed early)
            try {
              if (fs.existsSync(summaryPath)) fs.unlinkSync(summaryPath);
            } catch (e) { }
            controller.close();
            return;
          }

          // Process and save report
          try {
            if (fs.existsSync(summaryPath)) {
              const summaryData = fs.readFileSync(summaryPath, 'utf8');
              const summary = JSON.parse(summaryData);

              const report = {
                id: testId,
                timestamp: new Date().toISOString(),
                config: { url, method, vus, duration },
                summary: summary
              };

              const reportsDir = path.join(process.cwd(), 'reports');
              if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir);
              }

              fs.writeFileSync(path.join(reportsDir, `${testId}.json`), JSON.stringify(report, null, 2));

              controller.enqueue(encoder.encode(`\n\nTest Report Saved: ${testId}`));

              // Cleanup summary file
              fs.unlinkSync(summaryPath);
            } else {
              controller.enqueue(encoder.encode(`\nWarning: No summary file generated.`));
            }
          } catch (e) {
            console.error('Error saving report:', e);
            controller.enqueue(encoder.encode(`\nError saving report: ${e.message}`));
          }

          controller.close();
        });

        k6Process.on('error', (err) => {
          controller.enqueue(encoder.encode(`\nError starting k6: ${err.message}`));
          try {
            fs.unlinkSync(scriptPath);
            if (fs.existsSync(summaryPath)) fs.unlinkSync(summaryPath);
          } catch (e) {
            console.error('Error deleting temp files:', e);
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

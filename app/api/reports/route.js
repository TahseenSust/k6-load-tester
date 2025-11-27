import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const reportsDir = path.join(process.cwd(), 'reports');

        if (!fs.existsSync(reportsDir)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(reportsDir).filter(file => file.endsWith('.json'));

        const reports = files.map(file => {
            const filePath = path.join(reportsDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const report = JSON.parse(fileContent);

            // Return only necessary info for the list
            return {
                id: report.id,
                timestamp: report.timestamp,
                config: report.config,
                // Add basic metrics for the list view if needed
                vus: report.config.vus,
                duration: report.config.duration,
            };
        });

        // Sort by timestamp descending
        reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return NextResponse.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reports' },
            { status: 500 }
        );
    }
}

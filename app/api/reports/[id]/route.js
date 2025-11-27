import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const reportsDir = path.join(process.cwd(), 'reports');
        const filePath = path.join(reportsDir, `${id}.json`);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: 'Report not found' },
                { status: 404 }
            );
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const report = JSON.parse(fileContent);

        return NextResponse.json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        return NextResponse.json(
            { error: 'Failed to fetch report' },
            { status: 500 }
        );
    }
}

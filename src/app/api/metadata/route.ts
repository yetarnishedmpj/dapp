import { NextResponse } from 'next/server';
import { validateAndHashMetadata } from '../../../utils/metadata_cpp';

export async function POST(request: Request) {
    const { name, description } = await request.json();

    const result = validateAndHashMetadata(name, description);

    if (result.success) {
        return NextResponse.json({ 
            success: true, 
            hash: result.hash, 
            message: "Metadata validated by C++ Addon!" 
        });
    } else {
        return NextResponse.json({ 
            success: false, 
            error: result.error, 
            message: "C++ Validation Failed" 
        }, { status: 400 });
    }
}

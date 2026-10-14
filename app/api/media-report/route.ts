import { NextRequest, NextResponse } from 'next/server';
import { authenticateSignedInUser, publicSpicyError, recordMediaReport } from '@/lib/spicyapi-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await authenticateSignedInUser(req);
    const body = await req.json();
    const allowedTypes = ['chat', 'image', 'voice', 'video', 'other'];
    if (!allowedTypes.includes(body?.contentType) || typeof body?.description !== 'string'
      || body.description.trim().length < 10 || body.description.length > 2000) {
      return NextResponse.json({ error: 'Choose a content type and provide a 10–2,000 character report.' }, { status: 400 });
    }
    const reference = typeof body?.contentReference === 'string' ? body.contentReference.slice(0, 160) : null;
    await recordMediaReport(userId, body.contentType, reference, body.description.trim());
    return NextResponse.json({ submitted: true, message: 'Report received. Our review process should assess reports within 24 hours.' }, { status: 201 });
  } catch (error) {
    const mapped = publicSpicyError(error);
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}

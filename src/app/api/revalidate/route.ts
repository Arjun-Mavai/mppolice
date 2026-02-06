import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag');

  const path = request.nextUrl.searchParams.get('path');

  if (tag) {
    revalidateTag(tag , {expire: 0});
  }
  
  if (path) {
    revalidatePath(path );
  }

  if (!tag && !path) {
    return NextResponse.json({ message: 'Missing tag or path param' }, { status: 400 });
  }

  return NextResponse.json({ revalidated: true, now: Date.now(), tag, path });
}

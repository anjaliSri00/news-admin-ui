import { NextRequest, NextResponse } from 'next/server';
import { MEDIA_ASSETS } from '@/data/mockData';
import { MediaAsset } from '@/types/editorial';

let mediaDatabase: MediaAsset[] = [...MEDIA_ASSETS];

// READ / LIST
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get('tag');

  let filtered = [...mediaDatabase];
  if (tag && tag !== 'all') {
    filtered = filtered.filter((a) =>
      a.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
    );
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    media: filtered,
  });
}

// CREATE / UPLOAD
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<MediaAsset>;

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Media asset title is required' },
        { status: 400 }
      );
    }

    const newAsset: MediaAsset = {
      id: body.id || `media-${Date.now()}`,
      title: body.title,
      photographer: body.photographer || 'Rasmus Hjortshøj',
      monographTitle: body.monographTitle || 'General Folio Staging',
      resolution: body.resolution || '7200 x 4800 px (300 DPI)',
      aspectRatio: body.aspectRatio || '3:2 Landscape',
      fileSize: body.fileSize || '42.8 MB (TIFF / CMYK)',
      imageUrl:
        body.imageUrl ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      status: body.status || '300 DPI Verified',
      tags: body.tags || ['Master Plate', '300 DPI', 'Proofed'],
    };

    mediaDatabase.unshift(newAsset);

    return NextResponse.json(
      {
        success: true,
        message: 'Photographic plate ingested successfully',
        media: newAsset,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid media payload';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // empty
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Media ID is required for deletion' },
        { status: 400 }
      );
    }

    const initialLen = mediaDatabase.length;
    const removedItem = mediaDatabase.find((m) => m.id === id);
    mediaDatabase = mediaDatabase.filter((m) => m.id !== id);

    if (mediaDatabase.length === initialLen) {
      return NextResponse.json({ success: false, error: 'Media asset not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Media plate "${removedItem?.title || id}" deleted successfully`,
      deletedId: id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete media asset';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

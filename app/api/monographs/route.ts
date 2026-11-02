import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MONOGRAPHS } from '@/data/mockData';
import { Monograph } from '@/types/editorial';

// Persistent in-memory collection during server runtime
let monographsDatabase: Monograph[] = [...INITIAL_MONOGRAPHS];

// READ / LIST
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const query = searchParams.get('q');

  if (id) {
    const item = monographsDatabase.find((m) => m.id === id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Monograph not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, monograph: item });
  }

  let filtered = [...monographsDatabase];

  if (category && category !== 'all') {
    filtered = filtered.filter((m) => m.category === category);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((m) => m.status === status);
  }

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.author.name.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        (m.location && m.location.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    monographs: filtered,
  });
}

// CREATE
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Monograph>;

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Manuscript title is required' },
        { status: 400 }
      );
    }

    const nextNumber = String(monographsDatabase.length + 1).padStart(2, '0');

    const newMonograph: Monograph = {
      id: body.id || `mono-${Date.now()}`,
      number: body.number || nextNumber,
      title: body.title,
      subtitle: body.subtitle || 'Architectural Monograph / Critical Inquiry',
      category: body.category || 'Architectural Projects & Critical Monographs',
      author: body.author || {
        name: 'Dr. Helena Vance',
        initials: 'HV',
        desk: 'Zurich Bureau',
      },
      targetReleaseDate: body.targetReleaseDate || 'Nov 12, 2024',
      status: body.status || 'review',
      statusLabel: body.statusLabel || 'Peer Review (Zurich)',
      activeReads: body.activeReads || 120,
      meanDepth: body.meanDepth || '8m 45s dwell',
      coverImage:
        body.coverImage ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      synopsis: body.synopsis || 'Comprehensive spatial analysis and material inquiry.',
      fullBody: body.fullBody || body.synopsis || 'Full manuscript treatise in editorial composition.',
      architecturalStyle: body.architecturalStyle || 'Critical Regionalism',
      location: body.location || 'Zurich, Switzerland',
      pullQuote:
        body.pullQuote ||
        'Architecture serves as an unyielding witness to cultural and material truth.',
      gallery: body.gallery || [
        body.coverImage ||
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      ],
    };

    monographsDatabase.unshift(newMonograph);

    return NextResponse.json(
      {
        success: true,
        message: 'Monograph commissioned and created successfully',
        monograph: newMonograph,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid monograph payload';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// UPDATE (Full entity update)
export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as Monograph;

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Monograph ID is required for update' },
        { status: 400 }
      );
    }

    const index = monographsDatabase.findIndex((m) => m.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Monograph not found' }, { status: 404 });
    }

    monographsDatabase[index] = {
      ...monographsDatabase[index],
      ...body,
    };

    return NextResponse.json({
      success: true,
      message: 'Monograph updated successfully',
      monograph: monographsDatabase[index],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update monograph';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// PARTIAL UPDATE (Status, Label, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const { id, status, statusLabel, activeReads } = await req.json();

    const index = monographsDatabase.findIndex((m) => m.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Monograph not found' }, { status: 404 });
    }

    monographsDatabase[index] = {
      ...monographsDatabase[index],
      status: status !== undefined ? status : monographsDatabase[index].status,
      statusLabel: statusLabel !== undefined ? statusLabel : monographsDatabase[index].statusLabel,
      activeReads: activeReads !== undefined ? activeReads : monographsDatabase[index].activeReads,
    };

    return NextResponse.json({
      success: true,
      message: 'Monograph status patched successfully',
      monograph: monographsDatabase[index],
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update monograph status' },
      { status: 400 }
    );
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
        // body was empty or not json
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Monograph ID is required for deletion' },
        { status: 400 }
      );
    }

    const initialLength = monographsDatabase.length;
    const removedItem = monographsDatabase.find((m) => m.id === id);
    monographsDatabase = monographsDatabase.filter((m) => m.id !== id);

    if (monographsDatabase.length === initialLength) {
      return NextResponse.json({ success: false, error: 'Monograph not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Monograph "${removedItem?.title || id}" deleted successfully`,
      deletedId: id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete monograph';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

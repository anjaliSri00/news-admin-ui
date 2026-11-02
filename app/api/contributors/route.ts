import { NextRequest, NextResponse } from 'next/server';
import { CONTRIBUTORS } from '@/data/mockData';
import { Contributor } from '@/types/editorial';

let contributorsDatabase: Contributor[] = [...CONTRIBUTORS];

// READ / LIST
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const c = contributorsDatabase.find((item) => item.id === id);
    if (!c) {
      return NextResponse.json({ success: false, error: 'Contributor not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, contributor: c });
  }

  return NextResponse.json({
    success: true,
    count: contributorsDatabase.length,
    contributors: contributorsDatabase,
  });
}

// CREATE
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Contributor>;

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Contributor name is required' },
        { status: 400 }
      );
    }

    const initials =
      body.initials ||
      body.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const newContributor: Contributor = {
      id: body.id || `cont-${Date.now()}`,
      name: body.name,
      initials: initials || 'CO',
      role: body.role || 'Architectural Theorist & Contributing Fellow',
      desk: body.desk || 'Zurich Bureau',
      location: body.location || 'Zurich, Switzerland',
      activeAssignments: body.activeAssignments ?? 1,
      totalMonographs: body.totalMonographs ?? 0,
      specialty: body.specialty || 'Critical Spatial Inquiry',
      recentPiece: body.recentPiece || 'Commissioned Dispatch in Staging',
      status: body.status || 'Active',
      avatar:
        body.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };

    contributorsDatabase.unshift(newContributor);

    return NextResponse.json(
      {
        success: true,
        message: 'Contributor invited and registered successfully',
        contributor: newContributor,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid contributor payload';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// UPDATE
export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as Contributor;

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Contributor ID is required for update' },
        { status: 400 }
      );
    }

    const index = contributorsDatabase.findIndex((c) => c.id === body.id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Contributor not found' },
        { status: 404 }
      );
    }

    contributorsDatabase[index] = {
      ...contributorsDatabase[index],
      ...body,
    };

    return NextResponse.json({
      success: true,
      message: 'Contributor updated successfully',
      contributor: contributorsDatabase[index],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update contributor';
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
        { success: false, error: 'Contributor ID is required for deletion' },
        { status: 400 }
      );
    }

    const initialLen = contributorsDatabase.length;
    const removedItem = contributorsDatabase.find((c) => c.id === id);
    contributorsDatabase = contributorsDatabase.filter((c) => c.id !== id);

    if (contributorsDatabase.length === initialLen) {
      return NextResponse.json(
        { success: false, error: 'Contributor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Contributor "${removedItem?.name || id}" removed successfully`,
      deletedId: id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete contributor';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

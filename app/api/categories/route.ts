import { NextRequest, NextResponse } from 'next/server';
import { CURATED_CATEGORIES } from '@/data/mockData';
import { CuratedCategory } from '@/types/editorial';

let categoriesDatabase: CuratedCategory[] = [...CURATED_CATEGORIES];

// READ / LIST
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const cat = categoriesDatabase.find((c) => c.id === id);
    if (!cat) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, category: cat });
  }

  return NextResponse.json({
    success: true,
    count: categoriesDatabase.length,
    categories: categoriesDatabase,
  });
}

// CREATE
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CuratedCategory>;

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Category section title is required' },
        { status: 400 }
      );
    }

    const newCategory: CuratedCategory = {
      id: body.id || `cat-${Date.now()}`,
      title: body.title,
      description: body.description || 'Specialized thematic architectural focus area.',
      volumePercentage: body.volumePercentage || 10,
      readsCount: body.readsCount || 50000,
      monographCount: body.monographCount || 4,
      leadCurator: body.leadCurator || 'Dr. Helena Vance',
      architecturalFocus: body.architecturalFocus || ['Spatial Studies', 'Materiality'],
      leadImage:
        body.leadImage ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    };

    categoriesDatabase.push(newCategory);

    return NextResponse.json(
      {
        success: true,
        message: 'Curatorial section created successfully',
        category: newCategory,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid category payload';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// UPDATE
export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as CuratedCategory;

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required for update' },
        { status: 400 }
      );
    }

    const index = categoriesDatabase.findIndex((c) => c.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    categoriesDatabase[index] = {
      ...categoriesDatabase[index],
      ...body,
    };

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: categoriesDatabase[index],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update category';
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
        { success: false, error: 'Category ID is required for deletion' },
        { status: 400 }
      );
    }

    const initialLen = categoriesDatabase.length;
    const removedItem = categoriesDatabase.find((c) => c.id === id);
    categoriesDatabase = categoriesDatabase.filter((c) => c.id !== id);

    if (categoriesDatabase.length === initialLen) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Category "${removedItem?.title || id}" deleted successfully`,
      deletedId: id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete category';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_METRICS_DATA, CURATED_CATEGORIES, DESK_DEADLINES } from '@/data/mockData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const time = (searchParams.get('time') as keyof typeof SYSTEM_METRICS_DATA) || 'october';

  const metrics = SYSTEM_METRICS_DATA[time] || SYSTEM_METRICS_DATA.october;

  return NextResponse.json({
    success: true,
    edition: 'Vol. 48 Edition Metrics',
    timestamp: new Date().toISOString(),
    nodes: [
      { name: 'Zurich Node (Primary)', status: 'Active', latencyMs: 12, uptime: '99.98%' },
      { name: 'Milan Relay Node', status: 'Active', latencyMs: 18, uptime: '100%' },
      { name: 'Tokyo Cache Sync', status: 'Active', latencyMs: 134, uptime: '99.94%' },
      { name: 'London Broadside Link', status: 'Active', latencyMs: 24, uptime: '99.99%' },
    ],
    metrics,
    categories: CURATED_CATEGORIES,
    deadlines: DESK_DEADLINES,
    demographics: {
      panEuropean: 48,
      northAmerica: 32,
      asiaPacific: 20,
      viewport: {
        desktopBroadsheet: 64,
        mobileDispatch: 36,
      },
    },
  });
}

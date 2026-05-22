import prisma from '../../../config/prisma';
import type { CreateLayoutPatternInput } from '../validation';

function normalizePattern(row: Awaited<ReturnType<typeof prisma.event_layout_patterns.findFirstOrThrow>>) {
  return {
    id: row.id,
    label: row.label,
    seating_mode: row.seating_mode,
    diagram: row.diagram,
    zones: row.zones,
    positions: row.positions,
    fixtures: row.fixtures,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listLayoutPatterns() {
  const rows = await prisma.event_layout_patterns.findMany({
    orderBy: [{ updated_at: 'desc' }, { id: 'desc' }],
  });
  return rows.map(normalizePattern);
}

export async function createLayoutPattern(input: CreateLayoutPatternInput) {
  const row = await prisma.event_layout_patterns.create({ data: input });
  return normalizePattern(row);
}

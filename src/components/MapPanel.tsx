import { useMemo, useState } from 'react';
import { useInventory } from '../store/useInventoryStore';
import { MAP_AREAS, getMapAreaDef, getRoutableAreas } from '../data/mapAreas';
import { MapAreaDetailModal } from './MapAreaDetailModal';

const CELL = 96;
const PADDING = 24;

export function MapPanel() {
  const { position } = useInventory();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const bounds = useMemo(() => {
    const xs = MAP_AREAS.map((area) => area.x);
    const ys = MAP_AREAS.map((area) => area.y);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  }, []);
  const width = (bounds.maxX - bounds.minX + 1) * CELL + PADDING * 2;
  const height = (bounds.maxY - bounds.minY + 1) * CELL + PADDING * 2;
  const toPx = (x: number, y: number) => ({
    left: PADDING + (x - bounds.minX) * CELL,
    top: PADDING + (y - bounds.minY) * CELL,
  });

  const routableIds = useMemo(() => new Set(getRoutableAreas(position).map((area) => area.id)), [position]);

  const lines = useMemo(() => {
    const seen = new Set<string>();
    const result: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const area of MAP_AREAS) {
      for (const connId of area.connections) {
        const key = [area.id, connId].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        const target = getMapAreaDef(connId);
        if (!target) continue;
        const from = toPx(area.x, area.y);
        const to = toPx(target.x, target.y);
        result.push({ key, x1: from.left + CELL / 2, y1: from.top + CELL / 2, x2: to.left + CELL / 2, y2: to.top + CELL / 2 });
      }
    }
    return result;
  }, [bounds]);

  const currentArea = position ? getMapAreaDef(position) : null;
  const selectedArea = selectedAreaId ? getMapAreaDef(selectedAreaId) : null;

  return (
    <div className="flex h-full flex-col rounded border border-tarkov-border bg-tarkov-panel">
      <div className="border-b border-tarkov-border px-3 py-2">
        <h2 className="stencil text-xs text-tarkov-textDim">マップ</h2>
        <p className="text-[11px] text-tarkov-textDim/70">
          現在位置: {currentArea ? currentArea.name : '未配置(エリアを選んで配置してください)'}
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="relative" style={{ width, height }}>
          <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
            {lines.map((line) => (
              <line key={line.key} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#3a3f44" strokeWidth={2} />
            ))}
          </svg>
          {MAP_AREAS.map((area) => {
            const pos = toPx(area.x, area.y);
            const isCurrent = area.id === position;
            const isRoutable = routableIds.has(area.id);
            return (
              <button
                key={area.id}
                type="button"
                disabled={!isRoutable}
                onClick={() => setSelectedAreaId(area.id)}
                className={`absolute flex flex-col items-center justify-center rounded border text-center transition-colors ${
                  isCurrent
                    ? 'border-tarkov-accent bg-tarkov-accent/25 text-tarkov-accent'
                    : isRoutable
                    ? 'cursor-pointer border-tarkov-accentDim bg-tarkov-panelLight text-tarkov-text hover:border-tarkov-accent hover:bg-tarkov-accent/10'
                    : 'cursor-default border-tarkov-border/60 bg-tarkov-panelLight/40 text-tarkov-textDim/60'
                }`}
                style={{ left: pos.left + 6, top: pos.top + 6, width: CELL - 12, height: CELL - 12 }}
              >
                <span className="px-1 text-[11px] leading-tight">{area.name}</span>
                {isCurrent && <span className="stencil mt-0.5 text-[9px] text-tarkov-accent">現在地</span>}
              </button>
            );
          })}
        </div>
      </div>
      {selectedArea && (
        <MapAreaDetailModal area={selectedArea} isCurrent={selectedArea.id === position} onClose={() => setSelectedAreaId(null)} />
      )}
    </div>
  );
}
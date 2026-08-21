import { useState } from 'react';
import type { RouteAreaDefinition, RoutableSpot } from '../types';

export function RouteAreaModal({ area, onClose }: { area: RouteAreaDefinition; onClose: () => void }) {
  const [selectedSpot, setSelectedSpot] = useState<RoutableSpot | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={`${area.name}の拡大表示`}>
      <div className="grid max-h-[90vh] w-full max-w-5xl grid-cols-1 gap-3 overflow-hidden rounded border border-tarkov-border bg-tarkov-panel shadow-2xl md:grid-cols-[1fr_260px]">
        <div className="overflow-auto p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="stencil text-sm text-tarkov-accent">{area.name}</h2>
            <button type="button" onClick={onClose} className="rounded border border-tarkov-border px-2 py-1 text-xs text-tarkov-textDim hover:border-tarkov-danger hover:text-tarkov-danger">閉じる</button>
          </div>
          <div className="relative">
            <img src={area.imageUrl} alt={area.name} className="w-full select-none rounded border border-tarkov-border" draggable={false} />
            {area.routableSpots.map((spot) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => setSelectedSpot(spot)}
                className={`absolute flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs shadow transition-colors ${
                  selectedSpot?.id === spot.id
                    ? 'border-tarkov-accent bg-tarkov-accent/60'
                    : 'border-tarkov-warn bg-tarkov-warn/40 hover:bg-tarkov-warn/60'
                }`}
                style={{ left: `calc(${spot.x * 100}% - 12px)`, top: `calc(${spot.y * 100}% - 12px)` }}
                title={spot.name}
              >
                {spot.icon ?? '★'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto border-t border-tarkov-border p-3 md:border-l md:border-t-0">
          <h3 className="stencil mb-2 text-[11px] text-tarkov-textDim">ルート可能地点</h3>
          <ul className="space-y-1.5">
            {area.routableSpots.map((spot) => (
              <li key={spot.id}>
                <button
                  type="button"
                  onClick={() => setSelectedSpot(spot)}
                  className={`w-full rounded border px-2 py-1.5 text-left text-xs transition-colors ${
                    selectedSpot?.id === spot.id
                      ? 'border-tarkov-accent bg-tarkov-accent/10 text-tarkov-accent'
                      : 'border-tarkov-border text-tarkov-text hover:border-tarkov-accentDim'
                  }`}
                >
                  {spot.name}
                </button>
              </li>
            ))}
          </ul>
          {selectedSpot && (
            <div className="mt-3 rounded border border-tarkov-border bg-tarkov-panelLight p-2">
              <p className="stencil text-[10px] text-tarkov-accent">{selectedSpot.name}</p>
              <p className="mt-1 text-xs text-tarkov-text">{selectedSpot.description ?? '説明はまだ登録されていません。'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useMemo, useState } from 'react';
import type { RouteAreaDefinition, RoutableSpot } from '../types';
import { useMapState } from '../store/useMapStore';
import { useInventory } from '../store/useInventoryStore';
import { getItemDef } from '../data/items';

const THREAT_TONE: Record<string, string> = {
  低: 'border-tarkov-accent/50 bg-tarkov-accent/10 text-tarkov-accent',
  中: 'border-tarkov-warn/50 bg-tarkov-warn/10 text-tarkov-warn',
  高: 'border-tarkov-danger/50 bg-tarkov-danger/10 text-tarkov-danger',
};

function StatBadge({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`rounded border px-2 py-1.5 text-center ${tone ?? 'border-tarkov-border text-tarkov-text'}`}>
      <p className="stencil text-[9px] text-tarkov-textDim/80">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}

export function RouteAreaModal({ mapId, area, onClose }: { mapId: string; area: RouteAreaDefinition; onClose: () => void }) {
  const [selectedSpot, setSelectedSpot] = useState<RoutableSpot | null>(null);
  const { loot, ensureLootGenerated, pickupLootItem } = useMapState();
  const { addItemToStash } = useInventory();

  const currentEntry = useMemo(
    () => (selectedSpot ? loot.find((entry) => entry.mapId === mapId && entry.spotId === selectedSpot.id) : undefined),
    [loot, mapId, selectedSpot]
  );

  function openSpot(spot: RoutableSpot) {
    setSelectedSpot(spot);
    ensureLootGenerated(mapId, spot, area);
  }

  function pickup(lootInstanceId: string, itemId: string, quantity: number) {
    if (!selectedSpot) return;
    for (let i = 0; i < quantity; i++) addItemToStash(itemId);
    pickupLootItem(mapId, selectedSpot.id, lootInstanceId);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={`${area.name}の拡大表示`}>
      <div className="grid max-h-[90vh] w-full max-w-5xl grid-cols-1 gap-3 overflow-hidden rounded border border-tarkov-border bg-tarkov-panel shadow-2xl md:grid-cols-[1fr_300px]">
        <div className="overflow-auto p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="stencil text-sm text-tarkov-accent">{area.name}</h2>
            <button type="button" onClick={onClose} className="rounded border border-tarkov-border px-2 py-1 text-xs text-tarkov-textDim hover:border-tarkov-danger hover:text-tarkov-danger">閉じる</button>
          </div>
          <img src={area.imageUrl} alt={area.name} className="w-full select-none rounded border border-tarkov-border" draggable={false} />
          <div className="mt-3 grid grid-cols-4 gap-2">
            <StatBadge label="接敵率" value={area.engagementRate} tone={THREAT_TONE[area.engagementRate]} />
            <StatBadge label="ルート品質" value={area.routeQuality} />
            <StatBadge label="ルート箇所" value={area.routeDensity} />
            <StatBadge label="ボス" value={area.hasBoss ? '有' : '無'} tone={area.hasBoss ? THREAT_TONE['高'] : undefined} />
          </div>
        </div>

        <div className="flex flex-col overflow-hidden border-t border-tarkov-border md:border-l md:border-t-0">
          <div className="overflow-y-auto p-3">
            <h3 className="stencil mb-2 text-[11px] text-tarkov-textDim">ルート可能リスト</h3>
            <ul className="space-y-1.5">
              {area.routableSpots.map((spot) => (
                <li key={spot.id}>
                  <button
                    type="button"
                    onClick={() => openSpot(spot)}
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
          </div>

          {selectedSpot && (
            <div className="flex-1 overflow-y-auto border-t border-tarkov-border p-3">
              <p className="stencil mb-2 text-[10px] text-tarkov-accent">{selectedSpot.name} の入手アイテム</p>
              {!currentEntry && <p className="text-xs text-tarkov-textDim">生成中...</p>}
              {currentEntry && currentEntry.items.length === 0 && (
                <p className="text-xs text-tarkov-textDim">何も見つかりませんでした。</p>
              )}
              {currentEntry && currentEntry.items.length > 0 && (
                <ul className="space-y-1.5">
                  {currentEntry.items.map((lootItem) => {
                    const def = getItemDef(lootItem.itemId);
                    if (!def) return null;
                    return (
                      <li key={lootItem.id} className="flex items-center gap-2 rounded border border-tarkov-border bg-tarkov-panelLight px-2 py-1.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm" style={{ backgroundColor: `${def.color}22`, border: `1px solid ${def.color}55` }}>{def.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-tarkov-text">{def.name}</p>
                          <p className="text-[10px] text-tarkov-textDim">× {lootItem.quantity}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => pickup(lootItem.id, lootItem.itemId, lootItem.quantity)}
                          className="shrink-0 rounded border border-tarkov-accent/60 px-2 py-1 text-[11px] text-tarkov-accent hover:bg-tarkov-accent/10"
                        >
                          取得
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
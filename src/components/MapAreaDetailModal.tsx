import { useInventory } from '../store/useInventoryStore';
import { getRoutableAreas } from '../data/mapAreas';
import type { MapAreaDef } from '../types';

export function MapAreaDetailModal({ area, isCurrent, onClose }: { area: MapAreaDef; isCurrent: boolean; onClose: () => void }) {
  const { movePlayerTo } = useInventory();
  const nextAreas = getRoutableAreas(area.id);

  function handleMove() {
    movePlayerTo(area.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={`${area.name}の詳細`}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded border border-tarkov-border bg-tarkov-panel shadow-2xl">
        <div className="flex items-start gap-3 border-b border-tarkov-border p-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg text-tarkov-text">{area.name}</h2>
            <p className="mt-0.5 text-xs text-tarkov-textDim">座標: ({area.x}, {area.y})</p>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-tarkov-border px-2 py-1 text-xs text-tarkov-textDim hover:border-tarkov-danger hover:text-tarkov-danger">閉じる</button>
        </div>
        <div className="space-y-4 p-4">
          {area.description && (
            <section>
              <h3 className="stencil text-[11px] text-tarkov-textDim">DESCRIPTION</h3>
              <p className="mt-1 text-sm text-tarkov-text">{area.description}</p>
            </section>
          )}
          <section>
            <h3 className="stencil text-[11px] text-tarkov-textDim">ルート可能エリア</h3>
            {nextAreas.length > 0 ? (
              <ul className="mt-1 space-y-1">
                {nextAreas.map((next) => (
                  <li key={next.id} className="rounded border border-tarkov-border/70 bg-tarkov-panelLight px-2 py-1.5 text-sm text-tarkov-text">
                    {next.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-tarkov-textDim">これ以上ルート移動できるエリアはありません。</p>
            )}
          </section>
          {!isCurrent && (
            <button type="button" onClick={handleMove} className="w-full rounded border border-tarkov-accent/60 py-2 text-sm text-tarkov-accent hover:bg-tarkov-accent/10">
              このエリアへ移動する
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
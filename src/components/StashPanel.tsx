import { useDroppable } from '@dnd-kit/core';
import { useMemo } from 'react';
import { useInventory } from '../store/useInventoryStore';
import { getItemDef } from '../data/items';
import { DraggableItem } from './DraggableItem';

const CATEGORY_LABEL: Record<string, string> = {
  weapon: '武器',
  ammo: '弾薬',
  medical: '医療品',
  food: '食料',
  valuables: '貴重品',
  gear: '装備品',
  container: '収納',
  key: '鍵',
  misc: 'その他',
};

export function StashPanel() {
  const { instances } = useInventory();
  const { setNodeRef, isOver } = useDroppable({ id: 'stash-dropzone' });

  const stashItems = useMemo(
    () =>
      instances
        .filter((i) => i.location.type === 'stash')
        .map((i) => ({ instance: i, def: getItemDef(i.itemId) }))
        .filter((row): row is { instance: (typeof instances)[number]; def: NonNullable<typeof row.def> } => !!row.def),
    [instances]
  );

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full flex-col rounded border ${
        isOver ? 'border-tarkov-accent bg-tarkov-accent/5' : 'border-tarkov-border bg-tarkov-panel'
      } transition-colors`}
    >
      <div className="border-b border-tarkov-border px-3 py-2">
        <h2 className="stencil text-xs text-tarkov-textDim">スタッシュ</h2>
        <p className="text-[11px] text-tarkov-textDim/70">{stashItems.length} 件の未配置アイテム</p>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {stashItems.length === 0 && (
          <p className="p-4 text-center text-xs text-tarkov-textDim/60">アイテムがありません</p>
        )}
        {stashItems.map(({ instance, def }) => (
          <DraggableItem
            key={instance.instanceId}
            instanceId={instance.instanceId}
            def={def}
            className="flex items-center gap-2 rounded border border-tarkov-border bg-tarkov-panelLight px-2 py-1.5 hover:border-tarkov-accentDim"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm"
              style={{ backgroundColor: `${def.color}22`, border: `1px solid ${def.color}55` }}
            >
              {def.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm leading-tight text-tarkov-text">{def.name}</p>
              <p className="text-[10px] text-tarkov-textDim">
                {CATEGORY_LABEL[def.category]} ・ {def.width}×{def.height}
              </p>
            </div>
          </DraggableItem>
        ))}
      </div>
    </div>
  );
}

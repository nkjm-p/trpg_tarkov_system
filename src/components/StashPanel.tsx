import { useDroppable } from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { useInventory } from '../store/useInventoryStore';
import { getItemDef } from '../data/items';
import { DraggableItem } from './DraggableItem';
import type { ItemCategory, ItemInstance, ItemDefinition } from '../types';

const CATEGORY_ORDER: ItemCategory[] = [
  'weapon',
  'ammo',
  'medical',
  'food',
  'valuables',
  'gear',
  'container',
  'key',
  'misc',
];

const CATEGORY_LABEL: Record<ItemCategory, string> = {
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

interface StashRow {
  instance: ItemInstance;
  def: ItemDefinition;
}

function StashRowItem({ instance, def }: StashRow) {
  return (
    <DraggableItem
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
          {def.width}×{def.height}
        </p>
      </div>
    </DraggableItem>
  );
}

interface CategorySectionProps {
  category: ItemCategory;
  rows: StashRow[];
  isOpen: boolean;
  onToggle: () => void;
}

function CategorySection({ category, rows, isOpen, onToggle }: CategorySectionProps) {
  return (
    <div className="rounded border border-tarkov-border/70 bg-tarkov-panelLight/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-2 py-1.5 text-left"
      >
        <span className="stencil text-[11px] text-tarkov-textDim">{CATEGORY_LABEL[category]}</span>
        <span className="flex items-center gap-1.5">
          <span className="text-[10px] text-tarkov-textDim/60">{rows.length}</span>
          <span
            className={`text-[10px] text-tarkov-textDim transition-transform ${isOpen ? 'rotate-90' : ''}`}
          >
            ▶
          </span>
        </span>
      </button>
      {isOpen && (
        <div className="space-y-1 border-t border-tarkov-border/50 p-1.5">
          {rows.map((row) => (
            <StashRowItem key={row.instance.instanceId} instance={row.instance} def={row.def} />
          ))}
        </div>
      )}
    </div>
  );
}

export function StashPanel() {
  const { instances } = useInventory();
  const { setNodeRef, isOver } = useDroppable({ id: 'stash-dropzone' });
  const [openCategories, setOpenCategories] = useState<Set<ItemCategory>>(new Set(CATEGORY_ORDER));

  const stashItems = useMemo(
    () =>
      instances
        .filter((i) => i.location.type === 'stash')
        .map((i) => ({ instance: i, def: getItemDef(i.itemId) }))
        .filter((row): row is StashRow => !!row.def),
    [instances]
  );

  const grouped = useMemo(() => {
    const map = new Map<ItemCategory, StashRow[]>();
    for (const row of stashItems) {
      const list = map.get(row.def.category) ?? [];
      list.push(row);
      map.set(row.def.category, list);
    }
    return map;
  }, [stashItems]);

  function toggleCategory(category: ItemCategory) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  const nonEmptyCategories = CATEGORY_ORDER.filter((c) => (grouped.get(c)?.length ?? 0) > 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full flex-col rounded border ${
        isOver ? 'border-tarkov-accent bg-tarkov-accent/5' : 'border-tarkov-border bg-tarkov-panel'
      } transition-colors`}
    >
      <div className="border-b border-tarkov-border px-3 py-2">
        <h2 className="stencil text-xs text-tarkov-textDim">スタッシュ</h2>
        <p className="text-[11px] text-tarkov-textDim/70">{stashItems.length} 件の未配置アイテム(上限なし)</p>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
        {stashItems.length === 0 && (
          <p className="p-4 text-center text-xs text-tarkov-textDim/60">アイテムがありません</p>
        )}
        {nonEmptyCategories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            rows={grouped.get(category) ?? []}
            isOpen={openCategories.has(category)}
            onToggle={() => toggleCategory(category)}
          />
        ))}
      </div>
    </div>
  );
}
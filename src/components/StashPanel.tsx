import { useMemo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useInventory } from '../store/useInventoryStore';
import { getItemDef } from '../data/items';
import { DraggableItem } from './DraggableItem';
import { ItemDetailModal } from './ItemDetailModal';
import type { ItemCategory, ItemDefinition, ItemInstance } from '../types';

const CATEGORY_ORDER: ItemCategory[] = ['weapon', 'ammo', 'medical', 'food', 'valuables', 'gear', 'container', 'key', 'misc'];
const CATEGORY_LABEL: Record<ItemCategory, string> = { weapon: '武器', ammo: '弾薬', medical: '医療', food: '食料・水', valuables: '貴重品', gear: '装備', container: '収納', key: '鍵', misc: 'その他' };
interface StashRow { instance: ItemInstance; def: ItemDefinition }

function StashRowItem({ instance, def, onDetails }: StashRow & { onDetails: () => void }) {
  return <DraggableItem instanceId={instance.instanceId} def={def} className="flex items-center gap-2 rounded border border-tarkov-border bg-tarkov-panelLight px-2 py-1.5 hover:border-tarkov-accentDim">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm" style={{ backgroundColor: `${def.color}22`, border: `1px solid ${def.color}55` }}>{def.icon}</span>
    <div className="min-w-0 flex-1"><p className="truncate text-sm leading-tight text-tarkov-text">{def.name}</p><p className="text-[10px] text-tarkov-textDim">{def.width} × {def.height}</p></div>
    <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={onDetails} className="shrink-0 rounded border border-tarkov-border px-2 py-1 text-[11px] text-tarkov-textDim hover:border-tarkov-accent hover:text-tarkov-accent">詳細</button>
  </DraggableItem>;
}

export function StashPanel() {
  const { instances } = useInventory();
  const { setNodeRef, isOver } = useDroppable({ id: 'stash-dropzone' });
  const [openCategories, setOpenCategories] = useState<Set<ItemCategory>>(new Set(CATEGORY_ORDER));
  const [selectedItem, setSelectedItem] = useState<ItemDefinition | null>(null);
  const rows = useMemo(() => instances.filter((item) => item.location.type === 'stash').map((instance) => ({ instance, def: getItemDef(instance.itemId) })).filter((item): item is StashRow => Boolean(item.def)), [instances]);
  const grouped = useMemo(() => {
    const result = new Map<ItemCategory, StashRow[]>();
    rows.forEach((row) => result.set(row.def.category, [...(result.get(row.def.category) ?? []), row]));
    return result;
  }, [rows]);

  return <div ref={setNodeRef} className={`flex h-full flex-col rounded border ${isOver ? 'border-tarkov-accent bg-tarkov-accent/5' : 'border-tarkov-border bg-tarkov-panel'} transition-colors`}>
    <div className="border-b border-tarkov-border px-3 py-2"><h2 className="stencil text-xs text-tarkov-textDim">スタッシュ</h2><p className="text-[11px] text-tarkov-textDim/70">{rows.length} 個の未収納アイテム</p></div>
    <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
      {rows.length === 0 && <p className="p-4 text-center text-xs text-tarkov-textDim/60">アイテムがありません</p>}
      {CATEGORY_ORDER.map((category) => {
        const categoryRows = grouped.get(category) ?? [];
        if (categoryRows.length === 0) return null;
        const isOpen = openCategories.has(category);
        return <section key={category} className="rounded border border-tarkov-border/70 bg-tarkov-panelLight/40"><button type="button" onClick={() => setOpenCategories((previous) => { const next = new Set(previous); next.has(category) ? next.delete(category) : next.add(category); return next; })} className="flex w-full items-center justify-between px-2 py-1.5 text-left"><span className="stencil text-[11px] text-tarkov-textDim">{CATEGORY_LABEL[category]}</span><span className="text-[10px] text-tarkov-textDim/60">{categoryRows.length} {isOpen ? '▾' : '▸'}</span></button>{isOpen && <div className="space-y-1 border-t border-tarkov-border/50 p-1.5">{categoryRows.map((row) => <StashRowItem key={row.instance.instanceId} {...row} onDetails={() => setSelectedItem(row.def)} />)}</div>}</section>;
      })}
    </div>
    {selectedItem && <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
  </div>;
}

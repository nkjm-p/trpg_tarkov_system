import { useMemo, useState } from 'react';
import { useInventory } from '../store/useInventoryStore';
import { ITEM_DEFINITIONS } from '../data/items';
import type { ItemCategory, ItemDefinition } from '../types';
import { ItemDetailModal } from './ItemDetailModal';

const CATEGORY_ORDER: ItemCategory[] = ['weapon', 'ammo', 'medical', 'food', 'valuables', 'gear', 'container', 'key', 'misc'];
const CATEGORY_LABEL: Record<ItemCategory, string> = {
  weapon: '武器', ammo: '弾薬', medical: '医療', food: '食料・水', valuables: '貴重品',
  gear: '装備', container: '収納', key: '鍵', misc: 'その他',
};

function CatalogRow({ def, onAdd, onDetails }: { def: ItemDefinition; onAdd: () => void; onDetails: () => void }) {
  return <div className="flex items-center gap-2 rounded border border-tarkov-border bg-tarkov-panelLight px-2 py-1.5">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm" style={{ backgroundColor: `${def.color}22`, border: `1px solid ${def.color}55` }}>{def.icon}</span>
    <div className="min-w-0 flex-1"><p className="truncate text-sm leading-tight text-tarkov-text">{def.name}</p><p className="text-[10px] text-tarkov-textDim">{def.width} × {def.height}{def.description ? ` ・ ${def.description}` : ''}</p></div>
    <div className="flex shrink-0 gap-1">
      <button type="button" onClick={onDetails} className="rounded border border-tarkov-border px-2 py-1 text-[11px] text-tarkov-textDim hover:border-tarkov-accent hover:text-tarkov-accent">詳細</button>
      <button type="button" onClick={onAdd} className="rounded border border-tarkov-accent/60 px-2 py-1 text-[11px] text-tarkov-accent hover:bg-tarkov-accent/10">追加</button>
    </div>
  </div>;
}

export function ItemCatalogPanel() {
  const { addItemToStash } = useInventory();
  const [query, setQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<ItemCategory>>(new Set(CATEGORY_ORDER));
  const [selectedItem, setSelectedItem] = useState<ItemDefinition | null>(null);
  const filtered = useMemo(() => ITEM_DEFINITIONS.filter((def) => def.name.toLowerCase().includes(query.toLowerCase())), [query]);

  function toggleCategory(category: ItemCategory) {
    setOpenCategories((previous) => {
      const next = new Set(previous);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }

  return <div className="flex h-full flex-col rounded border border-tarkov-border bg-tarkov-panel">
    <div className="border-b border-tarkov-border px-3 py-2"><h2 className="stencil text-xs text-tarkov-textDim">アイテム一覧</h2><p className="mb-1.5 text-[11px] text-tarkov-textDim/70">詳細を確認してからスタッシュへ追加できます。</p><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="アイテム名で検索..." className="w-full rounded border border-tarkov-border bg-tarkov-bg px-2 py-1 text-xs text-tarkov-text placeholder:text-tarkov-textDim/50 focus:border-tarkov-accent focus:outline-none" /></div>
    <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
      {CATEGORY_ORDER.map((category) => {
        const items = filtered.filter((item) => item.category === category);
        if (items.length === 0) return null;
        const isOpen = openCategories.has(category);
        return <section key={category} className="rounded border border-tarkov-border/70 bg-tarkov-panelLight/40">
          <button type="button" onClick={() => toggleCategory(category)} className="flex w-full items-center justify-between px-2 py-1.5 text-left"><span className="stencil text-[11px] text-tarkov-textDim">{CATEGORY_LABEL[category]}</span><span className="text-[10px] text-tarkov-textDim/60">{items.length} {isOpen ? '▾' : '▸'}</span></button>
          {isOpen && <div className="space-y-1 border-t border-tarkov-border/50 p-1.5">{items.map((item) => <CatalogRow key={item.id} def={item} onDetails={() => setSelectedItem(item)} onAdd={() => addItemToStash(item.id)} />)}</div>}
        </section>;
      })}
    </div>
    {selectedItem && <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
  </div>;
}

import type { ItemDefinition } from '../types';
import { getItemTrpgInfo } from '../data/itemTrpgInfo';

export function ItemDetailModal({ item, onClose }: { item: ItemDefinition; onClose: () => void }) {
  const trpg = getItemTrpgInfo(item.id);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={`${item.name}の詳細`}>
    <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded border border-tarkov-border bg-tarkov-panel shadow-2xl">
      <div className="flex items-start gap-3 border-b border-tarkov-border p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-xl" style={{ backgroundColor: `${item.color}22`, border: `1px solid ${item.color}55` }}>{item.icon}</span>
        <div className="min-w-0 flex-1"><h2 className="text-lg text-tarkov-text">{item.name}</h2><p className="mt-0.5 text-xs text-tarkov-textDim">サイズ: {item.width} × {item.height}</p></div>
        <button type="button" onClick={onClose} className="rounded border border-tarkov-border px-2 py-1 text-xs text-tarkov-textDim hover:border-tarkov-danger hover:text-tarkov-danger">閉じる</button>
      </div>
      <div className="space-y-4 p-4">
        {item.description && <section><h3 className="stencil text-[11px] text-tarkov-textDim">DESCRIPTION</h3><p className="mt-1 text-sm text-tarkov-text">{item.description}</p></section>}
        {trpg ? <>
          <section><h3 className="stencil text-[11px] text-tarkov-accent">TRPG EFFECT</h3><p className="mt-1 text-sm text-tarkov-text">{trpg.effect}</p></section>
          <section><h3 className="stencil text-[11px] text-tarkov-textDim">RULE DATA</h3><dl className="mt-1 divide-y divide-tarkov-border rounded border border-tarkov-border">
            {trpg.properties.map((property) => <div key={property.label} className="flex gap-3 px-3 py-2 text-sm"><dt className="w-24 shrink-0 text-tarkov-textDim">{property.label}</dt><dd className="text-tarkov-text">{property.value}</dd></div>)}
          </dl></section>
          {trpg.notes && trpg.notes.length > 0 && <section><h3 className="stencil text-[11px] text-tarkov-textDim">NOTES</h3><ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-tarkov-text">{trpg.notes.map((note) => <li key={note}>{note}</li>)}</ul></section>}
        </> : <p className="rounded border border-tarkov-border p-3 text-sm text-tarkov-textDim">このアイテムにはTRPG情報がまだ登録されていません。</p>}
      </div>
    </div>
  </div>;
}

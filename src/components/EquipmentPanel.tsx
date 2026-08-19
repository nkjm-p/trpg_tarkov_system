import { useMemo, useState } from 'react';
import { useInventory } from '../store/useInventoryStore';
import { getItemDef } from '../data/items';
import { EQUIP_SLOTS } from '../data/slots';
import { CONTAINER_SLOTS, type EquipSlotType, type ItemDefinition } from '../types';
import { GridContainer } from './GridContainer';
import { ItemDetailModal } from './ItemDetailModal';

export function EquipmentPanel() {
  const { instances, equipItem, unequipSlot } = useInventory();
  const [selectedItem, setSelectedItem] = useState<ItemDefinition | null>(null);
  const equippedBySlot = useMemo(() => {
    const result = new Map<EquipSlotType, (typeof instances)[number]>();
    instances.forEach((item) => { if (item.location.type === 'equip') result.set(item.location.slot, item); });
    return result;
  }, [instances]);
  const candidatesBySlot = useMemo(() => {
    const result = new Map<EquipSlotType, { instanceId: string; name: string }[]>();
    instances.forEach((item) => {
      if (item.location.type !== 'stash') return;
      const definition = getItemDef(item.itemId);
      if (!definition?.equipSlot) return;
      result.set(definition.equipSlot, [...(result.get(definition.equipSlot) ?? []), { instanceId: item.instanceId, name: definition.name }]);
    });
    return result;
  }, [instances]);

  return <div className="flex h-full flex-col rounded border border-tarkov-border bg-tarkov-panel">
    <div className="border-b border-tarkov-border px-3 py-2"><h2 className="stencil text-xs text-tarkov-textDim">装備スロット</h2></div>
    <div className="flex-1 space-y-3 overflow-y-auto p-3">{EQUIP_SLOTS.map((slotMeta) => {
      const equipped = equippedBySlot.get(slotMeta.slot);
      const equippedDef = equipped ? getItemDef(equipped.itemId) : undefined;
      const candidates = candidatesBySlot.get(slotMeta.slot) ?? [];
      return <section key={slotMeta.slot} className="rounded border border-tarkov-border/70 bg-tarkov-panelLight p-2">
        <div className="mb-1.5 flex items-center gap-2"><span className="text-sm">{slotMeta.icon}</span><label className="stencil flex-1 text-[10px] text-tarkov-textDim">{slotMeta.label}</label>{equipped && <div className="flex gap-1">{equippedDef && <button type="button" onClick={() => setSelectedItem(equippedDef)} className="rounded border border-tarkov-border px-1.5 py-0.5 text-[10px] text-tarkov-textDim hover:border-tarkov-accent hover:text-tarkov-accent">詳細</button>}<button type="button" onClick={() => unequipSlot(slotMeta.slot)} className="rounded border border-tarkov-danger/50 px-1.5 py-0.5 text-[10px] text-tarkov-danger hover:bg-tarkov-danger/10">外す</button></div>}</div>
        <select className="w-full rounded border border-tarkov-border bg-tarkov-bg px-2 py-1.5 text-sm text-tarkov-text focus:border-tarkov-accent focus:outline-none" value={equipped?.instanceId ?? ''} onChange={(event) => { if (event.target.value) equipItem(event.target.value, slotMeta.slot); }}>
          {!equipped && <option value="" disabled>-- 未装備 --</option>}
          {equipped && equippedDef && <option value={equipped.instanceId}>{equippedDef.name}</option>}
          {candidates.map((candidate) => <option key={candidate.instanceId} value={candidate.instanceId}>{candidate.name}</option>)}
        </select>
        {CONTAINER_SLOTS.includes(slotMeta.slot) && equipped && equippedDef?.containerGrid && <div className="mt-2"><GridContainer containerInstanceId={equipped.instanceId} gridWidth={equippedDef.containerGrid.width} gridHeight={equippedDef.containerGrid.height} title={equippedDef.name} /></div>}
      </section>;
    })}</div>
    {selectedItem && <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
  </div>;
}

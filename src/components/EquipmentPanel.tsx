import { useMemo } from 'react';
import { useInventory } from '../store/useInventoryStore';
import { getItemDef } from '../data/items';
import { EQUIP_SLOTS } from '../data/slots';
import { CONTAINER_SLOTS, type EquipSlotType } from '../types';
import { GridContainer } from './GridContainer';

export function EquipmentPanel() {
  const { instances, equipItem, unequipSlot } = useInventory();

  const equippedBySlot = useMemo(() => {
    const map = new Map<EquipSlotType, (typeof instances)[number]>();
    for (const inst of instances) {
      if (inst.location.type === 'equip') map.set(inst.location.slot, inst);
    }
    return map;
  }, [instances]);

  const candidatesBySlot = useMemo(() => {
    const map = new Map<EquipSlotType, { instanceId: string; name: string }[]>();
    for (const inst of instances) {
      if (inst.location.type !== 'stash') continue;
      const def = getItemDef(inst.itemId);
      if (!def?.equipSlot) continue;
      const list = map.get(def.equipSlot) ?? [];
      list.push({ instanceId: inst.instanceId, name: def.name });
      map.set(def.equipSlot, list);
    }
    return map;
  }, [instances]);

  return (
    <div className="flex h-full flex-col rounded border border-tarkov-border bg-tarkov-panel">
      <div className="border-b border-tarkov-border px-3 py-2">
        <h2 className="stencil text-xs text-tarkov-textDim">装備スロット</h2>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {EQUIP_SLOTS.map((slotMeta) => {
          const equipped = equippedBySlot.get(slotMeta.slot);
          const equippedDef = equipped ? getItemDef(equipped.itemId) : undefined;
          const candidates = candidatesBySlot.get(slotMeta.slot) ?? [];
          const isContainer = CONTAINER_SLOTS.includes(slotMeta.slot);

          return (
            <div key={slotMeta.slot} className="rounded border border-tarkov-border/70 bg-tarkov-panelLight p-2">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm">{slotMeta.icon}</span>
                <label className="stencil flex-1 text-[10px] text-tarkov-textDim">{slotMeta.label}</label>
                {equipped && (
                  <button
                    type="button"
                    onClick={() => unequipSlot(slotMeta.slot)}
                    className="rounded border border-tarkov-danger/50 px-1.5 py-0.5 text-[10px] text-tarkov-danger hover:bg-tarkov-danger/10"
                  >
                    外す
                  </button>
                )}
              </div>

              <select
                className="w-full rounded border border-tarkov-border bg-tarkov-bg px-2 py-1.5 text-sm text-tarkov-text focus:border-tarkov-accent focus:outline-none"
                value={equipped?.instanceId ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) equipItem(val, slotMeta.slot);
                }}
              >
                {!equipped && (
                  <option value="" disabled>
                    -- 未装備 --
                  </option>
                )}
                {equipped && equippedDef && <option value={equipped.instanceId}>{equippedDef.name}</option>}
                {candidates.map((c) => (
                  <option key={c.instanceId} value={c.instanceId}>
                    {c.name}
                  </option>
                ))}
              </select>

              {isContainer && equipped && equippedDef?.containerGrid && (
                <div className="mt-2">
                  <GridContainer
                    containerInstanceId={equipped.instanceId}
                    gridWidth={equippedDef.containerGrid.width}
                    gridHeight={equippedDef.containerGrid.height}
                    title={equippedDef.name}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

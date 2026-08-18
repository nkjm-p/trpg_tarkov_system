import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { EquipSlotType, ItemInstance } from '../types';
import { CONTAINER_SLOTS } from '../types';
import { getItemDef } from '../data/items';

// ── 初期スタッシュの中身(セッション開始時の所持品サンプル) ──
const STARTER_ITEM_IDS: string[] = [
  'wpn_krait74',
  'wpn_m9talon',
  'ammo_545',
  'ammo_545',
  'ammo_9mm',
  'med_bandage',
  'med_bandage',
  'med_kit',
  'med_painkiller',
  'food_can',
  'food_water',
  'val_goldbar',
  'gear_helmet',
  'gear_facecover',
  'gear_earpiece',
  'gear_armor',
  'container_rig',
  'container_backpack',
];

function createInitialInstances(): ItemInstance[] {
  return STARTER_ITEM_IDS.map((itemId) => ({
    instanceId: uuidv4(),
    itemId,
    location: { type: 'stash' as const },
  }));
}

// ── Reducer ──────────────────────────────────
type Action =
  | { type: 'EQUIP'; instanceId: string; slot: EquipSlotType }
  | { type: 'UNEQUIP'; slot: EquipSlotType }
  | { type: 'PLACE_IN_CONTAINER'; instanceId: string; containerInstanceId: string; x: number; y: number }
  | { type: 'RETURN_TO_STASH'; instanceId: string }
  | { type: 'RESET' };

function reducer(state: ItemInstance[], action: Action): ItemInstance[] {
  switch (action.type) {
    case 'EQUIP': {
      let next = state;
      // 既にそのスロットに装備されているアイテムがあれば、中身ごとスタッシュへ戻す
      const currentlyEquipped = next.find((i) => i.location.type === 'equip' && i.location.slot === action.slot);
      if (currentlyEquipped) {
        next = unequipCascade(next, currentlyEquipped.instanceId);
      }
      // 対象アイテムがコンテナに入っていた場合、そのコンテナ内の座標情報は不要になるので単純に上書き
      next = next.map((i) =>
        i.instanceId === action.instanceId ? { ...i, location: { type: 'equip', slot: action.slot } } : i
      );
      return next;
    }
    case 'UNEQUIP': {
      const target = state.find((i) => i.location.type === 'equip' && i.location.slot === action.slot);
      if (!target) return state;
      return unequipCascade(state, target.instanceId);
    }
    case 'PLACE_IN_CONTAINER': {
      return state.map((i) =>
        i.instanceId === action.instanceId
          ? { ...i, location: { type: 'container', containerInstanceId: action.containerInstanceId, x: action.x, y: action.y } }
          : i
      );
    }
    case 'RETURN_TO_STASH': {
      return unequipCascade(state, action.instanceId);
    }
    case 'RESET': {
      return createInitialInstances();
    }
    default:
      return state;
  }
}

/**
 * 指定インスタンスをスタッシュへ戻す。
 * それがリグ/バックパックの場合、中に入っている子アイテムも連鎖的にスタッシュへ戻す。
 */
function unequipCascade(state: ItemInstance[], instanceId: string): ItemInstance[] {
  const target = state.find((i) => i.instanceId === instanceId);
  let next = state.map((i) => (i.instanceId === instanceId ? { ...i, location: { type: 'stash' as const } } : i));

  const def = target ? getItemDef(target.itemId) : undefined;
  const isContainer = def?.equipSlot && CONTAINER_SLOTS.includes(def.equipSlot);
  if (isContainer) {
    next = next.map((i) =>
      i.location.type === 'container' && i.location.containerInstanceId === instanceId
        ? { ...i, location: { type: 'stash' as const } }
        : i
    );
  }
  return next;
}

// ── Context ──────────────────────────────────
interface InventoryContextValue {
  instances: ItemInstance[];
  equipItem: (instanceId: string, slot: EquipSlotType) => void;
  unequipSlot: (slot: EquipSlotType) => void;
  placeInContainer: (instanceId: string, containerInstanceId: string, x: number, y: number) => void;
  returnToStash: (instanceId: string) => void;
  reset: () => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [instances, dispatch] = useReducer(reducer, undefined, createInitialInstances);

  const equipItem = useCallback((instanceId: string, slot: EquipSlotType) => {
    dispatch({ type: 'EQUIP', instanceId, slot });
  }, []);
  const unequipSlot = useCallback((slot: EquipSlotType) => {
    dispatch({ type: 'UNEQUIP', slot });
  }, []);
  const placeInContainer = useCallback((instanceId: string, containerInstanceId: string, x: number, y: number) => {
    dispatch({ type: 'PLACE_IN_CONTAINER', instanceId, containerInstanceId, x, y });
  }, []);
  const returnToStash = useCallback((instanceId: string) => {
    dispatch({ type: 'RETURN_TO_STASH', instanceId });
  }, []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const value = useMemo(
    () => ({ instances, equipItem, unequipSlot, placeInContainer, returnToStash, reset }),
    [instances, equipItem, unequipSlot, placeInContainer, returnToStash, reset]
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}

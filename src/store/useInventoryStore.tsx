import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { EquipSlotType, ItemInstance } from '../types';
import { CONTAINER_SLOTS } from '../types';
import { getItemDef } from '../data/items';
import { PLAYERS, DEFAULT_PLAYER_ID, type PlayerDef } from '../data/players';

// ── 各プレイヤーの初期スタッシュの中身(共通デフォルト) ──
const DEFAULT_STARTER_ITEM_IDS: string[] = [
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

function createInstancesForPlayer(player: PlayerDef): ItemInstance[] {
  const itemIds = player.starterItemIds ?? DEFAULT_STARTER_ITEM_IDS;
  return itemIds.map((itemId) => ({
    instanceId: uuidv4(),
    itemId,
    location: { type: 'stash' as const },
  }));
}

type ByPlayer = Record<string, ItemInstance[]>;

function createInitialState(): ByPlayer {
  const state: ByPlayer = {};
  for (const player of PLAYERS) {
    state[player.id] = createInstancesForPlayer(player);
  }
  return state;
}

// ── Reducer ──────────────────────────────────
type Action =
  | { type: 'EQUIP'; playerId: string; instanceId: string; slot: EquipSlotType }
  | { type: 'UNEQUIP'; playerId: string; slot: EquipSlotType }
  | { type: 'PLACE_IN_CONTAINER'; playerId: string; instanceId: string; containerInstanceId: string; x: number; y: number }
  | { type: 'RETURN_TO_STASH'; playerId: string; instanceId: string }
  | { type: 'ADD_ITEM'; playerId: string; itemId: string }
  | { type: 'RESET_PLAYER'; playerId: string };

function reducer(state: ByPlayer, action: Action): ByPlayer {
  const playerId = action.playerId;
  const playerInstances = state[playerId] ?? [];

  switch (action.type) {
    case 'EQUIP': {
      let next = playerInstances;
      const currentlyEquipped = next.find((i) => i.location.type === 'equip' && i.location.slot === action.slot);
      if (currentlyEquipped) {
        next = unequipCascade(next, currentlyEquipped.instanceId);
      }
      next = next.map((i) =>
        i.instanceId === action.instanceId ? { ...i, location: { type: 'equip', slot: action.slot } } : i
      );
      return { ...state, [playerId]: next };
    }
    case 'UNEQUIP': {
      const target = playerInstances.find((i) => i.location.type === 'equip' && i.location.slot === action.slot);
      if (!target) return state;
      return { ...state, [playerId]: unequipCascade(playerInstances, target.instanceId) };
    }
    case 'PLACE_IN_CONTAINER': {
      const next = playerInstances.map((i) =>
        i.instanceId === action.instanceId
          ? {
              ...i,
              location: { type: 'container' as const, containerInstanceId: action.containerInstanceId, x: action.x, y: action.y },
            }
          : i
      );
      return { ...state, [playerId]: next };
    }
    case 'RETURN_TO_STASH': {
      return { ...state, [playerId]: unequipCascade(playerInstances, action.instanceId) };
    }
    case 'ADD_ITEM': {
      const newInstance: ItemInstance = {
        instanceId: uuidv4(),
        itemId: action.itemId,
        location: { type: 'stash' },
      };
      return { ...state, [playerId]: [...playerInstances, newInstance] };
    }
    case 'RESET_PLAYER': {
      const player = PLAYERS.find((p) => p.id === playerId);
      if (!player) return state;
      return { ...state, [playerId]: createInstancesForPlayer(player) };
    }
    default:
      return state;
  }
}

/**
 * 指定インスタンスをスタッシュへ戻す。
 * それがリグ/バックパックの場合、中に入っている子アイテムも連鎖的にスタッシュへ戻す。
 */
function unequipCascade(instances: ItemInstance[], instanceId: string): ItemInstance[] {
  const target = instances.find((i) => i.instanceId === instanceId);
  let next = instances.map((i) => (i.instanceId === instanceId ? { ...i, location: { type: 'stash' as const } } : i));

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
  players: PlayerDef[];
  activePlayerId: string;
  setActivePlayerId: (id: string) => void;
  instances: ItemInstance[];
  equipItem: (instanceId: string, slot: EquipSlotType) => void;
  unequipSlot: (slot: EquipSlotType) => void;
  placeInContainer: (instanceId: string, containerInstanceId: string, x: number, y: number) => void;
  returnToStash: (instanceId: string) => void;
  addItemToStash: (itemId: string) => void;
  resetActivePlayer: () => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [byPlayer, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [activePlayerId, setActivePlayerId] = useState<string>(DEFAULT_PLAYER_ID);

  const equipItem = useCallback(
    (instanceId: string, slot: EquipSlotType) => dispatch({ type: 'EQUIP', playerId: activePlayerId, instanceId, slot }),
    [activePlayerId]
  );
  const unequipSlot = useCallback(
    (slot: EquipSlotType) => dispatch({ type: 'UNEQUIP', playerId: activePlayerId, slot }),
    [activePlayerId]
  );
  const placeInContainer = useCallback(
    (instanceId: string, containerInstanceId: string, x: number, y: number) =>
      dispatch({ type: 'PLACE_IN_CONTAINER', playerId: activePlayerId, instanceId, containerInstanceId, x, y }),
    [activePlayerId]
  );
  const returnToStash = useCallback(
    (instanceId: string) => dispatch({ type: 'RETURN_TO_STASH', playerId: activePlayerId, instanceId }),
    [activePlayerId]
  );
  const addItemToStash = useCallback(
    (itemId: string) => dispatch({ type: 'ADD_ITEM', playerId: activePlayerId, itemId }),
    [activePlayerId]
  );
  const resetActivePlayer = useCallback(
    () => dispatch({ type: 'RESET_PLAYER', playerId: activePlayerId }),
    [activePlayerId]
  );

  const instances = byPlayer[activePlayerId] ?? [];

  const value = useMemo(
    () => ({
      players: PLAYERS,
      activePlayerId,
      setActivePlayerId,
      instances,
      equipItem,
      unequipSlot,
      placeInContainer,
      returnToStash,
      addItemToStash,
      resetActivePlayer,
    }),
    [activePlayerId, instances, equipItem, unequipSlot, placeInContainer, returnToStash, addItemToStash, resetActivePlayer]
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}

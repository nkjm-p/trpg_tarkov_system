import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { EquipSlotType, ItemInstance } from '../types';
import { CONTAINER_SLOTS } from '../types';
import { getItemDef } from '../data/items';
import { PLAYERS, type PlayerDef } from '../data/players';
import { campaignId, db } from '../firebase';

const DEFAULT_STARTER_ITEM_IDS = [
  'wpn_krait74', 'wpn_m9talon', 'ammo_545', 'ammo_545', 'ammo_9mm',
  'med_bandage', 'med_bandage', 'med_kit', 'med_painkiller', 'food_can',
  'food_water', 'val_goldbar', 'gear_helmet', 'gear_facecover', 'gear_earpiece',
  'gear_armor', 'container_rig', 'container_backpack',
];

function createInstancesForPlayer(player: PlayerDef): ItemInstance[] {
  return (player.starterItemIds ?? DEFAULT_STARTER_ITEM_IDS).map((itemId) => ({
    instanceId: uuidv4(), itemId, location: { type: 'stash' as const },
  }));
}

type InventoryAction =
  | { type: 'EQUIP'; instanceId: string; slot: EquipSlotType }
  | { type: 'UNEQUIP'; slot: EquipSlotType }
  | { type: 'PLACE_IN_CONTAINER'; instanceId: string; containerInstanceId: string; x: number; y: number }
  | { type: 'RETURN_TO_STASH'; instanceId: string }
  | { type: 'ADD_ITEM'; itemId: string }
  | { type: 'RESET_PLAYER'; player: PlayerDef };

function unequipCascade(instances: ItemInstance[], instanceId: string): ItemInstance[] {
  const target = instances.find((item) => item.instanceId === instanceId);
  let next = instances.map((item) => item.instanceId === instanceId
    ? { ...item, location: { type: 'stash' as const } }
    : item
  );
  const definition = target ? getItemDef(target.itemId) : undefined;
  if (definition?.equipSlot && CONTAINER_SLOTS.includes(definition.equipSlot)) {
    next = next.map((item) => item.location.type === 'container' && item.location.containerInstanceId === instanceId
      ? { ...item, location: { type: 'stash' as const } }
      : item
    );
  }
  return next;
}

function applyAction(instances: ItemInstance[], action: InventoryAction): ItemInstance[] {
  switch (action.type) {
    case 'EQUIP': {
      const existing = instances.find((item) => item.location.type === 'equip' && item.location.slot === action.slot);
      const next = existing ? unequipCascade(instances, existing.instanceId) : instances;
      return next.map((item) => item.instanceId === action.instanceId
        ? { ...item, location: { type: 'equip', slot: action.slot } }
        : item
      );
    }
    case 'UNEQUIP': {
      const target = instances.find((item) => item.location.type === 'equip' && item.location.slot === action.slot);
      return target ? unequipCascade(instances, target.instanceId) : instances;
    }
    case 'PLACE_IN_CONTAINER':
      return instances.map((item) => item.instanceId === action.instanceId
        ? { ...item, location: { type: 'container' as const, containerInstanceId: action.containerInstanceId, x: action.x, y: action.y } }
        : item
      );
    case 'RETURN_TO_STASH':
      return unequipCascade(instances, action.instanceId);
    case 'ADD_ITEM':
      return [...instances, { instanceId: uuidv4(), itemId: action.itemId, location: { type: 'stash' } }];
    case 'RESET_PLAYER':
      return createInstancesForPlayer(action.player);
  }
}

interface InventoryContextValue {
  players: PlayerDef[];
  activePlayerId: string;
  activePlayer: PlayerDef;
  instances: ItemInstance[];
  isLoading: boolean;
  error: string | null;
  equipItem: (instanceId: string, slot: EquipSlotType) => void;
  unequipSlot: (slot: EquipSlotType) => void;
  placeInContainer: (instanceId: string, containerInstanceId: string, x: number, y: number) => void;
  returnToStash: (instanceId: string) => void;
  addItemToStash: (itemId: string) => void;
  resetActivePlayer: () => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ playerId, children }: { playerId: string; children: ReactNode }) {
  const player = PLAYERS.find((entry) => entry.id === playerId) ?? PLAYERS[0];
  const [instances, setInstances] = useState<ItemInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const firestore = db;
    if (!firestore) {
      setError('Firebaseの設定が見つかりません。.env.localを設定してください。');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const playerRef = doc(firestore, 'campaigns', campaignId, 'players', player.id);
    return onSnapshot(playerRef, (snapshot) => {
      if (!snapshot.exists()) {
        void runTransaction(firestore, async (transaction) => {
          const current = await transaction.get(playerRef);
          if (!current.exists()) transaction.set(playerRef, {
            name: player.name,
            instances: createInstancesForPlayer(player),
            schemaVersion: 1,
            updatedAt: serverTimestamp(),
          });
        }).catch(() => setError('初期データの作成に失敗しました。Firestoreのルールを確認してください。'));
        return;
      }
      const data = snapshot.data();
      setInstances(Array.isArray(data.instances) ? (data.instances as ItemInstance[]) : []);
      setIsLoading(false);
    }, () => {
      setError('Firestoreとの同期に失敗しました。接続とFirestoreのルールを確認してください。');
      setIsLoading(false);
    });
  }, [player.id, player.name]);

  const commit = useCallback(async (action: InventoryAction) => {
    const firestore = db;
    if (!firestore) return;
    const playerRef = doc(firestore, 'campaigns', campaignId, 'players', player.id);
    setError(null);
    try {
      await runTransaction(firestore, async (transaction) => {
        const snapshot = await transaction.get(playerRef);
        const current = snapshot.exists() && Array.isArray(snapshot.data().instances)
          ? (snapshot.data().instances as ItemInstance[])
          : createInstancesForPlayer(player);
        transaction.set(playerRef, {
          name: player.name,
          instances: applyAction(current, action),
          schemaVersion: 1,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      });
    } catch {
      setError('変更を保存できませんでした。ネットワーク接続とFirestoreのルールを確認してください。');
    }
  }, [player]);

  const value = useMemo(() => ({
    players: PLAYERS,
    activePlayerId: player.id,
    activePlayer: player,
    instances,
    isLoading,
    error,
    equipItem: (instanceId: string, slot: EquipSlotType) => void commit({ type: 'EQUIP', instanceId, slot }),
    unequipSlot: (slot: EquipSlotType) => void commit({ type: 'UNEQUIP', slot }),
    placeInContainer: (instanceId: string, containerInstanceId: string, x: number, y: number) =>
      void commit({ type: 'PLACE_IN_CONTAINER', instanceId, containerInstanceId, x, y }),
    returnToStash: (instanceId: string) => void commit({ type: 'RETURN_TO_STASH', instanceId }),
    addItemToStash: (itemId: string) => void commit({ type: 'ADD_ITEM', itemId }),
    resetActivePlayer: () => void commit({ type: 'RESET_PLAYER', player }),
  }), [commit, error, instances, isLoading, player]);

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory(): InventoryContextValue {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
}

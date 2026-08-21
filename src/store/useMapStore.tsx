import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { CharacterMapPosition, RouteAreaDefinition, RoutableSpot, SpotLootEntry } from '../types';
import { campaignId, db } from '../firebase';
import { generateLootForSpot } from '../utils/loot';

interface MapDocShape {
  positions: CharacterMapPosition[];
  loot: SpotLootEntry[];
}

interface MapContextValue {
  positions: CharacterMapPosition[];
  loot: SpotLootEntry[];
  isLoading: boolean;
  error: string | null;
  movePlayer: (playerId: string, mapId: string, x: number, y: number) => void;
  /** 未生成なら抽選して保存。生成済みならそのまま(内容を保持)。 */
  ensureLootGenerated: (mapId: string, spot: RoutableSpot, area: RouteAreaDefinition) => void;
  /** 取得済みスタックをルートリストから削除する。 */
  pickupLootItem: (mapId: string, spotId: string, lootInstanceId: string) => void;
  /** マップの配置とルート生成物を一括でリセットする。 */
  resetMap: (mapId: string) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

const MAP_DOC_PATH = ['mapState', 'main'] as const;

export function MapProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<CharacterMapPosition[]>([]);
  const [loot, setLoot] = useState<SpotLootEntry[]>([]);
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
    const mapRef = doc(firestore, 'campaigns', campaignId, ...MAP_DOC_PATH);
    return onSnapshot(mapRef, (snapshot) => {
      const data = snapshot.data() as Partial<MapDocShape> | undefined;
      setPositions(Array.isArray(data?.positions) ? data!.positions! : []);
      setLoot(Array.isArray(data?.loot) ? data!.loot! : []);
      setIsLoading(false);
    }, () => {
      setError('Firestoreとの同期に失敗しました。接続とFirestoreのルールを確認してください。');
      setIsLoading(false);
    });
  }, []);

  const withDoc = useCallback(
    (mutate: (current: MapDocShape) => MapDocShape, onFail: string) => {
      const firestore = db;
      if (!firestore) return;
      const mapRef = doc(firestore, 'campaigns', campaignId, ...MAP_DOC_PATH);
      setError(null);
      void runTransaction(firestore, async (transaction) => {
        const snapshot = await transaction.get(mapRef);
        const data = snapshot.exists() ? (snapshot.data() as Partial<MapDocShape>) : {};
        const current: MapDocShape = {
          positions: Array.isArray(data.positions) ? data.positions : [],
          loot: Array.isArray(data.loot) ? data.loot : [],
        };
        const next = mutate(current);
        transaction.set(mapRef, { ...next, updatedAt: serverTimestamp() }, { merge: true });
      }).catch(() => setError(onFail));
    },
    []
  );

  const movePlayer = useCallback((playerId: string, mapId: string, x: number, y: number) => {
    withDoc((current) => ({
      ...current,
      positions: [...current.positions.filter((p) => p.playerId !== playerId), { playerId, mapId, x, y }],
    }), '位置の保存に失敗しました。ネットワーク接続とFirestoreのルールを確認してください。');
  }, [withDoc]);

  const ensureLootGenerated = useCallback((mapId: string, spot: RoutableSpot, area: RouteAreaDefinition) => {
    withDoc((current) => {
      const exists = current.loot.some((entry) => entry.mapId === mapId && entry.spotId === spot.id);
      if (exists) return current; // 生成済みなら内容を保持
      const items = generateLootForSpot(spot, area);
      return { ...current, loot: [...current.loot, { mapId, spotId: spot.id, items }] };
    }, 'ルート生成に失敗しました。ネットワーク接続とFirestoreのルールを確認してください。');
  }, [withDoc]);

  const pickupLootItem = useCallback((mapId: string, spotId: string, lootInstanceId: string) => {
    withDoc((current) => ({
      ...current,
      loot: current.loot.map((entry) => entry.mapId === mapId && entry.spotId === spotId
        ? { ...entry, items: entry.items.filter((item) => item.id !== lootInstanceId) }
        : entry
      ),
    }), 'アイテムの取得処理に失敗しました。');
  }, [withDoc]);

  const resetMap = useCallback((mapId: string) => {
    withDoc((current) => ({
      positions: current.positions.filter((p) => p.mapId !== mapId),
      loot: current.loot.filter((entry) => entry.mapId !== mapId),
    }), 'マップのリセットに失敗しました。');
  }, [withDoc]);

  const value = useMemo(() => ({
    positions, loot, isLoading, error, movePlayer, ensureLootGenerated, pickupLootItem, resetMap,
  }), [positions, loot, isLoading, error, movePlayer, ensureLootGenerated, pickupLootItem, resetMap]);

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapState(): MapContextValue {
  const context = useContext(MapContext);
  if (!context) throw new Error('useMapState must be used within MapProvider');
  return context;
}
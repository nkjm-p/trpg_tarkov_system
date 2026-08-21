import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { CharacterMapPosition } from '../types';
import { campaignId, db } from '../firebase';

interface MapContextValue {
  positions: CharacterMapPosition[];
  isLoading: boolean;
  error: string | null;
  movePlayer: (playerId: string, mapId: string, x: number, y: number) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<CharacterMapPosition[]>([]);
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
    const mapRef = doc(firestore, 'campaigns', campaignId, 'mapState', 'main');
    return onSnapshot(mapRef, (snapshot) => {
      const data = snapshot.data();
      setPositions(Array.isArray(data?.positions) ? (data!.positions as CharacterMapPosition[]) : []);
      setIsLoading(false);
    }, () => {
      setError('Firestoreとの同期に失敗しました。接続とFirestoreのルールを確認してください。');
      setIsLoading(false);
    });
  }, []);

  const movePlayer = useCallback((playerId: string, mapId: string, x: number, y: number) => {
    const firestore = db;
    if (!firestore) return;
    const mapRef = doc(firestore, 'campaigns', campaignId, 'mapState', 'main');
    setError(null);
    void runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(mapRef);
      const current = snapshot.exists() && Array.isArray(snapshot.data().positions)
        ? (snapshot.data().positions as CharacterMapPosition[])
        : [];
      const next = current.filter((p) => p.playerId !== playerId);
      next.push({ playerId, mapId, x, y });
      transaction.set(mapRef, { positions: next, updatedAt: serverTimestamp() }, { merge: true });
    }).catch(() => setError('位置の保存に失敗しました。ネットワーク接続とFirestoreのルールを確認してください。'));
  }, []);

  const value = useMemo(() => ({ positions, isLoading, error, movePlayer }), [positions, isLoading, error, movePlayer]);
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapState(): MapContextValue {
  const context = useContext(MapContext);
  if (!context) throw new Error('useMapState must be used within MapProvider');
  return context;
}
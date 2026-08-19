import { useEffect, useState } from 'react';
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { InventoryProvider, useInventory } from './store/useInventoryStore';
import { isFirebaseConfigured } from './firebase';
import { DEFAULT_PLAYER_ID, PLAYERS } from './data/players';
import { getItemDef } from './data/items';
import { getPlacedItemsInContainer, canPlaceItem } from './utils/grid';
import { StashPanel } from './components/StashPanel';
import { EquipmentPanel } from './components/EquipmentPanel';
import { ItemCatalogPanel } from './components/ItemCatalogPanel';
import { PlayerTabs } from './components/PlayerTabs';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  return pathname;
}

function DndArea() {
  const { instances, placeInContainer, returnToStash } = useInventory();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const instanceId = String(active.id);
    const overId = String(over.id);
    if (overId === 'stash-dropzone') return returnToStash(instanceId);
    if (!overId.startsWith('container:')) return;
    const data = over.data.current as { containerInstanceId: string; x: number; y: number } | undefined;
    if (!data || instanceId === data.containerInstanceId) return;
    const containerInstance = instances.find((item) => item.instanceId === data.containerInstanceId);
    const containerDef = containerInstance ? getItemDef(containerInstance.itemId) : undefined;
    const draggedDef = getItemDef(instances.find((item) => item.instanceId === instanceId)?.itemId ?? '');
    if (!containerDef?.containerGrid || !draggedDef) return;
    const placed = getPlacedItemsInContainer(instances, data.containerInstanceId);
    if (canPlaceItem(data.x, data.y, draggedDef, containerDef.containerGrid.width, containerDef.containerGrid.height, placed, instanceId)) {
      placeInContainer(instanceId, data.containerInstanceId, data.x, data.y);
    }
  }
  return <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
    <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-3 p-3 lg:grid-cols-[280px_300px_1fr]">
      <div className="min-h-[300px] lg:h-full"><ItemCatalogPanel /></div>
      <div className="min-h-[300px] lg:h-full"><StashPanel /></div>
      <div className="min-h-[300px] lg:h-full"><EquipmentPanel /></div>
    </div>
  </DndContext>;
}

function SyncNotice() {
  const { isLoading, error } = useInventory();
  if (!isLoading && !error) return null;
  return <div className={`px-4 py-2 text-xs ${error ? 'bg-tarkov-danger/15 text-tarkov-danger' : 'bg-tarkov-panelLight text-tarkov-textDim'}`}>
    {error ?? 'Firestoreと同期しています…'}
  </div>;
}

function InventoryWorkspace({ isGm, onPlayerChange }: { isGm: boolean; onPlayerChange?: (id: string) => void }) {
  const { activePlayer } = useInventory();
  return <div className="flex h-screen flex-col bg-tarkov-bg">
    <header className="flex items-center gap-3 border-b border-tarkov-border bg-tarkov-panel px-4 py-3">
      <div><h1 className="stencil text-lg text-tarkov-accent">ESCAPE FROM CONSPIRACY</h1><p className="text-xs text-tarkov-textDim">{isGm ? 'GM管理画面' : `${activePlayer.name} のインベントリ`}</p></div>
      <button type="button" onClick={() => navigate(isGm ? '/' : '/player')} className="ml-auto rounded border border-tarkov-border px-2 py-1 text-xs text-tarkov-textDim hover:border-tarkov-accent">戻る</button>
    </header>
    {isGm && onPlayerChange && <PlayerTabs onPlayerChange={onPlayerChange} />}
    <SyncNotice />
    <main className="flex-1 overflow-y-auto"><DndArea /></main>
  </div>;
}

function GmPage() {
  const [playerId, setPlayerId] = useState(DEFAULT_PLAYER_ID);
  return <InventoryProvider playerId={playerId}><InventoryWorkspace isGm onPlayerChange={setPlayerId} /></InventoryProvider>;
}

function PlayerPage({ playerId }: { playerId: string }) {
  const player = PLAYERS.find((entry) => entry.id === playerId);
  useEffect(() => { if (player) localStorage.setItem('efc-inventory-player-id', player.id); }, [player]);
  if (!player) return <NotFound />;
  return <InventoryProvider playerId={player.id}><InventoryWorkspace isGm={false} /></InventoryProvider>;
}

function RoleSelect() {
  return <div className="flex min-h-screen items-center justify-center bg-tarkov-bg p-4"><div className="w-full max-w-md rounded border border-tarkov-border bg-tarkov-panel p-6">
    <h1 className="stencil text-xl text-tarkov-accent">ESCAPE FROM CONSPIRACY</h1><p className="mt-1 text-sm text-tarkov-textDim">インベントリ管理ツール</p>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <button type="button" onClick={() => navigate('/gm')} className="rounded border border-tarkov-accent/60 p-4 text-left hover:bg-tarkov-accent/10"><span className="stencil block text-sm text-tarkov-accent">GM</span><span className="mt-1 block text-xs text-tarkov-textDim">全プレイヤーを管理</span></button>
      <button type="button" onClick={() => navigate('/player')} className="rounded border border-tarkov-border p-4 text-left hover:border-tarkov-accent"><span className="stencil block text-sm text-tarkov-text">PLAYER</span><span className="mt-1 block text-xs text-tarkov-textDim">自分の所持品を開く</span></button>
    </div>
    {!isFirebaseConfigured && <p className="mt-5 rounded border border-tarkov-danger/50 bg-tarkov-danger/10 p-3 text-xs text-tarkov-danger">Firebaseが未設定です。.env.example を複製して .env.local を作成してください。</p>}
  </div></div>;
}

function PlayerSelect() {
  const remembered = localStorage.getItem('efc-inventory-player-id');
  return <div className="flex min-h-screen items-center justify-center bg-tarkov-bg p-4"><div className="w-full max-w-md rounded border border-tarkov-border bg-tarkov-panel p-6">
    <button type="button" onClick={() => navigate('/')} className="text-xs text-tarkov-textDim hover:text-tarkov-accent">← 役割選択へ</button><h1 className="stencil mt-4 text-lg text-tarkov-accent">PLAYER SELECT</h1><p className="mt-1 text-sm text-tarkov-textDim">自分の名前を選択してください。</p>
    <div className="mt-5 space-y-2">{PLAYERS.map((player) => <button key={player.id} type="button" onClick={() => navigate(`/player/${player.id}`)} className="flex w-full items-center justify-between rounded border border-tarkov-border px-4 py-3 text-left text-sm text-tarkov-text hover:border-tarkov-accent">{player.name}{remembered === player.id && <span className="text-xs text-tarkov-accent">前回選択</span>}</button>)}</div>
  </div></div>;
}

function NotFound() { return <div className="flex min-h-screen items-center justify-center bg-tarkov-bg p-4 text-center"><div><p className="text-tarkov-text">ページが見つかりません。</p><button type="button" onClick={() => navigate('/')} className="mt-3 text-sm text-tarkov-accent">トップへ戻る</button></div></div>; }

export default function App() {
  const pathname = usePathname();
  if (pathname === '/') return <RoleSelect />;
  if (pathname === '/gm') return <GmPage />;
  if (pathname === '/player') return <PlayerSelect />;
  const match = pathname.match(/^\/player\/([^/]+)$/);
  return match ? <PlayerPage playerId={decodeURIComponent(match[1])} /> : <NotFound />;
}

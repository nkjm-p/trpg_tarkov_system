import { useMemo, useState } from 'react';
import { DndContext, useDraggable, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { MAP_DEFINITIONS, getMapDef } from '../data/maps';
import { PLAYERS } from '../data/players';
import { useMapState } from '../store/useMapStore';
import { CharacterToken } from './CharacterToken';
import { RouteAreaModal } from './RouteAreaModal';
import type { RouteAreaDefinition } from '../types';

const TOKEN_COLORS = ['#064df2', '#ab8118', '#d11ac2', '#cb3923'];

function MapGridCell({ mapId, x, y, widthPercent, heightPercent }: { mapId: string; x: number; y: number; widthPercent: number; heightPercent: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: `mapcell:${mapId}:${x}:${y}`, data: { mapId, x, y } });
  return (
    <div
      ref={setNodeRef}
      className={`absolute ${isOver ? 'bg-tarkov-accent/20' : ''}`}
      style={{ left: `${x * widthPercent}%`, top: `${y * heightPercent}%`, width: `${widthPercent}%`, height: `${heightPercent}%` }}
    />
  );
}

function TrayToken({ playerId, name, color }: { playerId: string; name: string; color: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `token:${playerId}`, data: { playerId } });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex shrink-0 items-center gap-1.5 rounded-full border-2 px-2 py-1"
      style={{ borderColor: color, backgroundColor: `${color}22`, opacity: isDragging ? 0.4 : 1, cursor: 'grab', touchAction: 'none' }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-tarkov-text">{name}</span>
    </div>
  );
}

export function MapView({ activePlayerId, isGm }: { activePlayerId?: string; isGm: boolean }) {
  const [mapId, setMapId] = useState(MAP_DEFINITIONS[0]?.id ?? '');
  const [openArea, setOpenArea] = useState<RouteAreaDefinition | null>(null);
  const mapDef = getMapDef(mapId);
//   const { positions, movePlayer } = useMapState();
  const { positions, movePlayer, resetMap } = useMapState();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const widthPercent = mapDef ? 100 / mapDef.gridWidth : 0;
  const heightPercent = mapDef ? 100 / mapDef.gridHeight : 0;

  // GMは全員、PLは自分だけを配置・移動できる
  const visiblePlayerIds = isGm ? PLAYERS.map((p) => p.id) : activePlayerId ? [activePlayerId] : [];

  const tokens = useMemo(
    () => positions.filter((p) => p.mapId === mapId && visiblePlayerIds.includes(p.playerId)),
    [positions, mapId, visiblePlayerIds]
  );
  const unplacedPlayers = useMemo(
    () => visiblePlayerIds.filter((id) => !tokens.some((t) => t.playerId === id)).map((id) => PLAYERS.find((p) => p.id === id)).filter((p): p is (typeof PLAYERS)[number] => Boolean(p)),
    [visiblePlayerIds, tokens]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !mapDef) return;
    const dragged = active.data.current as { playerId: string } | undefined;
    const cell = over.data.current as { mapId: string; x: number; y: number } | undefined;
    if (!dragged || !cell) return;
    if (!isGm && dragged.playerId !== activePlayerId) return;
    movePlayer(dragged.playerId, cell.mapId, cell.x, cell.y);
  }

  if (!mapDef) return <p className="p-4 text-sm text-tarkov-textDim">マップが登録されていません。</p>;

  const cells = [];
  for (let y = 0; y < mapDef.gridHeight; y++) {
    for (let x = 0; x < mapDef.gridWidth; x++) {
      cells.push(<MapGridCell key={`${x}-${y}`} mapId={mapDef.id} x={x} y={y} widthPercent={widthPercent} heightPercent={heightPercent} />);
    }
  }

  return (
    <div className="flex h-full flex-col rounded border border-tarkov-border bg-tarkov-panel">
      {/* <div className="flex items-center gap-2 border-b border-tarkov-border px-3 py-2">
        <h2 className="stencil text-xs text-tarkov-textDim">マップ</h2>
        {MAP_DEFINITIONS.length > 1 && (
          <select
            value={mapId}
            onChange={(e) => setMapId(e.target.value)}
            className="ml-2 rounded border border-tarkov-border bg-tarkov-bg px-2 py-1 text-xs text-tarkov-text focus:border-tarkov-accent focus:outline-none"
          >
            {MAP_DEFINITIONS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        )}
      </div> */}
      // ヘッダー部分(select の直後)にリセットボタンを追加
        <div className="flex items-center gap-2 border-b border-tarkov-border px-3 py-2">
        <h2 className="stencil text-xs text-tarkov-textDim">マップ</h2>
        {MAP_DEFINITIONS.length > 1 && (
            <select
            value={mapId}
            onChange={(e) => setMapId(e.target.value)}
            className="ml-2 rounded border border-tarkov-border bg-tarkov-bg px-2 py-1 text-xs text-tarkov-text focus:border-tarkov-accent focus:outline-none"
            >
            {MAP_DEFINITIONS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
        )}
        {isGm && (
            <button
            type="button"
            onClick={() => {
                if (window.confirm(`「${mapDef.name}」の配置とルート状況をリセットします。よろしいですか?`)) {
                resetMap(mapDef.id);
                }
            }}
            className="ml-auto rounded border border-tarkov-danger/50 px-2 py-1 text-[11px] text-tarkov-danger hover:bg-tarkov-danger/10"
            >
            マップをリセット
            </button>
        )}
        </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {unplacedPlayers.length > 0 && (
          <div className="flex items-center gap-2 border-b border-tarkov-border/70 bg-tarkov-panelLight/40 px-3 py-2">
            <span className="stencil shrink-0 text-[10px] text-tarkov-textDim/70">未配置:</span>
            <div className="flex gap-2 overflow-x-auto">
              {unplacedPlayers.map((p, i) => (
                <TrayToken key={p.id} playerId={p.id} name={p.name} color={TOKEN_COLORS[PLAYERS.findIndex((pp) => pp.id === p.id) % TOKEN_COLORS.length] ?? TOKEN_COLORS[i % TOKEN_COLORS.length]} />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-3">
          <div className="relative mx-auto" style={{ maxWidth: 960 }}>
            <img src={mapDef.imageUrl} alt={mapDef.name} className="w-full select-none rounded border border-tarkov-border" draggable={false} />
            <div className="absolute inset-0">
              {cells}
              {mapDef.routeAreas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setOpenArea(area)}
                  className="absolute flex items-center justify-center rounded-full border-2 border-tarkov-warn bg-tarkov-warn/30 text-sm shadow hover:bg-tarkov-warn/50"
                  style={{ left: `calc(${area.mapX * widthPercent}% - 12px)`, top: `calc(${area.mapY * heightPercent}% - 12px)`, width: 24, height: 24 }}
                  title={area.name}
                >
                  📍
                </button>
              ))}
              {tokens.map((token, index) => {
                const player = PLAYERS.find((p) => p.id === token.playerId);
                return (
                  <CharacterToken
                    key={token.playerId}
                    playerId={token.playerId}
                    name={player?.name ?? token.playerId}
                    color={TOKEN_COLORS[PLAYERS.findIndex((p) => p.id === token.playerId) % TOKEN_COLORS.length] ?? TOKEN_COLORS[index % TOKEN_COLORS.length]}
                    leftPercent={token.x * widthPercent}
                    topPercent={token.y * heightPercent}
                    cellWidthPercent={widthPercent}
                    cellHeightPercent={heightPercent}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </DndContext>

      {/* {openArea && <RouteAreaModal area={openArea} onClose={() => setOpenArea(null)} />} */}
      {/* モーダル呼び出し箇所を修正(mapId を渡す) */}
      {openArea && <RouteAreaModal mapId={mapDef.id} area={openArea} onClose={() => setOpenArea(null)} />}  
    </div>
  );
}
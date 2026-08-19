import { useInventory } from '../store/useInventoryStore';

export function PlayerTabs() {
  const { players, activePlayerId, setActivePlayerId, resetActivePlayer } = useInventory();

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-tarkov-border bg-tarkov-panel px-3 py-2">
      <span className="stencil shrink-0 text-[10px] text-tarkov-textDim/70">プレイヤー:</span>
      <div className="flex gap-1.5">
        {players.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActivePlayerId(p.id)}
            className={`shrink-0 rounded border px-3 py-1 text-xs transition-colors ${
              p.id === activePlayerId
                ? 'border-tarkov-accent bg-tarkov-accent/15 text-tarkov-accent'
                : 'border-tarkov-border text-tarkov-textDim hover:border-tarkov-accentDim'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={resetActivePlayer}
        className="stencil ml-auto shrink-0 rounded border border-tarkov-border px-2 py-1 text-[10px] text-tarkov-textDim hover:border-tarkov-danger hover:text-tarkov-danger"
        title="このプレイヤーの所持品を初期状態に戻す"
      >
        このPLをリセット
      </button>
    </div>
  );
}

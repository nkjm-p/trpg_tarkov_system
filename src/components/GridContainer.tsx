import { useDroppable } from '@dnd-kit/core';
import { useInventory } from '../store/useInventoryStore';
import { getPlacedItemsInContainer } from '../utils/grid';
import { cellToPx, CELL_PX, GAP_PX } from '../utils/constants';
import { DraggableItem } from './DraggableItem';

interface GridContainerProps {
  containerInstanceId: string;
  gridWidth: number;
  gridHeight: number;
  title: string;
}

function GridCell({ containerInstanceId, x, y }: { containerInstanceId: string; x: number; y: number }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `container:${containerInstanceId}:${x}:${y}`,
    data: { containerInstanceId, x, y },
  });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-sm ${isOver ? 'bg-tarkov-accent/20' : 'bg-tarkov-grid'} shadow-cell`}
      style={{ width: CELL_PX, height: CELL_PX }}
    />
  );
}

export function GridContainer({ containerInstanceId, gridWidth, gridHeight, title }: GridContainerProps) {
  const { instances, returnToStash } = useInventory();
  const placedItems = getPlacedItemsInContainer(instances, containerInstanceId);

  const cells = [];
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      cells.push(<GridCell key={`${x}-${y}`} containerInstanceId={containerInstanceId} x={x} y={y} />);
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="stencil text-[11px] text-tarkov-textDim">{title}</p>
        <p className="text-[10px] text-tarkov-textDim/60">
          {gridWidth}×{gridHeight} マス
        </p>
      </div>
      <div
        className="relative rounded border border-tarkov-border bg-tarkov-panel p-1"
        style={{ width: cellToPx(gridWidth) + 8, height: cellToPx(gridHeight) + 8 }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridWidth}, ${CELL_PX}px)`,
            gridTemplateRows: `repeat(${gridHeight}, ${CELL_PX}px)`,
            gap: GAP_PX,
          }}
        >
          {cells}
        </div>

        {placedItems.map(({ instance, def, x, y }) => (
          <DraggableItem
            key={instance.instanceId}
            instanceId={instance.instanceId}
            def={def}
            className="group absolute flex flex-col items-center justify-center rounded border text-center"
            style={{
              left: 4 + cellToPx(x),
              top: 4 + cellToPx(y),
              width: cellToPx(def.width),
              height: cellToPx(def.height),
              backgroundColor: `${def.color}26`,
              borderColor: `${def.color}88`,
            }}
          >
            <span className="text-base leading-none">{def.icon}</span>
            <span className="mt-0.5 px-1 text-[9px] leading-tight text-tarkov-text line-clamp-2">{def.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                returnToStash(instance.instanceId);
              }}
              className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-tarkov-danger text-[10px] text-white group-hover:flex"
              title="スタッシュへ戻す"
            >
              ×
            </button>
          </DraggableItem>
        ))}
      </div>
    </div>
  );
}

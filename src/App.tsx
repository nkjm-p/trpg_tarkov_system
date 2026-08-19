import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { InventoryProvider, useInventory } from './store/useInventoryStore';
import { getItemDef } from './data/items';
import { getPlacedItemsInContainer, canPlaceItem } from './utils/grid';
import { StashPanel } from './components/StashPanel';
import { EquipmentPanel } from './components/EquipmentPanel';
import { ItemCatalogPanel } from './components/ItemCatalogPanel';
import { PlayerTabs } from './components/PlayerTabs';

function DndArea() {
  const { instances, placeInContainer, returnToStash } = useInventory();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const instanceId = String(active.id);
    const overId = String(over.id);

    if (overId === 'stash-dropzone') {
      returnToStash(instanceId);
      return;
    }

    if (overId.startsWith('container:')) {
      const data = over.data.current as { containerInstanceId: string; x: number; y: number } | undefined;
      if (!data) return;
      const { containerInstanceId, x, y } = data;

      const containerInstance = instances.find((i) => i.instanceId === containerInstanceId);
      const containerDef = containerInstance ? getItemDef(containerInstance.itemId) : undefined;
      const draggedDef = getItemDef(instances.find((i) => i.instanceId === instanceId)?.itemId ?? '');
      if (!containerDef?.containerGrid || !draggedDef) return;

      // アイテム自身をコンテナに入れることはできない(リグをリグに入れる等の防止)
      if (instanceId === containerInstanceId) return;

      const placedItems = getPlacedItemsInContainer(instances, containerInstanceId);
      const ok = canPlaceItem(
        x,
        y,
        draggedDef,
        containerDef.containerGrid.width,
        containerDef.containerGrid.height,
        placedItems,
        instanceId
      );
      if (ok) {
        placeInContainer(instanceId, containerInstanceId, x, y);
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-3 p-3 lg:grid-cols-[280px_300px_1fr]">
        <div className="min-h-[300px] lg:h-full">
          <ItemCatalogPanel />
        </div>
        <div className="min-h-[300px] lg:h-full">
          <StashPanel />
        </div>
        <div className="min-h-[300px] lg:h-full">
          <EquipmentPanel />
        </div>
      </div>
    </DndContext>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <div className="flex h-screen flex-col bg-tarkov-bg">
        <header className="border-b border-tarkov-border bg-tarkov-panel px-4 py-3">
          <h1 className="stencil text-lg text-tarkov-accent">ESCAPE FROM CONSPIRACY</h1>
          <p className="text-xs text-tarkov-textDim">インベントリ管理ツール</p>
        </header>
        <PlayerTabs />
        <main className="flex-1 overflow-y-auto">
          <DndArea />
        </main>
      </div>
    </InventoryProvider>
  );
}

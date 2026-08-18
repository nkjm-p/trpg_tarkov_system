import type { ItemDefinition, ItemInstance, PlacedItem } from '../types';
import { getItemDef } from '../data/items';

/**
 * 指定コンテナ内に既に配置されているアイテム一覧を取得する。
 */
export function getPlacedItemsInContainer(
  allInstances: ItemInstance[],
  containerInstanceId: string
): PlacedItem[] {
  const result: PlacedItem[] = [];
  for (const inst of allInstances) {
    if (inst.location.type === 'container' && inst.location.containerInstanceId === containerInstanceId) {
      const def = getItemDef(inst.itemId);
      if (!def) continue;
      result.push({ instance: inst, def, x: inst.location.x, y: inst.location.y });
    }
  }
  return result;
}

/**
 * (x, y) を起点に幅×高さのアイテムを置けるか判定する。
 * gridWidth/gridHeight: コンテナ側のマス数
 * excludeInstanceId: 自分自身の移動時など、判定から除外したいインスタンス
 */
export function canPlaceItem(
  x: number,
  y: number,
  def: ItemDefinition,
  gridWidth: number,
  gridHeight: number,
  placedItems: PlacedItem[],
  excludeInstanceId?: string
): boolean {
  // 境界チェック
  if (x < 0 || y < 0) return false;
  if (x + def.width > gridWidth) return false;
  if (y + def.height > gridHeight) return false;

  // 衝突チェック(矩形の重なり判定)
  for (const placed of placedItems) {
    if (excludeInstanceId && placed.instance.instanceId === excludeInstanceId) continue;
    const overlapX = x < placed.x + placed.def.width && x + def.width > placed.x;
    const overlapY = y < placed.y + placed.def.height && y + def.height > placed.y;
    if (overlapX && overlapY) return false;
  }
  return true;
}

/**
 * 空いている最初の位置を左上から探索して返す(自動配置用)。
 */
export function findFirstFreeSlot(
  def: ItemDefinition,
  gridWidth: number,
  gridHeight: number,
  placedItems: PlacedItem[]
): { x: number; y: number } | null {
  for (let y = 0; y <= gridHeight - def.height; y++) {
    for (let x = 0; x <= gridWidth - def.width; x++) {
      if (canPlaceItem(x, y, def, gridWidth, gridHeight, placedItems)) {
        return { x, y };
      }
    }
  }
  return null;
}

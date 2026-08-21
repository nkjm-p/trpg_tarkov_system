import { v4 as uuidv4 } from 'uuid';
import { ITEM_DEFINITIONS } from '../data/items';
import type {
  ItemDefinition,
  LootItemInstance,
  RouteAreaDefinition,
  RouteDensity,
  RoutableSpot,
} from '../types';

/** ルート箇所(routeDensity)ごとの、出現アイテム種類数の範囲。 */
const COUNT_RANGE: Record<RouteDensity, [number, number]> = {
  少: [1, 2],
  普: [2, 4],
  多: [3, 6],
};

/** アイテム1個あたりの個数(スタック数)の範囲。 */
const QUANTITY_RANGE: [number, number] = [1, 3];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** アイテムの抽選タグ。tags未指定の場合は category を使う。 */
function getItemTags(def: ItemDefinition): string[] {
  return def.tags && def.tags.length > 0 ? def.tags : [def.category];
}

/** スポットのタグと一致するアイテム一覧を返す。'other' タグは全アイテムが対象。 */
export function getEligibleItems(spot: RoutableSpot): ItemDefinition[] {
  if (spot.tags.includes('other')) return ITEM_DEFINITIONS;
  return ITEM_DEFINITIONS.filter((item) =>
    getItemTags(item).some((tag) => (spot.tags as string[]).includes(tag))
  );
}

/**
 * 出現確率の計算式:
 * 候補プール(タグ一致アイテム)から重複なしで抽選する。
 * 各回の選出確率 = そのアイテムのレアリティ(10/30/50) ÷ 「まだ選ばれていない候補」のレアリティ合計。
 * レアリティが高いアイテムほど選ばれやすく、1つ選ばれるたびに候補から除外されるため
 * 同じアイテムが重複して出現することはない。
 */
function weightedPickWithoutReplacement(pool: ItemDefinition[], count: number): ItemDefinition[] {
  const remaining = [...pool];
  const picked: ItemDefinition[] = [];
  const n = Math.min(count, remaining.length);
  for (let i = 0; i < n; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + item.rarity, 0);
    if (totalWeight <= 0) break;
    let r = Math.random() * totalWeight;
    let index = remaining.length - 1;
    for (let j = 0; j < remaining.length; j++) {
      r -= remaining[j].rarity;
      if (r <= 0) { index = j; break; }
    }
    picked.push(remaining[index]);
    remaining.splice(index, 1);
  }
  return picked;
}

/** ルート可能地点1件分のルートリスト(アイテムの種類・個数)を生成する。 */
export function generateLootForSpot(spot: RoutableSpot, area: RouteAreaDefinition): LootItemInstance[] {
  const eligible = getEligibleItems(spot);
  if (eligible.length === 0) return [];
  const [min, max] = COUNT_RANGE[area.routeDensity];
  const count = randomInt(min, max);
  const picked = weightedPickWithoutReplacement(eligible, count);
  return picked.map((item) => ({
    id: uuidv4(),
    itemId: item.id,
    quantity: randomInt(QUANTITY_RANGE[0], QUANTITY_RANGE[1]),
  }));
}
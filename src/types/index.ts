/**
 * Escape from Conspiracy - インベントリ管理ツール 型定義
 */

// ── アイテムカテゴリ ─────────────────────────────
export type ItemCategory =
  | 'weapon' // 武器
  | 'ammo' // 弾薬
  | 'medical' // 医療品
  | 'food' // 食料/水
  | 'valuables' // 貴重品/取引品
  | 'gear' // 防具・装備品
  | 'container' // リグ/バックパック等の収納
  | 'key' // 鍵
  | 'misc'; // その他

// ── 装備スロットの種類 ───────────────────────────
export type EquipSlotType =
  | 'primaryWeapon' // メイン武器
  | 'secondaryWeapon' // サブ武器
  | 'holster' // ホルスター(拳銃)
  | 'headwear' // ヘッドギア
  | 'faceCover' // フェイスカバー
  | 'earpiece' // イヤホン
  | 'bodyArmor' // ボディアーマー
  | 'rig' // チェストリグ(グリッド持ち)
  | 'backpack'; // バックパック(グリッド持ち)

// リグ/バックパックなど、内部にグリッドを持つスロット
export const CONTAINER_SLOTS: EquipSlotType[] = ['rig', 'backpack'];

// ── アイテムマスタ定義 ───────────────────────────
export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  /** グリッド上で占有する幅(マス数) */
  width: number;
  /** グリッド上で占有する高さ(マス数) */
  height: number;
  /** 一覧表示用の短縮アイコン文字(絵文字 or 2〜3文字) */
  icon: string;
  /** グリッドセルのアクセントカラー(Tailwindクラスではなくhex) */
  color: string;
  description?: string;
  /** このアイテム自体を装備できる場合、対象スロット */
  equipSlot?: EquipSlotType;
  /** リグ/バックパックの場合、内部グリッドサイズ */
  containerGrid?: { width: number; height: number };
}

// ── 所持アイテムの実体(インスタンス) ─────────────
export type ItemLocation =
  | { type: 'stash' } // スタッシュ(未配置リスト)にある
  | { type: 'equip'; slot: EquipSlotType } // 装備スロットにセットされている
  | { type: 'container'; containerInstanceId: string; x: number; y: number }; // リグ/バックパック内グリッド座標

export interface ItemInstance {
  instanceId: string;
  itemId: string; // ItemDefinition.id への参照
  location: ItemLocation;
}

// ── グリッド配置計算用 ───────────────────────────
export interface GridPosition {
  x: number;
  y: number;
}

export interface PlacedItem {
  instance: ItemInstance;
  def: ItemDefinition;
  x: number;
  y: number;
}

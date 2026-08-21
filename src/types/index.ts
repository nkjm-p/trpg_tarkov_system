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

/** TRPGで参照するアイテム固有のルール・数値。 */
export interface ItemTrpgInfo {
  /** アイテムを使用したときの主な効果。 */
  effect: string;
  /** ルール上の数値や計算式。値が未確定の場合も明示的に記録する。 */
  properties: { label: string; value: string }[];
  /** 装備条件、弾薬の互換性、運用上の注意など。 */
  notes?: string[];
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

// ── マップ関連 ─────────────────────────────
// export interface MapAreaDef {
//   id: string;
//   name: string;
//   /** マップグリッド上のX座標(マス単位) */
//   x: number;
//   /** マップグリッド上のY座標(マス単位) */
//   y: number;
//   description?: string;
//   /** このエリアからルート移動可能な隣接エリアのID一覧(双方向で記述すること) */
//   connections: string[];
// }


// ── マップ機能 ───────────────────────────
/** ルートエリア内の個別のルート可能地点(拠点・出口・アイテムスポットなど) */
export interface RoutableSpot {
  id: string;
  name: string;
  /** ルートエリア画像上の相対位置(0〜1)。左上原点。 */
  x: number;
  y: number;
  description?: string;
  icon?: string;
}

/** マップ上の1エリア。拡大表示するとルート可能地点の詳細が見える。 */
export interface RouteAreaDefinition {
  id: string;
  name: string;
  /** 拡大表示用の画像パス(public配下推奨) */
  imageUrl: string;
  /** 親マップのグリッド座標(マス単位) */
  mapX: number;
  mapY: number;
  /** このエリアが保持するルート可能地点インスタンスのリスト */
  routableSpots: RoutableSpot[];
}

/** マップ自体の定義。背景画像 + マス目 + ルートエリア群。 */
export interface MapDefinition {
  id: string;
  name: string;
  imageUrl: string;
  gridWidth: number;
  gridHeight: number;
  routeAreas: RouteAreaDefinition[];
}

/** プレイヤーキャラクターのマップ上の現在位置(Firestore同期対象)。 */
export interface CharacterMapPosition {
  playerId: string;
  mapId: string;
  x: number;
  y: number;
}

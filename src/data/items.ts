import type { ItemDefinition } from '../types';

/**
 * 「Escape from Conspiracy」シナリオ用のオリジナルアイテムマスタ。
 * 実在の銃器商標等は使用せず、架空の型番・名称で構成しています。
 * GM側で自由に増減・カスタマイズしてください。
 */
export const ITEM_DEFINITIONS: ItemDefinition[] = [
  // ── 武器 ─────────────────────────────
  {
    id: 'wpn_krait74',
    name: 'KRAIT-74 突撃銃',
    category: 'weapon',
    width: 4,
    height: 1,
    icon: '🔫',
    color: '#8a9a5b',
    equipSlot: 'primaryWeapon',
    description: '5.45mm弾を使用する信頼性の高いアサルトライフル。',
  },
  {
    id: 'wpn_vektor_smg',
    name: 'VEKTOR サブマシンガン',
    category: 'weapon',
    width: 3,
    height: 1,
    icon: '🔫',
    color: '#8a9a5b',
    equipSlot: 'primaryWeapon',
    description: '近距離戦闘向けの軽量SMG。',
  },
  {
    id: 'wpn_longshot',
    name: 'LONGSHOT Mk.II',
    category: 'weapon',
    width: 5,
    height: 1,
    icon: '🎯',
    color: '#8a9a5b',
    equipSlot: 'primaryWeapon',
    description: '長距離狙撃に適したボルトアクションライフル。',
  },
  {
    id: 'wpn_m9talon',
    name: 'M9 タロン',
    category: 'weapon',
    width: 2,
    height: 1,
    icon: '🔫',
    color: '#8a9a5b',
    equipSlot: 'secondaryWeapon',
    description: '標準的な9mm拳銃。ホルスターにも収まる。',
  },

  // ── 弾薬 ─────────────────────────────
  {
    id: 'ammo_545',
    name: '5.45x39 弾薬箱',
    category: 'ammo',
    width: 1,
    height: 1,
    icon: '📦',
    color: '#c9a13b',
    description: '30発入りの弾薬箱。',
  },
  {
    id: 'ammo_9mm',
    name: '9x19 弾薬箱',
    category: 'ammo',
    width: 1,
    height: 1,
    icon: '📦',
    color: '#c9a13b',
    description: '拳銃・SMG用の弾薬箱。',
  },

  // ── 医療品 ─────────────────────────────
  {
    id: 'med_bandage',
    name: 'バンテージ',
    category: 'medical',
    width: 1,
    height: 1,
    icon: '🩹',
    color: '#b3402f',
    description: '軽度の出血を止める。',
  },
  {
    id: 'med_kit',
    name: '医療キット',
    category: 'medical',
    width: 2,
    height: 2,
    icon: '💊',
    color: '#b3402f',
    description: '重傷の治療に使用する携行医療セット。',
  },
  {
    id: 'med_painkiller',
    name: '鎮痛剤',
    category: 'medical',
    width: 1,
    height: 1,
    icon: '💉',
    color: '#b3402f',
    description: '痛みによる行動不利を一時的に解消する。',
  },

  // ── 食料 ─────────────────────────────
  {
    id: 'food_can',
    name: '携行缶詰',
    category: 'food',
    width: 1,
    height: 1,
    icon: '🥫',
    color: '#5c6b3f',
    description: '腹持ちの良い保存食。',
  },
  {
    id: 'food_water',
    name: '水ボトル',
    category: 'food',
    width: 1,
    height: 1,
    icon: '💧',
    color: '#5c6b3f',
    description: '飲料水。脱水を防ぐ。',
  },

  // ── 貴重品/取引品 ─────────────────────────────
  {
    id: 'val_goldbar',
    name: '金塊',
    category: 'valuables',
    width: 1,
    height: 1,
    icon: '🟨',
    color: '#c9a13b',
    description: '闇市場で高値で取引される貴重品。',
  },
  {
    id: 'val_circuit',
    name: '電子基盤',
    category: 'valuables',
    width: 1,
    height: 1,
    icon: '💾',
    color: '#c9a13b',
    description: '交換ミッションで需要のある部品。',
  },

  // ── 防具・装備品(装備スロット専用) ─────────────
  {
    id: 'gear_helmet',
    name: 'コンバットヘルメット',
    category: 'gear',
    width: 2,
    height: 2,
    icon: '⛑️',
    color: '#8b9089',
    equipSlot: 'headwear',
    description: '頭部を保護するヘルメット。',
  },
  {
    id: 'gear_facecover',
    name: 'タクティカルマスク',
    category: 'gear',
    width: 1,
    height: 1,
    icon: '😷',
    color: '#8b9089',
    equipSlot: 'faceCover',
    description: '顔面を保護し、素性を隠す。',
  },
  {
    id: 'gear_earpiece',
    name: '戦術イヤホン',
    category: 'gear',
    width: 1,
    height: 1,
    icon: '🎧',
    color: '#8b9089',
    equipSlot: 'earpiece',
    description: '周囲の足音を聞き取りやすくする。',
  },
  {
    id: 'gear_armor',
    name: 'ボディアーマー LV4',
    category: 'gear',
    width: 3,
    height: 2,
    icon: '🛡️',
    color: '#8b9089',
    equipSlot: 'bodyArmor',
    description: '胴体への被弾ダメージを軽減する。',
  },

  // ── コンテナ(リグ/バックパック) ─────────────
  {
    id: 'container_rig',
    name: 'チェストリグ',
    category: 'container',
    width: 2,
    height: 2,
    icon: '🎒',
    color: '#5c6b3f',
    equipSlot: 'rig',
    containerGrid: { width: 3, height: 2 },
    description: '小型の収納リグ。3x2マスの収納スペースを持つ。',
  },
  {
    id: 'container_backpack',
    name: 'フィールドバックパック',
    category: 'container',
    width: 3,
    height: 3,
    icon: '🎒',
    color: '#5c6b3f',
    equipSlot: 'backpack',
    containerGrid: { width: 4, height: 4 },
    description: '大容量のバックパック。4x4マスの収納スペースを持つ。',
  },
];

export function getItemDef(itemId: string): ItemDefinition | undefined {
  return ITEM_DEFINITIONS.find((i) => i.id === itemId);
}

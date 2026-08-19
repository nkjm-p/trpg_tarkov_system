import type { EquipSlotType } from '../types';

export interface SlotMeta {
  slot: EquipSlotType;
  label: string;
  icon: string;
}

export const EQUIP_SLOTS: SlotMeta[] = [
  { slot: 'primaryWeapon', label: 'メイン武器', icon: '🔫' },
  { slot: 'secondaryWeapon', label: 'サブ武器', icon: '🔫' },
  // { slot: 'holster', label: 'ホルスター', icon: '🗡️' },
  { slot: 'headwear', label: 'ヘッドギア', icon: '⛑️' },
  { slot: 'faceCover', label: 'フェイスカバー', icon: '😷' },
  { slot: 'earpiece', label: 'イヤホン', icon: '🎧' },
  { slot: 'bodyArmor', label: 'ボディアーマー', icon: '🛡️' },
  { slot: 'rig', label: 'チェストリグ', icon: '🎒' },
  { slot: 'backpack', label: 'バックパック', icon: '🎒' },
];

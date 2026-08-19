import type { ItemTrpgInfo } from '../types';

/**
 * アイテム固有のTRPG情報です。数値を調整するときはここだけを更新します。
 * "未設定" の項目は、セッション用ルールの確定後に置き換えてください。
 */
export const ITEM_TRPG_INFO: Record<string, ItemTrpgInfo> = {
  wpn_krait74: {
    effect: '5.45mm弾を使用するアサルトライフル。',
    properties: [{ label: 'ダメージ', value: '未設定' }, { label: '命中率', value: '未設定' }, { label: '故障率', value: '100 - 耐久度' }],
    notes: ['メインウェポンスロットに装備。'],
  },
  wpn_vektor_smg: {
    effect: '近距離戦向けのサブマシンガン。',
    properties: [{ label: 'ダメージ', value: '未設定' }, { label: '命中率', value: '未設定' }, { label: '故障率', value: '100 - 耐久度' }],
    notes: ['メインウェポンスロットに装備。'],
  },
  wpn_longshot: {
    effect: '長距離射撃向けのボルトアクションライフル。',
    properties: [{ label: 'ダメージ', value: '未設定' }, { label: '命中率', value: '未設定' }, { label: '故障率', value: '100 - 耐久度' }],
    notes: ['メインウェポンスロットに装備。'],
  },
  wpn_m9talon: {
    effect: '9mm弾を使用する拳銃。',
    properties: [
      { label: 'ダメージ', value: '1D6 × 3' },
      { label: '命中率', value: '30% + 技能値' },
      { label: '故障率', value: '100 - 耐久度' },
    ],
    notes: ['サブウェポンスロットに装備。', '9x19弾薬箱を使用。'],
  },
  ammo_545: { effect: '5.45x39口径の弾薬。', properties: [{ label: '装弾数', value: '30発' }], notes: ['対応する武器と組み合わせて使用。'] },
  ammo_9mm: { effect: '9x19口径の弾薬。', properties: [{ label: '装弾数', value: '未設定' }], notes: ['M9タロンなど対応する武器と組み合わせて使用。'] },
  med_bandage: { effect: '出血を止めるための応急処置用品。', properties: [{ label: '使用回数', value: '未設定' }, { label: '処置効果', value: '出血の停止' }] },
  med_kit: { effect: '負傷者の治療に使う医療キット。', properties: [{ label: '使用回数', value: '未設定' }, { label: '治療量', value: '未設定' }] },
  med_painkiller: { effect: '痛みによる行動への悪影響を一時的に緩和する。', properties: [{ label: '持続時間', value: '未設定' }] },
  food_can: { effect: '空腹をしのぐ携行食。', properties: [{ label: '空腹回復', value: '未設定' }] },
  food_water: { effect: '携行用の飲料水。', properties: [{ label: '水分回復', value: '未設定' }] },
  val_goldbar: { effect: '換金や取引に使える高価な金塊。', properties: [{ label: '売却価値', value: '未設定' }] },
  val_circuit: { effect: '電子機器の修理・工作に使える電子基板。', properties: [{ label: '売却価値', value: '未設定' }] },
  gear_helmet: { effect: '頭部を保護するコンバットヘルメット。', properties: [{ label: '防護値', value: '未設定' }, { label: '耐久度', value: '未設定' }], notes: ['ヘッドギアスロットに装備。'] },
  gear_facecover: { effect: '顔面を保護し、外観を隠すタクティカルマスク。', properties: [{ label: '防護値', value: '未設定' }], notes: ['フェイスカバースロットに装備。'] },
  gear_earpiece: { effect: '周囲の音を聞き取りやすくする戦術イヤホン。', properties: [{ label: '判定補正', value: '未設定' }], notes: ['イヤホンスロットに装備。'] },
  gear_armor: { effect: '胴体を保護するレベル4相当のボディアーマー。', properties: [{ label: '防護値', value: '未設定' }, { label: '耐久度', value: '未設定' }], notes: ['ボディアーマースロットに装備。'] },
  container_rig: { effect: '小型の収納スペースを持つチェストリグ。', properties: [{ label: '収納マス', value: '3 × 2' }], notes: ['リグスロットに装備。'] },
  container_backpack: { effect: '大型の収納スペースを持つバックパック。', properties: [{ label: '収納マス', value: '4 × 4' }], notes: ['バックパックスロットに装備。'] },
};

export function getItemTrpgInfo(itemId: string): ItemTrpgInfo | undefined {
  return ITEM_TRPG_INFO[itemId];
}

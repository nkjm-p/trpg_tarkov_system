import type { ItemTrpgInfo } from '../types';

/**
 * アイテム固有のTRPG情報です。数値を調整するときはここだけを更新します。
 * "未設定" の項目は、セッション用ルールの確定後に置き換えてください。
 */
export const ITEM_TRPG_INFO: Record<string, ItemTrpgInfo> = {
  // ── 武器 ─────────────────────────────
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
  // ── 弾薬 ─────────────────────────────
  ammo_545: { effect: '5.45x39口径の弾薬。', properties: [{ label: '弾数', value: '30発' }], notes: ['対応する武器と組み合わせて使用。'] },
  ammo_762: { effect: '7.62x39口径の弾薬。', properties: [{ label: '弾数', value: '30発' }], notes: ['対応する武器と組み合わせて使用。'] },
  ammo_9mm: { effect: '9x19口径の弾薬。', properties: [{ label: '弾数', value: '60発' }], notes: ['対応する武器と組み合わせて使用。'] },
  // ── 弾倉 ─────────────────────────────
  mag_545_30: { effect: '5.45x39口径の30発入りマガジン。', properties: [{ label: '弾数', value: '30発' }], notes: ['対応する武器と組み合わせて使用。'] },
  mag_762_30: { effect: '7.62x39口径の30発入りマガジン。', properties: [{ label: '弾数', value: '30発' }], notes: ['対応する武器と組み合わせて使用。'] },
  mag_9mm_15: { effect: '9x19口径の15発入りマガジン。', properties: [{ label: '弾数', value: '15発' }], notes: ['対応する武器と組み合わせて使用。'] },
  // ── 医療 ─────────────────────────────
  med_bandage: { effect: '出血を止めるための応急処置用品。', properties: [{ label: '使用回数', value: '2回' }, { label: '処置効果', value: '出血の停止' }] },
  med_kit: { effect: '負傷者の治療に使う医療キット。', properties: [{ label: '使用回数', value: '3回' }, { label: '治療量', value: '30+技能値(HP)' }] },
  med_painkiller: { effect: '痛みによる行動への悪影響を一時的に緩和する。', properties: [{ label: '使用回数', value: '1回' },{ label: '持続時間', value: '3ラウンド' }] },
  // ── 食料・水 ─────────────────────────────
  food_can: { effect: '空腹をしのぐ携行食。', properties: [{ label: '空腹回復', value: '5ゲージ' }] },
  food_water: { effect: '携行用の飲料水。', properties: [{ label: '水分回復', value: '5ゲージ' }] },
  // ── 装備 ─────────────────────────────
  gear_helmet4: { effect: '頭部を保護するコンバットヘルメット。', properties: [{ label: '防護値', value: '4' }, { label: '耐久度', value: '100' }], notes: ['ヘッドギアスロットに装備。'] },
  gear_helmet5: { effect: '頭部を保護する信頼性の高いコンバットヘルメット。', properties: [{ label: '防護値', value: '5' }, { label: '耐久度', value: '100' }], notes: ['ヘッドギアスロットに装備。'] },
  
  gear_facecover: { effect: '顔面を保護し、外観を隠すタクティカルマスク。', properties: [{ label: '防護値', value: '2' }], notes: ['フェイスカバースロットに装備。'] },
  
  gear_earpiece_N: { effect: '周囲の音を聞き取りやすくする戦術イヤホン。', properties: [{ label: '判定補正', value: '+10' }], notes: ['イヤホンスロットに装備。'] },
  gear_earpiece_S: { effect: '周囲の音をかなり聞き取りやすくする高性能イヤホン。', properties: [{ label: '判定補正', value: '+20' }], notes: ['イヤホンスロットに装備。'] },
  
  gear_armor3: { effect: '胴体を保護するレベル3相当のボディアーマー。', properties: [{ label: '防護値', value: '3' }, { label: '耐久度', value: '100' }], notes: ['ボディアーマースロットに装備。'] },
  gear_armor4: { effect: '胴体を保護するレベル4相当のボディアーマー。', properties: [{ label: '防護値', value: '4' }, { label: '耐久度', value: '100' }], notes: ['ボディアーマースロットに装備。'] },
  
  container_rig_M: { effect: '普通の収納スペースを持つチェストリグ。', properties: [{ label: '収納マス', value: '3 × 2' }], notes: ['リグスロットに装備。'] },
  container_rig_L: { effect: '大型の収納スペースを持つチェストリグ。', properties: [{ label: '収納マス', value: '5 × 2' }], notes: ['リグスロットに装備。'] },
  
  container_backpack_S: { effect: '小型の収納スペースを持つバックパック。', properties: [{ label: '収納マス', value: '3 × 4' }], notes: ['バックパックスロットに装備。'] },
  container_backpack_M: { effect: '中型の収納スペースを持つバックパック。', properties: [{ label: '収納マス', value: '4 × 5' }], notes: ['バックパックスロットに装備。'] },
  container_backpack_L: { effect: '大型の収納スペースを持つバックパック。', properties: [{ label: '収納マス', value: '5 × 7' }], notes: ['バックパックスロットに装備。'] },
    // ── 貴重品 ─────────────────────────────
  val_goldbar: { effect: '換金や取引に使える高価な金塊。', properties: [{ label: '売却価値', value: '₽ 100,000' }] },
  val_circuit: { effect: '電子機器の修理・工作に使える電子基板。', properties: [{ label: '売却価値', value: '₽ 30,000' }] },
  val_graphic: { effect: '電子部品の供給源となる高価なパーツ。', properties: [{ label: '売却価値', value: '₽ 250,000' }] },
  // ── その他 ─────────────────────────────
  misc_gasoline: { effect: '燃料として使えるガソリン。', properties: [{ label: '売却価値', value: '₽ 5,000' }] },
  misc_battery: { effect: '電子機器の電源として使えるバッテリー。', properties: [{ label: '売却価値', value: '₽ 10,000' }] },
  misc_toolkit: { effect: '簡単な修理や工作に使えるツールキット。', properties: [{ label: '売却価値', value: '₽ 15,000' }] },
  misc_cord: { effect: '各種電子部品を繋げるコード。', properties: [{ label: '売却価値', value: '₽ 3,000' }] },
  misc_ducttape: { effect: '物を固定したり補修するのに使える強力なテープ。', properties: [{ label: '売却価値', value: '₽ 2,000' }] },
  misc_wire: { effect: '電子機器の修理や工作に使えるワイヤー。', properties: [{ label: '売却価値', value: '₽ 4,000' }] },
  misc_screwdriver: { effect: '電子機器の修理や工作に使えるドライバー。', properties: [{ label: '売却価値', value: '₽ 1,000' }] },
  misc_bolt: { effect: '電子機器の修理や工作に使えるボルト。', properties: [{ label: '売却価値', value: '₽ 2,500' }] },
  
};

export function getItemTrpgInfo(itemId: string): ItemTrpgInfo | undefined {
  return ITEM_TRPG_INFO[itemId];
}

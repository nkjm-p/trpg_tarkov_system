/**
 * TRPGセッションに参加するプレイヤーの定義。
 * GMはここに実際の参加者名を追加・編集してください。
 * starterItemIds を省略した場合は data/items.ts 側の共通初期装備が使われます。
 */
export interface PlayerDef {
  id: string;
  name: string;
  /** このプレイヤー専用の初期所持品(itemIdの配列)。省略時はデフォルトの初期装備。 */
  starterItemIds?: string[];
}

export const PLAYERS: PlayerDef[] = [
  { id: 'player1', name: 'プレイヤー1' },
  { id: 'player2', name: 'プレイヤー2' },
  { id: 'player3', name: 'プレイヤー3' },
  { id: 'player4', name: 'プレイヤー4' },
];

export const DEFAULT_PLAYER_ID = PLAYERS[0].id;

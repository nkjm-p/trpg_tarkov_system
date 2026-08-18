<<<<<<< HEAD
# Escape from Conspiracy - インベントリ管理ツール

身内TRPGセッション用のオリジナルシナリオ「Escape from Conspiracy」向け、
装備カスタム・スタッシュ管理を再現するブラウザ用インベントリ管理ツールです。

## 技術スタック

- React 18 + TypeScript
- Vite
- Tailwind CSS(ミリタリー風ダークUI)
- @dnd-kit(グリッドへのドラッグ&ドロップ)

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:5173` にアクセスすると起動します。

## ビルド

```bash
npm run build
npm run preview
```

## 機能概要

- **装備スロット**: メイン武器・サブ武器・ホルスター・ヘッドギア・フェイスカバー・
  イヤホン・ボディアーマー・チェストリグ・バックパックをプルダウンで選択して装備。
  装備するとスタッシュから該当アイテムが除外されます。
- **グリッドインベントリ**: チェストリグ・バックパックを装備すると、内部グリッドが
  出現し、スタッシュのアイテムをドラッグ&ドロップで配置できます。アイテムのサイズ
  (幅×高さ)を考慮した衝突判定・境界判定を行います。
- **スタッシュ**: 未配置のアイテム一覧。グリッドやスロットからアイテムを外すと
  ここに戻ります。

## アイテムデータのカスタマイズ

`src/data/items.ts` にアイテムマスタが定義されています。GMの用意したシナリオに
合わせて自由にアイテムを追加・編集してください。

```ts
{
  id: 'wpn_example',
  name: '独自の武器名',
  category: 'weapon',
  width: 3,
  height: 1,
  icon: '🔫',
  color: '#8a9a5b',
  equipSlot: 'primaryWeapon',
  description: '説明文',
}
```

初期所持品(セッション開始時のスタッシュ内容)は
`src/store/useInventoryStore.ts` の `STARTER_ITEM_IDS` で調整できます。

## 無料デプロイ(Vercel の例)

1. このリポジトリを GitHub に push
2. [Vercel](https://vercel.com) にログインし、GitHub リポジトリをインポート
3. Framework Preset は "Vite" を選択(自動検出されます)
4. Deploy を実行すると、参加者はブラウザから URL にアクセスするだけで利用できます

Netlify を使う場合も同様に、Build command: `npm run build` / Publish directory: `dist` で
デプロイできます。

## 今後の拡張案

- Firebase / Supabase を使ったセッション参加者間のリアルタイム同期
- スタッシュ自体のグリッド化(現状はリスト表示)
- アイテムの取引・譲渡ログ機能
- GM専用のNPCストック管理画面
=======
# trpg_tarkov_system
Development for Trpg system "tarkovlike"
>>>>>>> 1fcd86ce36aadd90ac749c90214205a8a088cfba

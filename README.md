# Escape from Conspiracy Inventory

身内で行うTRPG「Escape from Conspiracy」用の、Escape from Tarkov風インベントリ管理ツールです。

GMとPLが同じ所持品状態をリアルタイムで共有します。

## 主な機能

- GM／PLの役割選択と専用URL
- Firestoreによるプレイヤー別インベントリのリアルタイム同期
- アイテムカタログからの追加、スタッシュ、装備、リグ／バックパックへのマス目収納
- アイテムサイズ・範囲外・重複の配置判定
- アイテム固有のTRPG情報（効果、ダメージ、命中率、故障率など）の詳細表示

このアプリは認証を設けない、信頼できる身内向けの共有ボードです。GM／PLの画面分離は操作導線のためのものであり、アクセス制御ではありません。

## 技術構成

- React 18 / TypeScript / Vite
- Tailwind CSS
- `@dnd-kit`（ドラッグ＆ドロップ）
- Cloud Firestore（リアルタイム同期）

## ローカル起動

```powershell
npm.cmd install
npm.cmd run dev
```

`http://localhost:5173` を開きます。

## Firebase設定

1. Firebase ConsoleでWebアプリとCloud Firestoreデータベースを作成します。
2. `.env.example` を `.env.local` として複製し、Firebase Webアプリの設定値を記入します。
3. Firestoreルールをデプロイします。

```powershell
npx.cmd firebase-tools login
npx.cmd firebase-tools use --add
npx.cmd firebase-tools deploy --only firestore:rules
```

詳細は [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) を参照してください。`.env.local` は秘密情報を含む可能性があるためGit管理しません。一方、`.firebaserc` はFirebaseプロジェクトの対応情報のみであり、Git管理します。

Vercelに公開する際は後述の「検証とデプロイ」を参考に実施してください。

## 画面URL

| URL | 用途 |
| --- | --- |
| `/` | GM／PLの選択画面 |
| `/gm` | GM画面。任意のPLをタブで選択して閲覧・編集 |
| `/player` | PL名の選択画面 |
| `/player/:playerId` | 選択したPLのインベントリ画面 |

Firestore上のデータは `campaigns/{campaignId}/players/{playerId}` に保存されます。`campaignId` は `.env.local` の `VITE_FIREBASE_CAMPAIGN_ID` で指定し、未指定時は `default` です。

## アイテムセットの編集

通常のアイテム追加・性能変更では、次の2ファイルを編集します。

| 目的 | ファイル | 編集箇所 |
| --- | --- | --- |
| アイテムの基本情報 | `src/data/items.ts` | `ITEM_DEFINITIONS` にあるアイテム定義 |
| TRPG用の性能・効果 | `src/data/itemTrpgInfo.ts` | `ITEM_TRPG_INFO` の該当アイテムID |

### アイテムを追加する場合

1. `src/data/items.ts` の `ITEM_DEFINITIONS` に1件追加します。
2. 同じ `id` をキーとして、`src/data/itemTrpgInfo.ts` の `ITEM_TRPG_INFO` にTRPG情報を追加します。
3. 初期所持品に含めたい場合だけ、`src/store/useInventoryStore.tsx` の `DEFAULT_STARTER_ITEM_IDS` にそのIDを加えます。

```ts
// src/data/items.ts
{
  id: 'wpn_example',       // 一度運用を始めたIDは変更しない
  name: '例示武器',
  category: 'weapon',
  width: 3,
  height: 1,
  icon: '🔫',
  color: '#8a9a5b',
  equipSlot: 'primaryWeapon',
  description: '説明文',
}

// src/data/itemTrpgInfo.ts
wpn_example: {
  effect: '主な効果',
  properties: [
    { label: 'ダメージ', value: '1D6 × 3' },
    { label: '命中率', value: '30% + 技能値' },
  ],
  notes: ['運用上の注記'],
},
```

**重要:** `id` はFirestoreに保存される所持品データから参照されます。運用開始後にIDを変更・削除すると、既存の所持品が定義を見つけられなくなります。名前や性能の変更は安全ですが、IDを変える場合は既存データの移行も行ってください。

新しいカテゴリや装備スロットを追加する場合は、`src/types/index.ts`、`src/components/ItemCatalogPanel.tsx`、`src/components/StashPanel.tsx`、必要に応じて `src/data/slots.ts` も更新します。

## 検証とデプロイ

```powershell
npm.cmd run build
```

Vercelへ公開する場合は、Firebase設定値をVercelのEnvironment Variablesにも登録してください。直接URLへのアクセスをViteアプリへ戻す設定は `vercel.json` に含めています。

## 変更履歴

変更履歴は [CHANGELOG.md](./CHANGELOG.md) で管理します。機能変更時は、`package.json` のバージョンとCHANGELOGを同時に更新してください。

## TODO
- アイテムセットを作成
  - 各アイテムの能力値を設定
  - 初セッション用のアイテムリストを準備
- スタッシュ内のアイテムに削除機能を追加
- PLの各画面に所持金を表示
- 変更対象外設定ファイルをenvフォルダに移動（参照変更有無を要確認）

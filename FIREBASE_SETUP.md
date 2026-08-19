# Firestore セットアップ手順

このアプリケーションは、共有されたリアルタイムのインベントリ（持ち物）状態を管理するためにのみ Cloud Firestore を使用します。意図的にログイン機能や Firebase Authentication は実装していません。これは、信頼できるプライベートなTRPGグループ向けの共有ボードとして設計されているためです。

## 1. Firebase プロジェクトの作成

1. Firebase コンソールでプロジェクトを作成します。
2. ウェブアプリを登録し、表示された Firebase の設定値（構成情報）をコピーします。
3. Cloud Firestore データベースを「本番環境（Production mode）」モードで作成します。

## 2. ローカルアプリの設定

`.env.example` をコピーして `.env.local` を作成し、先ほどコピーしたウェブアプリの設定値を入力してください。`VITE_FIREBASE_CAMPAIGN_ID` のデフォルト値は `default` です。この値を変更すると、同じ Firebase プロジェクト内に独立した別のキャンペーン環境が作成されます。

```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_CAMPAIGN_ID=default
```

## 3. Firestore セキュリティルールのデプロイ

Firebase CLI をインストールしてログインし、同梱されているルールファイルをデプロイします。

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

`firestore.rules` ※ firestore.rules は意図的に、キャンペーンのプレイヤーデータに対するすべての読み取りと書き込みを許可する設定になっています。これは前述の「信頼できるグループ内での利用」にのみ適しています。一般公開環境へのデプロイには絶対にこのルールを使用しないでください。

## Routes

- `/`: GM（ゲームマスター）モードかプレイヤーモードを選択します。
- `/gm`: GMビューです。任意のプレイヤータブを選択して、そのプレイヤーのインベントリを編集できます。
- `/player`: プレイヤー名を選択します。
- `/player/:playerId`: プレイヤーのインベントリ画面です。最後に選択したプレイヤーはブラウザに記憶されます。

各プレイヤーのデータは `campaigns/{campaignId}/players/{playerId}` というパスに保存されます。アイテムの変更には Firestore のトランザクションが使用され、アクティブな画面（ビュー）は同じドキュメントの変更をリアルタイムで購読（サブスクライブ）します。


同梱されている `vercel.json` は、`/gm` や `/player/...` のURLへ直接アクセスされた場合、Vite アプリケーションにリライトするように設定されています。別の静的ホスティングサービスを利用する場合は、SPA（シングルページアプリケーション）向けに `index.html` へのフォールバック設定を適宜行ってください。

# Firestore setup

This application uses Cloud Firestore only for shared, real-time inventory state. It deliberately has no login or Firebase Authentication: it is a shared board for a trusted private TRPG group.

## 1. Create a Firebase project

1. Create a project in the Firebase console.
2. Register a Web app and copy its Firebase configuration values.
3. Create a Cloud Firestore database in Production mode.

## 2. Configure the local app

Copy `.env.example` to `.env.local`, then fill in the values from the Web app configuration. `VITE_FIREBASE_CAMPAIGN_ID` defaults to `default`; changing it creates an independent campaign in the same Firebase project.

```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_CAMPAIGN_ID=default
```

## 3. Deploy the Firestore rules

Install the Firebase CLI and log in, then deploy the included rule file.

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

`firestore.rules` intentionally allows all reads and writes to campaign player data. This is appropriate only for the stated trusted-group usage. Do not use these rules for a public deployment.

## Routes

- `/`: choose GM or player mode.
- `/gm`: GM view; choose any player tab and edit that player's inventory.
- `/player`: choose a player name.
- `/player/:playerId`: player inventory. The last selected player is remembered in the browser.

Each player is stored at `campaigns/{campaignId}/players/{playerId}`. Item changes use a Firestore transaction and active views subscribe to the same document in real time.

The included `vercel.json` rewrites direct visits to `/gm` and `/player/...` to the Vite application. If using another static host, configure its equivalent SPA fallback to `index.html`.

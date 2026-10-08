# RA Firebase Test

Recraft Alchemia の Firebase Realtime Database 検証用ミニアプリです。

## 機能
- 既存GASのキャラクター一覧をプレイヤーキーで取得
- 登録済みキャラクターを発言者として切替
- Firebase Anonymous Authentication
- Realtime Databaseによるリロード不要のチャット同期
- 既存ココフォリア部屋への外部リンク

## Firebase側で必要な設定
1. Firebaseプロジェクトを作成
2. Webアプリを登録
3. Authentication → Sign-in method → Anonymous を有効化
4. Realtime Database を作成
5. firebase-rules.json の内容を Realtime Database の Rules に設定
6. Firebase Web App の設定値をテスト画面へ入力

Firebase設定値はこのリポジトリへ保存せず、ブラウザのlocalStorageへ保存します。

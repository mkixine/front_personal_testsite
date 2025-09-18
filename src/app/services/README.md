# APIサービス

このディレクトリには、OpenAPI仕様書に基づいて作成されたAPIサービスが含まれています。

## ファイル構成

### ベースクラス
- `api-base.service.ts` - すべてのAPIサービスのベースクラス
- `api.service.ts` - メインAPIサービス（すべてのサービスを統合）

### 個別サービス
- `auth.service.ts` - 認証関連API（ログイン、プロフィール取得）
- `content.service.ts` - コンテンツ関連API（作成、一覧、更新）
- `member.service.ts` - メンバー関連API（一覧取得）

### 型定義
- `../models/api.types.ts` - APIリクエスト・レスポンスの型定義

### 使用例
- `api-usage-example.ts` - 各サービスの使用例

## 使用方法

### 1. 基本的な使用方法

```typescript
import { ApiService } from './services/api.service';

constructor(private api: ApiService) {}

// ログイン
this.api.auth.login({
  email: 'user@example.com',
  password: 'password123'
}).subscribe(response => {
  console.log('ログイン成功:', response);
});

// コンテンツ一覧取得
this.api.content.getContentList({
  cnt: 10,
  pageID: 1
}).subscribe(contents => {
  console.log('コンテンツ一覧:', contents);
});
```

### 2. 認証サービス

```typescript
// ログイン
this.api.auth.login({
  email: 'user@example.com',
  password: 'password123',
  login_save: 1
});

// プロフィール取得
this.api.auth.getProfile();
```

### 3. コンテンツサービス

```typescript

// コンテンツ一覧取得
this.api.content.getContentList({
  cnt: 10,
  'contents_type[]': [27]
});

// コンテンツ更新
this.api.content.updateContent('topics_id', {
  subject: '更新されたタイトル',
  amount: '5000'
});
```

### 4. メンバーサービス

```typescript
// メンバー一覧取得
this.api.member.getMemberList({
  cnt: 20,
  'group_id[]': [107]
});

// 特定のメンバー取得
this.api.member.getMembersByIds([1, 2, 3]);
```

## API エンドポイント

### 認証
- `POST /rcms-api/7/login` - ログイン
- `GET /rcms-api/7/profile` - プロフィール取得

### コンテンツ
- `POST /rcms-api/7/insert` - コンテンツ作成
- `GET /rcms-api/7/list` - コンテンツ一覧取得
- `POST /rcms-api/7/update/{topics_id}` - コンテンツ更新

### メンバー
- `GET /rcms-api/7/members` - メンバー一覧取得

## 注意事項

1. すべてのAPIリクエストは `https://mkixine-json.g.kuroco.app` をベースURLとして使用します
2. 認証が必要なAPIについては、適切な認証情報を設定してください
3. 型定義は実際のAPIレスポンスに応じて調整が必要な場合があります
4. エラーハンドリングは各コンポーネントで適切に実装してください

## カスタマイズ

必要に応じて以下の点をカスタマイズできます：

1. ベースURLの変更（`api-base.service.ts`）
2. 型定義の追加・修正（`api.types.ts`）
3. 新しいエンドポイントの追加
4. エラーハンドリングの強化
5. リトライ機能の追加

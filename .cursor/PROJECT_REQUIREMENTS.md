# プロジェクト要件

## 技術スタック
- **フレームワーク**: Angular
- **レンダリング**: Prerender（SSG）を有効化
- **スタイリング**: Tailwind CSS
- **配信**: 静的配信（SSRは使用しない）

## 設定方針
1. Angular CLIでプロジェクトを初期化
2. Prerenderを有効にしてSSG（Static Site Generation）を利用
3. Tailwind CSSを統合
4. 静的配信に最適化された設定

## 注意事項
- SSR（Server-Side Rendering）は使用しない
- 静的ファイルとして配信可能な構成にする

## Cursor AI設定
- `.cursor/rules` - 許可コマンドリスト
- `.cursor/settings.json` - Cursor固有の設定
- ターミナルコマンド実行許可
- ファイル操作許可
- パッケージ管理許可

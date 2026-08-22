# Doll Focus

ドール撮影用の被写界深度シミュレーターです。センサーサイズ、焦点距離、絞り、撮影距離を変えると、カメラからドールまでの画角とピントが合う範囲を図で確認できます。

## GitHub Pages で公開する

1. このフォルダを GitHub のリポジトリへ push します。
2. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にします。
3. `main` ブランチへの push 後、Actions の完了を待ちます。

`.github/workflows/pages.yml` が `docs/` の静的サイトを自動公開します。ビルド処理は不要です。

## ローカルで確認する

GitHub Pages版は `docs/index.html` をブラウザで開くか、任意の静的サーバーで `docs/` を配信してください。

Sites版を開発する場合:

```bash
pnpm install
pnpm dev
```

## 計算について

被写界深度は、センサー形式ごとの許容錯乱円と薄レンズ近似を使って計算しています。レンズ設計、フォーカスブリージング、最短撮影距離などにより実写とは差が生じます。

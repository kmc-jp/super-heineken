# Heineken

Hayai Kensaku webapp (ver.2; it means super!) built with [Remix](https://remix.run/docs).

## Development

Recommended to open with devcontainer:

```
$ devcontainer open .
```

To start the development server:

```
$ cp .env.example .env
$ npm run dev
```

### ぱっと構成を知りたい人向け

- Remix では routes の中に tsx を配置すると、自動的にパスに対応したコンポーネントとして認識されます

  - `routes/search.pukiwiki.tsx` は `/search/pukiwiki` に対応します
  - 詳細 https://remix.run/docs/en/main/file-conventions/routes

- tsx ファイルではなくディレクトリにすることもできます。その時は、ディレクトリ内の `route.tsx` ファイルが対応したコンポーネントになります(例: `routes/search.pukiwiki/route.tsx`)。

  - その他のファイルは `routes.tsx` から import して使うことになります

- Remix には Nested routes という特徴があり、`routes/search.tsx` と `routes/search.pukiwiki.tsx` がある場合、
  `/search/pukiwiki` を開くと `search.tsx` 内で定義されたコンポーネントの中（`<Outlet />`）に `search.pukiwiki.tsx` のコンポーネントが描画されます
  - 詳細 https://remix.run/docs/en/main/discussion/routes

## Deployment

First, build your app for production:

```
$ npm run build
```

Then run the app in production mode:

```
$ npm start
```

Now you'll need to pick a host to deploy it to.

Note: You can connect to KMC elasticsearch from local by `kubectl port-forward`

```
$ kubectl port-forward services/heineken-elasticsearch 9200 9200
```

### Styles

- Margin や Padding の設定は基本的に bootstrap のクラスを使って行っています
  - https://getbootstrap.com/docs/5.3/layout/grid/
- 画面幅の小さいデバイス用に処理を分ける際は、概ね以下のルールに従っています
  - 横は md 以下で縮める
  - 縦は sm 以下で縮める

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

## Related projects

- Crawler

https://github.com/kmc-jp/heineken-crawler

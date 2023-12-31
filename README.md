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

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

## Related projects

- Crawler

https://github.com/kmc-jp/heineken-crawler

// Bootstrap のコードは server で評価した瞬間に document がなくエラーになるので、
// クライアントのみで動かすために client.tsx で import する
// Note: サーバー側で export したモジュールを使おうとすると undefined になる
// https://remix.run/docs/en/main/file-conventions/-client
import { Collapse } from "bootstrap";

export { Collapse };

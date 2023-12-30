import styles from "./Help.css";
import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Help - Heineken" }];
};

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

interface HelpContentProps {
  title: string;
  contents: (string | [boolean, string])[];
}

function HelpContent(props: HelpContentProps) {
  return (
    <div className="row justify-content-center">
      <div className="col-sm-10 col-sm-offset-1">
        <h2>{props.title}</h2>
        {props.contents.map((v, i) => {
          const content = Array.isArray(v) ? v[1] : v;
          const pTag = Array.isArray(v) ? v[0] : true;
          if (pTag) {
            return <p dangerouslySetInnerHTML={{ __html: content }} key={i} />;
          } else {
            return (
              <div dangerouslySetInnerHTML={{ __html: content }} key={i} />
            );
          }
        })}
      </div>
    </div>
  );
}

function HelpListContent(props: HelpContentProps) {
  return (
    <div className="row justify-content-center">
      <div className="col-sm-10 col-sm-offset-1">
        <h2>{props.title}</h2>
        <ul>
          {props.contents.map((v, i) => (
            <li dangerouslySetInnerHTML={{ __html: v }} key={i} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Help() {
  return (
    <div className="Help">
      <div className="row">
        <h1>Heineken help</h1>
      </div>
      <HelpContent
        title="基本的な使い方"
        contents={[
          `検索します。出てきたものをクリックすると該当コンテンツのページに飛びます。`,
        ]}
      />
      <HelpContent
        title="検索モード"
        contents={[
          `Heineken では、検索時に 2 つのモードがあります。1 つは通常利用のための Simple モード、もう一つは Advanced モードです。`,
          `Simple モードでは、単語をスペース区切りにして AND で検索します（Quote ("") で囲まれている場合はスペース区切りを行いません）。
          タイトルなどのフィールド指定や期間の指定といったことはできません。`,
          `Advanced モードでは、与えられたクエリを Elasticsearch の Query string にそのまま渡します。日時の指定など、より柔軟な検索が可能になります。`,
        ]}
      />
      <HelpContent
        title="Advanced モードを使う"
        contents={[
          `Advanced モードでは、直接 Query string を記述することになるため、Elasitcsearch でインデックスしているドキュメントのフィールド名を知る必要があります。`,
          `Query string の基本的な構文については、
           <a href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax'>Elasticsearch のドキュメント</a>
           を見て下さい。`,
          `例えば、<code>AND</code> や <code>OR</code> , <code>||</code> などの記号が使えます。正規表現は使えると書いてありますが、
              index 方式の都合により2字以上3字以下にしか使えません。使い物になりませんね。`,
          `なお、検索のインデックス方式の都合から、テキストは必ず Quote ("") で囲んでください。`,
          [false, `<h3>PukiWiki</h3>`],
          `検索できるカラムは <code>title</code> （タイトル）、 <code>modified</code> （更新日時）、 <code>body</code> （内容） です。
            デフォルト（クエリ上で、フィールドを何も指定しない状態）では <code>title</code> と <code>body</code> で検索されます。
            フィールド名を指定することで、その他のカラムを用いて検索できます。`,
          [
            false,
            `<div class="card">
              <div class="card-body">
                body:"こんにちは" title:"NF"
              </div>
            </div>`,
          ],
          [
            false,
            `<div class="card">
              <div class="card-body">
                "春合宿" modified:[2017-01-01 TO 2017-04-04]
              </div>
            </div>`,
          ],
          [
            false,
            `<div class="card">
              <div class="card-body">
                ("春合宿" OR "こんにちは") AND "講座"
              </div>
            </div>`,
          ],
          [
            false,
            `<div class="card">
              <div class="card-body">
                "NF" -body:"コミケ"
              </div>
            </div>`,
          ],
          [false, `<h3>Mail</h3>`],
          `検索できるカラムは
            <code>subject</code> （タイトル）、
            <code>date</code> （日時）、
            <code>from</code> （送信元アドレス）、
            <code>to</code> （送信先アドレス）、
            <code>body</code> （内容）
            です。
            デフォルト（クエリ上で、フィールドを何も指定しない状態）では
            <code>subject</code>、
            <code>from</code>、
            <code>to</code>、
            <code>body</code>、
            で検索されます。`,
          `
            メールアドレスは英単語ごとに区切っているので、短い単語ではヒットしない可能性があります。
            `,
          [
            false,
            `<div class="card">
              <div class="card-body">
                body:"KMC" to:"info@kmc.gr.jp"
              </div>
            </div>`,
          ],
          [
            false,
            `<div class="card">
              <div class="card-body">
                "NF" date:[2016-10-01 TO 2017-01-01]
              </div>
            </div>`,
          ],
          [
            false,
            `<div class="card">
              <div class="card-body">
                ("京都大学" OR "京大") AND "こんにちは"
              </div>
            </div>`,
          ],
          [
            false,
            `<div class="card">
              <div class="card-body">
                "OB会" -body:会長
              </div>
            </div>`,
          ],
        ]}
      />
      <HelpListContent
        title="その他"
        contents={[
          `Index の都合により 1 文字では検索できません。
          <a href="https://inside.kmc.gr.jp/wiki/?cmd=search">PukiWiki の検索機能</a>
           を使って下さい。`,
          `<code>C#</code> や <code>C++</code> といった記号でも検索可能です。`,
          `更新されたばかりのページはクロールされるまで検索に出ません。`,
        ]}
      />
      <HelpContent
        title="動作環境"
        contents={[`2023-12-30 時点での最新の Chrome では動作を確認しました。`]}
      />
      <HelpListContent
        title="ソースコード"
        contents={[
          `<a href='https://github.com/kmc-jp/heineken2/'>Heineken (GitHub)</a>`,
          `<a href='https://github.com/kmc-jp/heineken-crawler/'>Heineken cralwler (GitHub)</a>`,
        ]}
      />
    </div>
  );
}
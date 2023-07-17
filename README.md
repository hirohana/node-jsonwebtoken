# JWT基礎知識

## JWT(JSON Web Token)の定義
[RFC 7519](https://tex2e.github.io/rfc-translater/html/rfc7519.html "RFC 7519")によると、`JWT`について以下のように定義されています。
> JSON Web Token（JWT）は、2つのパーティ間で転送されるクレームを表す、コンパクトでURLセーフな手段です。 JWTのクレームは、JSON Web Signature（JWS）構造のペイロードとして、またはJSON Web Encryption（JWE）構造のプレーンテキストとして使用されるJSONオブジェクトとしてエンコードされ、クレームをデジタル署名または整合性保護することができます。メッセージ認証コード（MAC）で暗号化されています。

上記の内容が理解できることを目標に解説していきたいと思います。

結構誤解されやすいのですが、`JWT`は定義を見ても分かるようにそれ自体が認証について規定しているわけではなく、認証が行われる際に利用される1つの手段に過ぎないことを理解しておく必要があります。具体的な認証フローはアプリケーションやシステムに依存します。JWTは、そのフローの一部として使用され、認証情報をトークンに含めるための手段として活用されます。

余談ですが、上記で出てきたRFC(Request For Comments)`とはインターネット技術の標準化などを行うIETF（Internet Engineering Task Force）が発行している、技術仕様などについての文書群のことです。

## JWTの構成
一般的にはJWTは、以下の構成の一部である`ペイロード`のことを指します。

図は[基本から理解するJWTとJWT認証の仕組み](https://developer.mamezou-tech.com/blogs/2022/12/08/jwt-auth/ "基本から理解するJWTとJWT認証の仕組み")の記事を参照させていただきました。
```terminal
{base64エンコードしたヘッダー}.{base64エンコードしたペイロード}.{署名}

// 具体例
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpc3MiOiJpby5leGFjdC5zYW1wbGUuand0Iiwic3ViIjoic2F1bXBsZSIsImV4cCI6MTY3MDA4NTMzNiwiZW1haWwiOiJzYW1wbGVAZXh0YWN0LmlvIiwiZ3JvdXBzIjoibWVtYmVyLCBhZG1pbiJ9.
wZRzbwWIclydco4ta069uPSaaimTtRFECIXksB81sdo
```
![スクリーンショット (1242).png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1220815/8b43c219-0d88-d10d-5fd6-9494d3d90c50.png)

上図に出てくるヘッダー、ペイロード、シグネチャの補足説明をしていきます。

### ヘッダー
`ヘッダー`にはペイロードの種類や署名アルゴリズムを記述します。
```json:
{
    "alg": "HS256",
    "typ": "JWT"
}
```
* `alg`はBASE64URLエンコードされたヘッダーとBASE64URLエンコードされたペイロードを署名(暗号化)する際のアルゴリズムです。
* `typ`はペイロードのデータ種別を表すものです。

### ペイロード(JWT)
ペイロード(JWT)はクレームセット(claim set)です。

本来日本語だと、クレームという言葉は`企業への不満や怒りを伴うなんらかの要求や主張`といった意味合いで使われると思いますが、JWTにおけるクレームとは`ペイロードのJSONデータの項目`のことを指します。

```json:
{
  "iss": "io.exact.sample.jwt",
  "sub": "saumple",
  "exp": 1670085336,
  "email": "sample@extact.io",
  "groups": "member, admin"
}
```
<table>
  <thead>
    <tr>
      <th>claim(省略名)</th> <th>項目名</th> <th>説明</th>
    </tr>
  </thead>
  <tr>
    <td> iss </td>　<td>issuer</td> <td>JWT発行者</td>
  </tr> 
  <tr>
    <td> sub </td>　<td>subject</td> <td>ユーザ識別子。userID（もしくはそれを暗号化したもの）といったユーザを識別できるためのID</td>
  </tr> 
  <tr>
    <td> exp </td>　<td>expiration time</td> <td>JWT有効期限</td>
  </tr> 
</table>

`iss`や`sub`、`groups`などのキーと値の組み合わせがJWTにおけるクレームです。

また、`iss`や`sub`、`exp`はJWTで予約されているクレーム名で『予約クレーム』と呼ばれます。他にも様々な予約クレームが存在します。詳細は[こちらの記事](https://openid-foundation-japan.github.io/draft-ietf-oauth-json-web-token-11.ja.html "こちらの記事")を参照してください。

それに対して、上図の`email`や`groups`など開発者が独自で定義可能なクレームは『プライベートクレーム』と呼ばれます。

そして、予約クレームを見て分かるように省略名で書かれています。省略名を使用することにより冒頭のJWTの定義文で書かれていた`JSON Web Token（JWT）は、2つのパーティ間で転送されるクレームを表す、コンパクトでURLセーフな手段`のコンパクトを実現する方法の1つになっています。

### シグネチャ
実はJWTにおけるヘッダーとペイロードはBASE64URLエンコードされているだけで、BASE64URLデコードを行えば簡単に中身を見ることが出来ます。

もし宜しければ下記サイトのEncodedにJWT構成の解説の具体例とのトークンを入れてみてください。簡単にデコードされて中身を確認できます。

https://jwt.io/

JWSは盗聴を防ぐものではないため、悪意をもった第三者に中身が見られる可能性があるペイロードは容易に改ざん可能ということになります。

ここで登場するのが、ペイロードが改ざんされたことを検知するために暗号鍵によって作成された`シグネチャ`になります。

![スクリーンショット (1244).png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1220815/2f0c5a51-bc2a-8b3e-6a73-07ab290b9305.png)

1. JWTの署名をBASE64URLデコードを行う。
1. デコードされた値を暗号鍵とヘッダーに記載されている暗号アルゴリズムを使って復号する。
1. 複合された値とBASE64URLエンコードされたヘッダーとペイロードの値と比較する。
1. 一致していれば改ざんされていないし、一致していなければ改ざんされている。

:::note info
JWTにおけるシグネチャ(署名)とは、ペイロードの改ざんを検知するのに必須な仕組みと言えます。
:::

## JWSとJWE
最後に、JWS(JSON Web Signature)とJWE(JSON Web Encryption)について簡単に解説します。

冒頭のRSC 7519の定義文の一部で書かれていた以下の文脈にJWSとJWEが記述されています。
> JWTのクレームは、JSON Web Signature（JWS）構造のペイロードとして、またはJSON Web Encryption（JWE）構造のプレーンテキストとして使用されるJSONオブジェクトとしてエンコードされ、クレームをデジタル署名または整合性保護することができます。

**JWS**は上記の説明にも出てきた`ヘッダー.ペイロード.署名`のフォーマットで形成された文字列で、BASE64URLエンコードされたJWTが本物かどうか、中身が改ざんされていないかを検証する仕組みのことになります。

それに対して**JWE**は署名ではなく、ペイロードを暗号化する表示形式になります。

![スクリーンショット (1245).png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1220815/3383872b-aaf9-f21e-f7fb-c8a0e9703bb8.png)

詳細に関しては以下の記事がとてもわかりやすいと思いましたので参考に貼っておきます。

https://fintan.jp/page/1572/

# 実装

## 環境構築
今回はNext.js(13.4.10)環境で認証機能を作成していきます。

* Windows11
* Next.js(13.4.10)

```terminal: terminal
npx create-next-app jsonwebtoken-sample
```
![スクリーンショット (280).png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1220815/5f288cd5-b08a-0a48-7338-aaaa1f70084f.png)
Next.jsの環境が構築できたら`jsonwebtoken`と型定義の`@types/jsonwebtoken`をインストールします。

```terminal: terminal
npm install jsonwebtoken @types/jsonwebtoken
```

## ログインページとAPIを作成
次にログインページにログイン認証API、ユーザー情報をクレームに含んだJWTを検証するAPIを作成します。

### ディレクトリ構成

![スクリーンショット (281).png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1220815/0b14b364-fbc1-9a3a-2e53-65c65defef33.png)

### ログインページ
本来はロジックやJSXをファイル分割すべきだと思うのですが、今回はデフォルトで設置されている`src/app/page.tsx`ファイルに全て記述しました。
```typescript: src/app/page.tsx
"use client";

import { FormEvent, MouseEvent, useState } from "react";

type Result = {
  user: {
    userId: number;
    username: string;
  };
  message: string;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1⃣ デフォルト値としてuserId: 9999とusername: ゲストユーザー を設定。
  const [user, setUser] = useState({
    userId: 9999,
    username: "ゲストユーザー",
  });

  // 2⃣ emailとpasswordを使ったログイン認証API
  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      email,
      password,
    };

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const { user, message }: Result = await response.json();

      if (response.status === 401) {
        window.alert(message);
      } else if (response.status === 200) {
        setUser(user);
        window.alert(message);
      }
    } catch (err) {
      window.alert(`エラーが発生しました。: ${err}`);
    }

    setEmail("");
    setPassword("");
  };

  // 3⃣ JWTトークンを検証するAPIにGETリクエストを送信する関数
  const verifyJwt = async (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/verify-jwt");
      const { user, message }: Result = await response.json();

      if (response.status === 401) {
        window.alert(message);
      } else if (response.status === 200) {
        setUser(user);
        window.alert(message);
      }
    } catch (err) {
      window.alert(`エラーが発生しました。: ${err}`);
    }
  };

  // 4⃣ ログインページ
  return (
    <main>
      <div className="flex flex-col justify-around items-center h-screen">
        <div>
          <p className="mb-4">ユーザーID: {user.userId}</p>
          <p>ユーザー名: {user.username}</p>
          <button
            onClick={(e) => verifyJwt(e)}
            className="px-4 py-2 mt-4 bg-indigo-400 rounded text-white"
          >
            ユーザー情報確認
          </button>
        </div>
        <div className="flex justify-center items-center h-96 w-96 bg-gray-100">
          <form onSubmit={(e) => login(e)}>
            <div className="flex flex-col justify-center items-center">
              <label htmlFor="email">email</label>
              <input
                type="email"
                id="email"
                placeholder="input email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-8 py-2 px-4"
              />
              <label htmlFor="password">password</label>
              <input
                type="password"
                id="password"
                placeholder="input password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-8 py-2 px-4"
              />
              <button
                type="submit"
                className="bg-indigo-500 py-2 px-4 rounded text-white"
              >
                送信
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
```
* ①はログイン認証を行っていないユーザーを想定してユーザーIDを`9999`、ユーザー名を`ゲストユーザー`としてデフォルト値を設定しています。
* ②はフォーム画面で入力したemailとpasswordを`src/app/api/login`にログイン認証APIにPOSTで送信する関数を定義しています。
* ③はJWTの妥当性を検証するAPI `src/app/api/verify-jwt`に対して、cookieに保存されているユーザー情報を含んだJWTトークンをGETで送信する関数を定義しています。
* ④はフォーム入力欄や、現在のユーザー情報を表示する要素を含んだログインページです。

### ログイン認証API
```typescript: src/app/api/login
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  /* 1⃣ 本来はDBにemailでユーザーが存在するかを確認して、ハッシュ化されたパスワードと比較を行うと思うのですが、
        今回はシンプルなログイン認証としたいので、emailとpasswordをハードコーディングしています。
  */
  if (email === "hirohana@co.jp" && password === "1234") {
    const user = {
      userId: 1,
      username: "hirohana",
    };

    // 2⃣ cookieにJWTを保存する。
    const secretKey = process.env.SECRET_KEY as string;
    const token = jwt.sign(user, secretKey, {
      expiresIn: 120,
      algorithm: "HS256",
    });
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    // 3⃣ ユーザーにuserとmessageを格納したオブジェクトを返却する
    const message = "ログイン認証に成功しました。";
    return NextResponse.json({ user, message }, { status: 200 });
  } else {
    // 4⃣ ログイン認証に失敗した場合は下記のmessageを格納したオブジェクトを返却する。
    const message = "emailまたはpasswordが違っています。";
    return NextResponse.json({ message }, { status: 401 });
  }
}
```
* ①は本来、フォームから送信されたemailとpasswordを使ってデータベースに問い合わせを行い、妥当性を検証する必要があるのですが、今回はシンプルなログイン認証機能という事でemailは`hirohana@co.jp`、passwordは`1234`とハードコーディングをしています。
* ②は`jwt.sign`関数を呼び出し、引数にユーザー情報と.envファイルに格納されているシークレットキーを渡してJWTトークンを作成しcookieに保存しています。
* ③ですが、ログイン認証に成功した場合はユーザー情報(userId、username)を格納した`user`変数と、`ログイン認証に成功した`というメッセージを格納したmessage変数をjsonとして返却しています。
* ④はログイン認証に失敗した場合に`emailまたはpasswordが違っています`という文言を格納したmessage変数をjsonとして返却しています。

### JWT検証API

```typescript: src/app/api/verify-jwt
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET() {

  // 1⃣ クッキーに保存されたtokenという名前のJWTを取得。
  const object = cookies().get("token") ?? { value: "" };
  const token = object.value;
  const secretKey = process.env.SECRET_KEY as string;

  try {
    // 2⃣ cookieから取得したtokenと、環境変数に格納しているsecretKeyを使い
    // tokenが改ざんされていないか、有効期限は切れていないかをverify関数を使って検証している。
    const user = jwt.verify(token, secretKey);

    // 3⃣ tokenに問題が無ければtokenから取得したuser情報とmessageをレスポンスとして返却。
    const message = "ユーザー情報を取得できました。";
    return NextResponse.json({ user, message }, { status: 200 });
  } catch (err) {
    // 4⃣ tokenが改ざんされていたり、有効期限が切れていたら下記のmessageをレスポンスとして返却。
    const message = `ユーザー情報を取得できませんでした。 ${err}`;
    return NextResponse.json({ message }, { status: 401 });
  }
```
* ①はクッキーに保存されている`token`という名称のユーザー情報(userId、username)が格納されたJWTトークンを取得しています。
* ②はクッキーから取得したJWTトークンと環境変数に格納しているシークレットキーを使い、トークンが改ざんされていないか、有効期限は切れていないかを`jwt.verify`関数を使って検証しています。
* ③はJWTトークンの検証に問題が無ければトークンから取得したユーザー情報(userId、username)と`ユーザー情報を取得できた`というメッセージをjsonとして返却しています。
* ④はJWTトークンが改ざんされていたり有効期限が切れていた場合はエラーハンドリングされcatch句に飛び、`ユーザー情報が取得できなかった`というメッセージをjsonとして返却しています。

### シークレットキーを.envファイルに記述
ログイン認証API、JWT検証APIで使用するシークレットキーを.envファイルに記述します。
```terminal: .env
SECRET_KEY=secretKey
```

<img width=400 src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1220815/02e493f4-14ff-77fa-b5c4-5a9a314091d6.png"/>

## ログイン認証APIの確認
ログイン認証APIを確認していきます。

emailを`hirohana@co.jp`、passwordを`1234`で入力し、ログイン認証APIに送信するとページ上部の`ユーザーID`と`ユーザー名`が更新されていることが分かります。

またChormeの開発者ツールのApplicationのタブのcookieを見ると、JWTトークンが格納されていることが確認できます。

<img width=300 src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1220815/0704bd15-f757-d2b2-b108-5dab498f8618.png"/>

![スクリーンショット (285).png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1220815/82dbd228-c828-14d4-99cc-87203ec38526.png)

<img width=400 src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1220815/7a06dcac-9773-8454-7ddc-9705ef78afee.png"/>

念のためJWTトークンとして認識されているか https://jwt.io/ のサイトにて確認を行ったところ、上図を見たら分かるようにデコードされたuserIdとusernameが表示されていました。

## JWT検証APIの確認
次にcookieに保存されているJWTトークンを検証するためJWT検証APIにGETリクエストを送信し、ペイロードからuserIdとusernameがレスポンスとして渡ってきて表示されるか確認を行います。

一度画面をリロードするとログインページ上部のユーザーIDとユーザー名は、デフォルト値に戻るのが確認できると思います。その後でユーザー情報確認のボタンを押せばJWTトークン検証APIにリクエストが送信され、再度ユーザーID及びユーザー名が更新されます。

もしJWTトークンの有効期限が切れた場合は、`window.alert`にて期限切れエラーメッセージが下図のように表示されます。今回のコードでは`jwt.sign`関数の中で`expiresIn: 120`で設定していますので、ログイン認証の2分後にユーザー情報確認ボタンを押せばJWTトークンの期限が切れることになります。

<img width=300 src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1220815/d21efc58-821c-ede6-5e55-f5085c4d21ad.png"/>

## ペイロードに個人情報を格納してはいけない

:::note alert 
JWTトークンのヘッダーとペイロードはBase64URLエンコードされているだけで、暗号化されているわけではありません。したがって万が一JWTトークンが盗まれた際に、Base64URLデコードされてしまうと容易に個人情報が盗まれますので、ペイロードに含める情報は仮に流出しても問題ない情報`ユーザーID`や`ユーザー名`、`ユーザーのプロフィール写真URL`などしか格納してはいけないことに注意が必要です。
:::


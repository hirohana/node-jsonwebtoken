## 参考記事
## JWT(JSON Web Token)の定義
[RFC 7519](https://tex2e.github.io/rfc-translater/html/rfc7519.html "RFC 7519")によると、`JWT`について以下のように定義されています。
> JSON Web Token（JWT）は、2つのパーティ間で転送されるクレームを表す、コンパクトでURLセーフな手段です。 JWTのクレームは、JSON Web Signature（JWS）構造のペイロードとして、またはJSON Web Encryption（JWE）構造のプレーンテキストとして使用されるJSONオブジェクトとしてエンコードされ、クレームをデジタル署名または整合性保護することができます。メッセージ認証コード（MAC）で暗号化されています。

上記の内容が理解できることを目標に解説していきたいと思います。

:::note info
結構誤解されやすいのですが、`JWT`は定義を見ても分かるようにそれ自体が認証について規定しているわけではなく、認証が行われる際に利用される1つの手段に過ぎないことを理解しておく必要があります。具体的な認証フローはアプリケーションやシステムに依存します。JWTは、そのフローの一部として使用され、認証情報をトークンに含めるための手段として活用されます。
:::

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

## おわりに
最後まで記事をご覧いただきありがとうございました。

間違いなどありましたらご指摘いただけると幸いです:bow:

## 参考
https://jwt.io/

https://tex2e.github.io/rfc-translater/html/rfc7519.html

https://developer.mamezou-tech.com/blogs/2022/12/08/jwt-auth/

https://fintan.jp/page/1572/


* https://qiita.com/Hirohana/items/aa8651a520cdbbb68046
* https://qiita.com/Hirohana/items/601712a9801237c1f44b

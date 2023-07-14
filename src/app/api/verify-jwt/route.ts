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
}

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

    // 3⃣ クライアントにuserとmessageを格納したオブジェクトを返却する
    const message = "ログイン認証に成功しました。";
    return NextResponse.json({ user, message }, { status: 200 });
  } else {
    // 4⃣ ログイン認証に失敗した場合は、下記のmessageを格納したオブジェクトを返却する。
    const message = "emailまたはpasswordが違っています。";
    return NextResponse.json({ message }, { status: 401 });
  }
}

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

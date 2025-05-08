import React, { useState, useEffect } from "react";
import useUser from "../hooks/useUser";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const Login = useUser(setUser);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.onopen = () => console.log("Conectado al WebSocket");
    return () => ws.close();
  }, []);

  async function checkLogin(email: string) {
    const loggedUser = await Login(email);
    if (loggedUser) {
      navigate("/app", { state: { user: loggedUser } });
    } else {
      setError("User does not exist");
    }
  }

  return (
    <>
      <h1>Login</h1>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo"
      />
      <button onClick={() => checkLogin(email)}>Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
}

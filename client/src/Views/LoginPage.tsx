import React, { useState, useEffect } from "react";
import useUser from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Puedes agregar la hoja de estilos personalizada

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
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <div className="login-form">
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          className="login-input"
        />
        <button onClick={() => checkLogin(email)} className="login-button">
          Iniciar sesión
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

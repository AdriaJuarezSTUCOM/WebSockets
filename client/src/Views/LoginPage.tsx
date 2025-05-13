import { useState, useEffect } from "react";
import useUser from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Puedes agregar la hoja de estilos personalizada

export default function LoginPage() {
  const navigate = useNavigate(); // Hook para redirigir a otra vista

  // UseStates para guardar datos
  const [email, setEmail] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const Login = useUser(setUser); // Instancia de hook useUser para hacer login

  // Conectarse a socket al cargar el componente
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.onopen = () => console.log("Conectado al WebSocket");
    return () => ws.close();
  }, []);

  // Funcion para hacer login y comprobar si es válido
  async function checkLogin(email: string) {
    const loggedUser = await Login(email);
    if (loggedUser) {
      navigate("/app", { state: { user: loggedUser } });
    } else {
      setError("User does not exist");
    }
  }

  // Devuelve el contenido del componente
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
        {/* Botón de login que llama a su correspondiente función */}
        <button onClick={() => checkLogin(email)} className="login-button">
          Iniciar sesión
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useChat from "./hooks/useChat";
import "./App.css"; // Agrega los estilos personalizados

type Room = {
  id: string;
  name: string;
  type: string;
  users: string[];
};

const App: React.FC = () => {
  const location = useLocation();
  const { user } = location.state || {};

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const GetUserRooms = useChat(setRooms);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.onopen = () => console.log("Conectado al WebSocket");
    ws.onmessage = (event) => setMessages((prev) => [...prev, event.data]);
    setSocket(ws);
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (user?.id) {
      GetUserRooms(user.id);
    }
    console.log("USER", user);
  }, [user]);

  useEffect(() => {
    console.log("ROOMS", rooms);
  }, [rooms]);

  const sendMessage = async () => {
    if (!input) return;
    await fetch("http://localhost:4000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    setInput("");
  };

  return (
    <>
      <div className="rooms-header">
          <h1>
            ¡Bienvenid@ {user.name}, esta es tu página de chats!
          </h1>
        </div>
      <div className="app-container">
        <div className="rooms-sidebar">
          <h3>Salas</h3>
          <ul>
            {rooms.map((room) => (
              <button key={room.id} >
                {room.name}
              </button>
            ))}
          </ul>
        </div>
        <div className="chat-main">
          <h1>Chat entre NOMBRES</h1>
          <div className="chat-box">
            <div className="messages-container">
              {messages.map((msg, i) => (
                <p key={i} className="message">{msg}</p>
              ))}
            </div>
            <div className="input-area">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="message-input"
              />
              <button onClick={sendMessage} className="send-button">
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;

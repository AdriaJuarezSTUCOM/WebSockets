import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useChat from "./hooks/useChat";

type Room = {
  id: string;
  name: string;
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
  }, [user]);

  useEffect(() => {
    console.log("ROOMS", rooms)
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
    <div style={{ display: "flex", gap: "2rem", padding: "1rem" }}>
      <div>
        <h3>Salas:</h3>
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>{room.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h1>Chat REST → WebSocket</h1>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje"
        />
        <button onClick={sendMessage}>Enviar</button>
        <div>
          {messages.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;

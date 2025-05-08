import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useChat from "./hooks/useChat";
import useMessages from "./hooks/useMessages";

type Room = {
  id: string;
  name: string;
};

const App: React.FC = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const { messages: roomMessages, loadMessages } = useMessages();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [input, setInput] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  const GetUserRooms = useChat(setRooms);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.onopen = () => console.log("Conectado al WebSocket");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.salaId === activeRoomId) {
        loadMessages(data.salaId); // recarga mensajes de la sala activa
      }
    };
    setSocket(ws);
    return () => ws.close();
  }, [activeRoomId]);

  useEffect(() => {
    if (user?.id) {
      GetUserRooms(user.id);
    }
  }, [user]);

  const handleLoadMessages = async (roomId: string) => {
    setActiveRoomId(roomId);
    await loadMessages(roomId);
  };

  const sendMessage = async () => {
    if (!input || !activeRoomId) return;
    await fetch("http://localhost:4000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contenido: input,
        salaId: activeRoomId,
        emisorId: user.id,
      }),
    });
    setInput("");
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "1rem" }}>
      <div>
        <h3>Salas:</h3>
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>
              <button onClick={() => handleLoadMessages(room.id)}>{room.name}</button>
            </li>
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
          {roomMessages.map((msg, i) => (
            <p key={i}>
              <strong>{msg.emisorId}:</strong> {msg.contenido}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;

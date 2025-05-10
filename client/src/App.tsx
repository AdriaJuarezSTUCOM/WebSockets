import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import useChat from "./hooks/useChat";
import useMessage from "./hooks/useMessage";
import useDocument from "./hooks/useDocument";
import "./App.css";

type Room = {
  id: string;
  name: string;
  type: string;
  users: any[];
};

type Message = {
  id: string,
  roomId: string,
  userId: string,
  content: string,
  timestamp: Date
};

type Document = {
  id: string,
  roomId: string,
  title: string,
  content: string,
  lastModified: Date
}

const App: React.FC = () => {
  const location = useLocation();
  const { user } = location.state || {};

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [input, setInput] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room>();
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);
  const [roomDocuments, setRoomDocuments] = useState<Document[]>([]);

  const GetUserRooms = useChat(setRooms);
  const GetRoomMessages = useMessage(setRoomMessages);
  const GetRoomDocuments = useDocument(setRoomDocuments);

  const currentRoomRef = useRef<Room | undefined>(undefined);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.onopen = () => console.log("Conectado al WebSocket");

    ws.onmessage = (event) => {
      const newMessage: Message = JSON.parse(event.data);

      
      if (newMessage.roomId === currentRoomRef.current?.id) {
        setRoomMessages((prev) => [...prev, newMessage]);
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, []);


  useEffect(() => {
    if (user?.id) {
      GetUserRooms(user.id);
    }
    console.log("USER", user);
  }, [user]);

  //-----------------------------------------------TESTEO---------------------------------------------
  useEffect(() => {
    console.log("ROOMS", rooms);
  }, [rooms]);

  useEffect(() => {
    console.log("ROOM MESSAGES", roomMessages);
  }, [roomMessages]);

  useEffect(() => {
    console.log("CURRENT ROOM", currentRoom);
  }, [currentRoom]);

  useEffect(() => {
    console.log("ROOM DOCUMENTS", roomDocuments);
  }, [roomDocuments]);
  //--------------------------------------------------------------------------------------------------

  const sendMessage = async () => {
    if (!input || !currentRoom?.id) return;
    await fetch("http://localhost:4000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        roomId: currentRoom.id,
        userId: user.id
      }),
    });
    setInput("");
  };

  const loadRoomData = async (roomId:string) => {
    setCurrentRoom(rooms.find((room)=> room.id == roomId));
    GetRoomMessages(roomId);
    GetRoomDocuments(roomId);
  }


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
              <button className="rooms-sidebar-button" key={room.id} onClick={() => loadRoomData(room.id)}>
                {room.name}
              </button>
            ))}
          </ul>
        </div>

        {currentRoom? 
          <>
            <div className="chat-main">
                <h1>{currentRoom.name}</h1>
                <div className="chat-box">
                  <div className="messages-container">
                    {roomMessages.map((msg, i) => (
                      <>
                        <p className="message-sender">{msg.userId}</p>
                        <p key={i} className="message">{msg.content}</p>
                        <p className="message-time">{new Date(msg.timestamp).toLocaleString()}</p>
                      </>
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
            <div className="chat-documents">
              <h1>Documentos</h1>
              {roomDocuments.length != 0?
                <div className="documents-container">
                  {roomDocuments.map((document, i) => (
                    <>
                      <button key={i} className="rooms-sidebar-button">{document.title}</button>
                      <p className="message-time">{new Date(document.lastModified).toLocaleString()}</p>
                    </>
                  ))}
                </div>
              :
                <div className="documents-container">
                  <h4 style={{color: "black"}}>No hay ningún documento en este chat</h4>
                </div>}
            </div>
          </>
          :
          <div className="chat-main">
            <h1 style={{justifyContent:"middle"}}>No hay ningún chat seleccionado</h1>
          </div>}
      </div>
    </>
  );
};

export default App;

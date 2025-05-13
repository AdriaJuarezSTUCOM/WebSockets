import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Document from "./Components/Document";
import useChat from "./hooks/useChat";
import useMessage from "./hooks/useMessage";
import useDocument from "./hooks/useDocument";
import "./App.css";

// Tipado del objeto Room
type Room = {
  id: string;
  name: string;
  type: string;
  users: any[];
};

// Tipado del objeto Message
type Message = {
  id: string,
  roomId: string,
  userId: string,
  content: string,
  timestamp: Date
};

// Tipado del objeto Document
type Document = {
  id: string,
  roomId: string,
  title: string,
  content: string,
  lastModified: Date
}

const App: React.FC = () => {
  const location = useLocation(); // Hook para recuperar el estado que se pasó por navegación
  const { user } = location.state || {}; // Recupera el usuario desde la navegación

  // UseStates para guardar datos
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [input, setInput] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room>();
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);
  const [roomDocuments, setRoomDocuments] = useState<Document[]>([]);
  const [documentOpen, setDocumentOpen] = useState<boolean>(false);

  // Instancias de hooks 
  const GetUserRooms = useChat(setRooms);
  const GetRoomMessages = useMessage(setRoomMessages);
  const GetRoomDocuments = useDocument(setRoomDocuments);

  // Referencia mutable para la sala actual
  const currentRoomRef = useRef<Room | undefined>(undefined);

  // Actualiza la referencia cuando cambie la sala actual
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // Conexión WebSocket al backend al montar el componente por primera vez
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.onopen = () => console.log("Conectado al WebSocket");

    ws.onmessage = (event) => {
      const newMessage: Message = JSON.parse(event.data);

      // Solo se envía el mensaje si pertenece a la sala actual
      if (newMessage.roomId === currentRoomRef.current?.id) {
        setRoomMessages((prev) => [...prev, newMessage]);
      }
    };

    setSocket(ws);
    return () => ws.close(); // Se cierra el socket al desmontar el componente
  }, []);


  // Carga las rooms del usuario cuando se inicializa o cambia
  useEffect(() => {
    if (user?.id) {
      GetUserRooms(user.id);
    }
  }, [user]);


  // Funcion para enviar mensaje
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

  // Función para cargar información relacionada con las salas
  const loadRoomData = async (roomId:string) => {
    setCurrentRoom(rooms.find((room)=> room.id == roomId));
    GetRoomMessages(roomId); // Recupera los mensajes de la sala
    GetRoomDocuments(roomId); // Recupera los documentos de la sala
  }

  // Funcion para exportar chat
  const exportChat = async () => {
    if (!roomMessages || roomMessages.length === 0) {
      alert("No hay mensajes para exportar.");
      return;
    }

    const fileName = `chat-${currentRoomRef.current?.id || "sala"}.json`;
    const json = JSON.stringify(roomMessages, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  // Código que devuelve el componente
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
            {/* Se recorre y se muestran las salas que tiene un usuario */}
            {rooms.map((room) => (
              <button className="rooms-sidebar-button" key={room.id} onClick={() => loadRoomData(room.id)}>
                {room.name}
              </button>
            ))}
          </ul>
        </div>

        {/* Si hay una sala seleccionada o no se muestran los componentes correspondientes */}
        {currentRoom? 
          <>
            <div className="chat-main">
              <div className="chat-title-row">
                <h1>{currentRoom.name}</h1>
                {/* Botón para exportar los mensajes en JSON */}
                <button onClick={exportChat} className="export-chat">Exportar chat</button>
              </div>
              <div className="chat-box">
                <div className="messages-container">
                  {/* Recorre los mensajes de la sala y los muestra */}
                  {roomMessages.map((msg, i) => (
                    <div key={i}>
                      <p className="message-sender">{msg.userId}</p>
                      <p className="message">{msg.content}</p>
                      <p className="message-time">{new Date(msg.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="input-area">
                  {/* Zona para escribir y enviar mensajes */}
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
              <div className="chat-documents-title-row">
                <h1>Documentos</h1>
                {/* Se muestra una lista de documentos clicable que tenga la sala */}
                {documentOpen && 
                  <button onClick={()=>setDocumentOpen(false)}>Volver</button>
                }
              </div>
              {roomDocuments.length != 0?
                <div className="documents-container">
                  {/* Si ha documentos y se ha hecho click se muestra el documento con su contenido */}
                  {roomDocuments.map((document, i) => (
                    documentOpen?
                      <Document
                        id={document.id}
                        salaId={document.roomId}
                        titulo={document.title}
                        contenido={document.content}
                        lastModified={document.lastModified}
                        refreshDocuments={() => GetRoomDocuments(document.roomId)}
                      />
                    :
                    // Si hay documentos pero no se ha seleccionado ninguno aparece su título para clicar
                      <>
                        <button onClick={()=>setDocumentOpen(true)} key={i} className="rooms-sidebar-button">{document.title}</button>
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
          <div className="chat-empty">
            <h1 style={{justifyContent:"middle"}}>No hay ningún chat seleccionado</h1>
          </div>}
      </div>
    </>
  );
};

export default App;

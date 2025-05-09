const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const salas = require("./private/data.json").salas;
const usuarios = require("./private/data.json").usuarios;
const mensajes = require("./private/data.json").mensajes;
const documentos = require("./private/data.json").documentos;

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Cliente conectado");
  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

app.post("/api/login", (req, res) => {
  const { email } = req.body;
  const usuario = usuarios.find((u) => u.email === email);

  if (usuario) {
    res.json({ success: true, userId: usuario.id, userName: usuario.nombre });
  } else {
    res.status(401).json({ success: false, error: "Usuario no encontrado" });
  }
});

app.post("/api/message", (req, res) => {
  const { message, roomId, userId } = req.body;

  if (!message) return res.status(400).json({ error: "Mensaje vacío" });
  if (!roomId) return res.status(400).json({ error: "No hay sala" });

  const msgObj = {
    id: crypto.randomUUID(),
    salaId: roomId,
    emisorId: userId,
    contenido: message,
    timestamp: new Date(),
  };

  mensajes.push(msgObj); 

  const formattedMessage = {
    id: msgObj.id,
    roomId: msgObj.salaId,
    userId: msgObj.emisorId,
    content: msgObj.contenido,
    timestamp: msgObj.timestamp,
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(formattedMessage)); 
    }
  });

  res.json({ sent: true });
});


app.get("/api/getRooms", (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Falta userId" });
  }

  const salasUsuario = salas.filter((sala) =>
    sala.participantes.includes(userId)
  ).map((sala) => ({
    id: sala.id,
    name: sala.nombre,
    type: sala.tipo,
    users: sala.participantes
  }));

  if (salasUsuario.length === 0) {
    return res.status(404).json({ success: false, error: "No se encontraron salas para este usuario" });
  }

  res.json({ success: true, rooms: salasUsuario });
});

app.get("/api/getRoomMessages", (req, res) => {
  const roomId = req.query.roomId;

  if (!roomId) {
    return res.status(400).json({ success: false, error: "Falta roomId" });
  }

  const roomMessages = mensajes.filter((mensaje) =>
    mensaje.salaId.includes(roomId)
  ).map((mensaje) => ({
    id: mensaje.id,
    roomId: mensaje.salaId,
    userId: mensaje.emisorId,
    content: mensaje.contenido,
    timestamp: mensaje.timestamp
  }));

  if (roomMessages.length === 0) {
    return res.status(404).json({ success: false, error: "No se encontraron mensajes en esta sala" });
  }

  res.json({ success: true, roomMessages: roomMessages });
});

app.get("/api/getRoomDocuments", (req, res) => {
  const roomId = req.query.roomId;

  if (!roomId) {
    return res.status(400).json({ success: false, error: "Falta roomId" });
  }

  const roomDocuments = documentos.filter((documento) =>
    documento.salaId.includes(roomId)
  ).map((documento) => ({
    id: documento.id,
    roomId: documento.salaId,
    title: documento.titulo,
    content: documento.contenido,
    timestamp: documento.lastModified
  }));

  if (roomDocuments.length === 0) {
    return res.status(404).json({ success: false, error: "No se encontraron documentos en esta sala" });
  }

  res.json({ success: true, roomDocuments: roomDocuments });
});

server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

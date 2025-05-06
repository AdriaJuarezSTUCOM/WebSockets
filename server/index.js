const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const usuarios = require("./private/data.json").usuarios;

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket solo para emitir mensajes
wss.on("connection", (ws) => {
  console.log("Cliente conectado");
  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

// Comprobacion login
app.post("/api/login", (req, res) => {
  const { email } = req.body;
  const userId = usuarios.find((u) => u.email === email).id;
  if (userId) {
    res.json({ success: true, userId });
  } else {
    res.status(401).json({ success: false, error: "Usuario no encontrado" });
  }
});

// Endpoint para enviar mensaje a todos los WebSocket conectados
app.post("/api/message", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Mensaje vacío" });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  res.json({ sent: true });
});

app.get("/api/getRooms", (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Falta userId" });
  }

  const usuario = usuarios.find((u) => u.id === userId);

  if (usuario) {
    res.json({ success: true, rooms: usuario.rooms });
  } else {
    res.status(404).json({ success: false, error: "Usuario no encontrado" });
  }
});


server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
